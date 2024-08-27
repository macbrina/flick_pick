import Sentiment from "sentiment";
const sentiment = new Sentiment();

const analyzeSentiment = (text) => {
  const result = sentiment.analyze(text);
  return {
    score: result.score,
    comparative: result.comparative,
    sentiment:
      result.score > 0 ? "Positive" : result.score < 0 ? "Negative" : "Neutral",
  };
};

export default analyzeSentiment;
