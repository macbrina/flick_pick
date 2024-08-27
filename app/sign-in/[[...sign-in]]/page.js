import Login from "@/app/_components/Auth/Login";
import ClientOnly from "@/app/_components/ClientOnly";

function SignIn() {
  return (
    <ClientOnly>
      <Login />
    </ClientOnly>
  );
}

export default SignIn;
