import { Container, Stack, Text, Title } from '@mantine/core';

export default function AboutPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Title order={1}>About</Title>
        <Text>
          Weeks is a simple tool to visualize the weeks in a lifetime. Enter your birth date and
          life expectancy to see lived, current, remaining, and extra weeks laid out as coins.
        </Text>
        <Text>
          The project uses Mantine components, Tailwind for layout, and Redux Toolkit for state
          management to keep the experience responsive and easy to extend.
        </Text>
      </Stack>
    </Container>
  );
}
