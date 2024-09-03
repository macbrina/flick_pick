import { fetchWithRetry } from "@/app/_utils/fetchWithRetry";
import { NextResponse } from "next/server";

const apiKey = process.env.TMDB_ACCESS_TOKEN;

export async function POST(req) {
  try {
    const { movieId, type } = await req.json();

    const url = new URL(
      `https://api.themoviedb.org/3/${type}/${movieId}/videos`
    );
    url.searchParams.append("api_key", apiKey);

    const response = await fetchWithRetry(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch video for movie ID ${movieId}`);
    }

    const data = await response.json();
    const video = data.results[0];

    const newData = {
      videoKey: video?.key || null,
      videoName: video?.name || null,
      videoSite: video?.site || null,
    };

    return NextResponse.json({ success: true, data: newData });
  } catch (error) {
    console.error("Error retrying fetch movie video:", error);
    return NextResponse.json(
      { error: "Failed to fetch movie video." },
      { status: 500 }
    );
  }
}
