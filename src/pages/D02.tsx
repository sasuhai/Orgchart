
import React, { useState, useEffect } from 'react';
import { Employee } from '../../types';
import { useSettings } from '../context/SettingsContext';

interface D02Props {
    employees: Employee[];
    focusedEmployeeId?: string | null;
}

export const D02: React.FC<D02Props> = ({ employees, focusedEmployeeId }) => {
    const { settings } = useSettings();
    const [manualResume, setManualResume] = useState(false);

    // Reset manual resume when search changes
    useEffect(() => {
        if (focusedEmployeeId) {
            setManualResume(false);
        }
    }, [focusedEmployeeId]);

    const cards = employees.length > 0 ? employees : Array.from({ length: 15 }).map((_, i) => ({
        id: i.toString(),
        name: 'John Doe',
        title: 'Employee',
        department: 'General',
        imageUrl: `https://picsum.photos/200/200?random=${i}`,
        parentId: null,
        roles: [],
        description: '',
        email: ''
    } as unknown as Employee));

    let displayList = cards;
    if (focusedEmployeeId) {
        const target = employees.find(e => e.id === focusedEmployeeId);
        if (target) {
            const others = cards.filter(e => e.id !== focusedEmployeeId);
            displayList = [target, ...others];
        }
    }

    const displayCards = displayList.slice(0, 20);
    const count = displayCards.length;
    const radius = Math.max(800, count * 40);

    const isPaused = focusedEmployeeId && !manualResume;

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#FF5F1F] overflow-hidden relative font-sans perspective-container flex items-center justify-center">
            {/* Background Text */}
            <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none">
                <h1 className="text-[18vw] font-black text-white/20 whitespace-nowrap leading-none tracking-tighter mix-blend-overlay">
                    {settings.companyName.toUpperCase()}
                </h1>
            </div>

            {/* Carousel Container */}
            <div className="w-full h-[600px] relative z-10 perspective-[2000px] flex items-center justify-center pointer-events-none">
                <div
                    className={`relative w-full h-full transform-style-3d pointer-events-auto ${isPaused ? '' : 'animate-spin-slow'}`}
                    style={{
                        transformOrigin: 'center center',
                        transform: isPaused ? 'rotateY(0deg)' : undefined,
                        cursor: isPaused ? 'pointer' : 'grab'
                    }}
                    onClick={() => setManualResume(true)}
                >
                    {displayCards.map((emp, i) => {
                        const angle = (i / count) * 360;
                        return (
                            <div
                                key={emp.id}
                                className="absolute top-1/2 left-1/2 w-[280px] h-[400px] bg-[#111] text-white p-6 flex flex-col justify-between shadow-2xl rounded-sm backface-hidden transition-transform duration-500 group cursor-pointer hover:scale-105 hover:z-50"
                                style={{
                                    transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)`,
                                    // Ensure clicks are captured immediately
                                    pointerEvents: 'auto'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setManualResume(true);
                                }}
                            >
                                <div>
                                    <h3 className="text-3xl font-bold mb-2 leading-tight">{emp.name}</h3>
                                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-0.5">{emp.title}</p>
                                    <p className="text-gray-500 text-xs">{typeof emp.department === 'string' ? emp.department : 'Department'}</p>
                                </div>

                                <div className="w-full flex justify-end">
                                    <div className="w-24 h-24 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                                        <img src={emp.imageUrl} alt={emp.name} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Gradient Overlays */}
            <div className="absolute top-0 bottom-0 left-0 w-[10vw] bg-gradient-to-r from-[#FF5F1F] to-transparent z-20 pointer-events-none"></div>
            <div className="absolute top-0 bottom-0 right-0 w-[10vw] bg-gradient-to-l from-[#FF5F1F] to-transparent z-20 pointer-events-none"></div>

            <style>{`
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        @keyframes spin-slow {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 80s linear infinite;
        }
        .animate-spin-slow:hover {
            animation-play-state: paused;
        }
      `}</style>
        </div>
    );
};
