const { fetchWithRetry } = require("@/app/_utils/fetchWithRetry");
const { NextResponse } = require("next/server");

const apiKey = process.env.TMDB_ACCESS_TOKEN;

export async function POST(req) {
  const { movieId, type } = await req.json();

  try {
    let url = `https://api.themoviedb.org/3/${type}/${movieId}`;
    const response = await fetchWithRetry(url, {
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

    const newData = {
      runtime: data.runtime || data.last_episode_to_air?.runtime || 0,
    };

    return NextResponse.json({ success: true, data: newData });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch movie video." },
      { status: 500 }
    );
  }
}
