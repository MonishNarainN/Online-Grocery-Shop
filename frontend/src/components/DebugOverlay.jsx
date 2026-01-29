import { useAuth } from '@/contexts/AuthContext';

export function DebugOverlay() {
    const { user, isAdmin, isLoading } = useAuth();

    if (process.env.NODE_ENV === 'production') return null;

    return (
        <div className="fixed bottom-4 left-4 z-[9999] p-4 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-mono text-white shadow-2xl pointer-events-none">
            <div className="flex flex-col gap-1">
                <p className="font-bold text-primary uppercase text-[8px] mb-1">Auth Debug (Local Only)</p>
                <p>Email: <span className="text-blue-400">{user?.email || 'N/A'}</span></p>
                <p>IsAdmin: <span className={isAdmin ? 'text-green-400' : 'text-red-400'}>{isAdmin ? 'YES' : 'NO'}</span></p>
                <p>Loading: <span className="text-yellow-400">{isLoading ? 'TRUE' : 'FALSE'}</span></p>
                {user?.email?.toLowerCase().trim() === 'rajarajeshwari@gmail.com' && !isAdmin && (
                    <p className="text-red-500 font-bold animate-pulse mt-1">WARNING: Email matches but role is false!</p>
                )}
            </div>
        </div>
    );
}
