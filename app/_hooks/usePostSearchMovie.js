"use client";

import { useState, useEffect } from "react";
import { useMovies } from "@/app/_context/MoviesContext";

export function usePostSearchMovie({ movieName, type }) {
  const [error, setError] = useState("");
  const [searchList, setSearchList] = useState([]);
  const { state, dispatch } = useMovies();

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          dispatch({ type: "SET_POST_SEARCH_LOADING", payload: true });
          setError("");

          const res = await fetch(`/api/search`, {
            signal: controller.signal,
            method: "POST",
            "Content-Type": "application/json",
            body: JSON.stringify({ movieName: movieName, type: type }),
          });

          if (!res.ok)
            throw new Error("Something went wrong with fetching movies");

          const data = await res.json();
          if (!data.success) throw new Error(data.error || "Movie not found");

          if (data.data.movieData.length == 0)
            throw new Error("Movie not found");

          setSearchList(data.data.movieData);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          dispatch({ type: "SET_POST_SEARCH_LOADING", payload: false });
        }
      }

      if (movieName.length < 3) {
        setSearchList([]);
        setError("");
        return;
      }

      if (movieName != "") {
        fetchMovies();
      }

      return function () {
        controller.abort();
      };
    },
    [movieName, type, dispatch]
  );

  return {
    searchList,
    error,
  };
}
