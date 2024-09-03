import analyzeSentiment from "@/app/_lib/sentiment";
import { fetchWithRetry } from "@/app/_utils/fetchWithRetry";

const { NextResponse } = require("next/server");

const apiKey = process.env.TMDB_ACCESS_TOKEN;

export async function POST(req) {
  const { movieId, type } = await req.json();

  try {
    const response = await fetchWithRetry(
      `https://api.themoviedb.org/3/${type}/${movieId}/reviews`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to fetch movies");
    }

    const data = await response.json();

    const reviews = data.results.slice(0, 10);

    if (reviews.length === 0) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: `No reviews found for this ${
            type == "movie" ? "movie" : "Tv Show"
          }.`,
        }),
        { status: 404 }
      );
    }

    const sentimentPromises = reviews.map((review) =>
      analyzeSentiment(review.content)
    );

    const sentiments = await Promise.all(sentimentPromises);

    const totalScore = sentiments.reduce(
      (sum, sentiment) => sum + sentiment.score,
      0
    );
    const averageScore = totalScore / sentiments.length;
    const overallSentimentType =
      averageScore > 0 ? "Positive" : averageScore < 0 ? "Negative" : "Neutral";

    const result = {
      overallSentimentScore: averageScore,
      overallSentimentType: overallSentimentType,
    };

    return new NextResponse(JSON.stringify({ success: true, data: result }), {
      status: 200,
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
