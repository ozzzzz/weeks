'use client';

import { useMemo } from 'react';
import { Container, Group, Text } from '@mantine/core';
import { useAppSelector } from '../hooks';
import { buildWeekPoints } from '../utils/weeks';
import { WeekStatus } from '../types';
import { MetaText } from './ui/text';

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
          <Text size="sm" fw={600}>Weeks</Text>
            {statusOrder.map((status) => (
              <Group key={status} gap={4}>
                <Text component="span" size="xs" style={{ color: colorForStatus(status), lineHeight: 1 }}>●</Text>
                <MetaText>
                  {status.charAt(0).toUpperCase() + status.slice(1)} {statusCounts[status]}
                </MetaText>
              </Group>
            ))}
          </Group>
      </Container>
    </header>
  );
};

export default Navigation;
