"use client";

import { useMovies } from "@/app/_context/MoviesContext";
import { GENREOPTIONS, LANGUAGEOPTIONS } from "@/app/_utils/constants";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

const MovieFilterForm = ({ onClose }) => {
  const { updateFormData, state, updateSearchList, dispatch } = useMovies();

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  async function handleFilterChange(e) {
    e.preventDefault();
    const query = { ...state.formData };
    onClose();

    try {
      dispatch({ type: "SET_SEARCH_LOADING", payload: true });
      dispatch({ type: "SET_SEARCH_ERROR", payload: "" });

      const res = await fetch(`/api/search`, {
        method: "POST",
        "Content-Type": "application/json",
        body: JSON.stringify(query),
      });

      if (!res.ok) throw new Error("Something went wrong with fetching movies");

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Movie not found");

      if (data.data.length == 0) throw new Error("Movie not found");

      updateSearchList(data.data);
      dispatch({ type: "SET_SEARCH_ERROR", payload: "" });
    } catch (err) {
      if (err.name !== "AbortError") {
        dispatch({ type: "SET_SEARCH_ERROR", payload: err.message });
      }
    } finally {
      dispatch({ type: "SET_SEARCH_LOADING", payload: false });
    }
  }

  return (
    <Box
      component="form"
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <FormControl fullWidth>
        <InputLabel>Genre</InputLabel>
        <Select
          value={state.formData.genre}
          onChange={handleChange}
          label="Genre"
          name="genre"
        >
          {GENREOPTIONS.map((g) => (
            <MenuItem key={g.id} value={g.id}>
              {g.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Language</InputLabel>
        <Select
          value={state.formData.language}
          onChange={handleChange}
          label="Language"
          name="language"
        >
          {LANGUAGEOPTIONS.map((l) => (
            <MenuItem key={l.code} value={l.code}>
              {l.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Type</InputLabel>
        <Select
          value={state.formData.type}
          onChange={handleChange}
          label="Type"
          name="type"
        >
          <MenuItem value="movie">Movies</MenuItem>
          <MenuItem value="tv">TV Shows</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Release Year"
        type="number"
        value={state.formData.releaseYear}
        name="releaseYear"
        onChange={handleChange}
        fullWidth
        sx={{
          "& .MuiOutlinedInput-root": { padding: "0px", borderRadius: "0px" },
        }}
      />
      <Button
        onClick={handleFilterChange}
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        disabled={state.searchLoading}
      >
        Apply Filters
      </Button>
    </Box>
  );
};

export default MovieFilterForm;
