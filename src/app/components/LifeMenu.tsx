'use client';

import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { ActionIcon, Button, Divider, Group, NumberInput, Paper, Stack, Tabs, Text, Transition } from '@mantine/core';
import { IconCalendar, IconChevronDown, IconChevronUp, IconDownload, IconUpload, IconUser } from '@tabler/icons-react';
import { calculateAge } from '../utils/dates';
import { buildWeekOverlays } from '../utils/calendar';
import { buildWeekPoints } from '../utils/weeks';
import { buildDemoState } from '../utils/demoData';
import { calendarActions, lifeActions, layoutActions } from '../store';
import { useAppDispatch, useAppSelector } from '../hooks';
import { downloadPersistedState, parsePersistedState } from '../utils/persistence';
import CalendarList from './CalendarList';

const LifeMenu = () => {
  const dispatch = useAppDispatch();
  const lifeProfile = useAppSelector((state) => state.life.profile);
  const calendars = useAppSelector((state) => state.calendar.calendars);
  const activeCalendarId = useAppSelector((state) => state.calendar.activeCalendarId);
  const isMenuCollapsed = useAppSelector((state) => state.layout.isMenuCollapsed);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const age = calculateAge(lifeProfile.dateOfBirth);

  const weeks = useMemo(() => buildWeekPoints(lifeProfile), [lifeProfile]);
  const overlays = useMemo(
    () => buildWeekOverlays(weeks.length, calendars, lifeProfile.dateOfBirth),
    [weeks.length, calendars, lifeProfile.dateOfBirth],
  );

  const diagnostics = useMemo(() => {
    let eventsInRange = 0;
    let weeksWithPeriods = 0;

    overlays.forEach((overlay) => {
      eventsInRange += overlay.events.length;
      if (overlay.periods.length > 0) weeksWithPeriods += 1;
    });

    const hasCurrentWeek = weeks.some((week) => week.status === 'current');

    return {
      totalWeeks: weeks.length,
      eventsInRange,
      weeksWithPeriods,
      hasCurrentWeek,
    };
  }, [overlays, weeks]);

  const handleBirthChange = (field: 'year' | 'month' | 'day') => (value: string | number) => {
    if (typeof value !== 'number') return;
    dispatch(lifeActions.setDateOfBirth({ ...lifeProfile.dateOfBirth, [field]: value }));
  };

  const handleRealExpectancyChange = (value: string | number) => {
    if (typeof value !== 'number') return;
    dispatch(lifeActions.setRealExpectancyYears(value));
  };

  const handleExtraExpectancyChange = (value: string | number) => {
    if (typeof value !== 'number') return;
    dispatch(lifeActions.setExtraExpectancyYears(value));
  };

  const toggleMenu = () => {
    dispatch(layoutActions.toggleMenu());
  };

  const handleLoadDemo = () => {
    const demo = buildDemoState();
    dispatch(lifeActions.setLifeProfile(demo.profile));
    dispatch(calendarActions.setCalendars(demo.calendars));
    dispatch(calendarActions.setActiveCalendar(demo.activeCalendarId ?? null));
    dispatch(layoutActions.setMenuCollapsed(false));
  };

  const handleClearCalendars = () => {
    dispatch(calendarActions.setCalendars([]));
  };

  const handleDownloadSettings = () => {
    downloadPersistedState({
      profile: lifeProfile,
      calendars,
      activeCalendarId,
      isMenuCollapsed,
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadSettings = async (event: ChangeEvent<HTMLInputElement>) => {
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

  return (
    <div className="flex flex-col items-start gap-2">
      <Transition
        mounted={isMenuCollapsed}
        keepMounted
        transition="pop"
        duration={220}
        timingFunction="cubic-bezier(0.22, 1, 0.36, 1)"
      >
        {(styles) => (
          <ActionIcon
            style={styles}
            size="lg"
            variant="filled"
            radius="xl"
            aria-label="Expand menu"
            onClick={toggleMenu}
          >
            <IconChevronDown size={18} />
          </ActionIcon>
        )}
      </Transition>

      <Transition
        mounted={!isMenuCollapsed}
        keepMounted
        transition="slide-down"
        duration={240}
        timingFunction="cubic-bezier(0.22, 1, 0.36, 1)"
      >
        {(styles) => (
          <Paper withBorder p="md" style={styles}>
            <Stack gap="md">
              <Group justify="flex-start" gap="xs">
                <ActionIcon
                  size="lg"
                  variant="filled"
                  radius="xl"
                  aria-label="Collapse menu"
                  onClick={toggleMenu}
                >
                  <IconChevronUp size={18} />
                </ActionIcon>
                <Text fw={600}>Life setup</Text>
              </Group>

              <Tabs defaultValue="profile">
                <Tabs.List>
                  <Tabs.Tab value="profile" leftSection={<IconUser size={14} />}>
                    Profile
                  </Tabs.Tab>
                  <Tabs.Tab value="calendars" leftSection={<IconCalendar size={14} />}>
                    Calendars
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="profile" pt="md">
                  <Stack gap="md">
                    <NumberInput
                      label="Birth year"
                      value={lifeProfile.dateOfBirth.year}
                      min={1900}
                      max={new Date().getFullYear()}
                      onChange={handleBirthChange('year')}
                    />

                    <Group grow>
                      <NumberInput
                        label="Birth month"
                        value={lifeProfile.dateOfBirth.month}
                        min={1}
                        max={12}
                        onChange={handleBirthChange('month')}
                      />
                      <NumberInput
                        label="Birth day"
                        value={lifeProfile.dateOfBirth.day}
                        min={1}
                        max={31}
                        onChange={handleBirthChange('day')}
                      />
                    </Group>

                    <Divider />

                    <NumberInput
                      label="Life expectancy (years)"
                      value={lifeProfile.realExpectancyYears}
                      min={0}
                      max={100}
                      onChange={handleRealExpectancyChange}
                    />

                    <NumberInput
                      label="Extra years"
                      value={lifeProfile.extraExpectancyYears}
                      min={0}
                      max={100}
                      onChange={handleExtraExpectancyChange}
                    />

                    <Text c="dimmed">Current age: {age} years</Text>

                    <Divider />

                    <Stack gap={4}>
                      <Text fw={600}>Status check</Text>
                      <Text size="sm" c={diagnostics.totalWeeks > 0 && diagnostics.hasCurrentWeek ? 'green' : 'red'}>
                        {diagnostics.totalWeeks > 0 && diagnostics.hasCurrentWeek
                          ? 'OK — weeks calculated'
                          : 'Check inputs — no valid weeks'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Weeks: {diagnostics.totalWeeks} · Events in range: {diagnostics.eventsInRange} · Weeks with periods: {diagnostics.weeksWithPeriods}
                      </Text>
                    </Stack>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="calendars" pt="md">
                  <Stack gap="md">
                    <CalendarList />
                    <Divider />
                    <Stack gap="xs">
                      <Text fw={600}>Demo data</Text>
                      <Text size="xs" c="dimmed">
                        Loads a full set of sample events and periods covering edge cases.
                      </Text>
                      <Group gap="xs">
                        <Button size="xs" variant="light" onClick={handleLoadDemo}>
                          Load demo data
                        </Button>
                        <Button size="xs" variant="subtle" color="red" onClick={handleClearCalendars}>
                          Clear calendars
                        </Button>
                      </Group>
                    </Stack>
                    <Divider />
                    <Stack gap="xs">
                      <Text fw={600}>Settings backup</Text>
                      <Text size="xs" c="dimmed">
                        Export current settings to JSON and restore later from file.
                      </Text>
                      <Group gap="xs">
                        <Button
                          size="xs"
                          variant="light"
                          leftSection={<IconDownload size={14} />}
                          onClick={handleDownloadSettings}
                        >
                          Download JSON
                        </Button>
                        <Button
                          size="xs"
                          variant="default"
                          leftSection={<IconUpload size={14} />}
                          onClick={handleUploadClick}
                        >
                          Upload JSON
                        </Button>
                      </Group>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/json"
                        className="hidden"
                        onChange={handleUploadSettings}
                      />
                      {importError && (
                        <Text size="xs" c="red">
                          {importError}
                        </Text>
                      )}
                    </Stack>
                  </Stack>
                </Tabs.Panel>
              </Tabs>
            </Stack>
          </Paper>
        )}
      </Transition>
    </div>
  );
};

export default LifeMenu;
