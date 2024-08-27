import { Stack } from "@mui/material";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function WatchSummary({ watchlist }) {
  const avgImdbRating = average(watchlist.map((movie) => movie.tmdbRating));
  const avgUserRating = average(watchlist.map((movie) => movie.userRating));
  const avgRuntime = average(watchlist.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h4>WatchList</h4>
      <Stack direction="row" spacing={2} alignItems="center">
        <p>
          <span>#️⃣</span>
          <span>{watchlist.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </Stack>
    </div>
  );
}

export default WatchSummary;
