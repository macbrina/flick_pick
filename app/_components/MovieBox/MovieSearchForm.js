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
  FormControl,
  InputLabel,
  Select,
  Grid,
  useMediaQuery,
} from "@mui/material";
import { Close, CloudDownload, FilterList, Sync } from "@mui/icons-material";
import MovieFilterForm from "@/app/_components/MovieBox/MovieFilterForm";
import { useMovies } from "@/app/_context/MoviesContext";
import { useKey } from "@/app/_hooks/useKey";
import MovieLinkSubmissionForm from "./MovieLinkSubmissionForm";

const MovieSearchForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrapModalOpen, setIsScrapModalOpen] = useState(false);
  const { updateFormData, state, dispatch } = useMovies();
  const inputEl = useRef(null);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));

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
    if (name == "movieName" && value.trim() !== "" && value.length >= 3) {
      dispatch({ type: "SET_SEARCH_LOADING", payload: true });
    } else {
      dispatch({ type: "SET_SEARCH_LOADING", payload: false });
    }
    updateFormData({ [name]: value });
  };

  return (
    <>
      <Box sx={{ flexGrow: 1, marginTop: 2 }}>
        <Grid container spacing={2} justifyContent="center" alignItems="center">
          <Grid item xs={12} sm={12} md={6}>
            <TextField
              label="Search Movies..."
              value={state.formData.movieName}
              name="movieName"
              onChange={handleChange}
              fullWidth
              inputRef={inputEl}
              sx={{
                mb: 2,
                marginBottom: "0px",
                padding: "0px",
                borderRadius: "0px",
                "& .MuiOutlinedInput-root": { padding: "0px" },
              }}
            />
          </Grid>
          <Grid item xs={7} sm={8} md={4}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={state.formData.type}
                onChange={handleChange}
                label="Type"
                name="type"
                sx={{
                  "& .MuiSelect-root": {
                    borderRadius: "50px",
                  },
                  borderRadius: "50px",
                }}
              >
                <MenuItem value="movie">Movies</MenuItem>
                <MenuItem value="tv">TV Shows</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={5} sm={4} md={2} container spacing={2}>
            <Grid item>
              <Tooltip title="Filter Movies">
                <IconButton
                  onClick={handleOpen}
                  sx={{ backgroundColor: "#6741D9" }}
                >
                  <FilterList sx={{ color: "#fff !important" }} />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Scrape Movie">
                <IconButton
                  onClick={() => setIsScrapModalOpen(true)}
                  sx={{ backgroundColor: "#6741D9" }}
                >
                  <Sync sx={{ color: "#fff !important" }} />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>

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
              width: isMobile ? "90%" : "50%",
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography id="filter-modal-title" gutterBottom>
              Filter Movies
            </Typography>
            <button
              className="btn-toggle"
              onClick={() => setIsModalOpen(false)}
            >
              <Tooltip title="Close">
                <Close sx={{ color: "#fff" }} />
              </Tooltip>
            </button>
            <MovieFilterForm onClose={handleClose} />
          </Box>
        </Modal>

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
              width: isMobile ? "90%" : "60%",
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography id="scrape-modal-title" gutterBottom>
              Scrape Movie
            </Typography>
            <button
              className="btn-toggle"
              onClick={() => setIsScrapModalOpen(false)}
            >
              <Tooltip title="Close">
                <Close sx={{ color: "#fff" }} />
              </Tooltip>
            </button>
            <MovieLinkSubmissionForm
              onClose={() => setIsScrapModalOpen(false)}
            />
          </Box>
        </Modal>
      </Box>
    </>
  );
};

export default MovieSearchForm;
