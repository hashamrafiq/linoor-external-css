import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageTransitionLoader from "@/components/PageTransitionLoader";

export const metadata = {
  title: "Linoor | Digital Agency",
  description: "A Next.js conversion of the Linoor digital agency theme.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/theme.css" />
      </head>
      <body>
        <PageTransitionLoader />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
