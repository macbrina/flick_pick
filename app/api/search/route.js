import { fetchWithRetry } from "@/app/_utils/fetchWithRetry";
import { NextResponse } from "next/server";

const apiKey = process.env.TMDB_ACCESS_TOKEN;

export async function POST(req) {
  const { movieName, genre, language, releaseYear, movieId, type } =
    await req.json();

  try {
    let url = `https://api.themoviedb.org/3/`;

    if (movieId && type) {
      url += `${type}/${movieId}`;
    } else if (movieName && type === "movie") {
      url += `search/${type}?query=${encodeURIComponent(movieName)}`;
    } else {
      url += `discover/${type}?sort_by=popularity.desc`;

      if (genre) {
        url += `&with_genres=${genre}`;
      }

      if (language) {
        url += `&with_original_language=${language}`;
      }

      if (releaseYear) {
        url += `&primary_release_year=${releaseYear}`;
      }
    }

    const response = await fetchWithRetry(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(errorText || "Failed to fetch movies");
    }

    let creditsData = null;

    if (movieId && type) {
      const creditsUrl = `https://api.themoviedb.org/3/${type}/${movieId}/credits`;

      const creditsResponse = await fetchWithRetry(creditsUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!creditsResponse.ok) {
        const errorData = await creditsResponse.json();
        throw new Error(
          errorData.status_message || "Failed to fetch movie credits"
        );
      }

      creditsData = await creditsResponse.json();
    }

    const data = await response.json();

    if (data || data.results) {
      const mData = data.results || data;

      const movieData = Array.isArray(mData)
        ? mData.map((item) => ({ ...item, movieType: type }))
        : { ...mData, movieType: type };

      return new NextResponse(
        JSON.stringify({ success: true, data: { movieData, creditsData } }),
        { status: 200 }
      );
    } else {
      throw new Error("No results found");
    }
  } catch (error) {
    console.log("error", error);
    return new NextResponse(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
