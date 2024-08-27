import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt = `
    You are a movie recommendation assistant equipped with Retrieval-Augmented Generation (RAG). Your role is to understand user queries, retrieve relevant movie information, and provide recommendations. Your response should include the following fields: "intro", "movies", and "outro". 

    **Handling Edge Cases:**
    - If the user query is unclear or too broad, provide a general recommendation or request additional details.
    - If no exact match is found, return a movie with similar attributes or suggest popular options in the desired category.

    **Critical Instruction:**
    After retrieving data from the vector database, your response MUST include only the data after "Returned results from vector db (done automatically):" without any modifications, additions, or omissions.


    Ensure the response is a JSON object structured as follows:
    
    {
    "intro": "Introduction message about the recommendations.",
    "movies": [
        {
        "id": "unique_movie_id",
        "title": "Movie Title",
        "image": "URL_to_image",
        "rating": movie_rating,
        "genres": ["Genre1", "Genre2"],
        "description": "A description of the movie.",
        "keywords": ["keyword1", "keyword2"],
        "language": "Language"
        }
    ],
    "outro": "Conclusion message about the recommendations. Make it nice"
    }

    Return the all the data after 'Returned results from vector db (done automatically):' in JSON object. Do not include any additional text or explanations.
`;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req) {
  try {
    const data = await req.json();

    const index = pc.index("movies").namespace("ns1");

    const lastMessage = data[data.length - 1];
    const text = lastMessage.content;

    const embeddings = await openai.embeddings.create({
      input: text,
      model: "text-embedding-3-small",
    });

    if (!embeddings.data || !embeddings.data[0].embedding) {
      throw new Error("Failed to retrieve embeddings.");
    }

    const previouslyReturnedIds = data
      .filter((msg) => msg.content.movies)
      .flatMap((msg) => msg.content.movies.map((movie) => movie.id));

    const response = await index.query({
      vector: embeddings.data[0].embedding,
      includeMetadata: true,
      topK: 5,
      filter: {
        id: { $nin: previouslyReturnedIds }, // Exclude previously returned movie IDs
      },
    });

    let resultString =
      "\n\nReturned results from vector db (done automatically):";

    response.matches.forEach((match) => {
      resultString += `\n\n\n
          id: ${match.id}
          Title: ${match.metadata.title}
          Image: ${match.metadata.image}
          Rating: ${match.metadata.rating}
          Genres: ${match.metadata.genres}
          Description: ${match.metadata.description}
          Keywords: ${match.metadata.keywords}
          Language: ${match.metadata.language}
          \n\n
      `;
    });

    if (!response.matches || response.matches.length === 0) {
      return NextResponse.json({
        content:
          "No relevant movies found for your query. Please try again with different keywords.",
      });
    }

    const lastMessageContent = lastMessage.content + resultString;
    const lastDataWithoutLastMessage = data
      .slice(0, data.length - 1)
      .map((msg) => {
        if (typeof msg.content === "object") {
          return {
            ...msg,
            content: JSON.stringify(msg.content),
          };
        }
        return msg;
      });

    // const completion = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: [
    //     {
    //       role: "system",
    //       content: systemPrompt,
    //     },
    //     ...lastDataWithoutLastMessage,
    //     {
    //       role: "user",
    //       content: lastMessageContent,
    //     },
    //   ],
    //   max_tokens: 1000,
    //   temperature: 0.1,
    // });

    // let responseDataString = completion.choices[0].message.content;

    // responseDataString = responseDataString
    //   .replace(/\\n/g, "") // Remove newlines
    //   .replace(/\\'/g, "'") // Remove escaped single quotes
    //   .replace(/\\"/g, '"') // Remove escaped double quotes
    //   .trim(); // Trim any leading/trailing whitespace

    // let responseData;
    // try {
    //   responseData = JSON.parse(responseDataString);
    // } catch (error) {
    //   console.error("Error parsing response JSON:", error);
    //   responseData = {
    //     intro: "An error occurred while processing your request.",
    //     movies: [],
    //     outro: "Please try again later.",
    //   };
    // }

    const model = await genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
    });

    const previousMessages = lastDataWithoutLastMessage
      .map((message) => message.content)
      .join("\n");

    const prompt = `${previousMessages}\n\n${lastMessageContent}`;

    const completion = await model.generateContent(prompt);

    const responseData = await completion.response;
    let output = await responseData.text();

    if (output.startsWith("```") && output.endsWith("```")) {
      output = output.slice(3, -3).trim();

      if (output.startsWith("json")) {
        output = output.slice(4).trim();
      }
    }

    return NextResponse.json({ content: JSON.parse(output) });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: error.message || "An unknown error occurred" },
      { status: 500 }
    );
  }
}
