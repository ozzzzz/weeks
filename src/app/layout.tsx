import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MantineProvider } from '@mantine/core';
import "./globals.css";
import '@mantine/core/styles.css';



export const metadata: Metadata = {
  title: "Weeks - Life Calendar",
  description: "Visualize your life in weeks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        <MantineProvider>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
