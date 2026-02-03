'use client';

import { useMemo, useState } from 'react';
import { ActionIcon, Button, Group, Modal, SegmentedControl, Stack, Text, TextInput } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useAppDispatch } from '../hooks';
import { calendarActions } from '../store';
import { Calendar, CalendarEvent, CalendarPeriod } from '../types';
import { partialDateToDate } from '../utils/dates';
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
  const [modal, setModal] = useState<ModalMode>({ type: 'none' });
  const [eventQuery, setEventQuery] = useState('');
  const [eventRange, setEventRange] = useState<'all' | 'past' | 'future'>('all');
  const [eventSort, setEventSort] = useState<'asc' | 'desc'>('asc');
  const [periodQuery, setPeriodQuery] = useState('');
  const [periodRange, setPeriodRange] = useState<'all' | 'active' | 'past' | 'future'>('all');
  const [periodSort, setPeriodSort] = useState<'asc' | 'desc'>('asc');

  const todayStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = eventQuery.trim().toLowerCase();

    const matchesRange = (event: CalendarEvent) => {
      const eventDate = partialDateToDate(event.date);
      if (eventRange === 'past') return eventDate < todayStart;
      if (eventRange === 'future') return eventDate >= todayStart;
      return true;
    };

    const matchesQuery = (event: CalendarEvent) => {
      if (!normalizedQuery) return true;
      return event.label.toLowerCase().includes(normalizedQuery);
    };

    const sorted = [...calendar.events]
      .filter((event) => matchesQuery(event) && matchesRange(event))
      .sort((a, b) => {
        const diff = partialDateToDate(a.date).getTime() - partialDateToDate(b.date).getTime();
        return eventSort === 'asc' ? diff : -diff;
      });

    return sorted;
  }, [calendar.events, eventQuery, eventRange, eventSort, todayStart]);

  const filteredPeriods = useMemo(() => {
    const normalizedQuery = periodQuery.trim().toLowerCase();

    const matchesRange = (period: CalendarPeriod) => {
      const startDate = partialDateToDate(period.start);
      const endDate = partialDateToDate(period.end);

      if (periodRange === 'past') return endDate < todayStart;
      if (periodRange === 'future') return startDate > todayStart;
      if (periodRange === 'active') return startDate <= todayStart && endDate >= todayStart;
      return true;
    };

    const matchesQuery = (period: CalendarPeriod) => {
      if (!normalizedQuery) return true;
      return period.label.toLowerCase().includes(normalizedQuery);
    };

    const sorted = [...calendar.periods]
      .filter((period) => matchesQuery(period) && matchesRange(period))
      .sort((a, b) => {
        const diff = partialDateToDate(a.start).getTime() - partialDateToDate(b.start).getTime();
        return periodSort === 'asc' ? diff : -diff;
      });

    return sorted;
  }, [calendar.periods, periodQuery, periodRange, periodSort, todayStart]);

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
        {calendar.events.length === 0 ? (
          <Text size="xs" c="dimmed">No events</Text>
        ) : (
          <>
            <TextInput
              placeholder="Search events"
              size="xs"
              value={eventQuery}
              onChange={(e) => setEventQuery(e.target.value)}
            />
            <Group gap="xs" wrap="nowrap">
              <SegmentedControl
                size="xs"
                value={eventRange}
                onChange={(value) => setEventRange(value as 'all' | 'past' | 'future')}
                data={[
                  { label: 'All', value: 'all' },
                  { label: 'Past', value: 'past' },
                  { label: 'Future', value: 'future' },
                ]}
              />
              <SegmentedControl
                size="xs"
                value={eventSort}
                onChange={(value) => setEventSort(value as 'asc' | 'desc')}
                data={[
                  { label: 'Oldest', value: 'asc' },
                  { label: 'Newest', value: 'desc' },
                ]}
              />
            </Group>

            {filteredEvents.length === 0 ? (
              <Text size="xs" c="dimmed">No matching events</Text>
            ) : (
              filteredEvents.map((event) => (
            <Group key={event.id} justify="space-between" wrap="nowrap">
              <Group gap="xs" wrap="nowrap">
                {event.color && (
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: event.color,
                    }}
                  />
                )}
                <Text size="xs" lineClamp={1}>{event.label}</Text>
              </Group>
              <Group gap={4} wrap="nowrap">
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
          </>
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
        {calendar.periods.length === 0 ? (
          <Text size="xs" c="dimmed">No periods</Text>
        ) : (
          <>
            <TextInput
              placeholder="Search periods"
              size="xs"
              value={periodQuery}
              onChange={(e) => setPeriodQuery(e.target.value)}
            />
            <Group gap="xs" wrap="nowrap">
              <SegmentedControl
                size="xs"
                value={periodRange}
                onChange={(value) => setPeriodRange(value as 'all' | 'active' | 'past' | 'future')}
                data={[
                  { label: 'All', value: 'all' },
                  { label: 'Active', value: 'active' },
                  { label: 'Past', value: 'past' },
                  { label: 'Future', value: 'future' },
                ]}
              />
              <SegmentedControl
                size="xs"
                value={periodSort}
                onChange={(value) => setPeriodSort(value as 'asc' | 'desc')}
                data={[
                  { label: 'Oldest', value: 'asc' },
                  { label: 'Newest', value: 'desc' },
                ]}
              />
            </Group>

            {filteredPeriods.length === 0 ? (
              <Text size="xs" c="dimmed">No matching periods</Text>
            ) : (
              filteredPeriods.map((period) => (
            <Group key={period.id} justify="space-between" wrap="nowrap">
              <Group gap="xs" wrap="nowrap">
                {period.color && (
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      backgroundColor: period.color,
                    }}
                  />
                )}
                <Text size="xs" lineClamp={1}>{period.label}</Text>
              </Group>
              <Group gap={4} wrap="nowrap">
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
          </>
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
