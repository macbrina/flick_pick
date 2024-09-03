import { Stack, Tooltip } from "@mui/material";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.tmdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h4>Movies you watched</h4>
      <Stack direction="row" spacing={2} alignItems="center">
        <Tooltip title="Movie length">
          <p>
            <span>#️⃣</span>
            <span>{watched.length} movies</span>
          </p>
        </Tooltip>
        <Tooltip title="TMDB Rating">
          <p>
            <span>⭐️</span>
            <span>{avgImdbRating.toFixed(2)}</span>
          </p>
        </Tooltip>
        <Tooltip title="User Rating">
          <p>
            <span>🌟</span>
            <span>{avgUserRating.toFixed(2)}</span>
          </p>
        </Tooltip>
        <Tooltip title="Runtime">
          <p>
            <span>⏳</span>
            <span>{avgRuntime.toFixed(2)} min</span>
          </p>
        </Tooltip>
      </Stack>
    </div>
  );
}

export default WatchedSummary;
