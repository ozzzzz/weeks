import { Anchor, Container, Stack, Text, Title } from '@mantine/core';

export default function About() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={1}>About</Title>

        <Text>
          Weeks is a tool to visualize your entire life at once — every week, laid out in a single
          grid. Lived weeks, remaining weeks, and potential extra time are all visible together,
          giving you a clear picture of your life as a whole.
        </Text>

        <Text>
          To configure your expected lifespan, you can look up average life expectancy by country
          and sex on the{' '}
          <Anchor
            href="https://www.who.int/data/gho/data/indicators/indicator-details/GHO/life-expectancy-at-birth-(years)"
            target="_blank"
            rel="noopener noreferrer"
          >
            WHO website
          </Anchor>
          .
        </Text>

        <Text>
          If you find this useful, you can{' '}
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
    </Container>
  );
}
