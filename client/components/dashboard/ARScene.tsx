import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef, useState, useEffect } from "react";

export type Rock = {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  size: number;
  active: boolean;
};

export type RealtimeStats = {
  hazardIndex: number; // 0-100
  velocityAvg: number; // m/s
  activeRocks: number;
  confidence: number; // 0-100
};

export interface ARSceneProps {
  running: boolean;
  showWireframe: boolean;
  showHeatmap: boolean;
  showPit: boolean;
  showTunnels: boolean;
  showStructures: boolean;
  showHills: boolean;
  hilliness: number; // 0-100
  mountainCount: number; // number of mountain peaks
  onStats: (stats: RealtimeStats) => void;
}

function terrainHeight(x: number, z: number) {
  const h = Math.sin(x * 0.25) * 0.75 + Math.cos(z * 0.18) * 0.5 + Math.sin((x + z) * 0.12) * 0.6;
  return h - 1.2;
}

function Terrain({ wireframe }: { wireframe: boolean }) {
  const geom = useMemo(() => {
    const size = 80;
    const divisions = 128;
    const geo = new THREE.PlaneGeometry(size, size, divisions, divisions);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i);
      const y = terrainHeight(x, z);
      pos.setZ(i, y);
    }
    geo.rotateX(-Math.PI / 2);
    geo.computeVertexNormals();
    return geo;
  }, []);

  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: new THREE.Color("#C9A36B"), roughness: 0.95, metalness: 0.05, wireframe }),
    [wireframe],
  );

  return <mesh geometry={geom} material={material} receiveShadow castShadow />;
}

function PitBenches({ rings = 8, radius = 14, stepDown = 0.9 }: { rings?: number; radius?: number; stepDown?: number }) {
  const meshes = [] as JSX.Element[];
  for (let i = 0; i < rings; i++) {
    const rOuter = radius - i * 1.4;
    const rInner = rOuter - 1.0;
    const y = -i * stepDown + 1.2;
    if (rInner <= 1) break;
    meshes.push(
      <mesh key={i} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[rInner, rOuter, 96]} />
        <meshStandardMaterial color="#C9A36B" roughness={0.95} metalness={0.02} side={THREE.DoubleSide} />
      </mesh>,
    );
  }
  return <group>{meshes}</group>;
}

class SpiralCurve extends (THREE.Curve as unknown as new () => THREE.Curve<THREE.Vector3>) {
  private turns: number; private radius: number; private height: number;
  constructor(turns: number, radius: number, height: number) { super(); this.turns = turns; this.radius = radius; this.height = height; }
  getPoint(t: number) {
    const angle = this.turns * Math.PI * 2 * t;
    const r = this.radius * (1 - 0.75 * t);
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const y = 1.2 - this.height * t;
    return new THREE.Vector3(x, y, z);
  }
}

function HaulRamp() {
  const path = useMemo(() => new SpiralCurve(2.2, 14, 8), []);
  const geom = useMemo(() => new THREE.TubeGeometry(path, 200, 0.3, 12, false), [path]);
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color="#C9A36B" roughness={0.9} />
    </mesh>
  );
}

