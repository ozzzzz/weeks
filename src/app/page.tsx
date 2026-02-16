import LifeMenu from './components/LifeMenu';
import WeeksVisualization from './components/WeeksVisualization';

export default function Home() {
  return (
    <div className="flex h-[calc(100vh-56px)] w-full overflow-hidden">
      <LifeMenu />
      <div className="relative flex-1 overflow-hidden">
        <WeeksVisualization />
      </div>
    </div>
  );
}
