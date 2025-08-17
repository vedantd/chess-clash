import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PrivyAppProvider } from "@/components/PrivyProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chess Clash - Token-Backed Challenges",
  description: "Create and participate in token-backed chess challenges",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PrivyAppProvider>
          {children}
          <Toaster position="top-right" />
        </PrivyAppProvider>
      </body>
    </html>
  );
}
