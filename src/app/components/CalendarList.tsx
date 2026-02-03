'use client';

import { useState } from 'react';
import { Accordion, ActionIcon, Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { IconPlus, IconTrash, IconEdit, IconCheck, IconX } from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { calendarActions } from '../store';
import { Calendar } from '../types';
import CalendarDetail from './CalendarDetail';

const CalendarList = () => {
  const dispatch = useAppDispatch();
  const calendars = useAppSelector((state) => state.calendar.calendars);
  const activeCalendarId = useAppSelector((state) => state.calendar.activeCalendarId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleKeyActivate = (action: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const handleCreate = () => {
    const newCalendar: Calendar = {
      id: crypto.randomUUID(),
      name: 'New Calendar',
      events: [],
      periods: [],
    };
    dispatch(calendarActions.upsertCalendar(newCalendar));
    dispatch(calendarActions.setActiveCalendar(newCalendar.id));
    setEditingId(newCalendar.id);
    setEditingName(newCalendar.name);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    dispatch(calendarActions.removeCalendar(id));
  };

  const handleStartEdit = (calendar: Calendar, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(calendar.id);
    setEditingName(calendar.name);
  };

  const handleSaveEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  const handleCancelEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditingName('');
  };

  const handleSelectCalendar = (calendarId: string) => {
    dispatch(calendarActions.setActiveCalendar(calendarId));
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
        <Accordion variant="separated" radius="sm">
          {calendars.map((calendar) => (
            <Accordion.Item key={calendar.id} value={calendar.id}>
              <Accordion.Control>
                <Group justify="space-between" wrap="nowrap" style={{ flex: 1 }}>
                  <Group gap="xs" wrap="nowrap" style={{ flex: 1 }}>
                    <input
                      type="radio"
                      name="activeCalendar"
                      checked={activeCalendarId === calendar.id}
                      onChange={() => handleSelectCalendar(calendar.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${calendar.name}`}
                    />
                    {editingId === calendar.id ? (
                      <TextInput
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        size="xs"
                        style={{ flex: 1 }}
                        autoFocus
                      />
                    ) : (
                      <Text size="sm">{calendar.name}</Text>
                    )}
                  </Group>

                  <Group gap="xs" wrap="nowrap" onClick={(e) => e.stopPropagation()}>
                    {editingId === calendar.id ? (
                      <>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="green"
                          component="span"
                          role="button"
                          tabIndex={0}
                          onClick={handleSaveEdit}
                          onKeyDown={handleKeyActivate(() => handleSaveEdit())}
                          aria-label="Save"
                        >
                          <IconCheck size={14} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="gray"
                          component="span"
                          role="button"
                          tabIndex={0}
                          onClick={handleCancelEdit}
                          onKeyDown={handleKeyActivate(() => handleCancelEdit())}
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
                          component="span"
                          role="button"
                          tabIndex={0}
                          onClick={(e) => handleStartEdit(calendar, e)}
                          onKeyDown={handleKeyActivate(() => handleStartEdit(calendar))}
                          aria-label="Edit calendar"
                        >
                          <IconEdit size={14} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="red"
                          component="span"
                          role="button"
                          tabIndex={0}
                          onClick={(e) => handleDelete(calendar.id, e)}
                          onKeyDown={handleKeyActivate(() => handleDelete(calendar.id))}
                          aria-label="Delete calendar"
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </>
                    )}
                  </Group>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <CalendarDetail calendar={calendar} />
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
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
