'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Badge, Group, Paper, Text } from '@mantine/core';
import { useAppSelector } from '../hooks';
import { buildWeekPoints } from '../utils/weeks';
import { formatDisplayDate } from '../utils/dates';
import { WeekStatus } from '../types';

type LayoutInfo = {
  cols: number;
  rows: number;
  cellSize: number;
  startX: number;
  startY: number;
  width: number;
  height: number;
};

type HoverInfo = {
  clientX: number;
  clientY: number;
  label: string;
};

const statusOrder: WeekStatus[] = ['lived', 'current', 'remaining', 'extra'];

const WeeksVisualization = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const pointerRef = useRef(new THREE.Vector2());
  const intersectionRef = useRef(new THREE.Vector3());
  const gridGroupRef = useRef<THREE.Group | null>(null);
  const meshRefs = useRef<Record<WeekStatus, THREE.InstancedMesh | null>>({
    lived: null,
    current: null,
    remaining: null,
    extra: null,
  });
  const layoutRef = useRef<LayoutInfo | null>(null);
  const didSetInitialZoom = useRef(false);
  const lightsRef = useRef<{ ambient: THREE.AmbientLight; directional: THREE.DirectionalLight } | null>(null);

  const lifeProfile = useAppSelector((state) => state.life.profile);
  const themeState = useAppSelector((state) => state.theme);
  const activeTheme = themeState.themes.find((theme) => theme.id === themeState.activeThemeId) ?? themeState.themes[0];

  const weeks = useMemo(() => buildWeekPoints(lifeProfile), [lifeProfile]);

  const statusCounts = useMemo(
    () =>
      weeks.reduce<Record<WeekStatus, number>>(
        (acc, week) => {
          acc[week.status] += 1;
          return acc;
        },
        { lived: 0, current: 0, remaining: 0, extra: 0 },
      ),
    [weeks],
  );

  const colorMap = useMemo(
    () => ({
      lived: new THREE.Color(activeTheme?.weeks.lived ?? '#1e293b'),
      current: new THREE.Color(activeTheme?.weeks.current ?? '#22c55e'),
      remaining: new THREE.Color(activeTheme?.weeks.remaining ?? '#e2e8f0'),
      extra: new THREE.Color(activeTheme?.weeks.extra ?? '#fcd34d'),
    }),
    [activeTheme],
  );

  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    Object.assign(renderer.domElement.style, {
      width: '100%',
      height: '100%',
      position: 'absolute',
      inset: '0',
      display: 'block',
    });
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const gridGroup = new THREE.Group();
    gridGroupRef.current = gridGroup;
    scene.add(gridGroup);

    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    const directional = new THREE.DirectionalLight(0xffffff, 0.6);
    directional.position.set(0.6, 0.8, 1.4);
    scene.add(ambient);
    scene.add(directional);
    lightsRef.current = { ambient, directional };

    const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -50, 50);
    camera.position.z = 10;
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.enableRotate = false;
    controls.panSpeed = 0.8;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };
    controls.touches = {
      ONE: THREE.TOUCH.PAN,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    controls.zoomSpeed = 0.7;
    controls.minZoom = 0.5;
    controls.maxZoom = 2.5;
    controls.target.set(0, 0, 0);
    controls.update();
    controlsRef.current = controls;

    const render = () => {
      controlsRef.current?.update();
      if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    renderer.setAnimationLoop(render);

    return () => {
      renderer.setAnimationLoop(null);
      controlsRef.current?.dispose();
      if (gridGroupRef.current) {
        scene.remove(gridGroupRef.current);
      }
      if (lightsRef.current) {
        scene.remove(lightsRef.current.ambient);
        scene.remove(lightsRef.current.directional);
      }
      Object.values(meshRefs.current).forEach((mesh) => {
        if (!mesh) return;
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        gridGroupRef.current?.remove(mesh);
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setClearColor(activeTheme?.background ?? '#f8fafc', 1);
    }
  }, [activeTheme]);

  const updateLayout = useCallback(() => {
    const container = containerRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const meshes = meshRefs.current;

    if (!container || !renderer || !camera || weeks.length === 0) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    renderer.setSize(width, height, false);

    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    if (!didSetInitialZoom.current) {
      camera.zoom = 0.88;
      didSetInitialZoom.current = true;
    }
    camera.updateProjectionMatrix();

    const minCell = 6;
    const maxColumns = Math.max(1, Math.floor(width / minCell));
    let bestCell = minCell;
    let bestCols = 1;

    for (let cols = 1; cols <= maxColumns; cols += 1) {
      const rows = Math.ceil(weeks.length / cols);
      const cellSize = Math.min(width / cols, height / rows);
      if (cellSize > bestCell) {
        bestCell = cellSize;
        bestCols = cols;
      }
    }

    const cols = bestCols;
    const rows = Math.ceil(weeks.length / cols);
    const cellSize = bestCell;
    const radius = Math.max(1.25, (cellSize * 0.9) / 2);
    const thickness = Math.max(0.6, radius * 0.25);
    const startX = -((cols * cellSize) / 2) + cellSize / 2;
    const startY = (rows * cellSize) / 2 - cellSize / 2;

    layoutRef.current = { cols, rows, cellSize, startX, startY, width, height };

    const dummy = new THREE.Object3D();

    const statusOffsets: Record<WeekStatus, number> = {
      lived: 0,
      current: 0,
      remaining: 0,
      extra: 0,
    };

    statusOrder.forEach((status) => {
      const mesh = meshes[status];
      if (!mesh) return;
      mesh.count = statusCounts[status];
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    });

    for (let index = 0; index < weeks.length; index += 1) {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * cellSize;
      const y = startY - row * cellSize;

      const week = weeks[index];
      const mesh = meshes[week.status];
      if (!mesh) continue;

      const offset = statusOffsets[week.status];

      dummy.position.set(x, y, 0);
      dummy.scale.set(radius, radius, thickness);
      dummy.updateMatrix();
      mesh.setMatrixAt(offset, dummy.matrix);

      statusOffsets[week.status] += 1;
    }

    statusOrder.forEach((status) => {
      const mesh = meshes[status];
      if (!mesh) return;
      mesh.instanceMatrix.needsUpdate = true;
    });
    controlsRef.current?.update();
  }, [weeks, statusCounts]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !rendererRef.current) return;

    statusOrder.forEach((status) => {
      const existing = meshRefs.current[status];
      if (existing) {
        gridGroupRef.current?.remove(existing);
        existing.geometry.dispose();
        (existing.material as THREE.Material).dispose();
        meshRefs.current[status] = null;
      }
    });

    statusOrder.forEach((status) => {
      const geometry = new THREE.CircleGeometry(1, 24);
      const material = new THREE.MeshBasicMaterial({ color: colorMap[status] });
      const mesh = new THREE.InstancedMesh(geometry, material, Math.max(statusCounts[status], 1));
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      meshRefs.current[status] = mesh;
      gridGroupRef.current?.add(mesh);
    });

    updateLayout();
  }, [colorMap, statusCounts, updateLayout]);

  useEffect(() => {
    const handleResize = () => updateLayout();
    const resizeObserver = containerRef.current ? new ResizeObserver(handleResize) : null;

    window.addEventListener('resize', handleResize);
    if (containerRef.current && resizeObserver) {
      resizeObserver.observe(containerRef.current);
    }

    updateLayout();

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
    };
  }, [updateLayout]);

  const colorForStatus = (status: WeekStatus) => activeTheme?.weeks[status] ?? '#ccc';

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const layout = layoutRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    if (!layout || !renderer || !camera) return;

    const rect = renderer.domElement.getBoundingClientRect();
    pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(pointerRef.current, camera);
    const intersection = raycasterRef.current.ray.intersectPlane(planeRef.current, intersectionRef.current);
    if (!intersection) {
      setHoverInfo(null);
      return;
    }

    const localPoint = intersection.clone();
    if (gridGroupRef.current) {
      gridGroupRef.current.worldToLocal(localPoint);
    }

    const col = Math.floor((localPoint.x - layout.startX + layout.cellSize / 2) / layout.cellSize);
    const row = Math.floor((layout.startY - localPoint.y + layout.cellSize / 2) / layout.cellSize);
    const index = row * layout.cols + col;

    if (col < 0 || col >= layout.cols || row < 0 || row >= layout.rows || index >= weeks.length) {
      setHoverInfo(null);
      return;
    }

    const week = weeks[index];
    setHoverInfo({
      clientX: event.clientX,
      clientY: event.clientY,
      label: `${formatDisplayDate(week.date)} · ${week.status}`,
    });
  };

  const handlePointerLeave = () => {
    setHoverInfo(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="pointer-events-none absolute left-1/2 top-4 z-20 flex -translate-x-1/2 gap-2">
        <Paper withBorder radius="md" p="xs" className="pointer-events-auto bg-white/80 backdrop-blur">
          <Group gap="xs">
            {statusOrder.map((status) => (
              <Badge key={status} color={colorForStatus(status)} variant="filled">
                {status} · {statusCounts[status]}
              </Badge>
            ))}
            <Text size="sm" c="dimmed">
              Total: {weeks.length}
            </Text>
          </Group>
        </Paper>
      </div>

      {hoverInfo && (
        <div
          className="pointer-events-none fixed z-30 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs shadow-md"
          style={{ left: hoverInfo.clientX + 10, top: hoverInfo.clientY + 10 }}
        >
          {hoverInfo.label}
        </div>
      )}
    </div>
  );
};

export default WeeksVisualization;
