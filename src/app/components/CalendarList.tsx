'use client';

import { useState } from 'react';
import { ActionIcon, Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { IconPlus, IconTrash, IconEdit, IconCheck, IconX } from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { calendarActions } from '../store';
import { Calendar } from '../types';

const CalendarList = () => {
  const dispatch = useAppDispatch();
  const calendars = useAppSelector((state) => state.calendar.calendars);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreate = () => {
    const newCalendar: Calendar = {
      id: crypto.randomUUID(),
      name: 'New Calendar',
      events: [],
      periods: [],
    };
    dispatch(calendarActions.upsertCalendar(newCalendar));
    setEditingId(newCalendar.id);
    setEditingName(newCalendar.name);
  };

  const handleDelete = (id: string) => {
    dispatch(calendarActions.removeCalendar(id));
  };

  const handleStartEdit = (calendar: Calendar) => {
    setEditingId(calendar.id);
    setEditingName(calendar.name);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editingName.trim()) return;

    const calendar = calendars.find((c) => c.id === editingId);
    if (calendar) {
      dispatch(calendarActions.upsertCalendar({
        ...calendar,
        name: editingName.trim(),
      }));
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <Stack gap="sm">
      {calendars.length === 0 ? (
        <Text c="dimmed" size="sm">No calendars yet</Text>
      ) : (
        calendars.map((calendar) => (
          <Group key={calendar.id} justify="space-between" wrap="nowrap">
            {editingId === calendar.id ? (
              <TextInput
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={handleKeyDown}
                size="sm"
                style={{ flex: 1 }}
                autoFocus
              />
            ) : (
              <Text size="sm" style={{ flex: 1 }}>{calendar.name}</Text>
            )}

            <Group gap="xs" wrap="nowrap">
              {editingId === calendar.id ? (
                <>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="green"
                    onClick={handleSaveEdit}
                    aria-label="Save"
                  >
                    <IconCheck size={14} />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="gray"
                    onClick={handleCancelEdit}
                    aria-label="Cancel"
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </>
              ) : (
                <>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={() => handleStartEdit(calendar)}
                    aria-label="Edit calendar"
                  >
                    <IconEdit size={14} />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={() => handleDelete(calendar.id)}
                    aria-label="Delete calendar"
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </>
              )}
            </Group>
          </Group>
        ))
      )}

      <Button
        leftSection={<IconPlus size={14} />}
        variant="light"
        size="xs"
        onClick={handleCreate}
      >
        Add Calendar
      </Button>
    </Stack>
  );
};

export default CalendarList;
