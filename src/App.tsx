import { useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import Navigation from './app/components/Navigation';
import Home from './app/page';
import { calendarActions, layoutActions, lifeActions, store } from './app/store';
import { loadPersistedState, savePersistedState } from './app/utils/persistence';

const App = () => {
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
    <Provider store={store}>
      <MantineProvider defaultColorScheme="light">
        <Navigation />
        <main>
          <Home />
        </main>
      </MantineProvider>
    </Provider>
  );
};

export default App;
