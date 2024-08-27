import { Pinecone } from "@pinecone-database/pinecone";
import fetch from "node-fetch";
import fs from "fs";
import { NextResponse } from "next/server";

const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const MODEL = "intfloat/multilingual-e5-large";

const index = new Pinecone({
  apiKey: PINECONE_API_KEY,
})
  .index("movies")
  .namespace("ns1");

export async function POST() {
  const movies = JSON.parse(fs.readFileSync("app/_data/movies.json", "utf-8"));
  const processed_data = [];

  for (const movie of movies) {
    const combined_text = `${movie.title} ${
      movie.description
    } ${movie.genres.join(" ")} ${movie.keywords.join(" ")}`;
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: { text: combined_text, wait_for_model: true },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Error response body:", errorBody);
      throw new Error(`Failed to fetch embeddings: ${response.statusText}`);
    }

    const embeddingResponse = await response.json();

    if (!embeddingResponse || embeddingResponse.length !== 1024) {
      throw new Error("Invalid embedding dimension.");
    }

    processed_data.push({
      values: embeddingResponse,
      id: movie.id,
      metadata: {
        title: movie.title,
        image: movie.image,
        rating: movie.rating,
        genres: movie.genres,
        description: movie.description,
        keywords: movie.keywords,
        language: movie.language,
      },
    });
  }
  try {
    const namespace = index.namespace("ns1");
    await namespace.upsert(processed_data);
  } catch (error) {
    console.error("Error uploading to Pinecone:", error);
  }

  return NextResponse(processed_data);
}
