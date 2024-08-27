import Register from "@/app/_components/Auth/Register";
import ClientOnly from "@/app/_components/ClientOnly";

function Signup() {
  return (
    <ClientOnly>
      <Register />
    </ClientOnly>
  );
}

export default Signup;