function Tunnel({ position = new THREE.Vector3(18, 0.4, -8), dir = new THREE.Vector3(-1, -0.05, 0.2) }: { position?: THREE.Vector3; dir?: THREE.Vector3 }) {
  const geom = useMemo(() => new THREE.CylinderGeometry(1.2, 1.2, 30, 24, 1, true), []);
  const rot = new THREE.Matrix4();
  const axis = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
  const angle = Math.acos(new THREE.Vector3(0, 1, 0).dot(dir.normalize()));
  rot.makeRotationAxis(axis, angle);
  return (
    <group position={position.toArray()}>
      <mesh geometry={geom} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#0b0f0e" roughness={1} metalness={0} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Structures() {
  return (
    <group>
      <mesh position={[22, 0.8, 12]}>
        <boxGeometry args={[2.5, 1.6, 2]} />
        <meshStandardMaterial color="#46535a" roughness={0.8} />
      </mesh>
      <mesh position={[22, 2.4, 12]}>
        <boxGeometry args={[0.6, 2.8, 0.6]} />
        <meshStandardMaterial color="#5b6b73" roughness={0.8} />
      </mesh>
      <mesh position={[19, 1.6, 14]}>
        <cylinderGeometry args={[1.4, 1.4, 3.2, 24]} />
        <meshStandardMaterial color="#546469" roughness={0.85} />
      </mesh>
    </group>
  );
}

function Hills({ amplitude = 4.8, count = 6 }: { amplitude?: number; count?: number }) {
  const geom = useMemo(() => {
    const size = 90;
    const seg = 96;
    const geo = new THREE.PlaneGeometry(size, size, seg, seg);
    const pos = geo.attributes.position as THREE.BufferAttribute;

    // Random hill centers around the perimeter
    const centers: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      const r = 34 + Math.random() * 6;
      centers.push([Math.cos(angle) * r, Math.sin(angle) * r, 10 + Math.random() * 10]); // [cx, cz, radius]
    }

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i);
      let y = 0;
      for (const [cx, cz, rad] of centers) {
        const dx = x - cx;
        const dz = z - cz;
        const d = Math.sqrt(dx * dx + dz * dz);
        const t = Math.max(0, 1 - d / rad);
        const cone = Math.pow(t, 1.6); // steeper sides like mountains
        const ridges = Math.abs(Math.sin((x + z) * 0.25) + Math.cos(x * 0.35) * 0.5) * 0.25 * t;
        y += (cone + ridges) * amplitude;
      }
      pos.setZ(i, y);
    }
    geo.rotateX(-Math.PI / 2);
    geo.computeVertexNormals();
    return geo;
  }, [amplitude, count]);

  return (
    <mesh geometry={geom} position={[0, 0, 0]} receiveShadow>
      <meshStandardMaterial color="#C9A36B" roughness={0.95} metalness={0.05} />
    </mesh>
  );
}

function Rocks({ rocks }: { rocks: Rock[] }) {
  const inst = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!inst.current) return;
    const dummy = new THREE.Object3D();
    rocks.forEach((r, i) => {
      dummy.position.copy(r.position);
      dummy.scale.setScalar(r.size);
      dummy.updateMatrix();
      inst.current!.setMatrixAt(i, dummy.matrix);
    });
    inst.current.instanceMatrix.needsUpdate = true;
  }, [rocks]);

  return (
    <instancedMesh ref={inst} args={[undefined as unknown as THREE.BufferGeometry, undefined as unknown as THREE.Material, Math.max(rocks.length, 1)]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial color="#C9A36B" roughness={0.3} metalness={0.2} />
    </instancedMesh>
  );
}

function Heatmap({ intensity }: { intensity: number }) {
  const plane = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!plane.current) return;
    const mat = plane.current.material as THREE.MeshBasicMaterial;
    mat.opacity = THREE.MathUtils.clamp(0.15 + intensity * 0.35, 0.1, 0.6);
  });
  return (
    <mesh ref={plane} rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
      <planeGeometry args={[80, 80, 1, 1]} />
      <meshBasicMaterial color="#06b6d4" transparent opacity={0.25} />
    </mesh>
  );
}

