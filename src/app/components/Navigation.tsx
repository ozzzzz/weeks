'use client';

import { Container, Group, Text, Title } from '@mantine/core';

const Navigation = () => {
  return (
    <header>
      <Container fluid px="lg" py="xs">
        <Group justify="space-between">
          <Title order={3}>Weeks</Title>
          <Text c="dimmed" size="sm">
            Static local tool
          </Text>
        </Group>
      </Container>
    </header>
  );
};

export default Navigation;
