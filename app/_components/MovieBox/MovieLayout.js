"use client";

import MovieDetails from "@/app/_components/MovieBox/MovieDetails";
import MovieSearchForm from "@/app/_components/MovieBox/MovieSearchForm";
import Spinner from "@/app/_components/Spinner";
import { useMovies } from "@/app/_context/MoviesContext";
import { useSearchMovie } from "@/app/_hooks/useSearchMovie";
import placeholder from "@/public/images/watching-movie.png";
import { Box, Grid, Toolbar, Typography } from "@mui/material";
import Image from "next/image";
import { useState } from "react";

function ErrorMessage({ message }) {
  return (
    <Typography variant="h5" sx={{ pb: 4, textAlign: "center" }}>
      <span>⛔️</span> {message}
    </Typography>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.id} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.id, movie.movieType)}>
      <img
        src={
          !movie.poster_path
            ? "/images/placeholder.png"
            : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        }
        alt={`${movie.title || movie.name} poster`}
      />
      <Typography variant="h5">{movie.title || movie.name}</Typography>
      <div>
        <Typography variant="body1">
          <Typography variant="body3">🗓</Typography>
          <Typography variant="body3">
            {movie.release_date || movie.first_air_date}
          </Typography>
        </Typography>
      </div>
    </li>
  );
}

function MovieBox({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

function MovieLayout() {
  const { state, handleSelectMovie } = useMovies();
  const {} = useSearchMovie(state.formData);

  function handleCloseMovie() {
    handleSelectMovie(null);
  }

  return (
    <Grid item xs={12} md={10} component="main" sx={{ p: 2, height: "100%" }}>
      <Box
        sx={{
          p: 3,
          maxWidth: "65rem",
          width: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          transition: "margin-left 0.3s ease",
          // overflow: "scroll",
        }}
      >
        <Toolbar />
        <MovieSearchForm />

        <Grid
          container
          spacing={2}
          sx={{
            marginTop: 2,
            flexGrow: 1,
            height: "calc(100vh - 7.2rem - 3* 2.4rem)",
          }}
        >
          {!state.selectedId && (
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "4px",
                }}
              >
                <MovieBox>
                  {state.searchLoading && <Spinner />}
                  {!state.searchLoading && !state.searchError && (
                    <MovieList
                      movies={state.searchCollections}
                      onSelectMovie={(id, movieType) =>
                        handleSelectMovie(id, movieType)
                      }
                    />
                  )}

                  <Box
                    display="flex"
                    justifyContent="center"
                    flexDirection="column"
                    alignItems="center"
                    sx={{
                      width: "100%",
                      height: "100%",
                      textAlign: "center",
                      padding: "16px",
                    }}
                  >
                    {state.searchError && (
                      <ErrorMessage message={state.searchError} />
                    )}
                    {state.searchCollections.length == 0 &&
                      !state.searchLoading && (
                        <Image
                          src={placeholder}
                          width="100%"
                          alt="Movie Placeholder"
                          height={200}
                          placeholder="blur"
                          style={{
                            maxWidth: "100%",
                            height: "auto",
                            borderRadius: "4px",
                          }}
                        />
                      )}
                  </Box>
                </MovieBox>
              </Box>
            </Grid>
          )}
          {state.selectedId && (
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "4px",
                  paddingBottom: "20px",
                }}
              >
                <MovieBox>
                  <MovieDetails
                    selectedId={state.selectedId}
                    onCloseMovie={handleCloseMovie}
                  />
                </MovieBox>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </Grid>
  );
}

export default MovieLayout;
