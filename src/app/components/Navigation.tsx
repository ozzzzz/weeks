'use client';

import { useMemo } from 'react';
import { Badge, Container, Group, Text, Title } from '@mantine/core';
import { useAppSelector } from '../hooks';
import { buildWeekPoints } from '../utils/weeks';
import { WeekStatus } from '../types';

const statusOrder: WeekStatus[] = ['lived', 'current', 'remaining', 'extra'];

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
        { lived: 0, current: 0, remaining: 0, extra: 0 },
      ),
    [weeks],
  );

  const colorForStatus = (status: WeekStatus) => activeTheme?.weeks[status] ?? '#ccc';

  return (
    <header>
      <Container fluid px="lg" py="xs">
        <Group justify="space-between">
          <Title order={3}>Weeks</Title>
          <Group gap="xs">
            {statusOrder.map((status) => (
              <Badge key={status} color={colorForStatus(status)} variant="filled" size="sm">
                {status} · {statusCounts[status]}
              </Badge>
            ))}
            <Text size="xs" c="dimmed">
              Total: {weeks.length}
            </Text>
          </Group>
        </Group>
      </Container>
    </header>
  );
};

export default Navigation;
