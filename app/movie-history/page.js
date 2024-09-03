"use client";

import ClientOnly from "@/app/_components/ClientOnly";
import MovieHistory from "@/app/_components/MovieBox/History/MovieHistory";
import Layout from "@/app/_components/Layout";

function BookMarkLayout() {
  return (
    <ClientOnly>
      <Layout>
        <MovieHistory />
      </Layout>
    </ClientOnly>
  );
}

export default BookMarkLayout;
