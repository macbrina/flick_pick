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
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const drawerWidth = 240;

export default function Sidebar() {
  const { state, toggleDrawer } = useMovies();
  const pathname = usePathname();

  return (
    <Drawer
      variant="persistent"
      open={state.drawerOpen}
      onClose={toggleDrawer}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
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
        <IconButton onClick={toggleDrawer}>
          <MenuSvg />
        </IconButton>
      </Stack>
      <List>
        <Link href="/">
          <ListItemButton
            sx={{
              justifyContent: "flex-start",
              paddingBottom: "15px",
              backgroundColor: pathname === "/" ? "#323232" : "transparent",
            }}
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
            sx={{
              justifyContent: "flex-start",
              paddingBottom: "15px",
              backgroundColor:
                pathname === "/assistant" ? "#323232" : "transparent",
            }}
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
            sx={{
              justifyContent: "flex-start",
              paddingBottom: "15px",
              backgroundColor:
                pathname === "/search" ? "#323232" : "transparent",
            }}
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
            sx={{
              justifyContent: "flex-start",
              paddingBottom: "15px",
              backgroundColor:
                pathname === "/watchlist" ? "#323232" : "transparent",
            }}
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
            sx={{
              justifyContent: "flex-start",
              paddingBottom: "15px",
              backgroundColor:
                pathname === "/movie-history" ? "#323232" : "transparent",
            }}
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
  );
}
