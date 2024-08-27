"use client";

import ClientOnly from "@/app/_components/ClientOnly";
import WatchList from "@/app/_components/MovieBox/Watch/WatchList";

function BookMarkLayout() {
  return (
    <ClientOnly>
      <WatchList />
    </ClientOnly>
  );
}

export default BookMarkLayout;
