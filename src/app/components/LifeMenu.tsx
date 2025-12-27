'use client';

import { ActionIcon, Divider, Group, NumberInput, Paper, Stack, Tabs, Text, Transition } from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconUser, IconCalendar } from '@tabler/icons-react';
import { calculateAge } from '../utils/dates';
import { lifeActions, layoutActions } from '../store';
import { useAppDispatch, useAppSelector } from '../hooks';
import CalendarList from './CalendarList';

const LifeMenu = () => {
  const dispatch = useAppDispatch();
  const lifeProfile = useAppSelector((state) => state.life.profile);
  const isMenuCollapsed = useAppSelector((state) => state.layout.isMenuCollapsed);
  const age = calculateAge(lifeProfile.dateOfBirth);

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
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="calendars" pt="md">
                  <CalendarList />
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
