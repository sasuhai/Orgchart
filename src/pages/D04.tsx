import React, { useState, useEffect } from 'react';
import { Employee } from '../../types';
import { useSettings } from '../context/SettingsContext';

interface D04Props {
    employees: Employee[];
    focusedEmployeeId?: string | null;
}

export const D04: React.FC<D04Props> = ({ employees, focusedEmployeeId }) => {
    const { settings } = useSettings();
    const [manualResume, setManualResume] = useState(false);

    // Reset manual resume when search changes
    useEffect(() => {
        if (focusedEmployeeId) {
            setManualResume(false);
        }
    }, [focusedEmployeeId]);

    // Ensure we have enough data to scroll smoothly
    const displayEmployees = employees.length > 0 ? employees : Array.from({ length: 5 }).map((_, i) => ({
        id: `mock-${i}`,
        name: `Employee ${i}`,
        title: 'Team Member',
        department: 'General',
        imageUrl: `https://picsum.photos/400/500?random=${i}`,
        description: 'A dedicated team member contributing to our success with passion and expertise.',
    } as unknown as Employee));

    // double the list for infinite scroll
    let finalDisplay = displayEmployees;
    if (focusedEmployeeId) {
        const target = employees.find(e => e.id === focusedEmployeeId);
        if (target) {
            const others = displayEmployees.filter(e => e.id !== focusedEmployeeId);
            finalDisplay = [target, ...others];
        }
    }

    const scrollList = [...finalDisplay, ...finalDisplay];

    return (
        <section className="overflow-hidden bg-[#fafafa] pt-32 pb-40 relative min-h-screen flex flex-col justify-center" id="reviews">

            {/* Giant Background Text */}
            <div className="absolute top-[10%] left-0 right-0 w-full text-center pointer-events-none select-none z-0">
                <h2 className="text-[18vw] font-bold tracking-tighter text-neutral-200/50 leading-none">
                    {settings.companyName}
                </h2>
            </div>

            <div className="md:px-12 z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mr-auto ml-auto pr-6 pl-6 relative gap-x-12 gap-y-12 items-end">

                {/* Left Controls/Info */}
                <div className="lg:col-span-4 flex flex-col h-full justify-start">
                    <div className="mt-4 mb-8">
                        <span className="text-xs font-semibold text-orange-600 uppercase tracking-widest mb-4 block">
                            [ OUR PEOPLE ]
                        </span>
                        <p className="text-neutral-500 text-sm leading-relaxed max-w-xs">
                            Meet the talented individuals who drive our success. Their dedication and expertise make our company what it is today.
                        </p>
                    </div>
                </div>

                {/* Right Carousel */}
                <div className="lg:col-span-8 relative overflow-hidden"
                    style={{
                        maskImage: 'linear-gradient(90deg, transparent, black 15%, black 85%, transparent)',
                        WebkitMaskImage: 'linear-gradient(90deg, transparent, black 15%, black 85%, transparent)'
                    }}>

                    {/* Animated track */}
                    <div className="testimonial-track flex pb-4 gap-x-6 gap-y-6">
                        {scrollList.map((employee, index) => (
                            <div
                                key={`${employee.id}-${index}`}
                                className="group testimonial-card min-w-[300px] md:min-w-[340px] bg-white p-4 border border-neutral-100 shadow-sm flex-shrink-0"
                            >
                                <div className="relative h-64 w-full mb-4 overflow-hidden bg-neutral-100 rounded-sm">
                                    <img
                                        src={employee.imageUrl}
                                        alt={employee.name}
                                        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:translate-x-3 cursor-pointer"
                                        onClick={() => setManualResume(true)}
                                    />
                                    <div className="absolute top-2 right-2 bg-white px-2 py-1 text-[10px] font-bold text-orange-600 uppercase tracking-wide">
                                        {employee.department || 'Team'}
                                    </div>
                                </div>
                                <p className="text-xs text-neutral-600 leading-relaxed mb-6 h-20 overflow-hidden line-clamp-4">
                                    "{employee.description || 'No description available for this team member.'}"
                                </p>
                                <div className="flex justify-between items-end border-t border-neutral-100 pt-4">
                                    <span className="text-xs font-bold text-neutral-900">{employee.name}</span>
                                    <span className="text-[10px] text-neutral-400 uppercase">{employee.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .testimonial-track {
                    width: max-content;
                    animation: testimonial-scroll 40s linear infinite;
                    animation-play-state: ${(focusedEmployeeId && !manualResume) ? 'paused' : 'running'};
                }

                ${(focusedEmployeeId && !manualResume) ? `
                .testimonial-track {
                    animation: none !important;
                    transform: translateX(0) !important;
                }
                ` : ''}

                /* Pause on hover so users can read comfortably */
                .testimonial-track:hover {
                    animation-play-state: paused;
                }

                @keyframes testimonial-scroll {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(-50%);
                    }
                }
            `}</style>
        </section>
    );
};
