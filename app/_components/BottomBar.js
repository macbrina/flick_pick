"use client";

import {
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
} from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ExploreIcon from "@mui/icons-material/Explore";
import HistoryIcon from "@mui/icons-material/History";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ExploreSvg from "./Icons/ExploreSvg";
import BotSvg from "./Icons/BotSvg";
import SearchSvg from "./Icons/SearchSvg";
import BookmarkSvg from "./Icons/BookmarkSvg";
import HistorySvg from "./Icons/HistorySvg";

export default function BottomBar() {
  const pathname = usePathname();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [value, setValue] = useState(pathname);

  const handleNavigationChange = (event, newValue) => {
    setValue(newValue);
  };

  if (!isMobile) return null; // Only render on tablets and smaller devices

  return (
    <BottomNavigation
      value={value}
      onChange={handleNavigationChange}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 1300,
      }}
    >
      <BottomNavigationAction
        label="Assistant"
        value="/assistant"
        icon={<BotSvg />}
        component={Link}
        href="/assistant"
      />
      <BottomNavigationAction
        label="Search"
        value="/search"
        icon={<SearchSvg />}
        component={Link}
        href="/search"
      />
      <BottomNavigationAction
        label="Explore"
        value="/"
        icon={<ExploreSvg />}
        component={Link}
        href="/"
      />
      <BottomNavigationAction
        label="History"
        value="/movie-history"
        icon={<HistorySvg />}
        component={Link}
        href="/movie-history"
      />
      <BottomNavigationAction
        label="Watchlist"
        value="/watchlist"
        icon={<BookmarkSvg />}
        component={Link}
        href="/watchlist"
      />
    </BottomNavigation>
  );
}
