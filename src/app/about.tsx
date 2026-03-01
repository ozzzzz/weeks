import { Anchor, Container, Group, Stack, Text } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Group>
          <Anchor component={Link} to="/" c="dimmed" size="sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconArrowLeft size={14} />
            Back
          </Anchor>
        </Group>

        <Stack gap="xs">
          <Text fw={600}>What is this?</Text>
          <Text>
            A tool to see your entire life at once. The weeks grid shows every week as a single
            cell — lived, remaining, and potential extra time all in one view. Prefer a bigger
            picture? Switch to months mode, where each cell is a month instead.
          </Text>
        </Stack>

        <Stack gap="xs">
          <Text fw={600}>How long will I live?</Text>
          <Text>
            Nobody knows, but you can use average life expectancy by country and sex as a
            baseline — the{' '}
            <Anchor
              href="https://www.who.int/data/gho/data/indicators/indicator-details/GHO/life-expectancy-at-birth-(years)"
              target="_blank"
              rel="noopener noreferrer"
            >
              WHO website
            </Anchor>
            {' '}has the data. The extra years shown beyond that baseline are a bonus — set them to
            whatever feels optimistic.
          </Text>
        </Stack>

        <Stack gap="xs">
          <Text fw={600}>Where is my data?</Text>
          <Text>
            Nowhere except your browser. There's no backend, no tracking, no cookies — nothing is
            sent or stored anywhere. Your data lives in local storage and in a file you can download
            and upload back anytime. Don't believe it? The{' '}
            <Anchor
              href="https://github.com/ozzzzz/weeks"
              target="_blank"
              rel="noopener noreferrer"
            >
              code is open
            </Anchor>
            , go check.
          </Text>
        </Stack>

        <Stack gap="xs">
          <Text fw={600}>Who made this?</Text>
          <Text>
            Hi, I'm{' '}
            <Anchor
              href="https://github.com/ozzzzz"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bogdan Neterebskii
            </Anchor>
            . I built this after coming across{' '}
            <Anchor
              href="https://year.vas3k.cloud/"
              target="_blank"
              rel="noopener noreferrer"
            >
              year.vas3k.cloud
            </Anchor>
            {' '}by Vastrik — a beautiful day-by-day year planner that got me thinking about time
            at a larger scale. If you have suggestions, open an{' '}
            <Anchor
              href="https://github.com/ozzzzz/weeks/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              issue on GitHub
            </Anchor>
            . If you enjoy the tool, you can{' '}
            <Anchor
              href="https://buymeacoffee.com/ozzzzz"
              target="_blank"
              rel="noopener noreferrer"
            >
              buy me a coffee
            </Anchor>
            .
          </Text>
        </Stack>
      </Stack>
    </Container>
  );
}
