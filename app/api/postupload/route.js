import { retryAsync } from "@/app/_utils/retryAsync";
import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = "text-embedding-3-small";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const index = new Pinecone({
  apiKey: PINECONE_API_KEY,
})
  .index("movies")
  .namespace("ns1");

export async function POST(req) {
  const { pineconeData } = await req.json();
  const movie = pineconeData;

  const combined_text = `${movie.title} ${movie.postContent} ${
    movie.language
  } ${movie.description} ${movie.genres.join(" ")} ${movie.keywords.join(" ")}`;

  let processed_data;

  try {
    const embeddings = await retryAsync(async () => {
      const response = await openai.embeddings.create({
        input: combined_text,
        model: MODEL,
      });

      if (!response.data || !response.data[0].embedding) {
        throw new Error("Failed to retrieve embeddings.");
      }

      return response;
    });

    processed_data = [
      {
        values: embeddings.data[0].embedding,
        id: movie.id,
        metadata: {
          title: movie.title,
          image: movie.image,
          rating: movie.rating,
          genres: movie.genres,
          description: movie.description,
          keywords: movie.keywords,
          language: movie.language,
          videoKey: movie.videoKey,
          videoSite: movie.videoSite,
          movieType: movie.movieType,
          type: movie.type,
          source: movie.source,
        },
      },
    ];

    await retryAsync(async () => {
      const namespace = index.namespace("ns1");
      await namespace.upsert(processed_data);
    });

    return NextResponse.json({
      success: true,
      message: "Processing complete.",
    });
  } catch (error) {
    console.error(`Error processing movie ${movie.id}:`, error);
    return NextResponse.json({
      success: false,
      message: "Failed to upload movie to pinecone",
    });
  }
}
