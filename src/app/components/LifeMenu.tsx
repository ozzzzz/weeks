'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ActionIcon, Button, Divider, Group, NumberInput, ScrollArea, Stack, Tabs, Text, Tooltip } from '@mantine/core';
import { IconCalendar, IconChevronLeft, IconChevronRight, IconDownload, IconUpload, IconUser, IconDatabase } from '@tabler/icons-react';
import { calculateAge } from '../utils/dates';
import { buildWeekOverlays } from '../utils/calendar';
import { buildWeekPoints } from '../utils/weeks';
import { buildDemoState } from '../utils/demoData';
import { calendarActions, lifeActions, layoutActions } from '../store';
import { useAppDispatch, useAppSelector } from '../hooks';
import { downloadPersistedState, parsePersistedState } from '../utils/persistence';
import CalendarList from './CalendarList';

const SIDEBAR_WIDTH = 320;

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

  // Tab key toggles sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't toggle if user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'Tab') {
        e.preventDefault();
        dispatch(layoutActions.toggleMenu());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

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
    <div className="flex h-full flex-shrink-0">
      {/* Sidebar content */}
      <div
        className="h-full overflow-hidden border-r border-gray-200 transition-[width] duration-300 ease-in-out"
        style={{ width: isMenuCollapsed ? 0 : SIDEBAR_WIDTH }}
      >
        <div style={{ width: SIDEBAR_WIDTH }}>
          <ScrollArea h="100dvh" offsetScrollbars>
            <Stack gap="md" p="md">
              <Text fw={600}>Life setup</Text>

              <Tabs defaultValue="profile">
                <Tabs.List>
                  <Tabs.Tab value="profile" leftSection={<IconUser size={14} />}>
                    Profile
                  </Tabs.Tab>
                  <Tabs.Tab value="calendars" leftSection={<IconCalendar size={14} />}>
                    Calendars
                  </Tabs.Tab>
                  <Tabs.Tab value="data" leftSection={<IconDatabase size={14} />}>
                    Data
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
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="calendars" pt="md">
                  <CalendarList />
                </Tabs.Panel>

                <Tabs.Panel value="data" pt="md">
                  <Stack gap="md">
                    <Stack gap="xs">
                      <Text fw={600}>Backup</Text>
                      <Text size="xs" c="dimmed">
                        Export and restore your settings as JSON.
                      </Text>
                      <Group gap="xs">
                        <Button
                          size="xs"
                          variant="light"
                          leftSection={<IconDownload size={14} />}
                          onClick={handleDownloadSettings}
                        >
                          Download
                        </Button>
                        <Button
                          size="xs"
                          variant="default"
                          leftSection={<IconUpload size={14} />}
                          onClick={handleUploadClick}
                        >
                          Upload
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

                    <Divider />

                    <Stack gap="xs">
                      <Text fw={600}>Demo</Text>
                      <Text size="xs" c="dimmed">
                        Load sample data or clear calendars.
                      </Text>
                      <Group gap="xs">
                        <Button size="xs" variant="light" onClick={handleLoadDemo}>
                          Load demo
                        </Button>
                        <Button size="xs" variant="subtle" color="red" onClick={handleClearCalendars}>
                          Clear all
                        </Button>
                      </Group>
                    </Stack>
                  </Stack>
                </Tabs.Panel>
              </Tabs>
            </Stack>
          </ScrollArea>
        </div>
      </div>

      {/* Toggle strip */}
      <Tooltip label={isMenuCollapsed ? 'Open (Tab)' : 'Close (Tab)'} position="right">
        <ActionIcon
          size="lg"
          variant="subtle"
          radius={0}
          aria-label={isMenuCollapsed ? 'Expand menu' : 'Collapse menu'}
          onClick={toggleMenu}
          className="h-full flex-shrink-0 border-r border-gray-200"
          style={{ width: 28 }}
        >
          {isMenuCollapsed ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
        </ActionIcon>
      </Tooltip>
    </div>
  );
};

export default LifeMenu;
