import { SignIn, SignUp } from "@clerk/nextjs";

export default function CatchAllPage() {
  return (
    <>
      <SignIn routing="path" />
      <SignUp routing="path" />
    </>
  );
}
