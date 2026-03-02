import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import Home from './app/page';
import About from './app/about';
import { calendarActions, layoutActions, lifeActions, store } from './app/store';
import { loadPersistedState, savePersistedState } from './app/utils/persistence';

const App = () => {
  useEffect(() => {
    const persisted = loadPersistedState();
    if (persisted) {
      store.dispatch(lifeActions.setLifeProfile(persisted.profile));
      store.dispatch(lifeActions.setWeekColors(persisted.weekColors));
      store.dispatch(calendarActions.setCalendars(persisted.calendars));
      store.dispatch(calendarActions.setActiveCalendar(persisted.activeCalendarId));
      store.dispatch(layoutActions.setViewMode(persisted.viewMode));
    }

    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      savePersistedState({
        profile: state.life.profile,
        weekColors: state.life.weekColors,
        calendars: state.calendar.calendars,
        activeCalendarId: state.calendar.activeCalendarId,
        viewMode: state.layout.viewMode,
      });
    });

    return unsubscribe;
  }, []);

  return (
    <Provider store={store}>
      <MantineProvider defaultColorScheme="light">
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </HashRouter>
      </MantineProvider>
    </Provider>
  );
};

export default App;
