import "./globals.css";

import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PrivyAuthProvider } from "./contexts/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PrivyPay",
  description: "Your Wallet's Best Friend",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PrivyAuthProvider>{children}</PrivyAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
