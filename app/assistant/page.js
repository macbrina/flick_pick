import ChatLayout from "@/app/_components/ChatAssistant/ChatLayout";
import ClientOnly from "@/app/_components/ClientOnly";
import Layout from "@/app/_components/Layout";

export default function Home() {
  return (
    <ClientOnly>
      <Layout>
        <ChatLayout />
      </Layout>
    </ClientOnly>
  );
}
