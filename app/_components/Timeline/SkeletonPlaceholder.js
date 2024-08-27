import { Skeleton } from "@mui/material";

const SkeletonPlaceholder = ({ width, height }) => {
  return (
    <Skeleton
      variant="rectangular"
      animation="pulse"
      width={width}
      height={height}
      sx={{ borderRadius: "8px" }}
    />
  );
};

export default SkeletonPlaceholder;
