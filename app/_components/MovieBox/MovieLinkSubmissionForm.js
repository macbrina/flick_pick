import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { useMovies } from "@/app/_context/MoviesContext";

const MovieLinkSubmissionForm = ({ onClose }) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { updateSearchList } = useMovies();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (url.trim() == "") return;

    if (
      !url.startsWith(
        "https://www.themoviedb.org/movie" ||
          !url.startsWith(
            "https://themoviedb.org/movie" ||
              !url.startsWith("https://www.themoviedb.org/movie")
          )
      )
    ) {
      toast.error(
        "Invalid URL. Please enter a valid The Movie Database page URL."
      );
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch("/api/scrapemovie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Data successfully submitted!");
        updateSearchList(result.data);
        onClose();
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 2,
      }}
    >
      <TextField
        variant="outlined"
        label="Enter TDMB page URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        fullWidth
        sx={{ mb: 2, "& .MuiOutlinedInput-root": { padding: "0px" } }}
      />
      <Button
        onClick={handleSubmit}
        variant="contained"
        color="primary"
        sx={{ width: "100%" }}
        disabled={isLoading}
      >
        {isLoading ? "Scraping..." : "Submit"}
      </Button>
    </Box>
  );
};

export default MovieLinkSubmissionForm;
