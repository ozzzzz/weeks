'use client';

import { useState } from 'react';
import { Button, ColorInput, Group, NumberInput, SegmentedControl, Stack, Text, TextInput } from '@mantine/core';
import { CalendarPeriod } from '../types';
import { PartialDate } from '../types/common';
import { partialDateToDate } from '../utils/dates';

interface PeriodFormProps {
  calendarId: string;
  period?: CalendarPeriod;
  onSave: (calendarId: string, period: CalendarPeriod) => void;
  onCancel: () => void;
}

const PeriodForm = ({ calendarId, period, onSave, onCancel }: PeriodFormProps) => {
  const currentYear = new Date().getFullYear();
  const [label, setLabel] = useState(period?.label ?? '');
  const [start, setStart] = useState<PartialDate>(period?.start ?? { year: currentYear });
  const [end, setEnd] = useState<PartialDate>(period?.end ?? { year: currentYear });
  const [color, setColor] = useState(period?.color ?? '');
  const [pattern, setPattern] = useState<'solid' | 'striped'>(period?.pattern ?? 'solid');
  const [error, setError] = useState('');

  const handleStartChange = (field: 'year' | 'month' | 'day') => (value: string | number) => {
    if (typeof value !== 'number') return;
    setError('');
    setStart((prev) => ({ ...prev, [field]: value }));
  };

  const handleEndChange = (field: 'year' | 'month' | 'day') => (value: string | number) => {
    if (typeof value !== 'number') return;
    setError('');
    setEnd((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!label.trim() || !start.year || !end.year) return;

    const startDate = partialDateToDate(start);
    const endDate = partialDateToDate(end);
    if (endDate < startDate) {
      setError('End date must be on or after the start date.');
      return;
    }

    const newPeriod: CalendarPeriod = {
      id: period?.id ?? crypto.randomUUID(),
      label: label.trim(),
      start,
      end,
      color: color || undefined,
      pattern,
    };
    onSave(calendarId, newPeriod);
  };

  return (
    <Stack gap="sm">
      <TextInput
        label="Period name"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        required
        autoFocus
      />

      <Text size="sm" fw={500}>Start date</Text>
      <NumberInput
        label="Year"
        value={start.year}
        min={1900}
        max={2100}
        onChange={handleStartChange('year')}
        required
      />
      <Group grow>
        <NumberInput
          label="Month"
          value={start.month}
          min={1}
          max={12}
          placeholder="1-12"
          onChange={handleStartChange('month')}
        />
        <NumberInput
          label="Day"
          value={start.day}
          min={1}
          max={31}
          placeholder="1-31"
          onChange={handleStartChange('day')}
        />
      </Group>

      <Text size="sm" fw={500} mt="xs">End date</Text>
      <NumberInput
        label="Year"
        value={end.year}
        min={1900}
        max={2100}
        onChange={handleEndChange('year')}
        required
      />
      <Group grow>
        <NumberInput
          label="Month"
          value={end.month}
          min={1}
          max={12}
          placeholder="1-12"
          onChange={handleEndChange('month')}
        />
        <NumberInput
          label="Day"
          value={end.day}
          min={1}
          max={31}
          placeholder="1-31"
          onChange={handleEndChange('day')}
        />
      </Group>

      <ColorInput
        label="Color (optional)"
        value={color}
        onChange={setColor}
        placeholder="Pick a color"
      />

      <Stack gap={4}>
        <Text size="sm" fw={500}>Pattern</Text>
        <SegmentedControl
          value={pattern}
          onChange={(val) => setPattern(val as 'solid' | 'striped')}
          data={[
            { label: 'Solid', value: 'solid' },
            { label: 'Striped', value: 'striped' },
      ]}
    />
      </Stack>

      {error && (
        <Text size="xs" c="red">
          {error}
        </Text>
      )}

      <Group justify="flex-end" mt="sm">
        <Button variant="subtle" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!label.trim() || !start.year || !end.year}>
          Save
        </Button>
      </Group>
    </Stack>
  );
};

export default PeriodForm;
