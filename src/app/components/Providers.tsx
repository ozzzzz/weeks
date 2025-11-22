'use client';

import { Provider } from 'react-redux';
import { MantineProvider } from '@mantine/core';
import type { ReactNode } from 'react';
import { store } from '../store';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <MantineProvider defaultColorScheme="light">
        {children}
      </MantineProvider>
    </Provider>
  );
}
