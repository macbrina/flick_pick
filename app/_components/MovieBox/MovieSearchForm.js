"use client";

import React, { useRef, useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Tooltip,
  IconButton,
  Modal,
} from "@mui/material";
import { CloudDownload, FilterList, Sync } from "@mui/icons-material";
import MovieFilterForm from "@/app/_components/MovieBox/MovieFilterForm";
import { useMovies } from "@/app/_context/MoviesContext";
import { useKey } from "@/app/_hooks/useKey";
import MovieLinkSubmissionForm from "./MovieLinkSubmissionForm";

const MovieSearchForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrapModalOpen, setIsScrapModalOpen] = useState(false);
  const { updateFormData, state } = useMovies();
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    updateFormData({ ["movieName"]: "" });
  });

  const handleOpen = (event) => {
    event.preventDefault();
    setIsModalOpen(true);
  };

  const handleClose = (event) => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        mt: 2,
      }}
    >
      <TextField
        label="Search Movies..."
        value={state.formData.movieName}
        name="movieName"
        onChange={handleChange}
        fullWidth
        inputRef={inputEl}
        sx={{
          mb: 2,
          marginBottom: "opx",
          padding: "0px",
          borderRadius: "0px",
          "& .MuiOutlinedInput-root": { padding: "0px" },
        }}
      />
      <Tooltip title="Filter Movies">
        <IconButton onClick={handleOpen} sx={{ backgroundColor: "#6741D9" }}>
          <FilterList />
        </IconButton>
      </Tooltip>
      <Modal
        open={isModalOpen}
        onClose={handleClose}
        aria-labelledby="filter-modal-title"
        aria-describedby="filter-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="filter-modal-title" gutterBottom>
            Filter Movies
          </Typography>
          <MovieFilterForm onClose={handleClose} />
        </Box>
      </Modal>
      <Tooltip title="Scrap Movie">
        <IconButton
          onClick={() => setIsScrapModalOpen(true)}
          sx={{ backgroundColor: "#6741D9" }}
        >
          <Sync />
        </IconButton>
      </Tooltip>
      <Modal
        open={isScrapModalOpen}
        onClose={() => setIsScrapModalOpen(false)}
        aria-labelledby="scrape-modal-title"
        aria-describedby="scrape-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="filter-modal-title" gutterBottom>
            Scrape Movie
          </Typography>
          <MovieLinkSubmissionForm onClose={() => setIsScrapModalOpen(false)} />
        </Box>
      </Modal>
    </Box>
  );
};

export default MovieSearchForm;
