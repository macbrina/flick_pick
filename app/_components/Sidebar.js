"use client";

import BookmarkSvg from "@/app/_components/Icons/BookmarkSvg";
import BotSvg from "@/app/_components/Icons/BotSvg";
import ExploreSvg from "@/app/_components/Icons/ExploreSvg";
import HistorySvg from "@/app/_components/Icons/HistorySvg";
import MenuSvg from "@/app/_components/Icons/MenuSvg";
import SearchSvg from "@/app/_components/Icons/SearchSvg";
import { useMovies } from "@/app/_context/MoviesContext";
import AddIcon from "@mui/icons-material/Add";
import {
  Backdrop,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  useMediaQuery,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const drawerWidth = 240;

export default function Sidebar() {
  const { state, toggleDrawer, dispatch } = useMovies();
  const pathname = usePathname();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [onLoad, setOnload] = useState(true);

  useEffect(() => {
    if (isMobile && onLoad) {
      setOnload(false);
      dispatch({ type: "CLOSE_DRAWER_MODE" });
    }
  }, [isMobile, onLoad, dispatch]);

  useEffect(() => {
    if (!isMobile) {
      dispatch({ type: "OPEN_DRAWER_MODE" });
    }
  }, [isMobile, dispatch]);

  return (
    <>
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={state.drawerOpen}
        onClose={isMobile ? toggleDrawer : undefined}
        sx={(theme) => ({
          position: isMobile ? "absolute" : "sticky",
          height: isMobile ? "100%" : "80%",
          width: drawerWidth,
          top: 0,
          left: 0,
          flexShrink: 0,
          paddingLeft: "15px",
          "& .MuiDrawer-paper": {
            height: isMobile ? "100%" : "85%",
            backgroundColor:
              theme.palette.mode == "dark" ? "rgba(47, 47, 47, 1)" : "#fff",
            width: drawerWidth,
            boxSizing: "border-box",
            zIndex: theme.zIndex.drawer + 2,
            top: isMobile ? "0" : "85px",
            // position: isMobile ? "absolute" : "sticky",
            // paddingLeft: "15px",
            borderRadius: isMobile ? "0px" : "20px",
          },
        })}
      >
        <Stack
          direction="row"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            pl: "8px",
            pr: "8px",
          }}
        >
          <IconButton>
            <AddIcon />
          </IconButton>
          <IconButton
            onClick={toggleDrawer}
            sx={{ display: { xs: "block", md: "none" } }}
          >
            <MenuSvg />
          </IconButton>
        </Stack>
        <List
          sx={(theme) => ({
            backgroundColor:
              theme.palette.mode == "dark" ? "rgba(47, 47, 47, 0.6)" : "#fff",
          })}
        >
          <Link href="/">
            <ListItemButton
              sx={(theme) => ({
                justifyContent: "flex-start",
                paddingBottom: "15px",
                backgroundColor:
                  pathname === "/"
                    ? theme.palette.mode == "dark"
                      ? "#3a3a3a"
                      : "#e7e8ff"
                    : "transparent",
              })}
            >
              <ListItemIcon
                sx={{
                  minWidth: "56px",
                }}
              >
                <ExploreSvg />
              </ListItemIcon>
              <ListItemText
                primary="Movie Feed"
                sx={{
                  display: state.drawerOpen ? "block" : "none",
                }}
              />
            </ListItemButton>
          </Link>
          <Link href="/assistant">
            <ListItemButton
              sx={(theme) => ({
                justifyContent: "flex-start",
                paddingBottom: "15px",
                backgroundColor:
                  pathname === "/assistant"
                    ? theme.palette.mode == "dark"
                      ? "#3a3a3a"
                      : "#e7e8ff"
                    : "transparent",
              })}
            >
              <ListItemIcon
                sx={{
                  minWidth: "56px",
                }}
              >
                <BotSvg />
              </ListItemIcon>
              <ListItemText
                primary="Movie Assistant"
                sx={{
                  display: state.drawerOpen ? "block" : "none",
                }}
              />
            </ListItemButton>
          </Link>
          <Link href="/search">
            <ListItemButton
              sx={(theme) => ({
                justifyContent: "flex-start",
                paddingBottom: "15px",
                backgroundColor:
                  pathname === "/search"
                    ? theme.palette.mode == "dark"
                      ? "#3a3a3a"
                      : "#e7e8ff"
                    : "transparent",
              })}
            >
              <ListItemIcon
                sx={{
                  minWidth: "56px",
                }}
              >
                <SearchSvg />
              </ListItemIcon>
              <ListItemText
                primary="Search Movies"
                sx={{
                  display: state.drawerOpen ? "block" : "none",
                }}
              />
            </ListItemButton>
          </Link>
          <Link href="/watchlist">
            <ListItemButton
              sx={(theme) => ({
                justifyContent: "flex-start",
                paddingBottom: "15px",
                backgroundColor:
                  pathname === "/watchlist"
                    ? theme.palette.mode == "dark"
                      ? "#3a3a3a"
                      : "#e7e8ff"
                    : "transparent",
              })}
            >
              <ListItemIcon
                sx={{
                  minWidth: "56px",
                }}
              >
                <BookmarkSvg />
              </ListItemIcon>
              <ListItemText
                primary="Watchlist"
                sx={{
                  display: state.drawerOpen ? "block" : "none",
                }}
              />
            </ListItemButton>
          </Link>
          <Link href="/movie-history">
            <ListItemButton
              sx={(theme) => ({
                justifyContent: "flex-start",
                paddingBottom: "15px",
                backgroundColor:
                  pathname === "/movie-history"
                    ? theme.palette.mode == "dark"
                      ? "#3a3a3a"
                      : "#e7e8ff"
                    : "transparent",
              })}
            >
              <ListItemIcon
                sx={{
                  minWidth: "56px",
                }}
              >
                <HistorySvg />
              </ListItemIcon>
              <ListItemText
                primary="Movie History"
                sx={{
                  display: state.drawerOpen ? "block" : "none",
                }}
              />
            </ListItemButton>
          </Link>
        </List>
      </Drawer>
      <Backdrop
        sx={{
          color: "#fff",
          backdropFilter: "blur(10px)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          position: "absolute",
          top: 0,
          left: drawerWidth,
          width: "calc(100% - " + drawerWidth + "px)",
          display: { xs: "block", md: "none" },
        }}
        open={state.drawerOpen}
        onClick={toggleDrawer}
      />
    </>
  );
}
