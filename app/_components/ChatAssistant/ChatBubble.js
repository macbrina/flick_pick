"use client";

import MovieCard from "@/app/_components/ChatAssistant/MovieCard";

import { Avatar, Box, Skeleton, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const fadeInUp = {
  animation: "fadeInUp 1s ease-out",
};

const styles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

export default function ChatBubble({ role, content, sending, error }) {
  const isAssistant = role === "assistant";
  const [visible, setVisible] = useState(false);

  const isLastMessage =
    !content?.movies &&
    (content?.includes("error") ||
      content?.includes("Error") ||
      content?.trim() == "");

  useEffect(() => {
    if (isAssistant && !sending && !error && !isLastMessage) {
      setTimeout(() => setVisible(true), 50);
    } else if (error && isLastMessage) {
      setVisible(false);
    }
  }, [sending, isAssistant, error, isLastMessage]);

  if (isAssistant && error && isLastMessage) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        mb: 2,
        justifyContent: isAssistant ? "flex-start" : "flex-end",
      }}
    >
      {isAssistant && (
        <Avatar sx={{ mr: 1 }} src="/images/logo.png" alt="Assistant" />
      )}
      {sending ? (
        <Skeleton
          animation="wave"
          variant="rectangular"
          width={200}
          height={40}
        />
      ) : (
        <Box
          sx={(theme) => ({
            maxWidth: "90%",
            p: 2,
            mb: 4,
            borderRadius: 2,
            backgroundImage: isAssistant
              ? theme.palette.mode == "dark"
                ? "linear-gradient(45deg, #2f2f2f 30%, #2f2f2f 90%)"
                : "linear-gradient(45deg, #d9d1ed 30%, #dcc2f4 90%)"
              : theme.palette.mode == "dark"
              ? "linear-gradient(45deg, #343a40 30%, #343a40 90%)"
              : "linear-gradient(45deg, #d6d3fc 30%, #ccedff 90%)",
            boxShadow: 3,
            overflowWrap: "break-word",
            wordBreak: "break-word",
            overflow: "hidden",
          })}
        >
          {isAssistant ? (
            content?.movies && content?.movies?.length != 0 ? (
              <Box
                sx={(theme) => ({
                  color: theme.palette.mode == "dark" ? "#fff" : "#000",
                  ...(visible ? fadeInUp : {}),
                })}
              >
                <Typography
                  variant="body1"
                  color="white"
                  fontSize="17px"
                  gutterBottom
                  sx={(theme) => ({
                    mb: 2,
                    color: theme.palette.mode == "dark" ? "#fff" : "#000",
                  })}
                >
                  {content.intro}
                </Typography>
                {content.movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    title={movie.title}
                    image={movie.image}
                    rating={movie.rating}
                    genres={movie.genres}
                    description={movie.description}
                    keywords={movie.keywords}
                    language={movie.language}
                    videoKey={movie?.videoKey || null}
                    videoSite={movie?.videoSite || null}
                  />
                ))}
                <Typography
                  variant="body1"
                  color="white"
                  fontSize="17px"
                  gutterBottom
                  sx={(theme) => ({
                    mb: 2,
                    color: theme.palette.mode == "dark" ? "#fff" : "#000",
                  })}
                >
                  {content.outro}
                </Typography>
              </Box>
            ) : (
              <Typography
                variant="body1"
                color="white"
                fontSize="17px"
                sx={(theme) => ({
                  color: theme.palette.mode == "dark" ? "#fff" : "#000",
                  ...(visible ? fadeInUp : {}),
                })}
              >
                {content}
              </Typography>
            )
          ) : (
            <Typography
              variant="body1"
              color="white"
              fontSize="17px"
              sx={(theme) => ({
                color: theme.palette.mode == "dark" ? "#fff" : "#000",
              })}
            >
              {content}
            </Typography>
          )}
        </Box>
      )}

      {!isAssistant && (
        <Avatar sx={{ ml: 1 }} src="/images/user-avatar.png" alt="You" />
      )}
    </Box>
  );
}
