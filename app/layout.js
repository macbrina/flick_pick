import { Roboto } from "next/font/google";
import "@/app/_styles/globals.css";
import { ToastContainer } from "react-toastify";
import NextTopLoader from "nextjs-toploader";
import "react-toastify/dist/ReactToastify.css";
import { MoviesProvider } from "@/app/_context/MoviesContext";
import { ClerkProvider } from "@clerk/nextjs";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata = {
  metadataBase: new URL("https://flickpick.vercel.app"),
  title: {
    template: "%s - FlickPick",
    default: "FlickPick: Your Personalized Movie Recommendation Hub",
  },
  other: {
    keywords:
      "FlickPick, movie recommendations, personalized movie lists, film suggestions, top movies, trending films, movie discovery, cinema, film lovers, movie reviews",
  },
  author: "Precious Mbaekwe",
  description:
    "FlickPick is your go-to platform for personalized movie recommendations. Discover your next favorite film with our curated lists and advanced suggestion algorithms. Perfect for movie enthusiasts looking to explore new genres, top-rated movies, and hidden gems.",
  openGraph: {
    title: "FlickPick: Your Personalized Movie Recommendation Hub",
    description:
      "FlickPick is your go-to platform for personalized movie recommendations. Discover your next favorite film with our curated lists and advanced suggestion algorithms. Perfect for movie enthusiasts looking to explore new genres, top-rated movies, and hidden gems.",
    images: [
      {
        url: "https://flickpick.vercel.app/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FlickPick Movie Recommendations",
        type: "image/png",
      },
    ],
    type: "website",
    locale: "en_US",
    siteName: "FlickPick",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlickPick: Your Personalized Movie Recommendation Hub",
    description:
      "FlickPick is your go-to platform for personalized movie recommendations. Discover your next favorite film with our curated lists and advanced suggestion algorithms. Perfect for movie enthusiasts looking to explore new genres, top-rated movies, and hidden gems.",
    images: ["https://flickpick.vercel.app/images/og-image.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={roboto.className}>
          <NextTopLoader showSpinner={false} color="#6741D9" />
          <ToastContainer />
          <MoviesProvider>{children}</MoviesProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
