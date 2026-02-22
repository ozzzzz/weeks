"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Button,
  ColorInput,
  Divider,
  Group,
  NumberInput,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconDatabase,
  IconDownload,
  IconRefresh,
  IconTrash,
  IconUpload,
  IconUser,
} from "@tabler/icons-react";
import { calculateAge } from "../utils/dates";
import { buildDemoState } from "../utils/demoData";
import { downloadPersistedState, parsePersistedState } from "../utils/persistence";
import { calendarActions, lifeActions, layoutActions, themeActions } from "../store";
import { useAppDispatch, useAppSelector } from "../hooks";
import CalendarList from "./CalendarList";

const SIDEBAR_WIDTH = 320;

const LifeMenu = () => {
  const dispatch = useAppDispatch();
  const lifeProfile = useAppSelector((state) => state.life.profile);
  const calendars = useAppSelector((state) => state.calendar.calendars);
  const activeCalendarId = useAppSelector((state) => state.calendar.activeCalendarId);
  const isMenuCollapsed = useAppSelector(
    (state) => state.layout.isMenuCollapsed,
  );
  const themeState = useAppSelector((state) => state.theme);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeTheme =
    themeState.themes.find((t) => t.id === themeState.activeThemeId) ??
    themeState.themes[0];
  const age = calculateAge(lifeProfile.dateOfBirth);

  const handleColorChange = (key: "lived" | "remaining" | "extra") => (value: string) => {
    dispatch(themeActions.upsertTheme({
      ...activeTheme,
      weeks: { ...activeTheme.weeks, [key]: value },
    }));
  };

  const handleBirthChange =
    (field: "year" | "month" | "day") => (value: string | number) => {
      if (typeof value !== "number") return;
      dispatch(
        lifeActions.setDateOfBirth({
          ...lifeProfile.dateOfBirth,
          [field]: value,
        }),
      );
    };

  const handleRealExpectancyChange = (value: string | number) => {
    if (typeof value !== "number") return;
    dispatch(lifeActions.setRealExpectancyYears(value));
  };

  const handleExtraExpectancyChange = (value: string | number) => {
    if (typeof value !== "number") return;
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
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "Tab") {
        e.preventDefault();
        dispatch(layoutActions.toggleMenu());
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
    <div className="relative flex h-full flex-shrink-0">
      {/* Sidebar content */}
      <div
        className={`h-full overflow-hidden transition-[width] duration-300 ease-in-out ${
          isMenuCollapsed ? "" : "border-r border-gray-200"
        }`}
        style={{ width: isMenuCollapsed ? 0 : SIDEBAR_WIDTH }}
      >
        <div style={{ width: SIDEBAR_WIDTH, height: "100%" }}>
          <ScrollArea h="100%" offsetScrollbars>
            <Stack gap="md" p="md">
              <Tabs defaultValue="profile" variant="pills" color="dark">
                <Tabs.List>
                  <Tabs.Tab
                    value="profile"
                    leftSection={<IconUser size={14} />}
                  >
                    Profile
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="calendars"
                    leftSection={<IconCalendar size={14} />}
                  >
                    Calendars
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="data"
                    leftSection={<IconDatabase size={14} />}
                  >
                    Data
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="profile" pt="md">
                  <Stack gap="xs">
                    <NumberInput
                      label="Birth year"
                      value={lifeProfile.dateOfBirth.year}
                      min={1900}
                      max={new Date().getFullYear()}
                      onChange={handleBirthChange("year")}
                    />

                    <Group grow>
                      <NumberInput
                        label="Birth month"
                        value={lifeProfile.dateOfBirth.month}
                        min={1}
                        max={12}
                        onChange={handleBirthChange("month")}
                      />
                      <NumberInput
                        label="Birth day"
                        value={lifeProfile.dateOfBirth.day}
                        min={1}
                        max={31}
                        onChange={handleBirthChange("day")}
                      />
                    </Group>

                    <Text size="sm" c="dimmed">
                      Current age: {age} years
                    </Text>

                    <Divider />

                    <NumberInput
                      label="Life expectancy (years)"
                      value={lifeProfile.realExpectancyYears}
                      min={0}
                      max={100}
                      onChange={handleRealExpectancyChange}
                    />

                    <NumberInput
                      label="Extra years (up to 100 in total)"
                      value={lifeProfile.extraExpectancyYears}
                      min={0}
                      max={100}
                      onChange={handleExtraExpectancyChange}
                    />

                    <Divider />

                    <Stack gap="xs">
                      <Text fw={600}>Colors</Text>
                      {(["lived", "remaining", "extra"] as const).map((key) => (
                        <ColorInput
                          key={key}
                          label={key.charAt(0).toUpperCase() + key.slice(1)}
                          value={activeTheme.weeks[key]}
                          onChange={handleColorChange(key)}
                          swatchesPerRow={9}
                        />
                      ))}
                    </Stack>

                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="calendars" pt="md">
                  <CalendarList />
                </Tabs.Panel>

                <Tabs.Panel value="data" pt="md">
                  <Stack gap="xs">
                    <Button
                      fullWidth
                      variant="default"
                      leftSection={<IconDownload size={14} />}
                      onClick={handleSaveData}
                    >
                      Save data
                    </Button>
                    <Button
                      fullWidth
                      variant="default"
                      leftSection={<IconUpload size={14} />}
                      onClick={handleLoadDataClick}
                    >
                      Load data
                    </Button>
                    {importError && (
                      <Text size="xs" c="red">{importError}</Text>
                    )}
                    <Button
                      fullWidth
                      variant="default"
                      leftSection={<IconRefresh size={14} />}
                      onClick={handleLoadDemo}
                    >
                      Load demo
                    </Button>
                    <Button
                      fullWidth
                      variant="subtle"
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      onClick={handleClearData}
                    >
                      Clear all
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/json"
                      className="hidden"
                      onChange={handleLoadData}
                    />
                  </Stack>
                </Tabs.Panel>
              </Tabs>
            </Stack>
          </ScrollArea>
        </div>
      </div>

      {/* Toggle button */}
      <Tooltip
        label={isMenuCollapsed ? "Open (Tab)" : "Close (Tab)"}
        position="right"
      >
        <ActionIcon
          size={30}
          variant="default"
          radius="xl"
          aria-label={isMenuCollapsed ? "Expand menu" : "Collapse menu"}
          onClick={toggleMenu}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-1/2 border-gray-200 bg-white shadow-sm"
        >
          {isMenuCollapsed ? (
            <IconChevronRight size={14} />
          ) : (
            <IconChevronLeft size={14} />
          )}
        </ActionIcon>
      </Tooltip>
    </div>
  );
};

export default LifeMenu;
