'use client';

import { useMemo } from 'react';
import { Container, Group, Text, Title } from '@mantine/core';
import { useAppSelector } from '../hooks';
import { buildWeekPoints } from '../utils/weeks';
import { WeekStatus } from '../types';

const statusOrder: WeekStatus[] = ['lived', 'remaining', 'extra'];

const Navigation = () => {
  const lifeProfile = useAppSelector((state) => state.life.profile);
  const themeState = useAppSelector((state) => state.theme);
  const activeTheme = themeState.themes.find((t) => t.id === themeState.activeThemeId) ?? themeState.themes[0];

  const weeks = useMemo(() => buildWeekPoints(lifeProfile), [lifeProfile]);

  const statusCounts = useMemo(
    () =>
      weeks.reduce<Record<WeekStatus, number>>(
        (acc, week) => {
          acc[week.status] += 1;
          return acc;
        },
        { lived: 0, remaining: 0, extra: 0 },
      ),
    [weeks],
  );

  const colorForStatus = (status: WeekStatus) => activeTheme?.weeks[status] ?? '#ccc';

  return (
    <header>
      <Container fluid px="lg" py="xs">
        <Group gap="md" align="center">
          <Title order={3}>Weeks</Title>
            {statusOrder.map((status) => (
              <Group key={status} gap={4}>
                <span style={{ color: colorForStatus(status), fontSize: 10, lineHeight: 1 }}>●</span>
                <Text size="xs" c="dimmed">
                  {status.charAt(0).toUpperCase() + status.slice(1)} {statusCounts[status]}
                </Text>
              </Group>
            ))}
          </Group>
      </Container>
    </header>
  );
};

export default Navigation;
