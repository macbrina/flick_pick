import ClientOnly from "@/app/_components/ClientOnly";
import Timeline from "@/app/_components/Timeline/Timeline";
import Layout from "@/app/_components/Layout";

function Page() {
  return (
    <ClientOnly>
      <Layout>
        <Timeline />
      </Layout>
    </ClientOnly>
  );
}

export default Page;
