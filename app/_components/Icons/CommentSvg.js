import { SvgIcon } from "@mui/material";

function CommentSvg(props) {
  return (
    <SvgIcon {...props}>
      <path
        style={{
          fill: "none",
          stroke: "currentColor",
          strokeMiterlimit: 10,
          strokeWidth: "1.91px",
        }}
        d="M1.5,5.3v9.54a3.82,3.82,0,0,0,3.82,3.82H7.23v2.86L13,18.66h5.73a3.82,3.82,0,0,0,3.82-3.82V5.3a3.82,3.82,0,0,0-3.82-3.82H5.32A3.82,3.82,0,0,0,1.5,5.3Z"
      />
      <line
        style={{
          fill: "none",
          stroke: "currentColor",
          strokeMiterlimit: 10,
          strokeWidth: "1.91px",
        }}
        x1="15.82"
        y1="10.07"
        x2="17.73"
        y2="10.07"
      />
      <line
        style={{
          fill: "none",
          stroke: "currentColor",
          strokeMiterlimit: 10,
          strokeWidth: "1.91px",
        }}
        x1="11.05"
        y1="10.07"
        x2="12.95"
        y2="10.07"
      />
      <line
        style={{
          fill: "none",
          stroke: "currentColor",
          strokeMiterlimit: 10,
          strokeWidth: "1.91px",
        }}
        x1="6.27"
        y1="10.07"
        x2="8.18"
        y2="10.07"
      />
    </SvgIcon>
  );
}

export default CommentSvg;
