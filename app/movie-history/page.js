"use client";

import ClientOnly from "@/app/_components/ClientOnly";
import MovieHistory from "@/app/_components/MovieBox/History/MovieHistory";

function BookMarkLayout() {
  return (
    <ClientOnly>
      <MovieHistory />
    </ClientOnly>
  );
}

export default BookMarkLayout;
