import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Link from "next/link";

const NoPostsCard = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ height: "100%" }}
    >
      {" "}
      <Card elevation={3} sx={{ mb: 3, textAlign: "center" }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            No Posts Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Start sharing your thoughts! Go to the search and find a movie to
            share with your others.
          </Typography>
          <Link href="/search">
            <Button
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
            >
              Search for a Movie
            </Button>
          </Link>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NoPostsCard;
