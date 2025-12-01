import { Title, Container } from '@mantine/core';
import LifeMenu from './components/LifeMenu';
import WeeksVisualization from './components/WeeksVisualization';

export default function Home() {
  return (
    <Container fluid px="lg" pt="xs" pb="md">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr]">
        <div>
          <LifeMenu />
        </div>
        <div>
          <WeeksVisualization />
        </div>
      </div>
    </Container>
  );
}
