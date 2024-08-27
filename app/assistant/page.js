import ChatLayout from "@/app/_components/ChatAssistant/ChatLayout";
import ClientOnly from "@/app/_components/ClientOnly";

export default function Home() {
  return (
    <ClientOnly>
      <ChatLayout />
    </ClientOnly>
  );
}
