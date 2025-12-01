'use client';

import "./globals.css";
import '@mantine/core/styles.css';
import { Provider } from "react-redux";
import { MantineProvider } from "@mantine/core";
import { store } from "./store";
import Navigation from "./components/Navigation";

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
            <Navigation />
            <main>
              {children}
            </main>
          </MantineProvider>
        </Provider>
      </body>
    </html>
  );
}
