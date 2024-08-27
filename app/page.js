import ClientOnly from "@/app/_components/ClientOnly";
import Timeline from "@/app/_components/Timeline/Timeline";

function Page() {
  return (
    <ClientOnly>
      <Timeline />
    </ClientOnly>
  );
}

export default Page;
