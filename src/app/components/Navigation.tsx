'use client';

import Link from 'next/link';
import { Anchor, Container, Group, Title } from '@mantine/core';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
];

const Navigation = () => {
  return (
    <header>
      <Container fluid px="lg" py="xs">
        <Group justify="space-between">
          <Title order={3}>Weeks</Title>
          <Group gap="md">
            {links.map((link) => (
              <Anchor key={link.href} component={Link} href={link.href}>
                {link.label}
              </Anchor>
            ))}
          </Group>
        </Group>
      </Container>
    </header>
  );
};

export default Navigation;
