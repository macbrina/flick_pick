import axios from "axios";
import { load } from "cheerio";

const scrapeMovieData = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = load(data);

    const metaTag = $('meta[property="og:url"]').attr("content");
    const movieIdMatch = metaTag.match(/\/movie\/(\d+)/);
    const tvIdMatch = metaTag.match(/\/tv\/(\d+)/);

    const movieId = movieIdMatch ? movieIdMatch[1] : null;
    const tvId = tvIdMatch ? tvIdMatch[1] : null;

    if (!movieId && !tvId) {
      throw new Error("Movie or TV show ID not found");
    }

    return {
      movieId: movieId || null,
      tvId: tvId || null,
    };
  } catch (error) {
    console.error("Error scraping data:", error.message);
    throw new Error("Failed to scrape data");
  }
};

export default scrapeMovieData;
