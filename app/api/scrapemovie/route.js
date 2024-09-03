import scrapeMovieData from "@/app/_lib/scraper";
import { GENREIDSTONAME, LANGUAGEMAPPING } from "@/app/_utils/constants";
import { fetchWithRetry } from "@/app/_utils/fetchWithRetry";
import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const apiKey = process.env.TMDB_ACCESS_TOKEN;

const index = new Pinecone({
  apiKey: PINECONE_API_KEY,
})
  .index("movies")
  .namespace("ns1");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const fetchMovieDetailsById = async (movieId, type) => {
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
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error.message);
    throw new Error("Failed to fetch movie details");
  }
};

export async function POST(req) {
  try {
    const { url } = await req.json();

    let type;
    let fetchId;

    const { movieId, tvId } = await scrapeMovieData(url);

    if (movieId) {
      type = "movie";
      fetchId = movieId;
    } else {
      type = "tv";
      fetchId = tvId;
    }

    const movieData = await fetchMovieDetailsById(fetchId, type);

    const video = await fetchWithRetry(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/movievideo`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movieId: fetchId, type }),
      }
    );

    if (!video.ok) {
      throw new Error("Failed to fetch movie details");
    }

    const videoData = await video.json();

    const keywords = [
      movieData.title || movieData.name,
      ...movieData.genres.map((id) => GENREIDSTONAME(id)),
    ];
    const language = LANGUAGEMAPPING[movieData.original_language];
    const additionalData = movieId
      ? "Movie Single Movie"
      : "TV Show TvShow Series";

    const combined_text = `${
      movieData.title || movieData.name
    } ${language} ${additionalData} ${
      movieData.overview
    } ${movieData.genres.join(" ")} ${keywords.join(" ")}`;

    const embeddings = await openai.embeddings.create({
      input: combined_text,
      model: "text-embedding-3-small",
    });

    if (!embeddings.data || !embeddings.data[0].embedding) {
      throw new Error("Failed to retrieve embeddings.");
    }

    const processed_data = [
      {
        values: embeddings.data[0].embedding,
        id: String(movieData.id),
        metadata: {
          title: movieData.title || movieData.name,
          image: movieData.poster_path,
          rating: movieData.vote_average,
          genres: movieData.genres.map((genre) => genre.name),
          description: movieData.overview,
          keywords: keywords,
          language: language,
          movieType: movieId ? "movie" : "tv",
          type: movieId ? "movie" : "tv",
          source: "tmdb",
          ...videoData.data,
        },
      },
    ];

    const namespace = index.namespace("ns1");
    await namespace.upsert(processed_data);
    const data = [
      {
        id: movieData.id,
        poster_path: movieData.poster_path,
        movieType: movieId ? "movie" : "tv",
        title: movieData.title || movieData.name,
        release_date: movieData.release_date || movieData.first_air_date,
      },
    ];

    console.log("data", data);
    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    console.error("Error retrying upload to Pinecone:", error);
    return NextResponse.json(
      { error: "Failed to upload embeddings." },
      { status: 500 }
    );
  }
}
