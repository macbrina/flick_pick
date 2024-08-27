"use client";

import { useState, useEffect } from "react";
import { useMovies } from "@/app/_context/MoviesContext";

const KEY = "5220e97f";

export function useSearchMovie(query) {
  const { state, dispatch, updateSearchList, handleSelectMovie } = useMovies();

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          dispatch({ type: "SET_SEARCH_LOADING", payload: true });
          dispatch({ type: "SET_SEARCH_ERROR", payload: "" });
          handleSelectMovie(null);

          const res = await fetch(`/api/search`, {
            signal: controller.signal,
            method: "POST",
            "Content-Type": "application/json",
            body: JSON.stringify(query),
          });

          if (!res.ok)
            throw new Error("Something went wrong with fetching movies");

          const data = await res.json();
          if (!data.success) throw new Error(data.error || "Movie not found");

          if (data.data.movieData.length == 0)
            throw new Error("Movie not found");

          updateSearchList(data.data.movieData);
          dispatch({ type: "SET_SEARCH_ERROR", payload: "" });
        } catch (err) {
          if (err.name !== "AbortError") {
            dispatch({ type: "SET_SEARCH_ERROR", payload: err.message });
          }
        } finally {
          dispatch({ type: "SET_SEARCH_LOADING", payload: false });
        }
      }

      if (query.movieName.length < 3) {
        updateSearchList([]);
        dispatch({ type: "SET_SEARCH_ERROR", payload: "" });
        return;
      }

      if (query.movieName != "") {
        fetchMovies();
      }

      return function () {
        controller.abort();
      };
    },
    [query, updateSearchList, dispatch]
  );

  return {};
}
