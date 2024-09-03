import { useState } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { Tooltip, useTheme } from "@mui/material";
import { usePathname } from "next/navigation";
import { Close } from "@mui/icons-material";

const AuthDialog = ({ open, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const theme = useTheme();
  const pathname = usePathname();

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
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{isSignUp ? "Sign Up" : "Log In"}</DialogTitle>
      <button className="btn-toggle" onClick={onClose}>
        <Tooltip title="Close">
          <Close sx={{ color: "#fff" }} />
        </Tooltip>
      </button>
      <DialogContent>
        {isSignUp ? (
          <SignUp
            routing="hash"
            appearance={clerkTheme}
            afterSignUpUrl={pathname}
          />
        ) : (
          <SignIn
            routing="hash"
            appearance={clerkTheme}
            afterSignInUrl={pathname}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
        <Button onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp
            ? "Already have an account? Log In"
            : "Need an account? Sign Up"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthDialog;
