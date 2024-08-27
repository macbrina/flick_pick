"use client";

import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
  IconButton,
  Typography,
  Skeleton,
  Button,
  TextField,
} from "@mui/material";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import CommentSvg from "../Icons/CommentSvg";
import HeartUnfilledSvg from "../Icons/HeartUnfilledSvg";
import BookmarkSvg from "../Icons/BookmarkSvg";
import HistorySvg from "../Icons/HistorySvg";

const PostCardSkeleton = () => {
  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardHeader
        avatar={<Skeleton variant="circular" width={40} height={40} />}
        action={
          <IconButton aria-label="settings">
            <MoreHoriz />
          </IconButton>
        }
        title={<Skeleton variant="text" width="30%" />}
        subheader={<Skeleton variant="text" width="50%" />}
      />
      <CardContent>
        <Skeleton variant="text" width="100%" sx={{ mb: 2 }} />
        <Box
          sx={{
            position: "relative",
            height: "500px",
            overflow: "hidden",
            borderRadius: "8px",
          }}
        >
          <Skeleton variant="rectangular" width="100%" height="500px" />
        </Box>
      </CardContent>
      <CardActions disableSpacing sx={{ flexDirection: "column" }}>
        <Box
          sx={{
            mb: 1,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Skeleton variant="text" width="20%" />
        </Box>
        <Divider
          sx={{
            borderColor: "#313131",
            borderWidth: "1.2px",
            borderStyle: "solid",
            width: "100%",
          }}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
          }}
        >
          <Box sx={{ textAlign: "center", flexGrow: 1 }}>
            <IconButton aria-label="like post" disableRipple>
              <HeartUnfilledSvg />
            </IconButton>
            <Typography variant="caption">
              <Skeleton variant="text" width={30} />
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center", flexGrow: 1 }}>
            <IconButton aria-label="comment" disableRipple>
              <CommentSvg />
            </IconButton>
            <Typography variant="caption">
              <Skeleton variant="text" width={50} />
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center", flexGrow: 1 }}>
            <IconButton aria-label="bookmark" disableRipple>
              <BookmarkSvg />
            </IconButton>
            <Typography variant="caption">
              <Skeleton variant="text" width={60} />
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center", flexGrow: 1 }}>
            <IconButton aria-label="bookmark" disableRipple>
              <HistorySvg />
            </IconButton>
            <Typography variant="caption">
              <Skeleton variant="text" width={40} />
            </Typography>
          </Box>
        </Box>
      </CardActions>
      <Collapse in={true} timeout="auto" unmountOnExit>
        <CardContent>
          <TextField
            fullWidth
            multiline
            variant="outlined"
            placeholder="Add a comment..."
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
            InputProps={{
              startAdornment: (
                <Skeleton variant="text" width="80%" sx={{ mb: 2 }} />
              ),
            }}
          />
          <Divider sx={{ my: 2 }} />
          <Skeleton variant="text" width="100%" sx={{ mb: 1 }} />
          <Skeleton variant="text" width="100%" sx={{ mb: 1 }} />
          <Skeleton variant="text" width="100%" sx={{ mb: 1 }} />
          <Button fullWidth>
            <Skeleton variant="text" width="100%" />
          </Button>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default PostCardSkeleton;
