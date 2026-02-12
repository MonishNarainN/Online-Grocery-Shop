import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GeometricBackground } from './backgrounds/GeometricBackground';
import { NetworkBackground } from './backgrounds/NetworkBackground';
import { OrbsBackground } from './backgrounds/OrbsBackground';
import { WaveBackground } from './backgrounds/WaveBackground';

const BACKGROUNDS = [
    { id: 'geometric', name: 'Geometric', component: GeometricBackground },
    { id: 'network', name: 'Network', component: NetworkBackground },
    { id: 'orbs', name: 'Orbs', component: OrbsBackground },
    { id: 'wave', name: 'Wave', component: WaveBackground },
];

export function BackgroundController() {
    const [activeIndex, setActiveIndex] = useState(0);
    const ActiveComponent = BACKGROUNDS[activeIndex].component;

    return (
        <>
            <ActiveComponent />

            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 bg-card/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Select Background</span>
                <div className="flex flex-col gap-2">
                    {BACKGROUNDS.map((bg, index) => (
                        <Button
                            key={bg.id}
                            variant={activeIndex === index ? 'default' : 'secondary'}
                            size="sm"
                            onClick={() => setActiveIndex(index)}
                            className="justify-start w-full"
                        >
                            {bg.name}
                        </Button>
                    ))}
                </div>
            </div>
        </>
    );
}
