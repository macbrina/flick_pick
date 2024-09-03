"use client";

import ChatBubble from "@/app/_components/ChatAssistant/ChatBubble";
import { useMovies } from "@/app/_context/MoviesContext";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import SendSvg from "../Icons/SendSvg";
import { useIsUserLoggedIn } from "@/app/_utils/auth";
import { deleteChatHistory, saveChatHistory } from "@/app/_lib/data-service";
import { db } from "@/app/_firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import Spinner from "@/app/_components/Spinner";
import { MenuRounded, MoreHoriz, MoreVert } from "@mui/icons-material";
import DeleteDialog from "@/app/_components/DeleteDialog";
import { useNotification } from "@/app/_context/NotificationContext";

export default function ChatLayout() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const { notify } = useNotification();
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
  const { isLoggedIn, userId, user } = useIsUserLoggedIn();
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDeleteOpen = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteClose = () => {
    setShowDeleteConfirmation(false);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!isLoggedIn) {
      notify("You have to be logged in to delete chat", "error");
    }
    setIsDeleting(true);

    try {
      await deleteChatHistory(userId);
    } catch (error) {
    } finally {
      setIsDeleting(false);
      handleMenuClose();
      setShowDeleteConfirmation(false);
    }
  };

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

      if (isLoggedIn) {
        const chatEntry = {
          userId: userId,
          messages: [
            ...messages,
            userMessage,
            { role: "assistant", content: data.content },
          ],
          updatedAt: new Date(),
        };

        await saveChatHistory(userId, chatEntry);
      }
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

  // useEffect(() => {
  //   setTimeout(() => {
  //     endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }, 100);
  // }, []);

  useEffect(() => {
    if (!loading) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      const chatDocRef = doc(db, "chatHistory", userId);

      const unsubscribe = onSnapshot(chatDocRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setMessages(data.messages);
        } else {
          setMessages([
            {
              role: "assistant",
              content:
                "Hello, I'm your movie assistant. What kind of movies recommendations are you looking for?",
            },
          ]);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, userId]);

  return (
    <Grid
      item
      xs={12}
      md={10}
      component="main"
      sx={{ p: 2, height: "100%", marginTop: 2 }}
    >
      <Toolbar />
      <Box
        sx={(theme) => ({
          flexGrow: 1,
          p: 3,
          maxWidth: "60rem",
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          flexDirection: "column",
          // height: "calc(100vh - 64px - 78px)",
          height: !isMobile
            ? "calc(100vh - 0.2rem - 3* 2.4rem)"
            : "calc(100vh - 64px - 78px)",
          overflow: "hidden",
          transition: "margin-left 0.3s ease",
          backgroundColor:
            theme.palette.mode == "dark" ? "rgba(47, 47, 47, 0.6)" : "#fff",
          borderRadius: "20px",
        })}
      >
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            mb: 2,
            p: { xs: 1, sm: 3 },
          }}
        >
          {loading ? (
            <Spinner />
          ) : (
            messages.map((msg, index) => (
              <ChatBubble
                key={index}
                role={msg.role}
                content={msg.content}
                sending={sendingMessage && index === messages.length - 1}
                error={error}
              />
            ))
          )}
          <div ref={endOfMessagesRef} />
        </Box>
        {!error ? (
          <Box
            sx={(theme) => ({
              display: "flex",
              alignItems: "center",
              p: 1,
              position: "sticky",
              bottom: 0,
              backgroundColor:
                theme.palette.mode == "dark" ? "#2f2f2f" : "#f2f2f2",
              border: "none",
              borderRadius: "50px",
              zIndex: 1,
              width: "100%",
            })}
          >
            {isLoggedIn && (
              <>
                <IconButton onClick={handleMenuOpen}>
                  <MoreVert />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "center",
                  }}
                  transformOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                  }}
                >
                  <MenuItem onClick={handleDeleteOpen}>Delete</MenuItem>
                </Menu>
              </>
            )}
            <TextField
              fullWidth
              multiline
              variant="outlined"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !sendingMessage) {
                  e.preventDefault();
                  handleMessageChange();
                }
              }}
              sx={(theme) => ({
                flex: 1,
                mr: 2,
                backgroundColor:
                  theme.palette.mode == "dark" ? "#2f2f2f" : "#f2f2f2",
                borderRadius: "50px",
              })}
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
              <SendSvg />
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
      <DeleteDialog
        onOpen={showDeleteConfirmation}
        onClose={handleDeleteClose}
        onDelete={handleDeleteConfirm}
        title={"this chat"}
        isDeleting={isDeleting}
      />
    </Grid>
  );
}
