"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useAppSelector, useAppDispatch } from "../hooks";
import { layoutActions } from "../store";
import { buildMonthPoints } from "../utils/months";
import { buildMonthOverlays, dateToMonthIndex } from "../utils/calendar";
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
const MENU_WIDTH = 720;
const EVENT_SCALE_MULTIPLIER = 2.0;
const EVENT_HOVER_SCALE_MULTIPLIER = 1.75;
const PERIOD_BG_HOVER_EXPAND = 1.4;
const HOVER_LIFT_Y_FACTOR = 0.16;
const HOVER_FLOAT_Y_FACTOR = 0.05;
const HOVER_LIFT_Z = 0.14;
const HOVER_EASING = 0.14;
const HOVER_EPSILON = 0.002;
const HOVER_FLOAT_SPEED = 0.004;
const MONTHS_PER_DECADE = 12 * 10;
const DECADE_GAP_RATIO = 0.5;

const MonthsVisualization = () => {
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
    remaining: null,
    extra: null,
  });
  const periodMeshesRef = useRef<THREE.InstancedMesh[]>([]);
  const eventMeshesRef = useRef<THREE.InstancedMesh[]>([]);
  const layoutRef = useRef<LayoutInfo | null>(null);
  const updateLayoutRef = useRef<(animateOnly?: boolean) => void>(() => {});
  const didSetInitialZoom = useRef(false);
  const dummyRef = useRef(new THREE.Object3D());
  const hoveredEventMonthIndicesRef = useRef<Set<number>>(new Set());
  const hoverProgressRef = useRef<Float32Array>(new Float32Array(0));
  const periodBgHoverProgressRef = useRef<Float32Array>(new Float32Array(0));
  const hoveredPeriodInstanceIndexRef = useRef<number>(-1);
  const hoverAnimationActiveRef = useRef(false);
  const cameraOffsetXRef = useRef(0);
  const targetCameraOffsetXRef = useRef(0);

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
  const isMenuCollapsed = useAppSelector(
    (state) => state.layout.isMenuCollapsed,
  );
  const weekColors = useAppSelector((state) => state.life.weekColors);

  const months = useMemo(() => buildMonthPoints(lifeProfile), [lifeProfile]);

  const activeCalendars = useMemo(() => {
    if (!activeCalendarId) return calendars;
    return calendars.filter((calendar) => calendar.id === activeCalendarId);
  }, [calendars, activeCalendarId]);

  const monthOverlays = useMemo(
    () =>
      buildMonthOverlays(months.length, activeCalendars, lifeProfile.dateOfBirth),
    [months.length, activeCalendars, lifeProfile.dateOfBirth],
  );

  const periodInstances = useMemo(() => {
    const totalMonths = months.length;
    if (totalMonths === 0) return [];

    return activeCalendars.flatMap((calendar) =>
      calendar.periods
        .map((period) => {
          const startWeek = dateToMonthIndex(
            period.start,
            lifeProfile.dateOfBirth,
          );
          const endWeek = dateToMonthIndex(period.end, lifeProfile.dateOfBirth);
          const start = Math.max(0, Math.min(totalMonths - 1, startWeek));
          const end = Math.max(0, Math.min(totalMonths - 1, endWeek));

          if (end < 0 || start > totalMonths - 1 || end < start) {
            return null;
          }

          const monthIndices: number[] = [];
          for (let i = start; i <= end; i += 1) {
            monthIndices.push(i);
          }

          return { period, monthIndices };
        })
        .filter(
          (
            entry,
          ): entry is {
            period: (typeof calendar.periods)[number];
            monthIndices: number[];
          } => !!entry,
        ),
    );
  }, [activeCalendars, lifeProfile.dateOfBirth, months.length]);

  // Only event hover drives dot animation; period hover drives background expansion
  const hoveredEventMonthIndices = useMemo(() => {
    const indices = new Set<number>();
    if (!hoveredEventId) return indices;

    for (const calendar of activeCalendars) {
      const event = calendar.events.find((item) => item.id === hoveredEventId);
      if (!event) continue;
      const monthIndex = dateToMonthIndex(event.date, lifeProfile.dateOfBirth);
      if (monthIndex >= 0 && monthIndex < months.length) {
        indices.add(monthIndex);
      }
      break;
    }
    return indices;
  }, [hoveredEventId, activeCalendars, lifeProfile.dateOfBirth, months.length]);

  const eventInstances = useMemo(() => {
    const colorToMonthIndices = new Map<string, number[]>();

    monthOverlays.forEach((overlay, monthIndex) => {
      if (overlay.events.length === 0) return;
      const latestEvent = overlay.events[overlay.events.length - 1];
      const color = latestEvent?.color || DEFAULT_EVENT_COLOR;
      const key = color.trim() || DEFAULT_EVENT_COLOR;
      const existing = colorToMonthIndices.get(key);
      if (existing) {
        existing.push(monthIndex);
        return;
      }
      colorToMonthIndices.set(key, [monthIndex]);
    });

    return Array.from(colorToMonthIndices.entries()).map(
      ([color, monthIndices]) => ({
        color,
        monthIndices,
      }),
    );
  }, [monthOverlays]);

  const statusCounts = useMemo(
    () =>
      months.reduce<Record<WeekStatus, number>>(
        (acc, month) => {
          acc[month.status] += 1;
          return acc;
        },
        { lived: 0, remaining: 0, extra: 0 },
      ),
    [months],
  );

  const colorMap = useMemo(
    () => ({
      lived: new THREE.Color(weekColors.lived),
      remaining: new THREE.Color(weekColors.remaining),
      extra: new THREE.Color(weekColors.extra),
    }),
    [weekColors],
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
      rendererRef.current.setClearColor("#f8fafc", 1);
    }
  }, []);

  const updateLayout = useCallback(
    (animateOnly = false) => {
      const container = containerRef.current;
      const renderer = rendererRef.current;
      const camera = cameraRef.current;
      const meshes = meshRefs.current;
      const dummy = dummyRef.current;

      if (!container || !renderer || !camera || months.length === 0) return;

      let cols: number;
      let rows: number;
      let cellSize: number;
      let startX: number;
      let startY: number;
      let width: number;
      let height: number;

      let hasCameraTransition = false;

      if (animateOnly && layoutRef.current) {
        ({ cols, rows, cellSize, startX, startY, width, height } =
          layoutRef.current);

        const targetOffset = targetCameraOffsetXRef.current;
        const currentOffset = cameraOffsetXRef.current;
        const next =
          currentOffset + (targetOffset - currentOffset) * HOVER_EASING;
        const snapped =
          Math.abs(targetOffset - next) < HOVER_EPSILON ? targetOffset : next;
        if (snapped !== cameraOffsetXRef.current) {
          cameraOffsetXRef.current = snapped;
          camera.left = -width / 2 - snapped;
          camera.right = width / 2 - snapped;
          camera.updateProjectionMatrix();
        }
        if (snapped !== targetOffset) hasCameraTransition = true;
      } else {
        width = container.clientWidth;
        height = container.clientHeight;

        renderer.setSize(width, height, false);

        cameraOffsetXRef.current = targetCameraOffsetXRef.current;
        camera.left = -width / 2 - cameraOffsetXRef.current;
        camera.right = width / 2 - cameraOffsetXRef.current;
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
          if (MONTHS_PER_DECADE % candidateCols !== 0) continue;
          const candidateRows = Math.ceil(months.length / candidateCols);
          const candidateNumGaps = Math.floor((candidateRows - 1) * candidateCols / MONTHS_PER_DECADE);
          const candidateCellSize = Math.min(
            width / candidateCols,
            height / (candidateRows + candidateNumGaps * DECADE_GAP_RATIO),
          );
          if (candidateCellSize > bestCell) {
            bestCell = candidateCellSize;
            bestCols = candidateCols;
          }
        }

        cols = bestCols;
        rows = Math.ceil(months.length / cols);
        cellSize = bestCell;
        const numGaps = Math.floor((rows - 1) * cols / MONTHS_PER_DECADE);
        startX = -((cols * cellSize) / 2) + cellSize / 2;
        startY = (rows * cellSize + numGaps * cellSize * DECADE_GAP_RATIO) / 2 - cellSize / 2;

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
      const getItemY = (index: number, row: number): number => {
        const decade = Math.floor((row * cols) / MONTHS_PER_DECADE);
        return startY - row * cellSize - decade * cellSize * DECADE_GAP_RATIO;
      };

      if (hoverProgressRef.current.length !== months.length) {
        hoverProgressRef.current = new Float32Array(months.length);
      }
      const hoverProgress = hoverProgressRef.current;
      const hoveredEventMonthIndicesSet = hoveredEventMonthIndicesRef.current;
      let hasEventTransition = false;

      const getHoverValue = (monthIndex: number) => {
        const target = hoveredEventMonthIndicesSet.has(monthIndex) ? 1 : 0;
        const current = hoverProgress[monthIndex] ?? 0;
        const next = current + (target - current) * HOVER_EASING;
        const snapped = Math.abs(target - next) < HOVER_EPSILON ? target : next;
        if (snapped !== target) {
          hasEventTransition = true;
        }
        hoverProgress[monthIndex] = snapped;
        return snapped;
      };

      const getFloatMultiplier = (hoverAmount: number, monthIndex: number) =>
        hoverAmount > 0
          ? ((Math.sin(now * HOVER_FLOAT_SPEED + monthIndex * 0.35) + 1) / 2) *
            hoverAmount
          : 0;

      const statusOffsets: Record<WeekStatus, number> = {
        lived: 0,
        remaining: 0,
        extra: 0,
      };

      statusOrder.forEach((status) => {
        const mesh = meshes[status];
        if (!mesh) return;
        mesh.count = statusCounts[status];
      });

      // Position month circles — only event hover scales dots
      for (let index = 0; index < months.length; index += 1) {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = startX + col * cellSize;
        const y = getItemY(index, row);

        const month = months[index];
        const mesh = meshes[month.status];
        if (!mesh) continue;

        const offset = statusOffsets[month.status];
        const hoverAmount = getHoverValue(index);
        const floatAmount = getFloatMultiplier(hoverAmount, index);
        const scaleMultiplier =
          1 + hoverAmount * (EVENT_HOVER_SCALE_MULTIPLIER - 1);
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

        statusOffsets[month.status] += 1;
      }

      statusOrder.forEach((status) => {
        const mesh = meshes[status];
        if (!mesh) return;
        mesh.instanceMatrix.needsUpdate = true;
      });

      // Position and animate period backgrounds — expand on hover, no dot scaling
      if (periodBgHoverProgressRef.current.length !== periodInstances.length) {
        periodBgHoverProgressRef.current = new Float32Array(
          periodInstances.length,
        );
      }
      const periodBgProgress = periodBgHoverProgressRef.current;
      const hoveredPeriodIdx = hoveredPeriodInstanceIndexRef.current;
      let hasPeriodTransition = false;

      periodMeshesRef.current.forEach((mesh, index) => {
        const instance = periodInstances[index];
        if (!instance) return;

        const target = hoveredPeriodIdx === index ? 1 : 0;
        const current = periodBgProgress[index] ?? 0;
        const next = current + (target - current) * HOVER_EASING;
        const snapped = Math.abs(target - next) < HOVER_EPSILON ? target : next;
        if (snapped !== target) hasPeriodTransition = true;
        periodBgProgress[index] = snapped;

        const expand = 1 + snapped * (PERIOD_BG_HOVER_EXPAND - 1);
        const bgWidth = cellSize * expand;
        const bgHeight = (cellSize / 1.8) * expand;

        instance.monthIndices.forEach((monthIndex, monthOffset) => {
          const col = monthIndex % cols;
          const row = Math.floor(monthIndex / cols);
          const x = startX + col * cellSize;
          const y = getItemY(monthIndex, row);

          dummy.position.set(x, y, -0.08);
          dummy.scale.set(bgWidth, bgHeight, 1);
          dummy.updateMatrix();
          mesh.setMatrixAt(monthOffset, dummy.matrix);
        });

        mesh.count = instance.monthIndices.length;
        mesh.instanceMatrix.needsUpdate = true;
      });

      // Position event overlays (one mesh per event color)
      eventMeshesRef.current.forEach((mesh, index) => {
        const instance = eventInstances[index];
        if (!instance) return;

        instance.monthIndices.forEach((monthIndex, monthOffset) => {
          const col = monthIndex % cols;
          const row = Math.floor(monthIndex / cols);
          const x = startX + col * cellSize;
          const y = getItemY(monthIndex, row);
          const hoverAmount = hoverProgress[monthIndex] ?? 0;
          const floatAmount = getFloatMultiplier(hoverAmount, monthIndex);
          const scaleMultiplier =
            1 + hoverAmount * (EVENT_HOVER_SCALE_MULTIPLIER - 1);
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
          mesh.setMatrixAt(monthOffset, dummy.matrix);
        });

        mesh.count = instance.monthIndices.length;
        mesh.instanceMatrix.needsUpdate = true;
      });

      hoverAnimationActiveRef.current =
        hoveredEventMonthIndicesSet.size > 0 ||
        hasEventTransition ||
        hoveredPeriodIdx >= 0 ||
        hasPeriodTransition ||
        hasCameraTransition;
    },
    [months, statusCounts, periodInstances, eventInstances],
  );

  useEffect(() => {
    updateLayoutRef.current = updateLayout;
  }, [updateLayout]);

  useEffect(() => {
    targetCameraOffsetXRef.current = isMenuCollapsed ? 0 : MENU_WIDTH / 2;
    hoverAnimationActiveRef.current = true;
  }, [isMenuCollapsed]);

  useEffect(() => {
    hoveredEventMonthIndicesRef.current = hoveredEventMonthIndices;
    hoverAnimationActiveRef.current = true;
  }, [hoveredEventMonthIndices]);

  useEffect(() => {
    hoveredPeriodInstanceIndexRef.current = hoveredPeriodId
      ? periodInstances.findIndex((i) => i.period.id === hoveredPeriodId)
      : -1;
    hoverAnimationActiveRef.current = true;
  }, [hoveredPeriodId, periodInstances]);

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
    const backgroundColor = new THREE.Color("#f8fafc");

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
        Math.max(instance.monthIndices.length, 1),
      );
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.renderOrder = -1;
      periodMeshesRef.current.push(mesh);
      gridGroupRef.current?.add(mesh);
    });

    // Create event overlays, grouped by color so event months can override base month color
    eventInstances.forEach((instance) => {
      const geometry = new THREE.CircleGeometry(1, 24);
      const material = new THREE.MeshBasicMaterial({ color: instance.color });
      const mesh = new THREE.InstancedMesh(
        geometry,
        material,
        Math.max(instance.monthIndices.length, 1),
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
    let closestRow = -1;
    let closestDist = Infinity;
    for (let r = 0; r < layout.rows; r++) {
      const decade = Math.floor((r * layout.cols) / MONTHS_PER_DECADE);
      const rowY = layout.startY - r * layout.cellSize - decade * layout.cellSize * DECADE_GAP_RATIO;
      const dist = Math.abs(localPoint.y - rowY);
      if (dist < closestDist) {
        closestDist = dist;
        closestRow = r;
      }
    }
    const row = closestRow;
    const index = row * layout.cols + col;

    if (
      col < 0 ||
      col >= layout.cols ||
      closestRow === -1 ||
      closestDist > layout.cellSize / 2 ||
      index >= months.length
    ) {
      setHoverInfo(null);
      return;
    }

    const month = months[index];
    const overlay = monthOverlays.get(index);

    setHoverInfo({
      clientX: event.clientX,
      clientY: event.clientY,
      label: `Month ${formatDisplayDate(month.date)}`,
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

export default MonthsVisualization;
