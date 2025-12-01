import { Title } from '@mantine/core';
import LifeMenu from './components/LifeMenu';
import WeeksVisualization from './components/WeeksVisualization';

export default function Home() {
  return (
    <div className="relative h-[calc(100vh-56px)] w-full overflow-hidden">
      <WeeksVisualization />

      <div className="pointer-events-none absolute left-4 top-4 z-30 flex max-w-[90vw] flex-col gap-3">
        <Title order={1} className="pointer-events-auto drop-shadow-sm">
          Weeks
        </Title>
        <div className="pointer-events-auto w-[320px] max-w-full">
          <LifeMenu />
        </div>
      </div>
    </div>
  );
}
