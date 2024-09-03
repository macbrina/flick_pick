"use client";

import { CircularProgress, Stack, Typography } from "@mui/material";
import { useState, useTransition } from "react";
import DeleteDialog from "@/app/_components/DeleteDialog";

function WatchedMovie({ movie, onDeleteWatched }) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isPending, startTransistion] = useTransition();

  function handleDeleteConfirm() {
    setShowDeleteConfirmation(false);
    startTransistion(() => onDeleteWatched(movie.id));
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteClose = () => {
    setShowDeleteConfirmation(false);
  };

  return (
    <>
      <li>
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={`${movie.title} poster`}
        />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5">{movie.title}</Typography>
          <button
            className="btn-delete"
            onClick={handleDeleteClick}
            disabled={isPending}
          >
            {isPending ? <CircularProgress /> : "X"}
          </button>
        </Stack>
        <Stack direction="row" spacing={3} alignItems="center">
          <Typography variant="body1">
            <Typography variant="body3">
              ⭐️ {movie.tmdbRating.toFixed(1)}
            </Typography>
          </Typography>
          <Typography variant="body1">
            <Typography variant="body3">🌟 {movie.userRating}</Typography>
          </Typography>
          <Typography variant="body1">
            <Typography variant="body3">⏳ {movie.runtime} min</Typography>
          </Typography>
        </Stack>
      </li>

      <DeleteDialog
        onOpen={showDeleteConfirmation}
        onClose={handleDeleteClose}
        onDelete={handleDeleteConfirm}
        title={movie.title}
      />
    </>
  );
}

export default WatchedMovie;
