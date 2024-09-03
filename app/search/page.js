import ClientOnly from "@/app/_components/ClientOnly";
import MovieLayout from "@/app/_components/MovieBox/MovieLayout";
import Layout from "@/app/_components/Layout";

export default function SearchPage() {
  return (
    <ClientOnly>
      <Layout>
        <MovieLayout />
      </Layout>
    </ClientOnly>
  );
}
