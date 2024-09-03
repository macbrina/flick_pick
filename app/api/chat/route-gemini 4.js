import fs from "fs";
import path from "path";
import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const recommendationSystemPrompt = `
    You are a movie recommendation assistant equipped with Retrieval-Augmented Generation (RAG). Your role is to understand user queries, retrieve relevant movie information, and provide recommendations. **Avoid generating harmful, offensive, or discriminatory content.** Your response should include the following fields: "intro", "movies", and "outro". 

    **Handling Edge Cases:**
    - If the user query is unclear or too broad, provide a general recommendation or request additional details.
    - If no exact match is found, suggest movies with similar attributes or popular options in the desired category.

    **Critical Instruction:**
      - When providing recommendations from the vector database, your response MUST include only the data after "Returned results from vector db (done automatically):" without any modifications, additions, or omissions.

    Ensure the response is a JSON object structured as follows:

    **JSON Response Format for Recommendations:**
    
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
        "videoKey": "videoKey"
        "videoSite": "videoSite"
        }
    ],
    "outro": "Conclusion message about the recommendations. Make it nice"
    }

    Return the all the data after 'Returned results from vector db (done automatically):' in JSON object. Do not include any additional text or explanations.
`;

const interactiveSystemPrompt = `You are an movie recommendation assistant that helps users with movie recommendations. When interacting with users, respond naturally based on the conversation's context. **Avoid generating harmful, offensive, or discriminatory content.** Avoid providing movie recommendations unless explicitly asked, and do not use the JSON format unless required for recommendations.

  **Critical Instructions:**
  - Engage in a friendly and interactive manner.
  - If the user hints at a need for recommendations, you can subtly guide them to ask for it, but don't push the recommendations directly.
  - Provide clear, contextually appropriate responses for non-recommendation queries.
  - Do not answer any query that is not movie related and remind the user that you are only tailored to be a movie recommendation assistant
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

    const embeddingsPath = path.join(
      process.cwd(),
      "app/_data/predefinedEmbeddings.json"
    );
    const predefinedEmbeddings = JSON.parse(
      fs.readFileSync(embeddingsPath, "utf8")
    );

    const cosineSimilarity = (vecA, vecB) => {
      const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
      const magnitudeA = Math.sqrt(
        vecA.reduce((acc, val) => acc + val * val, 0)
      );
      const magnitudeB = Math.sqrt(
        vecB.reduce((acc, val) => acc + val * val, 0)
      );
      return dotProduct / (magnitudeA * magnitudeB);
    };

    const similarities = predefinedEmbeddings.map((promptEmbedding) =>
      cosineSimilarity(embeddings.data[0].embedding, promptEmbedding.embedding)
    );
    // console.log("similarities", similarities);

    const similarityThreshold = 0.8;
    const isRecommendationQuery = similarities.some(
      (sim) => sim >= similarityThreshold
    );

    console.log("isRecommendationQuery", isRecommendationQuery);

    if (isRecommendationQuery) {
      const previouslyReturnedIds = data
        .filter((msg) => msg.content.movies)
        .flatMap((msg) => msg.content.movies.map((movie) => movie.id));

      const response = await index.query({
        vector: embeddings.data[0].embedding,
        includeMetadata: true,
        topK: 5,
        filter: {
          id: { $ne: previouslyReturnedIds.join("") }, // Exclude previously returned movie IDs
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
          videoKey: ${match.metadata.videoKey}
          videoSite: ${match.metadata.videoSite}
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

      const model = await genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: recommendationSystemPrompt,
      });

      const previousMessages = lastDataWithoutLastMessage
        .map((message) => message.content)
        .join("\n");

      console.log("previousMessages", lastMessageContent);

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

      console.log("non output", output);

      return NextResponse.json({ content: JSON.parse(output) });
    } else {
      const model = await genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: interactiveSystemPrompt,
      });

      const lastMessageContent = lastMessage.content;
      const lastDataWithoutLastMessage = data.slice(0, data.length - 1);

      const previousMessages = lastDataWithoutLastMessage
        .map((message) =>
          typeof message.content === "object"
            ? JSON.stringify(message.content)
            : message.content
        )
        .join("\n");

      const prompt = `${previousMessages}\n\n${lastMessageContent}`;

      console.log("previousMessages", prompt);

      const completion = await model.generateContent(prompt);
      const responseData = await completion.response;
      let output = await responseData.text();

      if (output.startsWith("```") && output.endsWith("```")) {
        output = output.slice(3, -3).trim();

        if (output.startsWith("json")) {
          output = output.slice(4).trim();
        }
      }

      console.log("output", output);

      return NextResponse.json({ content: output });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: error.message || "An unknown error occurred" },
      { status: 500 }
    );
  }
}
