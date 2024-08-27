import axios from "axios";
import { load } from "cheerio";

const scrapeMovieData = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = load(data);

    const metaTag = $('meta[property="og:url"]').attr("content");
    const movieIdMatch = metaTag.match(/\/movie\/(\d+)/);
    const movieId = movieIdMatch ? movieIdMatch[1] : null;

    if (!movieId) {
      throw new Error("Movie ID not found");
    }
    return movieId;
  } catch (error) {
    console.error("Error scraping data:", error.message);
    throw new Error("Failed to scrape data");
  }
};

export default scrapeMovieData;
