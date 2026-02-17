'use client';

import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { ActionIcon, Badge, Container, Group, Text, Title, Tooltip } from '@mantine/core';
import { IconDownload, IconUpload, IconTrash } from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { buildWeekPoints } from '../utils/weeks';
import { WeekStatus } from '../types';
import { calendarActions, layoutActions, lifeActions } from '../store';
import { downloadPersistedState, parsePersistedState } from '../utils/persistence';

const statusOrder: WeekStatus[] = ['lived', 'remaining', 'extra'];

const Navigation = () => {
  const dispatch = useAppDispatch();
  const lifeProfile = useAppSelector((state) => state.life.profile);
  const calendars = useAppSelector((state) => state.calendar.calendars);
  const activeCalendarId = useAppSelector((state) => state.calendar.activeCalendarId);
  const isMenuCollapsed = useAppSelector((state) => state.layout.isMenuCollapsed);
  const themeState = useAppSelector((state) => state.theme);
  const activeTheme = themeState.themes.find((t) => t.id === themeState.activeThemeId) ?? themeState.themes[0];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

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

  const handleSaveData = () => {
    downloadPersistedState({
      profile: lifeProfile,
      calendars,
      activeCalendarId,
      isMenuCollapsed,
    });
  };

  const handleLoadDataClick = () => {
    fileInputRef.current?.click();
  };

  const handleLoadData = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const raw = await file.text();
    const parsed = parsePersistedState(raw);

    if (!parsed) {
      setImportError('Invalid settings JSON file');
      event.target.value = '';
      return;
    }

    dispatch(lifeActions.setLifeProfile(parsed.profile));
    dispatch(calendarActions.setCalendars(parsed.calendars));
    dispatch(calendarActions.setActiveCalendar(parsed.activeCalendarId));
    dispatch(layoutActions.setMenuCollapsed(parsed.isMenuCollapsed));
    setImportError(null);
    event.target.value = '';
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This will reset everything to defaults.')) {
      dispatch(calendarActions.setCalendars([]));
      dispatch(calendarActions.setActiveCalendar(null));
    }
  };

  return (
    <header>
      <Container fluid px="lg" py="xs">
        <Group justify="space-between">
          <Title order={3}>Weeks</Title>
          <Group gap="md">
            <Group gap="xs">
              <Tooltip label="Save data">
                <ActionIcon size="lg" variant="subtle" onClick={handleSaveData}>
                  <IconDownload size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Load data">
                <ActionIcon size="lg" variant="subtle" onClick={handleLoadDataClick}>
                  <IconUpload size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Clear data">
                <ActionIcon size="lg" variant="subtle" color="red" onClick={handleClearData}>
                  <IconTrash size={18} />
                </ActionIcon>
              </Tooltip>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleLoadData}
              />
            </Group>
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
        </Group>
      </Container>
    </header>
  );
};

export default Navigation;
