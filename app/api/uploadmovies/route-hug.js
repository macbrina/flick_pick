import { Pinecone } from "@pinecone-database/pinecone";
import fetch from "node-fetch";
import fs from "fs/promises";
import { NextResponse } from "next/server";

const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const MODEL = "intfloat/multilingual-e5-large";
const RETRY_INTERVAL = 5000;
const MAX_RETRIES = 10;

const index = new Pinecone({
  apiKey: PINECONE_API_KEY,
})
  .index("movies")
  .namespace("movies-h");

async function fetchEmbeddings(combined_text, retryCount = 0) {
  try {
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

    if (response.ok) {
      return await response.json();
    } else {
      const errorBody = await response.text();
      const errorData = JSON.parse(errorBody);

      if (
        errorData.error &&
        errorData.error.includes(
          "Model intfloat/multilingual-e5-large is currently loading"
        )
      ) {
        if (retryCount < MAX_RETRIES) {
          console.log(
            `Model is still loading. Retrying in ${
              RETRY_INTERVAL / 1000
            } seconds...`
          );
          await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
          return await fetchEmbeddings(combined_text, retryCount + 1);
        } else {
          throw new Error(`Model failed to load after ${MAX_RETRIES} retries.`);
        }
      } else {
        throw new Error(`Failed to fetch embeddings: ${response.statusText}`);
      }
    }
  } catch (error) {
    throw new Error(`Error in fetchEmbeddings: ${error.message}`);
  }
}

export async function POST() {
  try {
    const movies = JSON.parse(
      await fs.readFile("app/_data/movies.json", "utf-8")
    );
    const processed_data = [];

    for (const movie of movies) {
      const combined_text = `${movie.title} ${movie.language} ${
        movie.description
      } ${movie.genres.join(" ")} ${movie.keywords.join(" ")}`;

      try {
        const embeddingResponse = await fetchEmbeddings(combined_text);

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
            videoKey: movie.video.key,
            videoSite: movie.video.site,
            movieType: "movie",
          },
        });

        console.log(
          `Processed movie ${movies.indexOf(movie) + 1} of ${
            movies.length
          }. Remaining: ${movies.length - movies.indexOf(movie) - 1}`
        );
      } catch (error) {
        console.error(`Error processing movie ${movie.id}:`, error);
      }
    }

    try {
      await fs.writeFile(
        "app/_data/embeddingsHugging.json",
        JSON.stringify(processed_data, null, 2)
      );
    } catch (error) {
      console.error("Error saving embeddings:", error);
    }

    try {
      const namespace = index.namespace("movies-h");
      await namespace.upsert(processed_data);
    } catch (error) {
      console.error("Error uploading to Pinecone:", error);
    }

    return NextResponse.json({
      success: true,
      message: "Processing complete.",
    });
  } catch (error) {
    console.error("Error reading movies.json file:", error);
    return NextResponse.json({
      success: false,
      message: "Error processing data.",
    });
  }
}
