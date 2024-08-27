import { NextResponse } from "next/server";

const apiKey = process.env.TMDB_ACCESS_TOKEN;

export async function POST(req) {
  try {
    const { movieId } = await req.json();

    const url = `https://api.themoviedb.org/3/movie/${movieId}/videos`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch movie details");
    }

    const data = await response.json();

    return NextResponse.json({ success: true, data: data.results[0] });
  } catch (error) {
    console.error("Error retrying fetch movie video:", error);
    return NextResponse.json(
      { error: "Failed to fetch movie video." },
      { status: 500 }
    );
  }
}
