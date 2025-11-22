'use client';

import type { Metadata } from "next";
import "./globals.css";
import '@mantine/core/styles.css';
import { Provider } from "react-redux";
import { MantineProvider } from "@mantine/core";
import { store } from "./store";

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
        <Provider store={store}>
          <MantineProvider defaultColorScheme="light">
            {children}
          </MantineProvider>
        </Provider>
      </body>
    </html>
  );
}
