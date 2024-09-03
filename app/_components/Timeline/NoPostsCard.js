import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";

const NoPostsCard = ({ onOpenSearch }) => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Card elevation={3} sx={{ mb: 3, textAlign: "center" }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            No Posts Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Start sharing your thoughts! Find a movie to share with others.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={onOpenSearch}
          >
            Search for a Movie
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NoPostsCard;
