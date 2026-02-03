'use client';

import { useEffect } from 'react';
import "./globals.css";
import '@mantine/core/styles.css';
import { Provider } from "react-redux";
import { MantineProvider } from "@mantine/core";
import { calendarActions, layoutActions, lifeActions, store } from "./store";
import { loadPersistedState, savePersistedState } from './utils/persistence';
import Navigation from "./components/Navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const persisted = loadPersistedState();
    if (persisted) {
      store.dispatch(lifeActions.setLifeProfile(persisted.profile));
      store.dispatch(calendarActions.setCalendars(persisted.calendars));
      store.dispatch(calendarActions.setActiveCalendar(persisted.activeCalendarId));
      store.dispatch(layoutActions.setMenuCollapsed(persisted.isMenuCollapsed));
    }

    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      savePersistedState({
        profile: state.life.profile,
        calendars: state.calendar.calendars,
        activeCalendarId: state.calendar.activeCalendarId,
        isMenuCollapsed: state.layout.isMenuCollapsed,
      });
    });

    return unsubscribe;
  }, []);

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
