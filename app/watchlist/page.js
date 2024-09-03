"use client";

import ClientOnly from "@/app/_components/ClientOnly";
import WatchList from "@/app/_components/MovieBox/Watch/WatchList";
import Layout from "@/app/_components/Layout";

function BookMarkLayout() {
  return (
    <ClientOnly>
      <Layout>
        <WatchList />
      </Layout>
    </ClientOnly>
  );
}

export default BookMarkLayout;
