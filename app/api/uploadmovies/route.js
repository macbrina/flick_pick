import { Pinecone } from "@pinecone-database/pinecone";
import fs from "fs/promises";
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

export async function POST() {
  let movies;
  try {
    const filePath = "app/_data/movies.json";
    const fileData = await fs.readFile(filePath, "utf-8");
    movies = JSON.parse(fileData);
  } catch (error) {
    console.error("Error reading or parsing movies.json:", error);
    return NextResponse.json(
      { error: "Failed to read or parse movies.json" },
      { status: 500 }
    );
  }

  const processed_data = [];

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    const combined_text = `${movie.title} ${movie.language} ${
      movie.description
    } ${movie.genres.join(" ")} ${movie.keywords.join(" ")}`;

    try {
      const embeddings = await openai.embeddings.create({
        input: combined_text,
        model: MODEL,
      });

      if (!embeddings.data || !embeddings.data[0].embedding) {
        throw new Error("Failed to retrieve embeddings.");
      }

      processed_data.push({
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
          videoKey: movie.video.key,
          videoSite: movie.video.site,
          movieType: "movie",
        },
      });

      console.log(
        `Processed movie ${i + 1} of ${movies.length}. Remaining: ${
          movies.length - i - 1
        }`
      );
    } catch (error) {
      console.error(`Error processing movie ${movie.id}:`, error);
    }
  }

  try {
    await fs.writeFile(
      "app/_data/embeddings.json",
      JSON.stringify(processed_data, null, 2)
    );
  } catch (error) {
    console.error("Error saving embeddings:", error);
  }

  try {
    const namespace = index.namespace("ns1");
    await namespace.upsert(processed_data);
  } catch (error) {
    console.error("Error uploading to Pinecone:", error);
  }

  return NextResponse.json({ success: true, message: "Processing complete." });
}
