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
  Grid,
} from "@mui/material";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import CommentSvg from "../Icons/CommentSvg";
import HeartUnfilledSvg from "../Icons/HeartUnfilledSvg";
import BookmarkSvg from "../Icons/BookmarkSvg";
import HistorySvg from "../Icons/HistorySvg";

const PostCardSkeleton = () => {
  return (
    <Grid container spacing={2} justifyContent="center" sx={{ height: "100%" }}>
      <Grid item xs={12} sm={12} md={10}>
        <Box sx={{ flexGrow: 1, marginTop: 2, marginBottom: 4 }}>
          <Skeleton variant="text" height="60px" width="100%" sx={{ mb: 2 }} />
        </Box>
      </Grid>
      <Grid item xs={12} sm={12} md={10}>
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardHeader
            avatar={<Skeleton variant="circular" width={40} height={40} />}
            action={
              <IconButton aria-label="settings">
                <Skeleton variant="text" width={30} />
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
              sx={(theme) => ({
                borderColor:
                  theme.palette.mode == "dark" ? "#313131" : "#ebe7ed",
                borderWidth: "1.2px",
                borderStyle: "solid",
                width: "100%",
              })}
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
                  <Skeleton variant="text" width={40} />
                </IconButton>
              </Box>
              <Box sx={{ textAlign: "center", flexGrow: 1 }}>
                <IconButton aria-label="comment" disableRipple>
                  <Skeleton variant="text" width={40} />
                </IconButton>
              </Box>
              <Box sx={{ textAlign: "center", flexGrow: 1 }}>
                <IconButton aria-label="bookmark" disableRipple>
                  <Skeleton variant="text" width={40} />
                </IconButton>
              </Box>
              <Box sx={{ textAlign: "center", flexGrow: 1 }}>
                <IconButton aria-label="bookmark" disableRipple>
                  <Skeleton variant="text" width={40} />
                </IconButton>
              </Box>
            </Box>
          </CardActions>
          <Collapse in={true} timeout="auto" unmountOnExit>
            <CardContent>
              <Skeleton
                variant="text"
                height="30px"
                width="100%"
                sx={{ mb: 2 }}
              />
              <Divider sx={{ my: 2 }} />
              <Skeleton
                variant="text"
                width="100%"
                height="50px"
                sx={{ mb: 1 }}
              />
            </CardContent>
          </Collapse>
        </Card>
      </Grid>
    </Grid>
  );
};

export default PostCardSkeleton;
