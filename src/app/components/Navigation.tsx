'use client';

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ActionIcon, Anchor, Container, Group, Text } from '@mantine/core';
import { IconBrandGithub } from '@tabler/icons-react';
import { useAppSelector } from '../hooks';
import { buildWeekPoints } from '../utils/weeks';
import { buildMonthPoints } from '../utils/months';
import { WeekStatus } from '../types';
import { MetaText } from './ui/text';

const statusOrder: WeekStatus[] = ['lived', 'remaining', 'extra'];

interface NavigationProps {
  viewMode: 'weeks' | 'months';
  onViewModeChange: (mode: 'weeks' | 'months') => void;
}

const Navigation = ({ viewMode, onViewModeChange }: NavigationProps) => {
  const lifeProfile = useAppSelector((state) => state.life.profile);
  const themeState = useAppSelector((state) => state.theme);
  const activeTheme = themeState.themes.find((t) => t.id === themeState.activeThemeId) ?? themeState.themes[0];

  const points = useMemo(
    () => viewMode === 'weeks' ? buildWeekPoints(lifeProfile) : buildMonthPoints(lifeProfile),
    [lifeProfile, viewMode],
  );

  const statusCounts = useMemo(
    () =>
      points.reduce<Record<WeekStatus, number>>(
        (acc, point) => {
          acc[point.status] += 1;
          return acc;
        },
        { lived: 0, remaining: 0, extra: 0 },
      ),
    [points],
  );

  const colorForStatus = (status: WeekStatus) => activeTheme?.weeks[status] ?? '#ccc';

  const otherMode = viewMode === 'weeks' ? 'months' : 'weeks';

  return (
    <header>
      <Container fluid px="lg" py="xs">
        <Group gap="md" align="center">
          <Text
            size="sm"
            fw={600}
            component={Link}
            to="/"
            style={{ textDecoration: 'none', color: 'inherit', display: 'inline-block', minWidth: '3.8rem' }}
          >
            {viewMode === 'weeks' ? 'Weeks' : 'Months'}
          </Text>
          <button
            onClick={() => onViewModeChange(otherMode)}
            style={{
              fontSize: '0.7rem',
              padding: '1px 6px',
              borderRadius: 4,
              border: '1px solid currentColor',
              cursor: 'pointer',
              background: 'transparent',
              color: 'inherit',
              opacity: 0.45,
              minWidth: '7.2rem',
            }}
          >
            Switch to {otherMode === 'weeks' ? 'Weeks' : 'Months'}
          </button>
          {statusOrder.map((status) => (
            <Group key={status} gap={4}>
              <Text component="span" size="xs" style={{ color: colorForStatus(status), lineHeight: 1 }}>●</Text>
              <MetaText>
                {status.charAt(0).toUpperCase() + status.slice(1)} {statusCounts[status]}
              </MetaText>
            </Group>
          ))}
          <Group gap="sm" ml="auto" align="center">
            <Anchor component={Link} to="/about" size="sm" c="dimmed">
              About
            </Anchor>
            <ActionIcon
              component="a"
              href="https://github.com/ozzzzz/weeks"
              target="_blank"
              rel="noopener noreferrer"
              variant="subtle"
              color="gray"
              size="sm"
              aria-label="GitHub repository"
            >
              <IconBrandGithub size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Container>
    </header>
  );
};

export default Navigation;
