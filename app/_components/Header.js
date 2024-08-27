"use client";

import MenuSvg from "@/app/_components/Icons/MenuSvg";
import { useMovies } from "@/app/_context/MoviesContext";
import { AppBar } from "@/app/_utils/styling";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Movie } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import Link from "next/link";

const drawerWidth = 240;

function Header() {
  const { state, toggleDrawer } = useMovies();

  return (
    <AppBar
      position="absolute"
      open={state.drawerOpen}
      // sx={{
      //   zIndex: (theme) => theme.zIndex.drawer + 1,
      //   width: {
      //     sm: state.drawerOpen ? `calc(100% - ${drawerWidth}px)` : "100%",
      //   },
      //   transition: "width 0.3s ease",
      //   backgroundImage: "linear-gradient(to bottom, #2f2f2f, #2f2f2f)",
      // }}
    >
      <Toolbar>
        {!state.drawerOpen && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuSvg />
          </IconButton>
        )}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 0,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ pl: 2 }} alignItems="center">
            <Link href="/">
              <Avatar
                src="/images/logo.png"
                alt="FlickPick Logo"
                sx={{ width: 30, height: 30 }}
              />
            </Link>
            <Link href="/">
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                FlickPick
              </Typography>
            </Link>
          </Stack>

          <Stack direction="row" spacing={1}>
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="contained" color="primary">
                  Login
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button color="primary" variant="outlined">
                  Sign Up
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Profile"
                    labelIcon={<Movie />}
                    href="/user/profile"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>
          </Stack>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
