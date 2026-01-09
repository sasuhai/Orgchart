
import React, { useMemo } from 'react';
import { Employee } from '../../types';

interface D01Props {
    employees: Employee[];
}

export const D01: React.FC<D01Props> = ({ employees }) => {
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
        return list.slice(0, 15); // Limit to 15 for optimal visual
    }, [employees]);

    const count = cards.length;
    // Radius calculation: Circumference = width_of_card * count * gap_factor
    // Radius = Circumference / (2 * PI)
    // Original card width 280 -> Reduced by 20% -> 224
    const cardWidth = 224;
    const gap = 1.2; // space between cards
    const radius = Math.max(800, (cardWidth * count * gap) / (2 * Math.PI));

    return (
        <div className="w-full h-[calc(100vh-64px)] bg-[#FF4500] overflow-hidden relative font-sans flex items-center justify-center">

            {/* 3D Scene Container */}
            <div
                className="relative w-full h-[500px] perspective-container z-10 flex items-center justify-center"
                style={{ perspective: '2000px' }}
            >
                {/* Global Scene Wrapper to share 3D space */}
                <div className="relative w-full h-full transform-style-3d flex items-center justify-center">

                    {/* Centered Text - Now in the 3D space */}
                    <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[18vw] font-black text-transparent stroke-text whitespace-nowrap opacity-20 select-none pointer-events-none z-0"
                        style={{ transform: 'translate(-50%, -50%) translateZ(0px)' }}
                    >
                        ORGCHART PRO
                    </h1>

                    {/* Rotating Ring */}
                    <div className="absolute top-1/2 left-1/2 w-0 h-0 transform-style-3d animate-spin-cylinder z-10">
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
      `}</style>
        </div>
    );
};
