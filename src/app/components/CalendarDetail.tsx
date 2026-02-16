'use client';

import { useMemo, useState } from 'react';
import { ActionIcon, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { calendarActions, layoutActions } from '../store';
import { Calendar, CalendarEvent, CalendarPeriod } from '../types';
import { partialDateToDate, formatPartialDate } from '../utils/dates';
import { dateToWeekIndex } from '../utils/calendar';
import EventForm from './EventForm';
import PeriodForm from './PeriodForm';

interface CalendarDetailProps {
  calendar: Calendar;
}

type ModalMode =
  | { type: 'none' }
  | { type: 'event'; event?: CalendarEvent }
  | { type: 'period'; period?: CalendarPeriod };

const CalendarDetail = ({ calendar }: CalendarDetailProps) => {
  const dispatch = useAppDispatch();
  const birthDate = useAppSelector((state) => state.life.profile.dateOfBirth);
  const [modal, setModal] = useState<ModalMode>({ type: 'none' });

  const sortedEvents = useMemo(() => {
    return [...calendar.events].sort(
      (a, b) => partialDateToDate(a.date).getTime() - partialDateToDate(b.date).getTime(),
    );
  }, [calendar.events]);

  const sortedPeriods = useMemo(() => {
    return [...calendar.periods].sort(
      (a, b) => partialDateToDate(a.start).getTime() - partialDateToDate(b.start).getTime(),
    );
  }, [calendar.periods]);

  const handleFocusEvent = (event: CalendarEvent) => {
    const weekIndex = dateToWeekIndex(event.date, birthDate);
    dispatch(layoutActions.setFocusWeek(weekIndex));
  };

  const handleFocusPeriod = (period: CalendarPeriod) => {
    const weekIndex = dateToWeekIndex(period.start, birthDate);
    dispatch(layoutActions.setFocusWeek(weekIndex));
  };

  const handleSaveEvent = (calendarId: string, event: CalendarEvent) => {
    dispatch(calendarActions.upsertEvent({ calendarId, event }));
    setModal({ type: 'none' });
  };

  const handleDeleteEvent = (eventId: string) => {
    dispatch(calendarActions.removeEvent({ calendarId: calendar.id, eventId }));
  };

  const handleSavePeriod = (calendarId: string, period: CalendarPeriod) => {
    dispatch(calendarActions.upsertPeriod({ calendarId, period }));
    setModal({ type: 'none' });
  };

  const handleDeletePeriod = (periodId: string) => {
    dispatch(calendarActions.removePeriod({ calendarId: calendar.id, periodId }));
  };

  return (
    <Stack gap="md" pt="xs">
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm" fw={500}>Events</Text>
          <Button
            leftSection={<IconPlus size={12} />}
            variant="subtle"
            size="xs"
            onClick={() => setModal({ type: 'event' })}
          >
            Add
          </Button>
        </Group>
        {sortedEvents.length === 0 ? (
          <Text size="xs" c="dimmed">No events</Text>
        ) : (
          sortedEvents.map((event) => (
            <Group
              key={event.id}
              justify="space-between"
              wrap="nowrap"
              style={{ cursor: 'pointer' }}
              onClick={() => handleFocusEvent(event)}
            >
              <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: event.color ?? '#ef4444',
                    flexShrink: 0,
                  }}
                />
                <Text size="xs" lineClamp={1} style={{ flex: 1, minWidth: 0 }}>{event.label}</Text>
                <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>{formatPartialDate(event.date)}</Text>
              </Group>
              <Group gap={4} wrap="nowrap" onClick={(e) => e.stopPropagation()}>
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  onClick={() => setModal({ type: 'event', event })}
                  aria-label="Edit event"
                >
                  <IconEdit size={12} />
                </ActionIcon>
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  color="red"
                  onClick={() => handleDeleteEvent(event.id)}
                  aria-label="Delete event"
                >
                  <IconTrash size={12} />
                </ActionIcon>
              </Group>
            </Group>
          ))
        )}
      </Stack>

      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm" fw={500}>Periods</Text>
          <Button
            leftSection={<IconPlus size={12} />}
            variant="subtle"
            size="xs"
            onClick={() => setModal({ type: 'period' })}
          >
            Add
          </Button>
        </Group>
        {sortedPeriods.length === 0 ? (
          <Text size="xs" c="dimmed">No periods</Text>
        ) : (
          sortedPeriods.map((period) => (
            <Group
              key={period.id}
              justify="space-between"
              wrap="nowrap"
              style={{ cursor: 'pointer' }}
              onClick={() => handleFocusPeriod(period)}
            >
              <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    backgroundColor: period.color ?? '#3b82f6',
                    flexShrink: 0,
                  }}
                />
                <Text size="xs" lineClamp={1} style={{ flex: 1, minWidth: 0 }}>{period.label}</Text>
                <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                  {formatPartialDate(period.start)} — {formatPartialDate(period.end)}
                </Text>
              </Group>
              <Group gap={4} wrap="nowrap" onClick={(e) => e.stopPropagation()}>
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  onClick={() => setModal({ type: 'period', period })}
                  aria-label="Edit period"
                >
                  <IconEdit size={12} />
                </ActionIcon>
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  color="red"
                  onClick={() => handleDeletePeriod(period.id)}
                  aria-label="Delete period"
                >
                  <IconTrash size={12} />
                </ActionIcon>
              </Group>
            </Group>
          ))
        )}
      </Stack>

      <Modal
        opened={modal.type === 'event'}
        onClose={() => setModal({ type: 'none' })}
        title={modal.type === 'event' && modal.event ? 'Edit Event' : 'New Event'}
        size="sm"
      >
        {modal.type === 'event' && (
          <EventForm
            calendarId={calendar.id}
            event={modal.event}
            onSave={handleSaveEvent}
            onCancel={() => setModal({ type: 'none' })}
          />
        )}
      </Modal>

      <Modal
        opened={modal.type === 'period'}
        onClose={() => setModal({ type: 'none' })}
        title={modal.type === 'period' && modal.period ? 'Edit Period' : 'New Period'}
        size="sm"
      >
        {modal.type === 'period' && (
          <PeriodForm
            calendarId={calendar.id}
            period={modal.period}
            onSave={handleSavePeriod}
            onCancel={() => setModal({ type: 'none' })}
          />
        )}
      </Modal>
    </Stack>
  );
};

export default CalendarDetail;
