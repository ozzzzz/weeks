'use client';

import { useMemo } from 'react';
import { Badge, Group, Paper, ScrollArea, SimpleGrid, Stack, Text, ThemeIcon, Tooltip } from '@mantine/core';
import { useAppSelector } from '../hooks';
import { buildWeekPoints } from '../utils/weeks';
import { formatDisplayDate } from '../utils/dates';
import { WeekStatus } from '../types';

const statusOrder: WeekStatus[] = ['lived', 'current', 'remaining', 'extra'];

const WeeksVisualization = () => {
  const lifeProfile = useAppSelector((state) => state.life.profile);
  const themeState = useAppSelector((state) => state.theme);

  const activeTheme = themeState.themes.find((theme) => theme.id === themeState.activeThemeId) ?? themeState.themes[0];

  const weeks = useMemo(() => buildWeekPoints(lifeProfile), [lifeProfile]);

  const statusCounts = weeks.reduce<Record<WeekStatus, number>>((acc, week) => {
    acc[week.status] += 1;
    return acc;
  }, { lived: 0, current: 0, remaining: 0, extra: 0 });

  const colorForStatus = (status: WeekStatus) => activeTheme?.weeks[status] ?? 'gray';

  return (
    <Paper withBorder p="sm">
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={600}>Weeks visualization</Text>
          <Text c="dimmed" size="sm">
            Total weeks: {weeks.length}
          </Text>
        </Group>

        <Group gap="xs" wrap="wrap">
          {statusOrder.map((status) => (
            <Badge key={status} color={colorForStatus(status)} variant="filled">
              {status} · {statusCounts[status]}
            </Badge>
          ))}
        </Group>

        <ScrollArea.Autosize mah="calc(100vh - 220px)" type="auto">
          <SimpleGrid cols={{ base: 20, sm: 28, md: 40, lg: 52, xl: 64 }} spacing={4}>
            {weeks.map((week) => (
              <Tooltip key={week.index} label={`${formatDisplayDate(week.date)} · ${week.status}`}>
                <ThemeIcon
                  color={colorForStatus(week.status)}
                  radius="xl"
                  size={14}
                  variant="filled"
                />
              </Tooltip>
            ))}
          </SimpleGrid>
        </ScrollArea.Autosize>
      </Stack>
    </Paper>
  );
};

export default WeeksVisualization;
