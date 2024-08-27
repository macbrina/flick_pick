import { NextResponse } from "next/server";

const apiKey = process.env.TMDB_ACCESS_TOKEN;

export async function POST(req) {
  const { movieName, genre, language, releaseYear, movieId } = await req.json();

  try {
    let url = `https://api.themoviedb.org/3/`;

    if (movieId) {
      url += `movie/${movieId}`;
    } else if (movieName) {
      url += `search/movie?query=${encodeURIComponent(movieName)}`;
    } else {
      url += `discover/movie?sort_by=popularity.desc`;

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

    const response = await fetch(url, {
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

    if (movieId) {
      const creditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits`;

      const creditsResponse = await fetch(creditsUrl, {
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
      const movieData = data.results || data;
      return new NextResponse(
        JSON.stringify({ success: true, data: { movieData, creditsData } }),
        { status: 200 }
      );
    } else {
      throw new Error("No results found");
    }
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
