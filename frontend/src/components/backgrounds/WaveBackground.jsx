import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function Wave() {
    const ref = useRef();

    const positions = useMemo(() => {
        const pos = [];
        const count = 100; // 100x100 grid
        const sep = 0.5;
        for (let xi = 0; xi < count; xi++) {
            for (let zi = 0; zi < count; zi++) {
                let x = sep * (xi - count / 2);
                let z = sep * (zi - count / 2);
                let y = 0;
                pos.push(x, y, z);
            }
        }
        return new Float32Array(pos);
    }, []);

    useFrame((state) => {
        const { clock } = state;
        const t = clock.getElapsedTime();
        const positions = ref.current.geometry.attributes.position.array;

        // Animate y based on x, z and time
        let i = 0;
        const count = 100;
        for (let xi = 0; xi < count; xi++) {
            for (let zi = 0; zi < count; zi++) {
                const x = positions[i];
                const z = positions[i + 2];
                // Wave equation
                positions[i + 1] = Math.sin(x * 0.5 + t) * 0.5 + Math.sin(z * 0.3 + t * 0.5) * 0.5;
                i += 3;
            }
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <Points ref={ref} positions={positions} stride={3} rotation={[-Math.PI / 4, 0, 0]}>
            <PointMaterial
                transparent
                color="#16a34a"
                size={0.05}
                sizeAttenuation={true}
                depthWrite={false}
            />
        </Points>
    );
}

export function WaveBackground() {
    return (
        <div className="fixed inset-0 -z-10 bg-background pointer-events-none">
            <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
                <Wave />
            </Canvas>
        </div>
    );
}
