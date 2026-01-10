
import React, { useMemo, useState, useEffect } from 'react';
import { Employee } from '../../types';
import { useSettings } from '../context/SettingsContext';

interface D01Props {
    employees: Employee[];
    focusedEmployeeId?: string | null;
}

export const D01: React.FC<D01Props> = ({ employees, focusedEmployeeId }) => {
    const { settings, updateD01Settings } = useSettings();
    const { fontSize, fillOpacity, isGlass, textColor } = settings.d01;
    const [showSettings, setShowSettings] = useState(false);
    const [manualResume, setManualResume] = useState(false);

    // Reset manual resume when search changes
    useEffect(() => {
        if (focusedEmployeeId) {
            setManualResume(false);
        }
    }, [focusedEmployeeId]);

    // Helper to convert hex to rgba
    const getRgba = (hex: string, opacity: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
    };

    // Use a subset if potentially too many to keep performance high
    const cards = useMemo(() => {
        const list = employees.length > 0 ? employees : Array.from({ length: 10 }).map((_, i) => ({
            id: i.toString(),
            name: 'John Doe',
            title: 'Artist',
            department: 'Creatives',
            imageUrl: `https://picsum.photos/200/200?random=${i}`,
            parentId: null,
            roles: [],
            description: '',
            email: ''
        } as unknown as Employee));

        let displayList = list;
        if (focusedEmployeeId) {
            const target = employees.find(e => e.id === focusedEmployeeId);
            if (target) {
                const others = list.filter(e => e.id !== focusedEmployeeId);
                displayList = [target, ...others];
            }
        }

        return displayList.slice(0, 15); // Limit to 15 for optimal visual
    }, [employees, focusedEmployeeId]);

    const count = cards.length;
    // Radius calculation based on card width and count
    const cardWidth = 224;
    const gap = 1.2; // space between cards
    const radius = Math.max(800, (cardWidth * count * gap) / (2 * Math.PI));

    return (
        <div className="w-full h-[calc(100vh-64px)] bg-[#FF4500] overflow-hidden relative font-sans flex items-center justify-center">

            {/* Settings Toggle Button */}
            <button
                onClick={() => setShowSettings(!showSettings)}
                className="absolute top-4 right-4 z-50 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 transition-all backdrop-blur-md border border-white/10 group"
                title={showSettings ? "Hide Settings" : "Show Settings"}
            >
                {showSettings ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                )}
            </button>

            {/* Customization Controls */}
            {showSettings && (
                <div className="absolute top-16 right-4 z-50 bg-black/20 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white w-64 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-xs font-bold mb-4 uppercase tracking-wider text-white/80">Background Settings</h3>

                    {/* Font Size */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] uppercase tracking-wide text-white/60">Size</label>
                            <span className="text-[10px] font-mono text-white/60">{fontSize}vw</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="40"
                            value={fontSize}
                            onChange={(e) => updateD01Settings({ fontSize: Number(e.target.value) })}
                            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>

                    {/* Fill Opacity Slider */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] uppercase tracking-wide text-white/60">Fill Opacity (Solid)</label>
                            <span className="text-[10px] font-mono text-white/60">{fillOpacity}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={fillOpacity}
                            onChange={(e) => {
                                const newOpacity = Number(e.target.value);
                                updateD01Settings({
                                    fillOpacity: newOpacity,
                                    isGlass: isGlass ? false : isGlass // Turn off glass if adjusting solid
                                });
                            }}
                            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>

                    {/* Liquid Glass Toggle */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] uppercase tracking-wide text-white/60">Liquid Glass</label>
                            <button
                                onClick={() => {
                                    const newIsGlass = !isGlass;
                                    updateD01Settings({
                                        isGlass: newIsGlass,
                                        fillOpacity: newIsGlass ? 0 : fillOpacity // If turning ON glass, set fill opacity to 0
                                    });
                                }}
                                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${isGlass ? 'bg-white' : 'bg-white/20'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-black shadow-sm transform transition-transform ${isGlass ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div className="mb-0">
                        <label className="block text-[10px] uppercase tracking-wide text-white/60 mb-2">Color</label>
                        <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg border border-white/5">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/20 shadow-inner">
                                <input
                                    type="color"
                                    value={textColor}
                                    onChange={(e) => updateD01Settings({ textColor: e.target.value })}
                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                                />
                            </div>
                            <span className="text-xs font-mono text-white/80 uppercase">{textColor}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 3D Scene Container */}
            <div
                className="relative w-full h-[500px] perspective-container z-10 flex items-center justify-center"
                style={{ perspective: '2000px' }}
            >
                {/* Global Scene Wrapper to share 3D space */}
                <div className="relative w-full h-full transform-style-3d flex items-center justify-center">

                    {/* Centered Text - Now in the 3D space */}
                    <h1
                        className={`absolute top-1/2 left-1/2 font-black whitespace-nowrap select-none pointer-events-none 
                            ${isGlass ? 'glass-text' : 'stroke-text'}`}
                        style={{
                            transform: 'translate(-50%, -50%) translateZ(0px)',
                            fontSize: `${fontSize}vw`,
                            color: isGlass ? 'transparent' : getRgba(textColor, fillOpacity),
                        }}
                    >
                        {settings.companyName.toUpperCase()}
                    </h1>

                    {/* Rotating Ring */}
                    <div
                        className={`absolute top-1/2 left-1/2 w-0 h-0 transform-style-3d ${(focusedEmployeeId && !manualResume) ? '' : 'animate-spin-cylinder'}`}
                        style={{ transform: (focusedEmployeeId && !manualResume) ? 'rotateY(0deg)' : undefined }}
                        onClick={() => setManualResume(true)}
                    >
                        {cards.map((emp, i) => {
                            const angle = (360 / count) * i;
                            return (
                                <div
                                    key={emp.id}
                                    className="absolute top-0 left-0 w-[224px] h-[320px] bg-black text-white p-5 rounded-md shadow-2xl backface-visible"
                                    style={{
                                        // 3D placement
                                        transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                                        // Center the card on its origin (half width/height)
                                        marginLeft: '-112px',
                                        marginTop: '-160px'
                                    }}
                                >
                                    {/* Card Content Construction */}
                                    <div className="flex flex-col h-full relative">
                                        {/* Top Section */}
                                        <div className="z-10">
                                            <h3 className="text-2xl font-bold leading-none mb-1.5 tracking-tight">{emp.name}</h3>
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">{emp.title}</p>
                                            <p className="text-[10px] text-gray-500 mt-1">{typeof emp.department === 'string' ? emp.department : 'General'}</p>
                                        </div>

                                        {/* Bottom Image Section */}
                                        <div className="absolute -bottom-5 -right-5 w-32 h-32 overflow-hidden rounded-tl-3xl">
                                            <img
                                                src={emp.imageUrl}
                                                alt={emp.name}
                                                className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style>{`
        .perspective-container {
            perspective: 2000px;
        }
        .transform-style-3d {
            transform-style: preserve-3d;
        }
        .stroke-text {
            -webkit-text-stroke: 2px rgba(255, 255, 255, 0.8);
        }
        @keyframes spin-cylinder {
            0% { transform: rotateY(0deg); }
            100% { transform: rotateY(-360deg); }
        }
        .animate-spin-cylinder {
            animation: spin-cylinder 50s linear infinite;
        }
        .animate-spin-cylinder:hover {
            animation-play-state: paused;
        }
        .glass-text {
            background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.4) 0%,
                rgba(255, 255, 255, 0.1) 20%,
                rgba(255, 255, 255, 0.7) 50%,
                rgba(255, 255, 255, 0.1) 80%,
                rgba(255, 255, 255, 0.4) 100%
            );
            background-size: 200% auto;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
            animation: shine 5s linear infinite;
        }
        @keyframes shine {
            to {
                background-position: 200% center;
            }
        }
      `}</style>
        </div>
    );
};
