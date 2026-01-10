import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Employee } from '../../types';
import { useSettings } from '../context/SettingsContext';

interface D03Props {
    employees: Employee[];
    focusedEmployeeId?: string | null;
}

const SLOT_COUNT = 12;
const ROTATION_SPEED = 0.1; // speed factor

export const D03: React.FC<D03Props> = ({ employees, focusedEmployeeId }) => {
    const { settings } = useSettings();
    // 1. Prepare Full List
    const fullList = useMemo(() => {
        let list = employees.length > 0 ? employees : Array.from({ length: 20 }).map((_, i) => ({
            id: `mock-${i}`,
            name: `Employee ${i}`,
            imageUrl: `https://picsum.photos/100/100?random=${i}`,
        } as unknown as Employee));

        // Ensure enough data to fill slots
        // We only duplicate if we absolutely lack enough unique items to fill the ring
        while (list.length < SLOT_COUNT) {
            list = [...list, ...list];
        }
        return list;
    }, [employees]);

    // 2. State for visible slots logic
    const [visibleItems, setVisibleItems] = useState<Employee[]>([]);
    const [nextQueueIndex, setNextQueueIndex] = useState(SLOT_COUNT);
    const [fadingIndices, setFadingIndices] = useState<number[]>([]); // Indices currently invisible (fading out/swapped)
    const [featuredPerson, setFeaturedPerson] = useState<Employee | null>(null);
    const [featuredCardOpacity, setFeaturedCardOpacity] = useState(0);
    const [manualResume, setManualResume] = useState(false);

    // State to track previous focus ID for derived state reset
    const [prevFocusedId, setPrevFocusedId] = useState<string | null | undefined>(focusedEmployeeId);

    // Derived State Reset: If focus changes, reset manualResume immediately during render
    if (focusedEmployeeId !== prevFocusedId) {
        setPrevFocusedId(focusedEmployeeId);
        if (focusedEmployeeId) {
            setManualResume(false);
        }
    }

    // Refs for animation and DOM access
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const rotationRef = useRef(0);
    const animationFrameRef = useRef<number | null>(null);
    const featuredIdRef = useRef<string | null>(null);
    const isTransitioningRef = useRef(false);

    // NEW: Ref to track latest visible items to avoid stale closures in animation loop
    const visibleItemsRef = useRef<Employee[]>([]);

    // Initialize visible items once
    useEffect(() => {
        if (fullList.length > 0 && visibleItems.length === 0) {
            setVisibleItems(fullList.slice(0, SLOT_COUNT));
            setNextQueueIndex(SLOT_COUNT % fullList.length);
        }
    }, [fullList, visibleItems.length]);

    // Keep ref synced with state
    useEffect(() => {
        visibleItemsRef.current = visibleItems;
    }, [visibleItems]);

    // Handle Focus/Search
    useEffect(() => {
        // If the user has manually resumed, we do not want to re-snap or re-inject
        // even if visibleItems changes due to the rotation/swap logic.
        if (manualResume) return;

        if (focusedEmployeeId && fullList.length > 0) {
            const focusedEmp = fullList.find(e => e.id === focusedEmployeeId);
            if (focusedEmp) {
                // Set as featured immediately
                setFeaturedPerson(focusedEmp);
                setFeaturedCardOpacity(1);
                featuredIdRef.current = focusedEmp.id;

                // ALIGN ROTATION:
                // Find index of employee in visible items (or slot 0 if we inject).
                let targetIndex = visibleItems.findIndex(item => item.id === focusedEmp.id);

                if (targetIndex === -1) {
                    targetIndex = 0;
                    // Force into visible slot 0
                    setVisibleItems(prev => {
                        const newItems = [...prev];
                        newItems[0] = focusedEmp;
                        return newItems;
                    });
                }

                // Calculate rotation needed to bring targetIndex to 0 degrees (Right)
                // Angle = (slotAngle + rotation) % 360 = 0
                // rotation = -slotAngle
                const slotAngle = (360 / SLOT_COUNT) * targetIndex;
                const targetRotation = -slotAngle;

                // Snap rotation
                rotationRef.current = targetRotation;
                // Container rotation is removed in favor of item positioning
                if (containerRef.current) {
                    containerRef.current.style.transform = 'none';
                }
            }
        }
    }, [focusedEmployeeId, fullList, visibleItems, manualResume]);

    // Animation Loop
    useEffect(() => {
        // Helper to debounce swap
        const lastSwaps = new Map<number, number>(); // slotIndex -> timestamp
        const SWAP_DEBOUNCE_MS = 5000; // Prevent rapid re-swaps for the same slot

        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const normalizeAngle = (deg: number) => (deg % 360 + 360) % 360;

        const animate = () => {
            // Update rotation
            if (!focusedEmployeeId || manualResume) {
                rotationRef.current += ROTATION_SPEED;
            }
            const currentRotation = rotationRef.current; // Global offset in degrees

            // Container ITSELF does not rotate anymore. We move items along the path.
            // This ensures items are always upright (no counter-rotation needed).

            let closestToRightIndex = -1;
            let minDistanceToRight = 1000;

            const currentItems = visibleItemsRef.current;
            const RADIUS = 300; // Radius in pixels (check matches CSS translate)

            itemRefs.current.forEach((el, index) => {
                if (el && currentItems[index]) {
                    const count = SLOT_COUNT;
                    const slotAngleBase = (360 / count) * index;
                    const totalAngle = slotAngleBase + currentRotation;

                    // Normalize for logic checks
                    const absAngle = normalizeAngle(totalAngle);

                    // Trig Positioning (0 degrees = Right)
                    // Math.cos(0) = 1 (Right), Math.sin(0) = 0 (Center Y)
                    const rad = toRad(totalAngle);
                    const x = Math.cos(rad) * RADIUS;
                    const y = Math.sin(rad) * RADIUS;

                    el.style.transform = `translate(${x}px, ${y}px)`;

                    // 1. Check for Closest to Right (0 degrees)
                    // Distance is shortest arc to 0 or 360
                    const distTo0 = Math.min(Math.abs(absAngle - 0), Math.abs(absAngle - 360));
                    if (distTo0 < minDistanceToRight) {
                        minDistanceToRight = distTo0;
                        closestToRightIndex = index;
                    }

                    // 2. Check for Bottom Swap (90 degrees)
                    const TARGET_ANGLE = 90;
                    const ANGLE_TOLERANCE = ROTATION_SPEED * 10; // Slightly larger window for safety
                    // We also check direction to only swap once per pass? 
                    // Debounce handles re-triggers.

                    if (Math.abs(absAngle - TARGET_ANGLE) < ANGLE_TOLERANCE) {
                        const now = Date.now();
                        if (!lastSwaps.has(index) || now - lastSwaps.get(index)! > SWAP_DEBOUNCE_MS) {
                            lastSwaps.set(index, now);
                            swapDataRef.current(index);
                        }
                    }
                }
            });

            // Handle Featured Person Update
            if ((!focusedEmployeeId || manualResume) && closestToRightIndex !== -1 && !isTransitioningRef.current) {
                const TRIGGER_WINDOW = 10; // Wider window to ensure we catch it
                if (minDistanceToRight < TRIGGER_WINDOW) {
                    const candidate = currentItems[closestToRightIndex];

                    if (candidate && candidate.id !== featuredIdRef.current) {
                        isTransitioningRef.current = true;
                        setFeaturedCardOpacity(0);
                        setTimeout(() => {
                            featuredIdRef.current = candidate.id;
                            setFeaturedPerson(candidate);
                            setFeaturedCardOpacity(1);
                            setTimeout(() => {
                                isTransitioningRef.current = false;
                            }, 300);
                        }, 300);
                    } else if (candidate && candidate.id === featuredIdRef.current && featuredCardOpacity === 0) {
                        // Ensure opacity is restored if we somehow missed it
                        setFeaturedCardOpacity(1);
                    }
                }
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        if (visibleItems.length === SLOT_COUNT) {
            // We need to ensure we can read the initial values immediately, but safer to rely on ref sync
            // But ref sync effect runs AFTER render.
            // On first run, visibleItemsRef is empty []
            // But valid visibleItems.length === SLOT_COUNT means we have data.
            // So we should sync validItemsRef immediately or in the effect above
            // Added dependency [visibleItems] below to restart not needed but just ensuring ref is populated.
            visibleItemsRef.current = visibleItems; // safety sync for first run
            animationFrameRef.current = requestAnimationFrame(animate);
        }

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [visibleItems.length, focusedEmployeeId, manualResume]); // Restart loop if these change to capture fresh state

    // 3. Stable Callback for Swap Logic

    // Track visible items in ref for swap logic to access latest state without re-binding
    const visibleItemsRefForSwap = useRef<Employee[]>([]);
    useEffect(() => {
        visibleItemsRefForSwap.current = visibleItems;
    }, [visibleItems]);

    const swapDataRef = useRef<(index: number) => void>(() => { });

    useEffect(() => {
        swapDataRef.current = (index: number) => {
            // Step 1: Fade Out
            setFadingIndices(prev => [...prev, index]);

            // Step 2: Swap Data after delay
            setTimeout(() => {
                setNextQueueIndex(currentQueueIndex => {
                    const currentVisible = visibleItemsRefForSwap.current;
                    let foundCandidate: Employee | null = null;
                    let nextIndex = currentQueueIndex;
                    let attempts = 0;

                    // Search for the next available employee who is NOT currently visible
                    while (attempts < fullList.length) {
                        const candidateIndex = nextIndex % fullList.length;
                        const candidate = fullList[candidateIndex];

                        // Check uniqueness: Is this candidate currently displayed?
                        // (We ignore the slot we are about to replace, efficiently we just check all)
                        const isVisible = currentVisible.some(v => v.id === candidate.id);

                        if (!isVisible) {
                            foundCandidate = candidate;
                            nextIndex++; // Move past this one for next time
                            break;
                        }

                        // Helper: if everyone is visible (e.g. list size == slot size), we fail gracefully
                        nextIndex++;
                        attempts++;
                    }

                    // Fallback if no unique found (shouldn't happen if list > slots)
                    if (!foundCandidate) {
                        foundCandidate = fullList[currentQueueIndex % fullList.length];
                        nextIndex = currentQueueIndex + 1;
                    }

                    setVisibleItems(prevItems => {
                        const newItems = [...prevItems];
                        if (foundCandidate) {
                            newItems[index] = foundCandidate;
                        }
                        return newItems;
                    });

                    return nextIndex;
                });

                // Step 3: Fade In
                setTimeout(() => {
                    setFadingIndices(prev => prev.filter(i => i !== index));
                }, 100);

            }, 500);
        };
    }, [fullList]);

    // 4. Derive Active Person for Display
    // We prioritize the focused employee immediately if we are in "Search Focus" mode (not manually resumed).
    // This prevents "flicker" of the old card while effects are running.
    const targetEmployee = useMemo(() => {
        if (!focusedEmployeeId) return null;
        return fullList.find(e => e.id === focusedEmployeeId) || null;
    }, [focusedEmployeeId, fullList]);

    const activePerson = (focusedEmployeeId && !manualResume && targetEmployee)
        ? targetEmployee
        : featuredPerson;

    const activeOpacity = (focusedEmployeeId && !manualResume && targetEmployee)
        ? 1
        : featuredCardOpacity;


    return (
        <div className="w-full h-[calc(100vh-64px)] bg-[#050510] overflow-hidden relative flex items-center justify-center font-sans">

            {/* Background Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
            </div>

            {/* Central Content */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 tracking-tighter mb-4 z-20 relative text-center px-4 pb-2 leading-tight">
                    {settings.companyName}
                </h1>
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full z-0" />
            </div>

            {/* Featured Person Card - Right Side */}
            {activePerson && (
                <div
                    className="absolute right-[5%] md:right-[10%] top-1/2 -translate-y-1/2 w-48 md:w-56 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-white z-50 shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-in fade-in duration-700 cursor-pointer"
                    onClick={() => setManualResume(true)}
                >
                    <div
                        className="transition-opacity duration-300 ease-in-out"
                        style={{ opacity: activeOpacity }}
                    >
                        <div className="w-full aspect-[4/5] rounded-xl overflow-hidden mb-4 shadow-lg border border-white/5 relative">
                            <img
                                src={activePerson.imageUrl}
                                alt={activePerson.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                        </div>
                        <h3 className="font-bold text-xl leading-tight mb-1 text-white tracking-tight">{activePerson.name}</h3>
                        <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1">{activePerson.title || 'Team Member'}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{activePerson.department || 'General'}</p>
                    </div>
                </div>
            )}

            {/* Orbit Container */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

                {/* Single Logic JS Driven Ring */}
                <div
                    ref={containerRef}
                    className="absolute border border-white/5 rounded-full w-[600px] h-[600px] md:w-[800px] md:h-[800px]"
                >
                    {visibleItems.map((emp, i) => {
                        const isFading = fadingIndices.includes(i);
                        return (
                            <div
                                key={`${i}-slot`}
                                ref={el => itemRefs.current[i] = el}
                                className="absolute top-1/2 left-1/2 w-32 h-32 -ml-16 -mt-16 transition-opacity duration-500 ease-in-out"
                                style={{
                                    opacity: isFading ? 0 : 1,
                                }}
                            >
                                <div className="w-full h-full">
                                    <div className="w-full h-full rounded-full border border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.3)] cursor-pointer pointer-events-auto group relative transition-colors hover:border-white/80 bg-black/20">
                                        <img
                                            src={emp?.imageUrl}
                                            alt={emp?.name}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                        {/* Tooltip */}
                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded text-[10px] whitespace-nowrap text-white backdrop-blur-sm pointer-events-none border border-white/10">
                                            {emp?.name}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};
