import { Canvas } from '@react-three/fiber';
import { Float, Icosahedron } from '@react-three/drei';

function FloatingShape({ position, color, scale, speed }) {
    return (
        <Float
            speed={speed} // Animation speed
            rotationIntensity={1} // XYZ rotation intensity
            floatIntensity={1} // Up/down float intensity
        >
            <Icosahedron args={[1, 0]} position={position} scale={scale}>
                <meshStandardMaterial color={color} wireframe transparent opacity={0.15} />
            </Icosahedron>
        </Float>
    );
}

export function MinimalBackground() {
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none bg-background">
            <Canvas camera={{ position: [0, 0, 10] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />

                {/* Primary Green Shapes */}
                <FloatingShape position={[-4, 2, 0]} color="#16a34a" scale={1.5} speed={1.5} />
                <FloatingShape position={[5, -3, -2]} color="#16a34a" scale={2} speed={1} />

                {/* Subtle Dark/Secondary Shapes */}
                <FloatingShape position={[0, 4, -5]} color="#22c55e" scale={1} speed={2} />
                <FloatingShape position={[-6, -4, -3]} color="#ffffff" scale={1.2} speed={1.2} />
                <FloatingShape position={[6, 3, -4]} color="#ffffff" scale={0.8} speed={1.8} />
            </Canvas>
        </div>
    );
}
