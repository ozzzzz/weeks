import Navigation from './components/Navigation';
import LifeMenu from './components/LifeMenu';
import WeeksVisualization from './components/WeeksVisualization';
import MonthsVisualization from './components/MonthsVisualization';
import { useAppDispatch, useAppSelector } from './hooks';
import { layoutActions } from './store';

export default function Home() {
  const dispatch = useAppDispatch();
  const viewMode = useAppSelector((state) => state.layout.viewMode);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <Navigation viewMode={viewMode} onViewModeChange={(mode) => dispatch(layoutActions.setViewMode(mode))} />
      <div className="relative flex-1 overflow-hidden">
        {viewMode === 'weeks' ? <WeeksVisualization /> : <MonthsVisualization />}
        <LifeMenu />
      </div>
    </div>
  );
}