function FrameStepper({ running, rocksRef, setRocks, onStats }: { running: boolean; rocksRef: React.MutableRefObject<Rock[]>; setRocks: React.Dispatch<React.SetStateAction<Rock[]>>; onStats: (s: RealtimeStats) => void }) {
  const gravity = useMemo(() => new THREE.Vector3(0, -9.81, 0), []);
  const lastTime = useRef(performance.now());

  useFrame(() => {
    const now = performance.now();
    const dt = Math.min((now - lastTime.current) / 1000, 0.05);
    lastTime.current = now;
    if (!running || rocksRef.current.length === 0) return;

    setRocks((prev) => {
      const next = prev.map((r) => {
        if (!r.active) return r;
        const v = r.velocity.clone().add(gravity.clone().multiplyScalar(dt));
        let p = r.position.clone().add(v.clone().multiplyScalar(dt));
        const terrainY = terrainHeight(p.x, p.z);
        if (p.y - r.size <= terrainY) {
          p.y = terrainY + r.size;
          v.y *= -0.25;
          v.x *= 0.94;
          v.z *= 0.94;
          if (v.length() < 0.35) {
            return { ...r, position: p, velocity: new THREE.Vector3(), active: false };
          }
        }
        return { ...r, position: p, velocity: v };
      });
      rocksRef.current = next;
      const active = next.filter((r) => r.active);
      const velocityAvg = active.length ? active.reduce((sum, r) => sum + r.velocity.length(), 0) / active.length : 0;
      const hazard = THREE.MathUtils.clamp((active.length * 0.6 + velocityAvg * 9) * 1.2, 0, 100);
      const confidence = 65 + Math.min(35, Math.max(0, 100 - Math.abs(50 - hazard)) * 0.3);
      onStats({ hazardIndex: hazard, velocityAvg, activeRocks: active.length, confidence });
      return next;
    });
  });
  return null;
}

export default function ARScene({ running, showWireframe, showHeatmap, showPit, showTunnels, showStructures, showHills, hilliness, mountainCount, onStats }: ARSceneProps) {
  const [rocks, setRocks] = useState<Rock[]>([]);
  const rocksRef = useRef<Rock[]>([]);

  useEffect(() => {
    rocksRef.current = rocks;
  }, [rocks]);

  // Spawn new rocks periodically
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setRocks((prev) => {
        const id = prev.length ? prev[prev.length - 1].id + 1 : 1;
        const x = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 40;
        const size = 0.2 + Math.random() * 0.8;
        const velocity = new THREE.Vector3((Math.random() - 0.5) * 2, -2 - Math.random() * 2, (Math.random() - 0.5) * 2);
        const next = [
          ...prev,
          { id, position: new THREE.Vector3(x, 8 + Math.random() * 4, z), velocity, size, active: true },
        ].slice(-150);
        rocksRef.current = next;
        return next;
      });
    }, 900);
    return () => clearInterval(interval);
  }, [running]);

  const heatIntensity = Math.min(1, rocks.filter((r) => r.active).length / 80);

  return (
    <div className="relative h-full w-full rounded-xl border border-border/60 bg-gradient-to-b from-background to-muted overflow-hidden">
      <Canvas shadows camera={{ position: [10, 10, 14], fov: 45 }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[10, 20, 10]} intensity={1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <Terrain wireframe={showWireframe} />
        {showHills && <Hills amplitude={THREE.MathUtils.lerp(0, 12, hilliness / 100)} count={Math.max(2, Math.round(mountainCount))} />}
        {showPit && (
          <group>
            <PitBenches />
            <HaulRamp />
          </group>
        )}
        {showTunnels && (
          <group>
            <Tunnel position={new THREE.Vector3(18, 0.4, -8)} dir={new THREE.Vector3(-1, -0.05, 0.2)} />
            <Tunnel position={new THREE.Vector3(-20, 0.2, 10)} dir={new THREE.Vector3(1, -0.04, -0.1)} />
          </group>
        )}
        {showStructures && <Structures />}
        <Rocks rocks={rocks} />
        {showHeatmap && <Heatmap intensity={heatIntensity} />}
        <OrbitControls enableDamping dampingFactor={0.1} maxPolarAngle={Math.PI / 2.05} />
        <gridHelper args={[80, 40, "#1f2937", "#111827"]} position={[0, 0.01, 0]} />
        <FrameStepper running={running} rocksRef={rocksRef} setRocks={setRocks} onStats={onStats} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 flex items-start justify-between p-4">
        <div className="rounded-md bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40 border border-border px-3 py-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">AR Overlay</p>
          <p className="font-semibold text-foreground">Terrain • Rockfall Simulation</p>
        </div>
        <div className="rounded-md bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40 border border-border px-3 py-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Camera</p>
          <p className="font-semibold text-foreground">Orbit • 45° FOV</p>
        </div>
      </div>
    </div>
  );
}
