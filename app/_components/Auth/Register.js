"use client";

import logo from "@/public/images/logo.png";
import { SignUp, useSignUp } from "@clerk/nextjs";
import {
  Box,
  Grid,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";

const Register = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isLoaded } = useSignUp();

  const clerkTheme = {
    variables: {
      colorPrimary: theme.palette.primary.main,
      colorBackground: theme.palette.background.default,
      colorText: theme.palette.text.primary,
      borderRadius: theme.shape.borderRadius + "px",
      fontFamily: theme.typography.fontFamily,
    },
    elements: {
      card: {
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
      },
      formButtonPrimary: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.text.primary,
      },
      socialButtonsBlockButton: {
        backgroundColor: theme.palette.mode == "light" ? "#fff" : "#ccc",
      },
    },
  };

  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      {!isMobile && (
        <Grid
          item
          xs={12}
          md={6}
          sx={(theme) => ({
            position: "relative",
            overflow: "hidden",
            backgroundColor: "rgba(25, 32, 48, 1)",
          })}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `linear-gradient(
                to top, 
                rgba(141, 67, 210, 0.6), 
                rgba(0, 0, 0, 0.7)
              ),
              url('https://image.tmdb.org/t/p/w500/gNPqcv1tAifbN7PRNgqpzY8sEJZ.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(4px)",
              zIndex: 1,
            }}
          />
          <Box
            sx={{
              position: "relative",
              zIndex: 2,
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              p: 4,
              height: "100%",
            }}
          >
            <Box sx={{ mb: 4 }}>
              <Link href="/">
                <Image
                  src={logo}
                  alt="MindStacks Logo"
                  width="100%"
                  height={50}
                />
              </Link>
            </Box>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{ color: "#fff" }}
            >
              Join Us Today!
            </Typography>
            <Typography variant="h6" component="p" sx={{ color: "#fff" }}>
              Create an account to get personalized movie recommendations and
              explore a world of entertainment.
            </Typography>
          </Box>
        </Grid>
      )}

      {/* Right Grid for the Clerk sign-up form */}
      <Grid
        item
        xs={12}
        md={6}
        component={Box}
        sx={(theme) => ({
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor:
            theme.palette.mode === "light"
              ? "rgba(249,250,251, 0.4)"
              : "rgba(25, 32, 48, 1)",
        })}
      >
        <Box
          sx={{
            maxWidth: 400,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {!isLoaded ? (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={600}
              animation="wave"
            />
          ) : (
            <SignUp
              path="/sign-up"
              routing="path"
              signInUrl="/sign-in"
              afterSignUpUrl="/"
              appearance={clerkTheme}
            />
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default Register;
