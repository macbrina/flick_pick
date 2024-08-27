"use client";

import ChatBubble from "@/app/_components/ChatAssistant/ChatBubble";
import Header from "@/app/_components/Header";
import Sidebar from "@/app/_components/Sidebar";
import { useMovies } from "@/app/_context/MoviesContext";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import {
  Box,
  Button,
  CssBaseline,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

export default function ChatLayout() {
  const { state } = useMovies();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello, I'm your movie assistant. What kind of movies recommendations are you looking for?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [userLastMessage, setUserLastMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const endOfMessagesRef = useRef(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(false);

  const handleMessageChange = useCallback(async () => {
    if (message.trim() === "") {
      return;
    }
    setSendingMessage(true);
    setError(false);

    const userMessage = { role: "user", content: message };
    const assistantPlaceholder = { role: "assistant", content: "" };

    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      assistantPlaceholder,
    ]);
    setUserLastMessage(message);
    setMessage("");

    try {
      const response = await fetch(`/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, userMessage]),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const data = await response.json();

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1] = {
          role: "assistant",
          content: data.content,
        };
        return updatedMessages;
      });
    } catch (error) {
      console.error("Error sending message:", error.message);
      setError(true);
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        if (
          updatedMessages.length > 1 &&
          updatedMessages[updatedMessages.length - 1].role === "assistant" &&
          updatedMessages[updatedMessages.length - 1].content === ""
        ) {
          updatedMessages.pop();
        }
        return updatedMessages;
      });
    } finally {
      setSendingMessage(false);
    }
  }, [messages, message]);

  const handleRetry = () => {
    if (error) {
      setMessage(userLastMessage);
      setRetry(true);
    }
  };

  useEffect(() => {
    if (retry && message.trim() !== "") {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        if (
          updatedMessages.length > 1 &&
          updatedMessages[updatedMessages.length - 1].role === "user" &&
          updatedMessages[updatedMessages.length - 1].content ===
            userLastMessage
        ) {
          updatedMessages.pop();
        }
        return updatedMessages;
      });
      handleMessageChange();
      setRetry(false);
    }
  }, [retry, handleMessageChange, message, userLastMessage]);

  useEffect(() => {
    setTimeout(() => {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box
      sx={{
        display: state.drawerOpen ? "flex" : "block",
        transition: "width 0.3s ease",
      }}
    >
      <CssBaseline />
      <Header />
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          maxWidth: "60rem",
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          transition: "margin-left 0.3s ease",
        }}
      >
        <Toolbar />
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            mb: 2,
            p: { xs: 1, sm: 3 },
          }}
        >
          {messages.map((msg, index) => (
            <ChatBubble
              key={index}
              role={msg.role}
              content={msg.content}
              sending={sendingMessage && index === messages.length - 1}
              error={error}
            />
          ))}
          <div ref={endOfMessagesRef} />
        </Box>
        {!error ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: 1,
              position: "sticky",
              bottom: 0,
              backgroundColor: "#2f2f2f",
              border: "none",
              borderRadius: "50px",
              zIndex: 1,
              width: "100%",
            }}
          >
            <TextField
              fullWidth
              multiline
              variant="outlined"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{
                flex: 1,
                mr: 2,
                backgroundColor: "#2f2f2f",
                borderRadius: "50px",
              }}
            />
            <Button
              variant="contained"
              disabled={sendingMessage || message.trim() === ""}
              onClick={handleMessageChange}
              sx={{
                minWidth: "34px",
                borderRadius: "9999px",
              }}
            >
              <ArrowUpwardIcon />
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              p: 1,
              position: "sticky",
              bottom: 0,
              border: "none",
              borderRadius: "50px",
              zIndex: 1,
              width: "100%",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: "red",
                mb: 1,
              }}
            >
              An error occurred while processing your request. Please try again.
            </Typography>
            <Button variant="contained" onClick={handleRetry}>
              Regenerate
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
