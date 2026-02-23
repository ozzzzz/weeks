import Navigation from './components/Navigation';
import LifeMenu from './components/LifeMenu';
import WeeksVisualization from './components/WeeksVisualization';

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <Navigation />
      <div className="relative flex-1 overflow-hidden">
        <WeeksVisualization />
        <LifeMenu />
      </div>
    </div>
  );
}
