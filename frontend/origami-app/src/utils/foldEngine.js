import * as THREE from 'three';
import gsap from 'gsap';

const SEGMENTS = 48;
const SIZE = 3;
const VERTEX_COUNT = (SEGMENTS + 1) * (SEGMENTS + 1);

// ─── Build flat grid positions ────────────────────────────────────────────────
function buildFlatPositions() {
  const pos = new Float32Array(VERTEX_COUNT * 3);
  let idx = 0;
  for (let iy = 0; iy <= SEGMENTS; iy++) {
    for (let ix = 0; ix <= SEGMENTS; ix++) {
      pos[idx++] = (ix / SEGMENTS - 0.5) * SIZE;
      pos[idx++] = (iy / SEGMENTS - 0.5) * SIZE;
      pos[idx++] = 0;
    }
  }
  return pos;
}

// ─── Apply one fold to a position array (in place) ───────────────────────────
// This is the ONLY place fold math happens.
// It reads current positions and rotates vertices on movingSide.
function applyOneFold(positions, fold) {
  const { foldAxis, foldPosition, angle, movingSide } = fold;

  const axisVec = foldAxis === 'x'
    ? new THREE.Vector3(1, 0, 0)
    : new THREE.Vector3(0, 1, 0);

  const pivot = foldAxis === 'x'
    ? new THREE.Vector3(0, foldPosition, 0)
    : new THREE.Vector3(foldPosition, 0, 0);

  const q = new THREE.Quaternion();
  q.setFromAxisAngle(axisVec, angle);

  for (let i = 0; i < VERTEX_COUNT; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];

    // Determine which side this vertex is on using CURRENT position
    const val = foldAxis === 'x' ? y : x;
    const isMoving = movingSide === 'positive' ? val > foldPosition : val < foldPosition;

    if (isMoving) {
      const v = new THREE.Vector3(x, y, z);
      v.sub(pivot);
      v.applyQuaternion(q);
      v.add(pivot);
      positions[i * 3]     = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
    }
  }
}

// ─── Compute positions after N folds from scratch ─────────────────────────────
// Always starts from flat. This guarantees correctness for any step.
function computePositionsAtStep(folds, count) {
  const positions = buildFlatPositions();
  for (let i = 0; i < count; i++) {
    applyOneFold(positions, folds[i]);
  }
  return positions;
}

// ─── Create geometry ──────────────────────────────────────────────────────────
export function createGeometryWithRegions() {
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
  geo.userData.appliedFolds = [];
  return geo;
}

// ─── Reset to flat ────────────────────────────────────────────────────────────
export function resetGeometry(geo) {
  const flat = buildFlatPositions();
  const pos = geo.attributes.position.array;
  for (let i = 0; i < flat.length; i++) pos[i] = flat[i];
  geo.attributes.position.needsUpdate = true;
  geo.computeVertexNormals();
  geo.userData.appliedFolds = [];
}

// ─── Animated fold ────────────────────────────────────────────────────────────
export function animateFold({ geometry, fold, duration = 1.2, onComplete }) {
  const appliedFolds = geometry.userData.appliedFolds || [];

  // Before: positions after all previously applied folds
  const before = computePositionsAtStep(appliedFolds, appliedFolds.length);

  // After: positions after all previous folds PLUS this new fold
  const after = computePositionsAtStep([...appliedFolds, fold], appliedFolds.length + 1);

  const posArray = geometry.attributes.position.array;
  const progress = { t: 0 };

  gsap.killTweensOf(progress);
  gsap.to(progress, {
    t: 1,
    duration,
    ease: 'power2.inOut',
    onUpdate: () => {
      for (let i = 0; i < VERTEX_COUNT * 3; i++) {
        posArray[i] = before[i] + (after[i] - before[i]) * progress.t;
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    },
    onComplete: () => {
      // Commit after positions
      for (let i = 0; i < VERTEX_COUNT * 3; i++) posArray[i] = after[i];
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
      geometry.userData.appliedFolds = [...appliedFolds, fold];
      onComplete?.();
    }
  });
}

// ─── Go to step N (for undo) ──────────────────────────────────────────────────
export function goToStep({ geometry, allFolds, targetIndex, duration = 0.6, onComplete }) {
  const posArray = geometry.attributes.position.array;

  // Before: current positions
  const before = new Float32Array(posArray);

  // After: recompute from scratch up to targetIndex
  const after = computePositionsAtStep(allFolds, targetIndex);

  const progress = { t: 0 };

  gsap.killTweensOf(progress);
  gsap.to(progress, {
    t: 1,
    duration,
    ease: 'power2.inOut',
    onUpdate: () => {
      for (let i = 0; i < VERTEX_COUNT * 3; i++) {
        posArray[i] = before[i] + (after[i] - before[i]) * progress.t;
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    },
    onComplete: () => {
      for (let i = 0; i < VERTEX_COUNT * 3; i++) posArray[i] = after[i];
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
      geometry.userData.appliedFolds = allFolds.slice(0, targetIndex);
      onComplete?.();
    }
  });
}