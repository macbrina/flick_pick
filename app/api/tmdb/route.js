import { GENREIDSTONAME, LANGUAGEMAPPING } from "@/app/_utils/constants";
import fs from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

async function appendMoviesToFile(movies) {
  const filePath = path.join(process.cwd(), "app", "_data", "movies.json");

  try {
    let fileData = await fs.readFile(filePath, "utf8");
    const existingMovies = JSON.parse(fileData);

    const updatedMovies = [...existingMovies, ...movies];

    await fs.writeFile(filePath, JSON.stringify(updatedMovies, null, 2));
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(filePath, JSON.stringify(movies, null, 2));
    } else {
      console.error("Error appending movies:", error);
    }
  }
}

async function fetchMovieVideo(movieId, apiKey) {
  const url = new URL(`https://api.themoviedb.org/3/movie/${movieId}/videos`);
  url.searchParams.append("api_key", apiKey);

  console.log(`Fetching video for movie ID ${movieId}...`);

  const response = await fetch(url.toString(), {
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
  console.log(`Fetched ${data.results.length} videos for movie ID ${movieId}.`);

  // Assuming you want to pick the first video, or you can apply additional logic to select the video you want
  const video = data.results[0];

  return {
    id: video?.id || null,
    key: video?.key || null,
    name: video?.name || null,
    site: video?.site || null,
    type: video?.type || null,
  };
}

export async function POST() {
  const apiKey = process.env.TMDB_ACCESS_TOKEN;
  const totalPages = 100;
  const movies = [];

  console.log("Starting movie fetch process...");

  for (let page = 1; page <= totalPages; page++) {
    console.log(`Fetching page ${page} of movies...`);

    const url = new URL("https://api.themoviedb.org/3/discover/movie");
    url.searchParams.append("sort_by", "popularity.desc");
    url.searchParams.append("include_adult", "true");
    url.searchParams.append("page", page.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch movies:", await response.text());
      return new NextResponse(
        JSON.stringify({ error: "Failed to fetch movies" }),
        {
          status: 500,
        }
      );
    }

    const data = await response.json();
    console.log(`Fetched ${data.results.length} movies from page ${page}.`);

    for (const movie of data.results) {
      const movieData = {
        id: movie.id.toString(),
        title: movie.title,
        image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        rating: movie.vote_average,
        genres: movie.genre_ids.map((id) => GENREIDSTONAME(id)),
        description: movie.overview,
        keywords: [
          movie.title,
          ...movie.genre_ids.map((id) => GENREIDSTONAME(id)),
        ],
        language: LANGUAGEMAPPING[movie.original_language] || "Unknown",
        video: {}, // Initialize video as an object
      };

      try {
        const video = await fetchMovieVideo(movie.id, apiKey);
        movieData.video = video;
        console.log(`Added video for movie ID ${movie.id}.`);
      } catch (error) {
        console.error(`Error fetching video for movie ID ${movie.id}:`, error);
      }

      movies.push(movieData);
    }
  }

  await appendMoviesToFile(movies);

  console.log("Movie fetch process completed.");

  return new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
  });
}
