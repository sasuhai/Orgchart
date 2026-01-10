import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Employee } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface D05Props {
    employees: Employee[];
    focusedEmployeeId?: string | null;
}

export const D05: React.FC<D05Props> = ({ employees, focusedEmployeeId }) => {
    const { settings } = useSettings();

    // Visual position (Float)
    const [scrollProgress, setScrollProgress] = useState(0);

    // Target position (Float) - The destination we want to reach
    const targetScrollRef = useRef(0);

    const [isAutoScroll, setIsAutoScroll] = useState(true);
    const [isDragging, setIsDragging] = useState(false);

    // Animation refs
    const requestRef = useRef<number>();
    const previousTimeRef = useRef<number>();
    const scrollSpeedRef = useRef(0.4); // Auto-scroll speed

    // Physics constants
    const LERP_FACTOR = 0.05; // Lower = smoother/heavier, Higher = snappier

    // Ensure we have some data
    const cards = useMemo(() => {
        return employees.length > 0 ? employees : Array.from({ length: 8 }).map((_, i) => ({
            id: `mock-${i}`,
            name: `Employee ${i}`,
            title: 'Team Member',
            department: 'General',
            imageUrl: `https://picsum.photos/800/1000?random=${i}`,
        } as unknown as Employee));
    }, [employees]);

    // Handle External Focus Changes
    useEffect(() => {
        if (focusedEmployeeId) {
            const idx = cards.findIndex(e => e.id === focusedEmployeeId);
            if (idx !== -1) {
                targetScrollRef.current = idx;
                setIsAutoScroll(false);
            }
        }
    }, [focusedEmployeeId, cards]);

    // Main Animation Loop
    const animate = (time: number) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = (time - previousTimeRef.current) / 1000;

            // 1. Update Target if Auto-Scrolling
            if (isAutoScroll) {
                targetScrollRef.current += (scrollSpeedRef.current * deltaTime);
            }

            // 2. Interpolate Visual Position towards Target
            setScrollProgress(prev => {
                const dist = targetScrollRef.current - prev;

                // If extremely close and not auto-scrolling, snap to save resources? 
                // For "cinematic" feel, continuous lerp is better.
                if (Math.abs(dist) < 0.0001 && !isAutoScroll) {
                    return targetScrollRef.current;
                }

                // Smooth Lerp
                return prev + (dist * LERP_FACTOR);
            });
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isAutoScroll]); // Loop stays active to handle damping even if auto-scroll is off

    // Manual Controls
    const handleNext = () => {
        setIsAutoScroll(false);
        // Snap target to next integer relative to current target
        targetScrollRef.current = Math.round(targetScrollRef.current) + 1;
    };

    const handlePrev = () => {
        setIsAutoScroll(false);
        targetScrollRef.current = Math.round(targetScrollRef.current) - 1;
    };

    const handleCardClick = (index: number) => {
        setIsAutoScroll(false);

        // Find shortest path to index in modular arithmetic space
        const currentRef = targetScrollRef.current;
        const total = cards.length;

        // Current effective index
        const currentMod = ((currentRef % total) + total) % total;

        // Distance in loop
        let diff = index - currentMod;

        // Shortest path wrapping
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;

        // Set new target
        targetScrollRef.current = currentRef + diff;
    };


    // Render Helpers
    const normalizedProgress = (scrollProgress % cards.length + cards.length) % cards.length;

    const getCardStyle = (index: number) => {
        const total = cards.length;

        // Calculate continuous distance
        let diff = (index - normalizedProgress);

        // Handle wrapping for rendering visual style
        while (diff < -total / 2) diff += total;
        while (diff > total / 2) diff -= total;

        const absDiff = Math.abs(diff);

        // Cinematic Tuning
        const scale = Math.max(0.7, 1 - absDiff * 0.15);
        const opacity = Math.max(0, 1 - absDiff * 0.3);
        const blur = Math.max(0, (absDiff - 0.5) * 4);
        const filter = `brightness(${Math.max(0.4, 1 - absDiff * 0.2)}) blur(${blur}px)`;
        const zIndex = Math.round((20 - absDiff) * 10);
        const xOffset = diff * 220;
        const rotateY = -diff * 15;

        return {
            transform: `translateX(${xOffset}px) scale(${scale}) rotateY(${rotateY}deg)`,
            opacity,
            filter,
            zIndex,
            boxShadow: absDiff < 0.5 ? '0 20px 60px rgba(163,230,53,0.3)' : '0 10px 30px rgba(0,0,0,0.5)',
            className: `absolute w-80 h-[460px] rounded-2xl overflow-hidden ${absDiff < 0.5 ? 'ring-2 ring-lime-300/40' : 'ring-1 ring-white/10'} bg-black/40 transition-shadow duration-300 will-change-transform cursor-pointer`,
        };
    };

    return (
        <div className="w-full h-screen bg-[#050510] text-white font-sans overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 flex flex-col items-center justify-center pt-8 pb-4 z-40 pointer-events-none">
                <div className="absolute top-8 right-8 z-50 flex items-center gap-2 pointer-events-auto">
                    <label className="relative inline-flex items-center cursor-pointer group">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isAutoScroll}
                            onChange={(e) => setIsAutoScroll(e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 transition-colors"></div>
                        <span className="ml-2 text-xs font-medium text-gray-400 group-hover:text-white transition-colors">Auto Scroll</span>
                    </label>
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 tracking-tighter mb-4 z-20 relative text-center px-4 pb-2 leading-tight pointer-events-auto">
                    {settings.companyName}
                </h1>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-blue-500/10 blur-[100px] rounded-full z-0 pointer-events-none" />
            </div>

            <section className="h-full w-full flex flex-col items-center justify-center relative z-10" id="gallery">

                <div
                    className="flex relative items-center justify-center w-full h-full max-w-[1400px]"
                    style={{ perspective: '1000px' }}
                >

                    <button
                        onClick={handlePrev}
                        className="absolute left-4 md:left-10 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/50 ring-1 ring-white/10 hover:bg-white/10 transition backdrop-blur-md"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="h-6 w-6 text-white/80" />
                    </button>

                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                            {cards.map((employee, i) => {
                                const style = getCardStyle(i);
                                if (style.opacity < 0.01) return null;

                                return (
                                    <div
                                        key={employee.id || i}
                                        className={style.className}
                                        style={{
                                            transform: style.transform,
                                            opacity: style.opacity,
                                            filter: style.filter,
                                            zIndex: style.zIndex,
                                            boxShadow: style.boxShadow,
                                        }}
                                        onClick={() => handleCardClick(i)}
                                    >
                                        <img
                                            src={employee.imageUrl}
                                            alt={employee.name}
                                            className="h-full w-full object-cover pointer-events-none select-none"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                        <div className="absolute bottom-8 left-6 right-6 text-left transform translate-z-10">
                                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs ring-1 ring-white/20 mb-3 backdrop-blur-md">
                                                <span className="text-white">{employee.title || 'Team Member'}</span>
                                            </div>
                                            <p className="text-2xl font-bold text-white tracking-tight mb-1">
                                                {employee.name}
                                            </p>
                                            <p className="text-sm text-neutral-400">
                                                {employee.department || 'General'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        onClick={handleNext}
                        className="absolute right-4 md:right-10 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/50 ring-1 ring-white/10 hover:bg-white/10 transition backdrop-blur-md"
                        aria-label="Next"
                    >
                        <ChevronRight className="h-6 w-6 text-white/80" />
                    </button>

                </div>
            </section>
        </div>
    );
};
