"use client";

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Box,
  Chip,
  useMediaQuery,
  CardMedia,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarHalfIcon from "@mui/icons-material/StarHalf";

const getStarIcons = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const totalStars = 10;

  for (let i = 0; i < totalStars; i++) {
    if (i < fullStars) {
      stars.push(<StarIcon key={i} sx={{ color: "#fcc419" }} />);
    } else if (i === fullStars && halfStar) {
      stars.push(<StarHalfIcon key={i} sx={{ color: "#fcc419" }} />);
    } else {
      stars.push(<StarBorderIcon key={i} />);
    }
  }
  return stars;
};

const MovieCard = ({
  title,
  image,
  rating,
  genres,
  description,
  keywords,
  language,
}) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Card variant="outlined" sx={{ mb: 2, p: 1 }}>
      <CardMedia
        component="img"
        image={image}
        alt={title}
        sx={{
          height: isMobile ? 200 : 300,
          width: "100%",
          objectFit: "contain",
          mb: 2,
        }}
      />
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Typography color="white" sx={{ mb: 1 }}>
          {language}
        </Typography>

        <Stack direction="row" spacing={1} display="flex" alignItems="center">
          <Box>{getStarIcons(rating.toFixed(1))}</Box>
          <Typography variant="body2" color="white">{` ${rating.toFixed(
            1
          )}`}</Typography>
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Typography variant="body1" color="white" sx={{ mb: 2 }}>
          {description}
        </Typography>

        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={1}
          sx={{ flexWrap: "wrap", mb: 2 }}
        >
          {genres.map((genre, index) => (
            <Chip
              key={index}
              label={genre}
              sx={{ mb: isMobile ? 1 : 0, color: "#fff" }}
            />
          ))}
        </Stack>

        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={1}
          sx={{ flexWrap: "wrap" }}
        >
          {keywords.map((keyword, index) => (
            <Chip
              key={index}
              label={keyword}
              sx={{ mb: isMobile ? 1 : 0, color: "#fff" }}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MovieCard;
