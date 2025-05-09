import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const customFont = localFont({
  src: "./fonts/font.woff2",
  variable: "--font-custom",
});

export const metadata: Metadata = {
  title: "Chatter - Your Friendly Chat Application",
  description:
    "Join Happy Chat to connect with friends and share your thoughts.",
  keywords: "chat, messaging, social, connect",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${customFont.variable} ${geistSans.variable} ${geistMono.variable} antialiased font-custom`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
