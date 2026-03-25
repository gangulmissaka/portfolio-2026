import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import ParticleField from "@/components/ParticleField";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gangul Missaka | Senior Creative Developer",
  description: "Portfolio of Gangul Missaka Hinguralaarachchi, Software Engineering student and Creative Developer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body
        className="min-h-full bg-black text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden film-grain"
        suppressHydrationWarning={true}
      >
        {/* Global interactive layers — rendered above everything */}
        <CustomCursor />
        <ParticleField />
        {children}
      </body>
    </html>
  );
}
