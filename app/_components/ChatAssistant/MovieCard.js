"use client";

import React, { useState } from "react";
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
import { getVideoUrl } from "@/app/_utils/utilities";
import SkeletonPlaceholder from "../Timeline/SkeletonPlaceholder";
import Image from "next/image";
import ReactPlayer from "react-player";

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
  videoKey,
  videoSite,
}) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [imageLoading, setImageLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);

  const handleError = () => {
    setVideoError(true);
    setVideoLoading(false);
  };

  const handleReady = () => {
    setVideoLoading(false);
    setVideoError(false);
  };

  let videoUrl = null;

  if (videoSite && videoKey) {
    videoUrl = getVideoUrl(videoSite, videoKey) || "";
  }
  const numRating = Number(rating);

  return (
    <Card variant="outlined" sx={{ mb: 2, p: 1 }}>
      <Box
        sx={{
          position: "relative",
          height: "500px",
          overflow: "hidden",
          borderRadius: "8px",
          objectFit: "contain",
        }}
      >
        {videoUrl ? (
          videoUrl.includes("dailymotion") ? (
            <>
              {videoLoading && (
                <SkeletonPlaceholder width="100%" height="100%" />
              )}
              <iframe
                src={videoUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; fullscreen"
                allowFullScreen
                style={{ display: videoLoading ? "none" : "block" }}
                onLoad={() => setVideoLoading(false)}
              />
            </>
          ) : (
            <>
              {videoLoading && (
                <SkeletonPlaceholder width="100%" height="100%" />
              )}
              {videoError ? (
                <Image
                  src={!image ? "/images/placeholder.png" : `${image}`}
                  alt={title}
                  fill
                  style={{
                    objectFit: "contain",
                    display: imageLoading ? "none" : "block",
                  }}
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                  onLoad={() => setImageLoading(false)}
                />
              ) : (
                <ReactPlayer
                  url={videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  playing={false}
                  onError={handleError}
                  onReady={handleReady}
                  style={{ display: videoLoading ? "none" : "block" }}
                />
              )}
            </>
          )
        ) : (
          <>
            {imageLoading && (
              <SkeletonPlaceholder width="100%" height="500px" />
            )}
            <Image
              src={image}
              alt={title}
              fill
              style={{
                objectFit: "contain",
                display: imageLoading ? "none" : "block",
              }}
              sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
              onLoad={() => setImageLoading(false)}
            />
          </>
        )}
      </Box>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Typography
          sx={(theme) => ({
            mb: 1,
            color: theme.palette.mode == "dark" ? "#fff" : "#000",
          })}
        >
          {language}
        </Typography>

        <Stack direction="row" spacing={1} display="flex" alignItems="center">
          <Box>{getStarIcons(numRating.toFixed(1))}</Box>
          <Typography variant="body2" color="white">{` ${numRating.toFixed(
            1
          )}`}</Typography>
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Typography
          variant="body1"
          sx={(theme) => ({
            mb: 2,
            color: theme.palette.mode == "dark" ? "#fff" : "#000",
          })}
        >
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
              sx={(theme) => ({
                mb: isMobile ? 1 : 0,
                color: theme.palette.mode == "dark" ? "#fff" : "#000",
              })}
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
