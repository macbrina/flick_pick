"use client";

import PostMovieBox from "@/app/_components/Timeline/PostMovieBox";
import { useMovies } from "@/app/_context/MoviesContext";
import { useKey } from "@/app/_hooks/useKey";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useRef } from "react";

const PostSearchForm = ({
  movieName,
  type,
  onChangeMovieName,
  onChangeType,
  searchList,
  error,
  onClose,
}) => {
  const inputEl = useRef(null);
  const { dispatch, state } = useMovies();

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setMovieName("");
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name == "movieName" && value.trim() !== "" && value.length >= 3) {
      dispatch({ type: "SET_POST_SEARCH_LOADING", payload: true });
    } else {
      dispatch({ type: "SET_POST_SEARCH_LOADING", payload: false });
    }
    onChangeMovieName(value);
  };

  return (
    <Grid container justifyContent="center" sx={{ height: "100%" }}>
      <Box sx={{ flexGrow: 1, marginTop: 2 }}>
        <Grid container spacing={2} justifyContent="center">
          {!state.postSelectedId && (
            <>
              <Grid item xs={12} sm={8} md={8}>
                <TextField
                  label="Search Movies..."
                  value={movieName}
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
              <Grid item xs={12} sm={4} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={type}
                    onChange={(e) => onChangeType(e.target.value)}
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
            </>
          )}
          <PostMovieBox
            error={error}
            searchList={searchList}
            onClose={onClose}
          />
        </Grid>
      </Box>
    </Grid>
  );
};

export default PostSearchForm;
