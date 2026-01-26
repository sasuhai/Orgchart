
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Employee } from '../../types';
import { useSettings } from '../context/SettingsContext';

interface D06Props {
    employees: Employee[];
    focusedEmployeeId?: string | null;
}

const ITEMS_PER_PAGE = 6;

export const D06: React.FC<D06Props> = ({ employees }) => {
    const { settings } = useSettings();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Mock data if empty
    const fullList = useMemo(() => {
        return employees.length > 0 ? employees : Array.from({ length: 18 }).map((_, i) => ({
            id: `mock-${i}`,
            name: `Employee ${i}`,
            title: i % 2 === 0 ? 'Designer' : 'Developer',
            department: i % 3 === 0 ? 'Creative' : 'Engineering',
            imageUrl: `https://picsum.photos/300/400?random=${i}`,
        } as unknown as Employee));
    }, [employees]);

    const totalPages = Math.ceil(fullList.length / ITEMS_PER_PAGE);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % totalPages);
    }, [totalPages]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
    }, [totalPages]);

    // Auto-scroll logic
    useEffect(() => {
        if (isHovered) return;
        const timer = setInterval(() => {
            handleNext();
        }, 8000);
        return () => clearInterval(timer);
    }, [handleNext, isHovered]);

    // Deterministic random indices for labels to prevent jumping
    const pageActiveIndices = useMemo(() => {
        return Array.from({ length: totalPages }).map((_, pIdx) => {
            const start = pIdx * ITEMS_PER_PAGE;
            const count = Math.min(ITEMS_PER_PAGE, fullList.length - start);
            if (count === 0) return [];
            const firstIdx = (pIdx * 3) % count;
            let secondIdx = (pIdx * 7 + 1) % count;
            if (firstIdx === secondIdx && count > 1) secondIdx = (secondIdx + 1) % count;
            return [firstIdx, secondIdx];
        });
    }, [fullList.length, totalPages]);

    const layouts = [
        { rotate: -3, y: 10 },
        { rotate: 2, y: -5 },
        { rotate: -2, y: 5 },
        { rotate: 4, y: 0 },
        { rotate: -1, y: 8 },
        { rotate: 3, y: -2 },
    ];

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#F8F9FA] flex flex-col items-center py-10 overflow-hidden font-sans text-slate-900 selection:bg-blue-100">

            {/* Giant Background Text */}
            <div className="absolute top-[10%] left-0 right-0 w-full text-center pointer-events-none select-none z-0">
                <h2 className="text-[18vw] font-bold tracking-tighter text-neutral-200/50 leading-none">
                    {settings.companyName}
                </h2>
            </div>

            <div className="h-20 md:h-32 w-full"></div>

            {/* Carousel Section */}
            <div
                className="flex-1 w-full flex items-center justify-center relative px-4 z-10"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >

                {/* Navigation Buttons */}
                <button
                    onClick={handlePrev}
                    className="absolute left-6 md:left-16 z-50 p-5 rounded-full bg-white/60 backdrop-blur-md shadow-[0_8px_40px_rgba(0,0,0,0.1)] hover:bg-white hover:scale-110 active:scale-95 transition-all text-slate-800 hover:text-blue-600 ring-1 ring-white/50"
                >
                    <span className="material-symbols-outlined text-3xl">arrow_back</span>
                </button>

                {/* Cinematic Cross-Dissolve Stage */}
                <div className="relative w-full max-w-[1300px] h-[480px]">
                    {Array.from({ length: totalPages }).map((_, pageIdx) => {
                        const isActive = currentIndex === pageIdx;
                        return (
                            <div
                                key={pageIdx}
                                className="absolute inset-0 flex items-center justify-center gap-10 px-12 transition-opacity"
                                style={{
                                    opacity: isActive ? 1 : 0,
                                    zIndex: isActive ? 30 : 25, // Both stay high to ensure overlap
                                    pointerEvents: isActive ? 'auto' : 'none',
                                    transitionDuration: '3000ms',
                                    transitionTimingFunction: 'ease-in-out'
                                }}
                            >
                                {fullList.slice(pageIdx * ITEMS_PER_PAGE, (pageIdx + 1) * ITEMS_PER_PAGE).map((emp, i) => {
                                    const layout = layouts[i % layouts.length];
                                    const activeIndices = pageActiveIndices[pageIdx];
                                    const isFirstLabel = i === activeIndices[0];
                                    const isSecondLabel = i === activeIndices[1];
                                    const hasCloud = isFirstLabel || isSecondLabel;
                                    const bubbleColor = isSecondLabel ? '#fdba74' : '#93c5fd';

                                    return (
                                        <div
                                            key={emp.id}
                                            className="relative flex-none group perspective-1000 select-none cursor-pointer"
                                            style={{
                                                transform: `translateY(${layout.y}px) rotate(${layout.rotate}deg)`,
                                                width: '180px',
                                                height: '244px',
                                                zIndex: 10 + i
                                            }}
                                        >
                                            <div
                                                className="w-full h-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-2 transform-gpu relative bg-white"
                                                style={{ borderRadius: '34px', overflow: 'hidden' }}
                                            >
                                                <img
                                                    src={emp.imageUrl}
                                                    alt={emp.name}
                                                    className="w-full h-full object-cover rounded-[34px]"
                                                    loading="eager"
                                                />
                                                <div className="absolute inset-0 rounded-[34px] border border-black/5 pointer-events-none"></div>

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5 rounded-[34px]">
                                                    <p className="text-white font-bold text-lg leading-tight tracking-tight">{emp.name}</p>
                                                    <p className="text-white/70 text-[10px] uppercase font-bold mt-1 tracking-widest">{emp.department}</p>
                                                </div>
                                            </div>

                                            {hasCloud && (
                                                <div
                                                    className="absolute left-1/2 -translate-x-1/2 z-[50] whitespace-nowrap pointer-events-none transition-all duration-1000"
                                                    style={{ top: '-70px' }}
                                                >
                                                    <div
                                                        className="px-6 py-2.5 rounded-full shadow-2xl font-bold tracking-wide flex items-center justify-center relative border border-white/30 backdrop-blur-sm"
                                                        style={{
                                                            transform: `rotate(${-layout.rotate}deg)`,
                                                            backgroundColor: bubbleColor,
                                                            color: '#000000',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        {emp.title || 'Creative'}
                                                        <div
                                                            className="absolute top-full left-1/2 -translate-x-1/2"
                                                            style={{
                                                                width: '0',
                                                                height: '0',
                                                                borderLeft: '10px solid transparent',
                                                                borderRight: '10px solid transparent',
                                                                borderTop: `12px solid ${bubbleColor}`
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={handleNext}
                    className="absolute right-6 md:right-16 z-50 p-5 rounded-full bg-white/60 backdrop-blur-md shadow-[0_8px_40px_rgba(0,0,0,0.1)] hover:bg-white hover:scale-110 active:scale-95 transition-all text-slate-800 hover:text-blue-600 ring-1 ring-white/50"
                >
                    <span className="material-symbols-outlined text-3xl">arrow_forward</span>
                </button>

            </div>

            {/* Premium Pagination */}
            <div className="mt-14 flex gap-3">
                {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-2 rounded-full transition-all duration-700 ${i === currentIndex ? 'w-10 bg-slate-900 shadow-sm' : 'w-2 bg-slate-200 hover:bg-slate-300'}`}
                    />
                ))}
            </div>

            <style>{`
                .perspective-1000 { perspective: 1000px; }
            `}</style>
        </div>
    );
};
