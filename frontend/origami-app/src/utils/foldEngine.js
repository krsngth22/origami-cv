import * as THREE from 'three';
import gsap from 'gsap';

export function animateFold({ geometry, foldAxis, foldPosition, angle, duration = 1.2, onComplete }) {
  const posArray = geometry.attributes.position.array;
  const vertexCount = posArray.length / 3;

  const axisVec = foldAxis === 'x'
    ? new THREE.Vector3(1, 0, 0)
    : new THREE.Vector3(0, 1, 0);

  const pivot = foldAxis === 'x'
    ? new THREE.Vector3(0, foldPosition, 0)
    : new THREE.Vector3(foldPosition, 0, 0);

  const startPositions = [];
  const movingIndices = [];

  for (let i = 0; i < vertexCount; i++) {
    const x = posArray[i * 3];
    const y = posArray[i * 3 + 1];
    const z = posArray[i * 3 + 2];
    startPositions.push(new THREE.Vector3(x, y, z));
    const val = foldAxis === 'x' ? y : x;
    if (val > foldPosition) movingIndices.push(i);
  }

  const progress = { t: 0 };

  gsap.to(progress, {
    t: 1,
    duration,
    ease: 'power2.inOut',
    onUpdate: () => {
      const currentAngle = angle * progress.t;
      const q = new THREE.Quaternion();
      q.setFromAxisAngle(axisVec, currentAngle);
      for (const i of movingIndices) {
        const v = startPositions[i].clone();
        v.sub(pivot);
        v.applyQuaternion(q);
        v.add(pivot);
        posArray[i * 3] = v.x;
        posArray[i * 3 + 1] = v.y;
        posArray[i * 3 + 2] = v.z;
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    },
    onComplete
  });
}

export function resetGeometry(geometry) {
  const posArray = geometry.attributes.position.array;
  const segments = 24;
  const size = 2;
  let idx = 0;
  for (let iy = 0; iy <= segments; iy++) {
    for (let ix = 0; ix <= segments; ix++) {
      posArray[idx++] = (ix / segments - 0.5) * size;
      posArray[idx++] = (iy / segments - 0.5) * size;
      posArray[idx++] = 0;
    }
  }
  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals();
}