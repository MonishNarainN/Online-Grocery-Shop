import { Canvas } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';

function Orb({ position, color, speed, distort, scale }) {
    return (
        <Float speed={speed} rotationIntensity={1} floatIntensity={2}>
            <Sphere args={[1, 100, 200]} scale={scale} position={position}>
                <MeshDistortMaterial
                    color={color}
                    attach="material"
                    distort={distort}
                    speed={speed}
                    roughness={0}
                    transparent
                    opacity={0.6}
                />
            </Sphere>
        </Float>
    );
}

export function OrbsBackground() {
    return (
        <div className="fixed inset-0 -z-10 bg-background pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={1} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} />

                <Orb position={[-3, 2, -2]} color="#16a34a" scale={1.2} speed={2} distort={0.4} />
                <Orb position={[3, -2, -1]} color="#22c55e" scale={1.5} speed={1.5} distort={0.3} />
                <Orb position={[0, 0, -5]} color="#0f172a" scale={3} speed={1} distort={0.5} />
            </Canvas>
        </div>
    );
}
