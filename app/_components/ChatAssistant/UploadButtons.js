"use client";

import { Button } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";

export function FetchMovie() {
  const [loadingMovies, setLoadingMovies] = useState(false);

  async function fetchMovies() {
    setLoadingMovies(true);
    try {
      const response = await fetch("/api/tmdb", {
        method: "POST",
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Movies fetched and saved successfully");
      } else {
        toast.error("Failed to fetch and save movies");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingMovies(false);
    }
  }
  return (
    <Button
      onClick={fetchMovies}
      variant="contained"
      color="inherit"
      disabled={loadingMovies}
    >
      {loadingMovies ? "Fetching..." : "Fetch Movies"}
    </Button>
  );
}

export function UploadMovie() {
  const [loadingUploads, setLoadingUploads] = useState(false);

  async function uploadMovies() {
    setLoadingUploads(true);
    try {
      const response = await fetch("/api/uploadmovies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error uploading reviews: ${response.status} ${errorText}`
        );
      }

      const result = await response.json();
      toast.success("Reviews uploaded successfully:", result);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingUploads(false);
    }
  }
  return (
    <Button
      onClick={uploadMovies}
      variant="contained"
      color="inherit"
      disabled={loadingUploads}
    >
      {loadingUploads ? "Uploading..." : "Upload Movies"}
    </Button>
  );
}
export function RetryUpload() {
  const [loadingUploads, setLoadingUploads] = useState(false);

  const handleRetryUpload = async () => {
    setLoadingUploads(true);
    try {
      const response = await fetch("/api/pinecone", {
        method: "GET",
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message || "Upload successful.");
      } else {
        console.error("Error:", result.error);
        toast.error(result.error || "Failed to upload embeddings.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to connect to the server.");
    } finally {
      setLoadingUploads(false);
    }
  };
  return (
    <Button
      onClick={handleRetryUpload}
      variant="contained"
      color="inherit"
      disabled={loadingUploads}
    >
      {loadingUploads ? "Uploading..." : "Upload Pinecone"}
    </Button>
  );
}
