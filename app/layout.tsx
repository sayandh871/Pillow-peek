import type { Metadata } from "next";
import { Jost } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pillow Peek",
  description: "Pillow Peek is an e-commerce platform for buying and selling mattresses.",
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jost.className} antialiased`}>
        <Navbar />
        <main className="min-h-screen">
            {children}
        </main>
        <Footer />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
