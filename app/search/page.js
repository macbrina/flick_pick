import ClientOnly from "@/app/_components/ClientOnly";
import MovieLayout from "@/app/_components/MovieBox/MovieLayout";

export default function SearchPage() {
  return (
    <ClientOnly>
      <MovieLayout />
    </ClientOnly>
  );
}
