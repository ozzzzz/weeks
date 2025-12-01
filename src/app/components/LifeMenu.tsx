'use client';

import { Button, NumberInput, Paper, Stack, Text, Group, Divider } from '@mantine/core';
import { calculateAge } from '../utils/dates';
import { lifeActions, layoutActions } from '../store';
import { useAppDispatch, useAppSelector } from '../hooks';

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

  if (isMenuCollapsed) {
    return (
      <Paper withBorder p="md">
        <Group justify="space-between">
          <Text fw={600}>Life setup</Text>
          <Button size="xs" variant="light" onClick={toggleMenu}>
            Expand
          </Button>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600}>Life setup</Text>
          <Button size="xs" variant="light" onClick={toggleMenu}>
            Collapse
          </Button>
        </Group>

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
    </Paper>
  );
};

export default LifeMenu;
