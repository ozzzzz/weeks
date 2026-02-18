"use client";

import { useEffect } from "react";
import {
  ActionIcon,
  Button,
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
  IconUser,
} from "@tabler/icons-react";
import { calculateAge } from "../utils/dates";
import { buildDemoState } from "../utils/demoData";
import { calendarActions, lifeActions, layoutActions } from "../store";
import { useAppDispatch, useAppSelector } from "../hooks";
import CalendarList from "./CalendarList";

const SIDEBAR_WIDTH = 320;

const LifeMenu = () => {
  const dispatch = useAppDispatch();
  const lifeProfile = useAppSelector((state) => state.life.profile);
  const isMenuCollapsed = useAppSelector(
    (state) => state.layout.isMenuCollapsed,
  );
  const age = calculateAge(lifeProfile.dateOfBirth);

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
                      <Text fw={600}>Demo</Text>
                      <Text size="xs" c="dimmed">
                        Load sample data or clear calendars.
                      </Text>
                      <Group gap="xs">
                        <Button
                          size="xs"
                          variant="subtle"
                          color="dark"
                          onClick={handleLoadDemo}
                        >
                          Load demo
                        </Button>
                        <Button
                          size="xs"
                          variant="subtle"
                          color="red"
                          onClick={handleClearCalendars}
                        >
                          Clear all
                        </Button>
                      </Group>
                    </Stack>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="calendars" pt="md">
                  <CalendarList />
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
