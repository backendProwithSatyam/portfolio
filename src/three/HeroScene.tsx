import { useMemo, useRef, useState, type MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Props = {
  /** 0 → 1 as the hero scrolls out; written by GSAP, read every frame. */
  progress: MutableRefObject<number>
  quality: 'high' | 'low'
  /** Pause rendering entirely when the hero is off-screen. */
  active: boolean
}

const ORANGE = new THREE.Color('#ff7a1a')
const VIOLET = new THREE.Color('#6d6cf7')
const AQUA = new THREE.Color('#5cc8ff')

function dotTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.35, 'rgba(255,255,255,0.6)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 64, 64)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Points distributed evenly on a sphere (Fibonacci lattice) — reads as a digital globe. */
function Globe({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null)
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const phi = Math.PI * (3 - Math.sqrt(5))
    const c = new THREE.Color()
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = phi * i
      const R = 2.15
      positions.set([Math.cos(theta) * r * R, y * R, Math.sin(theta) * r * R], i * 3)
      // Orange band near the equator fading into violet at the poles.
      c.copy(VIOLET).lerp(ORANGE, Math.pow(1 - Math.abs(y), 3))
      if (Math.random() < 0.04) c.copy(AQUA)
      colors.set([c.r, c.g, c.b], i * 3)
    }
    return { positions, colors }
  }, [count])
  const tex = useMemo(dotTexture, [])

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.06
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} map={tex} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  )
}

/** Faceted wireframe core with a glowing heart — the "engine" at the centre of the stack. */
function Core() {
  const outer = useRef<THREE.Mesh>(null)
  const inner = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (outer.current) {
      outer.current.rotation.x = t * 0.15
      outer.current.rotation.y = t * 0.2
    }
    if (inner.current) {
      const s = 1 + Math.sin(t * 1.6) * 0.04
      inner.current.scale.setScalar(s)
      inner.current.rotation.y = -t * 0.3
    }
  })
  return (
    <group>
      <mesh ref={outer}>
        <icosahedronGeometry args={[1.25, 1]} />
        <meshBasicMaterial color="#ff9447" wireframe transparent opacity={0.55} />
      </mesh>
      <mesh ref={inner}>
        <icosahedronGeometry args={[0.62, 0]} />
        <meshStandardMaterial color="#2a1608" emissive="#ff5a00" emissiveIntensity={0.28} roughness={0.35} metalness={0.85} flatShading />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshBasicMaterial color="#ff7a1a" transparent opacity={0.04} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}

/** Tilted orbit with travelling nodes — services (API, DB, cloud, mobile) circling the core. */
function Orbit({ radius, tilt, speed, color, nodes }: { radius: number; tilt: [number, number, number]; speed: number; color: string; nodes: number }) {
  const group = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.z += dt * speed
  })
  return (
    <group rotation={tilt}>
      <mesh>
        <torusGeometry args={[radius, 0.004, 8, 160]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>
      <group ref={group}>
        {Array.from({ length: nodes }, (_, i) => {
          const a = (i / nodes) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * radius, Math.sin(a) * radius, 0]}>
              <boxGeometry args={[0.09, 0.09, 0.09]} />
              <meshBasicMaterial color={color} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) p.set([(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8 - 2], i * 3)
    return p
  }, [count])
  const tex = useMemo(dotTexture, [])
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.01
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} map={tex} color="#c9c9ff" transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

function Rig({ progress, children }: { progress: MutableRefObject<number>; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null)
  useFrame(({ pointer, camera }, dt) => {
    const g = group.current
    if (!g) return
    const p = progress.current
    // Ease toward the pointer for a subtle parallax response.
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -pointer.y * 0.35 + p * 0.6, 3, dt)
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, pointer.x * 0.5 + p * 1.2, 3, dt)
    g.position.y = THREE.MathUtils.damp(g.position.y, p * 1.6, 4, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, 8.5 - p * 2.5, 4, dt)
  })
  return <group ref={group}>{children}</group>
}

/**
 * Watches the real frame rate for the first couple of seconds and steps quality
 * down once if the device can't keep up — no hard-coded guesses about hardware.
 */
function FpsGuard({ onSlow }: { onSlow: () => void }) {
  const frames = useRef(0)
  const elapsed = useRef(0)
  const done = useRef(false)
  useFrame((_, dt) => {
    if (done.current) return
    // Skip the first half second: shader compilation makes early frames unrepresentative.
    elapsed.current += dt
    if (elapsed.current < 0.5) return
    frames.current++
    if (elapsed.current >= 2.5) {
      done.current = true
      if (frames.current / (elapsed.current - 0.5) < 45) onSlow()
    }
  })
  return null
}

export default function HeroScene({ progress, quality, active }: Props) {
  const [lite, setLite] = useState(quality === 'low')
  const high = !lite
  return (
    <Canvas
      dpr={high ? [1, 1.5] : 1}
      camera={{ position: [0, 0, 8.5], fov: 42 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false }}
      frameloop={active ? 'always' : 'never'}
      aria-hidden
    >
      {high && <FpsGuard onSlow={() => setLite(true)} />}
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 3, 4]} intensity={30} color="#8b8cff" />
      <pointLight position={[-4, -2, 3]} intensity={25} color="#ff7a1a" />
      <Rig progress={progress}>
        <Core />
        <Globe count={high ? 1800 : 700} />
        <Orbit radius={2.85} tilt={[1.2, 0.3, 0]} speed={0.25} color="#ff9447" nodes={3} />
        <Orbit radius={3.25} tilt={[-1.0, -0.5, 0.4]} speed={-0.18} color="#8b8cff" nodes={4} />
        {high && <Orbit radius={3.65} tilt={[0.3, 1.1, 0.2]} speed={0.12} color="#5cc8ff" nodes={2} />}
      </Rig>
      {high && <Dust count={400} />}
    </Canvas>
  )
}
