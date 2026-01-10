
import React, { useMemo, useState } from 'react';
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
    const [randomSeed, setRandomSeed] = useState(0); // Used to ensure randomness on every click

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

    // Get current 6 items
    const currentItems = useMemo(() => {
        const start = currentIndex * ITEMS_PER_PAGE;
        return fullList.slice(start, start + ITEMS_PER_PAGE);
    }, [fullList, currentIndex]);

    // Generate random active indices for labels whenever page changes or 'randomSeed' updates
    const activeIndices = useMemo(() => {
        const count = currentItems.length;
        if (count === 0) return [];

        // Pick two distinct random indices
        const idx1 = Math.floor(Math.random() * count);
        let idx2 = Math.floor(Math.random() * count);

        // Ensure they are different (simple retry)
        while (count > 1 && idx2 === idx1) {
            idx2 = Math.floor(Math.random() * count);
        }

        return [idx1, idx2];
    }, [currentItems.length, currentIndex, randomSeed]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % totalPages);
        setRandomSeed((prev) => prev + 1); // Force new random positions
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
        setRandomSeed((prev) => prev + 1); // Force new random positions
    };

    const layouts = [
        { rotate: -3, y: 10 },
        { rotate: 2, y: -5 },
        { rotate: -2, y: 5 },
        { rotate: 4, y: 0 },
        { rotate: -1, y: 8 },
        { rotate: 3, y: -2 },
    ];

    const cloudColors = [
        'bg-blue-500 text-white',
        'bg-orange-500 text-white',
        'bg-purple-500 text-white',
        'bg-green-500 text-white',
        'bg-pink-500 text-white',
        'bg-indigo-500 text-white',
    ];

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#F8F9FA] flex flex-col items-center py-10 overflow-hidden font-sans">

            {/* Giant Background Text (Matched to D04) */}
            <div className="absolute top-[10%] left-0 right-0 w-full text-center pointer-events-none select-none z-0">
                <h2 className="text-[18vw] font-bold tracking-tighter text-neutral-200/50 leading-none">
                    {settings.companyName}
                </h2>
            </div>
            {/* Spacer to push content down below the giant text if needed, or just rely on flex center */}
            <div className="h-20 md:h-32 w-full"></div>

            {/* Carousel Section */}
            <div className="flex-1 w-full flex items-center justify-center relative px-4">

                {/* Left Arrow */}
                <button
                    onClick={handlePrev}
                    className="absolute left-4 md:left-12 z-30 p-4 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-110 active:scale-95 transition-all text-slate-700 hover:text-blue-600 ring-1 ring-slate-100"
                >
                    <span className="material-symbols-outlined text-3xl">arrow_back</span>
                </button>

                {/* Cards Row - Locked Width */}
                {/* We specificly use a container that allows the items to stay strict size */}
                <div className="flex items-center justify-center gap-6 px-12 h-[450px]">
                    {currentItems.map((emp, i) => {
                        const layout = layouts[i % layouts.length];

                        const isFirstLabel = i === activeIndices[0];
                        const isSecondLabel = i === activeIndices[1];
                        const hasCloud = isFirstLabel || isSecondLabel;

                        // Force one blue and one orange
                        let bubbleColor = '#93c5fd'; // Default Blue
                        if (isSecondLabel) bubbleColor = '#fdba74'; // Second is Orange

                        return (
                            <div
                                key={emp.id}
                                className="relative flex-none group perspective-1000 select-none cursor-pointer transition-all duration-500 ease-out hover:z-50"
                                style={{
                                    scrollSnapAlign: 'start',
                                    transform: `translateY(${layout.y}px) rotate(${layout.rotate}deg)`,
                                    width: '180px',
                                    height: '244px',
                                    zIndex: 10 + i
                                }}
                            >
                                <div
                                    className="w-full h-full shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:scale-105 transform-gpu relative bg-white"
                                    style={{ borderRadius: '30px', overflow: 'hidden' }}
                                >
                                    <img
                                        src={emp.imageUrl}
                                        alt={emp.name}
                                        className="w-full h-full object-cover rounded-[30px]"
                                        style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.backgroundColor = '#ccc';
                                        }}
                                    />
                                    {/* Inner border for definition */}
                                    <div className="absolute inset-0 rounded-[30px] border border-black/5 pointer-events-none"></div>

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 rounded-[30px]">
                                        <p className="text-white font-bold text-lg leading-tight">{emp.name}</p>
                                        <p className="text-white text-xs mt-1 font-normal">{emp.department}</p>
                                    </div>
                                </div>

                                {/* Role Cloud - Speech Bubble Style */}
                                {hasCloud && (
                                    <div
                                        className="absolute left-1/2 -translate-x-1/2 z-[50] whitespace-nowrap pointer-events-none"
                                        style={{ top: '-60px' }} // Moved higher up away from card
                                    >
                                        <div
                                            className="px-5 py-2 rounded-full shadow-lg font-normal tracking-wide flex items-center justify-center relative"
                                            style={{
                                                transform: `rotate(${-layout.rotate}deg)`,
                                                backgroundColor: bubbleColor,
                                                color: '#000000',
                                                fontSize: '15px'
                                            }}
                                        >
                                            {emp.title || 'Creative'}

                                            {/* Speech Bubble Tail (The 'tild') */}
                                            <div
                                                className="absolute top-full left-1/2 -translate-x-1/2"
                                                style={{
                                                    width: '0',
                                                    height: '0',
                                                    borderLeft: '8px solid transparent',
                                                    borderRight: '8px solid transparent',
                                                    borderTop: `10px solid ${bubbleColor}`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={handleNext}
                    className="absolute right-4 md:right-12 z-30 p-4 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-110 active:scale-95 transition-all text-slate-700 hover:text-blue-600 ring-1 ring-slate-100"
                >
                    <span className="material-symbols-outlined text-3xl">arrow_forward</span>
                </button>

            </div>

            {/* Pagination */}
            <div className="mt-8 flex gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-slate-900' : 'w-2 bg-slate-300'}`}
                    />
                ))}
            </div>

            <style>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 4s infinite ease-in-out;
                }
             `}</style>
        </div>
    );
};
