import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import fs from "fs/promises";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const BATCH_SIZE = 100;

const index = new Pinecone({
  apiKey: PINECONE_API_KEY,
})
  .index("movies")
  .namespace("ns1");

export async function GET() {
  try {
    const embeddingsData = await fs.readFile(
      "app/_data/embeddings.json",
      "utf-8"
    );
    let processed_data = JSON.parse(embeddingsData);

    processed_data = processed_data.map((item) => {
      const { video } = item.metadata;
      const videoKey = video?.key || "";
      const videoSite = video?.site || "";
      const videoName = video?.name || "";

      return {
        ...item,
        metadata: {
          ...item.metadata,
          videoKey,
          videoSite,
          videoName,
          video: undefined,
        },
      };
    });

    const totalItems = processed_data.length;
    const totalBatches = Math.ceil(totalItems / BATCH_SIZE);
    const namespace = index.namespace("ns1");

    for (let i = 0; i < totalItems; i += BATCH_SIZE) {
      const batch = processed_data.slice(i, i + BATCH_SIZE);
      console.log(
        `Batch ${
          Math.floor(i / BATCH_SIZE) + 1
        } of ${totalBatches} processed successfully.`
      );
      await namespace.upsert(batch);
    }

    return NextResponse.json({ success: true, message: "Upload successful." });
  } catch (error) {
    console.error("Error retrying upload to Pinecone:", error);
    return NextResponse.json(
      { error: "Failed to upload embeddings." },
      { status: 500 }
    );
  }
}
