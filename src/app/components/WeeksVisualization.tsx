"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useAppSelector, useAppDispatch } from "../hooks";
import { layoutActions } from "../store";
import { buildWeekPoints } from "../utils/weeks";
import { buildWeekOverlays, dateToWeekIndex } from "../utils/calendar";
import { formatDisplayDate, formatPartialDate } from "../utils/dates";
import {
  WeekStatus,
  DEFAULT_EVENT_COLOR,
  DEFAULT_PERIOD_COLOR,
} from "../types";

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
  events?: string[];
  periods?: string[];
};

const statusOrder: WeekStatus[] = ["lived", "remaining", "extra"];
const EVENT_SCALE_MULTIPLIER = 2.0;
const HOVER_SCALE_MULTIPLIER = 1.35;
const HOVER_LIFT_Y_FACTOR = 0.16;
const HOVER_FLOAT_Y_FACTOR = 0.05;
const HOVER_LIFT_Z = 0.14;
const HOVER_EASING = 0.14;
const HOVER_EPSILON = 0.002;
const HOVER_FLOAT_SPEED = 0.004;

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
  const periodMeshesRef = useRef<THREE.InstancedMesh[]>([]);
  const eventMeshesRef = useRef<THREE.InstancedMesh[]>([]);
  const layoutRef = useRef<LayoutInfo | null>(null);
  const updateLayoutRef = useRef<(animateOnly?: boolean) => void>(() => {});
  const didSetInitialZoom = useRef(false);
  const hoveredWeekIndicesRef = useRef<Set<number>>(new Set());
  const hoverProgressRef = useRef<Float32Array>(new Float32Array(0));
  const hoverAnimationActiveRef = useRef(false);
  const lightsRef = useRef<{
    ambient: THREE.AmbientLight;
    directional: THREE.DirectionalLight;
  } | null>(null);

  const dispatch = useAppDispatch();
  const lifeProfile = useAppSelector((state) => state.life.profile);
  const calendars = useAppSelector((state) => state.calendar.calendars);
  const activeCalendarId = useAppSelector(
    (state) => state.calendar.activeCalendarId,
  );
  const focusWeekIndex = useAppSelector((state) => state.layout.focusWeekIndex);
  const resetView = useAppSelector((state) => state.layout.resetView);
  const hoveredEventId = useAppSelector((state) => state.layout.hoveredEventId);
  const hoveredPeriodId = useAppSelector(
    (state) => state.layout.hoveredPeriodId,
  );
  const themeState = useAppSelector((state) => state.theme);
  const activeTheme =
    themeState.themes.find((theme) => theme.id === themeState.activeThemeId) ??
    themeState.themes[0];

  const weeks = useMemo(() => buildWeekPoints(lifeProfile), [lifeProfile]);

  const activeCalendars = useMemo(() => {
    if (!activeCalendarId) return calendars;
    return calendars.filter((calendar) => calendar.id === activeCalendarId);
  }, [calendars, activeCalendarId]);

  const weekOverlays = useMemo(
    () =>
      buildWeekOverlays(weeks.length, activeCalendars, lifeProfile.dateOfBirth),
    [weeks.length, activeCalendars, lifeProfile.dateOfBirth],
  );

  const periodInstances = useMemo(() => {
    const totalWeeks = weeks.length;
    if (totalWeeks === 0) return [];

    return activeCalendars.flatMap((calendar) =>
      calendar.periods
        .map((period) => {
          const startWeek = dateToWeekIndex(
            period.start,
            lifeProfile.dateOfBirth,
          );
          const endWeek = dateToWeekIndex(period.end, lifeProfile.dateOfBirth);
          const start = Math.max(0, Math.min(totalWeeks - 1, startWeek));
          const end = Math.max(0, Math.min(totalWeeks - 1, endWeek));

          if (end < 0 || start > totalWeeks - 1 || end < start) {
            return null;
          }

          const weekIndices: number[] = [];
          for (let i = start; i <= end; i += 1) {
            weekIndices.push(i);
          }

          return { period, weekIndices };
        })
        .filter(
          (
            entry,
          ): entry is {
            period: (typeof calendar.periods)[number];
            weekIndices: number[];
          } => !!entry,
        ),
    );
  }, [activeCalendars, lifeProfile.dateOfBirth, weeks.length]);

  const hoveredWeekIndices = useMemo(() => {
    const indices = new Set<number>();

    if (hoveredEventId) {
      for (const calendar of activeCalendars) {
        const event = calendar.events.find(
          (item) => item.id === hoveredEventId,
        );
        if (!event) continue;
        const weekIndex = dateToWeekIndex(event.date, lifeProfile.dateOfBirth);
        if (weekIndex >= 0 && weekIndex < weeks.length) {
          indices.add(weekIndex);
        }
        break;
      }
    }

    if (hoveredPeriodId) {
      for (const calendar of activeCalendars) {
        const period = calendar.periods.find(
          (item) => item.id === hoveredPeriodId,
        );
        if (!period) continue;
        const start = Math.max(
          0,
          dateToWeekIndex(period.start, lifeProfile.dateOfBirth),
        );
        const end = Math.min(
          weeks.length - 1,
          dateToWeekIndex(period.end, lifeProfile.dateOfBirth),
        );
        for (let i = start; i <= end; i += 1) {
          indices.add(i);
        }
        break;
      }
    }

    return indices;
  }, [
    hoveredEventId,
    hoveredPeriodId,
    activeCalendars,
    lifeProfile.dateOfBirth,
    weeks.length,
  ]);

  const eventInstances = useMemo(() => {
    const colorToWeekIndices = new Map<string, number[]>();

    weekOverlays.forEach((overlay, weekIndex) => {
      if (overlay.events.length === 0) return;
      const latestEvent = overlay.events[overlay.events.length - 1];
      const color = latestEvent?.color || DEFAULT_EVENT_COLOR;
      const key = color.trim() || DEFAULT_EVENT_COLOR;
      const existing = colorToWeekIndices.get(key);
      if (existing) {
        existing.push(weekIndex);
        return;
      }
      colorToWeekIndices.set(key, [weekIndex]);
    });

    return Array.from(colorToWeekIndices.entries()).map(
      ([color, weekIndices]) => ({
        color,
        weekIndices,
      }),
    );
  }, [weekOverlays]);

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
      lived: new THREE.Color(activeTheme?.weeks.lived ?? "#1e293b"),
      current: new THREE.Color(activeTheme?.weeks.current ?? "#22c55e"),
      remaining: new THREE.Color(activeTheme?.weeks.remaining ?? "#e2e8f0"),
      extra: new THREE.Color(activeTheme?.weeks.extra ?? "#fcd34d"),
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
      width: "100%",
      height: "100%",
      position: "absolute",
      inset: "0",
      display: "block",
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
      if (hoverAnimationActiveRef.current) {
        updateLayoutRef.current(true);
      }
      if (!rendererRef.current || !cameraRef.current || !sceneRef.current)
        return;
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
      periodMeshesRef.current.forEach((mesh) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        gridGroupRef.current?.remove(mesh);
      });
      periodMeshesRef.current = [];
      eventMeshesRef.current.forEach((mesh) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        gridGroupRef.current?.remove(mesh);
      });
      eventMeshesRef.current = [];
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setClearColor(
        activeTheme?.background ?? "#f8fafc",
        1,
      );
    }
  }, [activeTheme]);

  const updateLayout = useCallback(
    (animateOnly = false) => {
      const container = containerRef.current;
      const renderer = rendererRef.current;
      const camera = cameraRef.current;
      const meshes = meshRefs.current;

      if (!container || !renderer || !camera || weeks.length === 0) return;

      let cols: number;
      let rows: number;
      let cellSize: number;
      let startX: number;
      let startY: number;
      let width: number;
      let height: number;

      if (animateOnly && layoutRef.current) {
        ({ cols, rows, cellSize, startX, startY, width, height } =
          layoutRef.current);
      } else {
        width = container.clientWidth;
        height = container.clientHeight;

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

        for (
          let candidateCols = 1;
          candidateCols <= maxColumns;
          candidateCols += 1
        ) {
          const candidateRows = Math.ceil(weeks.length / candidateCols);
          const candidateCellSize = Math.min(
            width / candidateCols,
            height / candidateRows,
          );
          if (candidateCellSize > bestCell) {
            bestCell = candidateCellSize;
            bestCols = candidateCols;
          }
        }

        cols = bestCols;
        rows = Math.ceil(weeks.length / cols);
        cellSize = bestCell;
        startX = -((cols * cellSize) / 2) + cellSize / 2;
        startY = (rows * cellSize) / 2 - cellSize / 2;

        layoutRef.current = {
          cols,
          rows,
          cellSize,
          startX,
          startY,
          width,
          height,
        };
      }

      const radius = Math.max(1.2, (cellSize * 0.4) / 2);
      const thickness = Math.max(0.6, radius * 0.3);
      const now = performance.now();

      if (hoverProgressRef.current.length !== weeks.length) {
        hoverProgressRef.current = new Float32Array(weeks.length);
      }
      const hoverProgress = hoverProgressRef.current;
      const hoveredWeekIndicesSet = hoveredWeekIndicesRef.current;
      let hasTransition = false;

      const getHoverValue = (weekIndex: number) => {
        const target = hoveredWeekIndicesSet.has(weekIndex) ? 1 : 0;
        const current = hoverProgress[weekIndex] ?? 0;
        const next = current + (target - current) * HOVER_EASING;
        const snapped = Math.abs(target - next) < HOVER_EPSILON ? target : next;
        if (snapped !== target) {
          hasTransition = true;
        }
        hoverProgress[weekIndex] = snapped;
        return snapped;
      };

      const getFloatMultiplier = (hoverAmount: number, weekIndex: number) =>
        hoverAmount > 0
          ? ((Math.sin(now * HOVER_FLOAT_SPEED + weekIndex * 0.35) + 1) / 2) *
            hoverAmount
          : 0;

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

      // Position week circles
      for (let index = 0; index < weeks.length; index += 1) {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = startX + col * cellSize;
        const y = startY - row * cellSize;

        const week = weeks[index];
        const mesh = meshes[week.status];
        if (!mesh) continue;

        const offset = statusOffsets[week.status];
        const hoverAmount = getHoverValue(index);
        const floatAmount = getFloatMultiplier(hoverAmount, index);
        const scaleMultiplier = 1 + hoverAmount * (HOVER_SCALE_MULTIPLIER - 1);
        const yOffset =
          hoverAmount * cellSize * HOVER_LIFT_Y_FACTOR +
          floatAmount * cellSize * HOVER_FLOAT_Y_FACTOR;
        const zOffset = hoverAmount * HOVER_LIFT_Z;

        dummy.position.set(x, y + yOffset, zOffset);
        dummy.scale.set(
          radius * scaleMultiplier,
          radius * scaleMultiplier,
          thickness,
        );
        dummy.updateMatrix();
        mesh.setMatrixAt(offset, dummy.matrix);

        statusOffsets[week.status] += 1;
      }

      statusOrder.forEach((status) => {
        const mesh = meshes[status];
        if (!mesh) return;
        mesh.instanceMatrix.needsUpdate = true;
      });

      // Position period backgrounds per period (color-locked materials)
      if (!animateOnly) {
        periodMeshesRef.current.forEach((mesh, index) => {
          const instance = periodInstances[index];
          if (!instance) return;
          const bgWidth = cellSize;
          const bgHeight = cellSize / 1.8;

          instance.weekIndices.forEach((weekIndex, weekOffset) => {
            const col = weekIndex % cols;
            const row = Math.floor(weekIndex / cols);
            const x = startX + col * cellSize;
            const y = startY - row * cellSize;

            dummy.position.set(x, y, -0.08);
            dummy.scale.set(bgWidth, bgHeight, 1);
            dummy.updateMatrix();
            mesh.setMatrixAt(weekOffset, dummy.matrix);
          });

          mesh.count = instance.weekIndices.length;
          mesh.instanceMatrix.needsUpdate = true;
        });
      }

      // Position event overlays (one mesh per event color)
      eventMeshesRef.current.forEach((mesh, index) => {
        const instance = eventInstances[index];
        if (!instance) return;

        instance.weekIndices.forEach((weekIndex, weekOffset) => {
          const col = weekIndex % cols;
          const row = Math.floor(weekIndex / cols);
          const x = startX + col * cellSize;
          const y = startY - row * cellSize;
          const hoverAmount = hoverProgress[weekIndex] ?? 0;
          const floatAmount = getFloatMultiplier(hoverAmount, weekIndex);
          const scaleMultiplier =
            1 + hoverAmount * (HOVER_SCALE_MULTIPLIER - 1);
          const yOffset =
            hoverAmount * cellSize * HOVER_LIFT_Y_FACTOR +
            floatAmount * cellSize * HOVER_FLOAT_Y_FACTOR;
          const zOffset = hoverAmount * HOVER_LIFT_Z;

          dummy.position.set(x, y + yOffset, 0.02 + zOffset);
          dummy.scale.set(
            radius * EVENT_SCALE_MULTIPLIER * scaleMultiplier,
            radius * EVENT_SCALE_MULTIPLIER * scaleMultiplier,
            thickness,
          );
          dummy.updateMatrix();
          mesh.setMatrixAt(weekOffset, dummy.matrix);
        });

        mesh.count = instance.weekIndices.length;
        mesh.instanceMatrix.needsUpdate = true;
      });

      hoverAnimationActiveRef.current =
        hoveredWeekIndicesSet.size > 0 || hasTransition;
      controlsRef.current?.update();
    },
    [weeks, statusCounts, periodInstances, eventInstances],
  );

  useEffect(() => {
    updateLayoutRef.current = updateLayout;
  }, [updateLayout]);

  useEffect(() => {
    hoveredWeekIndicesRef.current = hoveredWeekIndices;
    hoverAnimationActiveRef.current = true;
  }, [hoveredWeekIndices]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !rendererRef.current) return;

    // Clean up existing week meshes
    statusOrder.forEach((status) => {
      const existing = meshRefs.current[status];
      if (existing) {
        gridGroupRef.current?.remove(existing);
        existing.geometry.dispose();
        (existing.material as THREE.Material).dispose();
        meshRefs.current[status] = null;
      }
    });

    // Create week meshes
    statusOrder.forEach((status) => {
      const geometry = new THREE.CircleGeometry(1, 24);
      const material = new THREE.MeshBasicMaterial({ color: colorMap[status] });
      const mesh = new THREE.InstancedMesh(
        geometry,
        material,
        Math.max(statusCounts[status], 1),
      );
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      meshRefs.current[status] = mesh;
      gridGroupRef.current?.add(mesh);
    });

    // Clean up existing overlay meshes
    eventMeshesRef.current.forEach((mesh) => {
      gridGroupRef.current?.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    eventMeshesRef.current = [];

    periodMeshesRef.current.forEach((mesh) => {
      gridGroupRef.current?.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    periodMeshesRef.current = [];

    // Create period background meshes, one per period to lock in color
    const backgroundColor = new THREE.Color(
      activeTheme?.background ?? "#f8fafc",
    );

    periodInstances.forEach((instance) => {
      const planeGeometry = new THREE.PlaneGeometry(1, 1);
      const baseColor = new THREE.Color(
        instance.period.color || DEFAULT_PERIOD_COLOR,
      );
      const tintColor = baseColor.clone().lerp(backgroundColor, 0.35);
      const planeMaterial = new THREE.MeshBasicMaterial({
        color: tintColor,
        transparent: false,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.InstancedMesh(
        planeGeometry,
        planeMaterial,
        Math.max(instance.weekIndices.length, 1),
      );
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.renderOrder = -1;
      periodMeshesRef.current.push(mesh);
      gridGroupRef.current?.add(mesh);
    });

    // Create event overlays, grouped by color so event weeks can override base week color
    eventInstances.forEach((instance) => {
      const geometry = new THREE.CircleGeometry(1, 24);
      const material = new THREE.MeshBasicMaterial({ color: instance.color });
      const mesh = new THREE.InstancedMesh(
        geometry,
        material,
        Math.max(instance.weekIndices.length, 1),
      );
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      eventMeshesRef.current.push(mesh);
      gridGroupRef.current?.add(mesh);
    });

    updateLayout();
  }, [colorMap, statusCounts, periodInstances, eventInstances, updateLayout]);

  useEffect(() => {
    const handleResize = () => updateLayout();
    const resizeObserver = containerRef.current
      ? new ResizeObserver(handleResize)
      : null;

    window.addEventListener("resize", handleResize);
    if (containerRef.current && resizeObserver) {
      resizeObserver.observe(containerRef.current);
    }

    updateLayout();

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
    };
  }, [updateLayout]);

  // Focus week zoom disabled
  useEffect(() => {
    if (focusWeekIndex == null) return;
    dispatch(layoutActions.setFocusWeek(null));
  }, [focusWeekIndex, dispatch]);

  // Reset view to origin when switching calendars (no animation)
  useEffect(() => {
    if (!resetView) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    if (!controls || !camera) return;

    camera.position.set(0, 0, 10);
    controls.target.set(0, 0, 0);
    camera.zoom = 0.88;
    camera.updateProjectionMatrix();
    controls.update();

    dispatch(layoutActions.setResetView(false));
  }, [resetView, dispatch]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const layout = layoutRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    if (!layout || !renderer || !camera) return;

    const rect = renderer.domElement.getBoundingClientRect();
    pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(pointerRef.current, camera);
    const intersection = raycasterRef.current.ray.intersectPlane(
      planeRef.current,
      intersectionRef.current,
    );
    if (!intersection) {
      setHoverInfo(null);
      return;
    }

    const localPoint = intersection.clone();
    if (gridGroupRef.current) {
      gridGroupRef.current.worldToLocal(localPoint);
    }

    const col = Math.floor(
      (localPoint.x - layout.startX + layout.cellSize / 2) / layout.cellSize,
    );
    const row = Math.floor(
      (layout.startY - localPoint.y + layout.cellSize / 2) / layout.cellSize,
    );
    const index = row * layout.cols + col;

    if (
      col < 0 ||
      col >= layout.cols ||
      row < 0 ||
      row >= layout.rows ||
      index >= weeks.length
    ) {
      setHoverInfo(null);
      return;
    }

    const week = weeks[index];
    const overlay = weekOverlays.get(index);

    setHoverInfo({
      clientX: event.clientX,
      clientY: event.clientY,
      label: `Week ${formatDisplayDate(week.date)}`,
      events: overlay?.events.map(
        (e) => `${e.label} ${formatPartialDate(e.date)}`,
      ),
      periods: overlay?.periods.map(
        (p) =>
          `${p.label} ${formatPartialDate(p.start)} → ${formatPartialDate(p.end)}`,
      ),
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
      {hoverInfo && (
        <div
          className="pointer-events-none fixed z-30 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs shadow-md"
          style={{ left: hoverInfo.clientX + 10, top: hoverInfo.clientY + 10 }}
        >
          <div>{hoverInfo.label}</div>
          {hoverInfo.events && hoverInfo.events.length > 0 && (
            <div className="mt-1 text-red-600">
              {hoverInfo.events.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </div>
          )}
          {hoverInfo.periods && hoverInfo.periods.length > 0 && (
            <div className="mt-1 text-blue-600">
              {hoverInfo.periods.map((p, i) => (
                <div key={i}>{p}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeeksVisualization;
