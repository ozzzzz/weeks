'use client';

import { useState } from 'react';
import { Button, ColorInput, Group, NumberInput, Stack, TextInput } from '@mantine/core';
import { CalendarEvent } from '../types';
import { PartialDate } from '../types/common';

interface EventFormProps {
  calendarId: string;
  event?: CalendarEvent;
  onSave: (calendarId: string, event: CalendarEvent) => void;
  onCancel: () => void;
}

const EventForm = ({ calendarId, event, onSave, onCancel }: EventFormProps) => {
  const [label, setLabel] = useState(event?.label ?? '');
  const [date, setDate] = useState<PartialDate>(event?.date ?? { year: new Date().getFullYear() });
  const [color, setColor] = useState(event?.color ?? '');

  const handleDateChange = (field: 'year' | 'month' | 'day') => (value: string | number) => {
    if (typeof value !== 'number') return;
    setDate((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!label.trim() || !date.year) return;

    const newEvent: CalendarEvent = {
      id: event?.id ?? crypto.randomUUID(),
      label: label.trim(),
      date,
      color: color || undefined,
    };
    onSave(calendarId, newEvent);
  };

  return (
    <Stack gap="sm">
      <TextInput
        label="Event name"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        required
        autoFocus
      />

      <NumberInput
        label="Year"
        value={date.year}
        min={1900}
        max={2100}
        onChange={handleDateChange('year')}
        required
      />

      <Group grow>
        <NumberInput
          label="Month"
          value={date.month}
          min={1}
          max={12}
          placeholder="1-12"
          onChange={handleDateChange('month')}
        />
        <NumberInput
          label="Day"
          value={date.day}
          min={1}
          max={31}
          placeholder="1-31"
          onChange={handleDateChange('day')}
        />
      </Group>

      <ColorInput
        label="Color (optional)"
        value={color}
        onChange={setColor}
        placeholder="Pick a color"
      />

      <Group justify="flex-end" mt="sm">
        <Button variant="subtle" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!label.trim() || !date.year}>
          Save
        </Button>
      </Group>
    </Stack>
  );
};

export default EventForm;
