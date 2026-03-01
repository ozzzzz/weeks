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
import { SectionLabel } from "./ui/text";
import { DateInput } from "@mantine/dates";
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconRefresh,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { partialDateToDate } from "../utils/dates";
import { buildDemoState } from "../utils/demoData";
import {
  downloadPersistedState,
  parsePersistedState,
} from "../utils/persistence";
import {
  calendarActions,
  lifeActions,
  layoutActions,
} from "../store";
import { useAppDispatch, useAppSelector } from "../hooks";
import CalendarList from "./CalendarList";

const SIDEBAR_WIDTH = 360;

const LifeMenu = () => {
  const dispatch = useAppDispatch();
  const lifeProfile = useAppSelector((state) => state.life.profile);
  const calendars = useAppSelector((state) => state.calendar.calendars);
  const activeCalendarId = useAppSelector(
    (state) => state.calendar.activeCalendarId,
  );
  const isMenuCollapsed = useAppSelector(
    (state) => state.layout.isMenuCollapsed,
  );
  const viewMode = useAppSelector((state) => state.layout.viewMode);
  const weekColors = useAppSelector((state) => state.life.weekColors);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleColorChange =
    (key: "lived" | "remaining" | "extra") => (value: string) => {
      dispatch(lifeActions.setWeekColor({ key, value }));
    };

  const birthdateAsDate = partialDateToDate(lifeProfile.dateOfBirth);

  const handleBirthDateChange = (value: string | null) => {
    if (!value) return;
    const [year, month, day] = value.split("-").map(Number);
    if (!year || isNaN(year)) return;
    dispatch(lifeActions.setDateOfBirth({ year, month, day }));
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

  // "/" toggles sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
        dispatch(layoutActions.toggleMenu());
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  const handleLoadDemo = () => {
    if (
      !confirm(
        "Loading demo data will overwrite your current profile and calendars. Continue?",
      )
    )
      return;
    const demo = buildDemoState();
    dispatch(lifeActions.setLifeProfile(demo.profile));
    dispatch(calendarActions.setCalendars(demo.calendars));
    dispatch(calendarActions.setActiveCalendar(demo.activeCalendarId ?? null));
    dispatch(layoutActions.setMenuCollapsed(false));
  };

  const handleSaveData = () => {
    downloadPersistedState({
      profile: lifeProfile,
      weekColors,
      calendars,
      activeCalendarId,
      viewMode,
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
      setImportError("Invalid settings JSON file");
      event.target.value = "";
      return;
    }

    dispatch(lifeActions.setLifeProfile(parsed.profile));
    dispatch(lifeActions.setWeekColors(parsed.weekColors));
    dispatch(calendarActions.setCalendars(parsed.calendars));
    dispatch(calendarActions.setActiveCalendar(parsed.activeCalendarId));
    dispatch(layoutActions.setViewMode(parsed.viewMode));
    setImportError(null);
    event.target.value = "";
  };

  const handleClearData = () => {
    if (
      confirm(
        "Are you sure you want to clear all data? This will reset everything to defaults.",
      )
    ) {
      dispatch(calendarActions.setCalendars([]));
      dispatch(calendarActions.setActiveCalendar(null));
    }
  };

  return (
    <div className="absolute left-0 top-0 z-10 flex h-full">
      {/* Sidebar content */}
      <div
        className="h-full overflow-hidden bg-white shadow-xl transition-[width] duration-300 ease-in-out"
        style={{ width: isMenuCollapsed ? 0 : SIDEBAR_WIDTH }}
      >
        <div style={{ width: SIDEBAR_WIDTH, height: "100%" }}>
          <ScrollArea h="100%" offsetScrollbars>
            <Stack gap="md" p="md">
              <Tabs defaultValue="profile" variant="pills" color="dark" keepMounted={false}>
                <Tabs.List grow>
                  <Tabs.Tab value="profile">Profile</Tabs.Tab>
                  <Tabs.Tab value="calendars">Calendars</Tabs.Tab>
                  <Tabs.Tab value="data">Data</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="profile" pt="md">
                  <Stack gap="xs">
                    <DateInput
                      label="Birthdate"
                      value={birthdateAsDate}
                      onChange={handleBirthDateChange}
                      minDate={new Date(1900, 0, 1)}
                      maxDate={new Date()}
                      valueFormat="YYYY-MM-DD"
                      clearable={false}
                    />

                    <Group align="flex-end" gap="xs">
                      <NumberInput
                        label="Life expectancy"
                        value={lifeProfile.realExpectancyYears}
                        min={0}
                        max={100}
                        style={{ flex: 1 }}
                        onChange={handleRealExpectancyChange}
                      />
                      <Text pb={6}>+</Text>
                      <NumberInput
                        label="Extra years"
                        value={lifeProfile.extraExpectancyYears}
                        min={0}
                        max={50}
                        style={{ flex: 1 }}
                        onChange={handleExtraExpectancyChange}
                      />
                    </Group>

                    <Divider />

                    <Stack gap="xs">
                      <SectionLabel>Colors</SectionLabel>
                      {(["lived", "remaining", "extra"] as const).map((key) => (
                        <ColorInput
                          key={key}
                          label={key.charAt(0).toUpperCase() + key.slice(1)}
                          value={weekColors[key]}
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
                      <Text size="xs" c="red">
                        {importError}
                      </Text>
                    )}
                    <Group grow mt="xs">
                      <Button
                        variant="default"
                        leftSection={<IconRefresh size={14} />}
                        onClick={handleLoadDemo}
                      >
                        Load demo
                      </Button>
                      <Button
                        variant="outline"
                        color="red"
                        leftSection={<IconTrash size={14} />}
                        onClick={handleClearData}
                      >
                        Clear all
                      </Button>
                    </Group>
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
        label={isMenuCollapsed ? "Open (/)" : "Close (/)"}
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
