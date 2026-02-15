import React, { useEffect, useRef } from 'react';
import { Employee } from '../../types';
import {
    ArrowUpRight,
    Compass,
    Gavel,
    Instagram,
    Linkedin,
    Music,
    PawPrint,
    Trophy,
    Twitter,
} from 'lucide-react';

interface D07Props {
    employees: Employee[];
    focusedEmployeeId?: string | null;
}

export const D07: React.FC<D07Props> = () => {
    const mainRef = useRef<HTMLDivElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);
    const card1Ref = useRef<HTMLDivElement>(null);
    const card2Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const existing = document.getElementById('d07-inter-font');
        if (!existing) {
            const link = document.createElement('link');
            link.id = 'd07-inter-font';
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap';
            document.head.appendChild(link);
        }

        const resolveScrollParent = () => {
            if (!mainRef.current) return null;
            return mainRef.current.closest('[data-scroll-container]') as HTMLElement | null;
        };

        let latestScrollTop = 0;
        let rafId = 0;
        const update = () => {
            if (!mainRef.current) return;
            const scrollParent = resolveScrollParent();
            const sectionTop = mainRef.current.offsetTop;
            const scrollTop = scrollParent ? scrollParent.scrollTop : window.scrollY;
            latestScrollTop = scrollTop;
            const scrollY = Math.max(0, scrollTop - sectionTop);

            const speed = 1.3;
            const y1 = Math.max(0, scrollY * speed);
            const y2 = Math.max(0, (scrollY - 400) * speed);
            const y1Rounded = Math.round(y1);
            const y2Rounded = Math.round(y2);

            if (card1Ref.current) {
                card1Ref.current.style.transform = y1Rounded > 0
                    ? `translateY(-${y1Rounded}px) rotate(${-y1Rounded * 0.02}deg)`
                    : 'translateY(0) rotate(0deg)';
            }

            if (card2Ref.current) {
                card2Ref.current.style.transform = y2Rounded > 0
                    ? `translateY(-${y2Rounded}px) rotate(${-3 + (y2Rounded * 0.02)}deg)`
                    : 'translateY(0) rotate(-3deg)';
            }

            if (stickyRef.current && scrollParent) {
                const sectionHeight = mainRef.current.offsetHeight;
                const viewportHeight = scrollParent.clientHeight;
                const start = sectionTop;
                const end = start + sectionHeight - viewportHeight;
                const translate = Math.min(Math.max(scrollTop - start, 0), Math.max(end - start, 0));
                stickyRef.current.style.transform = `translateY(${Math.round(translate)}px)`;
            }
        };

        const syncStickyHeight = () => {
            const scrollParent = resolveScrollParent();
            if (!stickyRef.current || !scrollParent) return;
            stickyRef.current.style.height = `${scrollParent.clientHeight}px`;
        };

        const tick = () => {
            update();
            rafId = window.requestAnimationFrame(tick);
        };

        syncStickyHeight();
        update();
        const target = resolveScrollParent() ?? window;
        target.addEventListener('scroll', update as EventListener, { passive: true });
        window.addEventListener('resize', syncStickyHeight);
        return () => {
            target.removeEventListener('scroll', update as EventListener);
            window.removeEventListener('resize', syncStickyHeight);
            window.cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <div className="bg-[#f2f2f2] text-gray-900 overflow-x-hidden antialiased selection:bg-gray-900 selection:text-white min-h-screen font-sans">
            <style>{`
                html { scroll-behavior: smooth; }
                ::-webkit-scrollbar { width: 0px; background: transparent; }
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .animate-marquee { animation: marquee 40s linear infinite; }
                .card { transition: transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: transform; transform-style: preserve-3d; backface-visibility: hidden; }
                .line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
                .d07-aspect { aspect-ratio: 3 / 4; }
                @media (min-width: 768px) { .d07-aspect { aspect-ratio: 4 / 3; } }
            `}</style>

            <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <div className="flex whitespace-nowrap animate-marquee opacity-[0.03]">
                    <span className="text-[30vh] leading-none font-bold tracking-tighter text-black mx-4 uppercase">Capabilities</span>
                    <span className="text-[30vh] leading-none font-bold tracking-tighter text-black mx-4 uppercase">Capabilities</span>
                </div>
            </div>

            <main ref={mainRef} className="relative z-10" style={{ height: '220vh' }}>
                <div
                    ref={stickyRef}
                    className="w-full flex flex-col items-center justify-center overflow-hidden"
                    style={{ height: '100vh', perspective: '1000px', position: 'absolute', top: 0, left: 0, right: 0 }}
                >
                    <div className="relative w-full max-w-[90vw] md:max-w-3xl d07-aspect flex items-center justify-center">
                        <div
                            id="card-3"
                            className="card absolute inset-0 w-full h-full rounded-2xl md:rounded-3xl origin-bottom"
                            style={{ transform: 'translateY(0) rotate(6deg)' }}
                        >
                            <div className="absolute top-10 left-6 right-6 bottom-[-20px] bg-gradient-to-b from-gray-900/20 to-black/80 blur-2xl rounded-[inherit] -z-10"></div>
                            <div className="relative w-full h-full rounded-[inherit] overflow-hidden bg-gray-800 shadow-inner">
                                <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover brightness-75" alt="Fashion Design" />
                            </div>
                        </div>

                        <div
                            id="card-2"
                            ref={card2Ref}
                            className="card absolute inset-0 w-full h-full rounded-2xl md:rounded-3xl origin-bottom"
                            style={{ transform: 'translateY(0) rotate(-3deg)' }}
                        >
                            <div className="absolute top-8 left-6 right-6 bottom-[-25px] bg-gradient-to-b from-gray-800/30 to-black/90 blur-2xl rounded-[inherit] -z-10"></div>
                            <div className="relative w-full h-full rounded-[inherit] overflow-hidden bg-gray-700 shadow-inner">
                                <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2020&auto=format&fit=crop" className="w-full h-full object-cover" alt="Editorial" />
                            </div>
                        </div>

                        <div
                            id="card-1"
                            ref={card1Ref}
                            className="card absolute inset-0 w-full h-full rounded-2xl md:rounded-3xl origin-center"
                            style={{ transform: 'translateY(0) rotate(0deg)', zIndex: 30 }}
                        >
                            <div
                                className="absolute inset-0 rounded-2xl md:rounded-3xl ring-1 ring-black/10 pointer-events-none"
                                style={{ opacity: 0.08 }}
                            ></div>
                            <div className="absolute top-12 left-8 right-8 bottom-[-40px] bg-gradient-to-br from-black/40 via-black/60 to-black blur-[40px] rounded-[inherit] -z-10 opacity-90"></div>

                            <div className="relative w-full h-full rounded-[inherit] overflow-hidden bg-gray-100 ring-1 ring-white/10">
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2864&auto=format&fit=crop" className="w-full h-full object-cover" alt="Portrait" />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

                                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div className="max-w-md">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white uppercase tracking-wider border border-white/20">Photography</span>
                                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white uppercase tracking-wider border border-white/20">2024</span>
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white leading-[1.1] mb-2">
                                            Capturing <br /> human essence.
                                        </h2>
                                        <p className="text-gray-300 text-base md:text-lg leading-relaxed line-clamp-2 hidden md:block">
                                            An exploration of light, shadow, and the raw emotion found in portraiture across urban environments.
                                        </p>
                                    </div>

                                    <button className="group relative inline-flex items-center gap-2 bg-white text-black pl-6 pr-4 py-4 rounded-full text-sm font-semibold hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 whitespace-nowrap shadow-lg">
                                        <span>View Project</span>
                                        <div className="bg-black text-white rounded-full p-1 group-hover:rotate-45 transition-transform duration-300">
                                            <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <section className="relative z-20 bg-[#f2f2f2] pt-32 pb-32 overflow-hidden">
                <div className="flex flex-col items-center justify-center text-center mb-24 px-6">
                    <h3 className="text-xl md:text-2xl font-medium tracking-tight text-gray-900 mb-6">Legion Design Creative Agency</h3>
                    <button className="group bg-black text-white pl-4 pr-5 py-2.5 rounded-lg text-sm font-semibold hover:scale-105 transition-transform flex items-center gap-2.5 shadow-xl shadow-black/10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        Learn More
                    </button>
                </div>

                <div className="w-full max-w-[95vw] md:max-w-7xl mx-auto px-6 md:px-10 mb-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tighter text-gray-900 leading-[1.05] max-w-4xl">
                            We team up with visionary <br className="hidden md:block" />
                            brands to create work that <br className="hidden md:block" />
                            leaves a <span className="text-gray-300">lasting mark.</span>
                        </h2>
                        <p className="text-lg md:text-xl font-medium text-gray-600 mb-1 md:mb-3 whitespace-nowrap">
                            (they love us btw)
                        </p>
                    </div>
                </div>

                <div className="w-full flex overflow-hidden">
                    <div className="flex gap-6 animate-marquee whitespace-nowrap min-w-full px-3">
                        <div className="bg-white rounded-2xl w-64 h-32 flex items-center justify-center gap-3 shrink-0 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-1"><Trophy className="w-7 h-7 text-black" strokeWidth={0} fill="currentColor" /></div>
                            <span className="text-2xl font-semibold tracking-tight text-gray-900">Rise</span>
                        </div>
                        <div className="bg-white rounded-2xl w-64 h-32 flex items-center justify-center gap-3 shrink-0 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-1"><Music className="w-7 h-7 text-black" strokeWidth={0} fill="currentColor" /></div>
                            <span className="text-2xl font-semibold tracking-tight text-gray-900">Volume</span>
                        </div>
                        <div className="bg-white rounded-2xl w-64 h-32 flex items-center justify-center gap-3 shrink-0 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-1"><Compass className="w-7 h-7 text-black" strokeWidth={2} /></div>
                            <span className="text-2xl font-semibold tracking-tight text-gray-900">Trace</span>
                        </div>
                        <div className="bg-white rounded-2xl w-64 h-32 flex items-center justify-center gap-3 shrink-0 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-1"><Gavel className="w-7 h-7 text-black" strokeWidth={0} fill="currentColor" /></div>
                            <span className="text-2xl font-semibold tracking-tight text-gray-900">Rise</span>
                        </div>
                        <div className="bg-white rounded-2xl w-64 h-32 flex items-center justify-center gap-3 shrink-0 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-1"><PawPrint className="w-7 h-7 text-black" strokeWidth={0} fill="currentColor" /></div>
                            <span className="text-2xl font-semibold tracking-tight text-gray-900">Clues</span>
                        </div>
                        <div className="bg-white rounded-2xl w-64 h-32 flex items-center justify-center gap-3 shrink-0 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-1"><Music className="w-7 h-7 text-black" strokeWidth={0} fill="currentColor" /></div>
                            <span className="text-2xl font-semibold tracking-tight text-gray-900">Volume</span>
                        </div>

                        <div className="bg-white rounded-2xl w-64 h-32 flex items-center justify-center gap-3 shrink-0 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-1"><Trophy className="w-7 h-7 text-black" strokeWidth={0} fill="currentColor" /></div>
                            <span className="text-2xl font-semibold tracking-tight text-gray-900">Rise</span>
                        </div>
                        <div className="bg-white rounded-2xl w-64 h-32 flex items-center justify-center gap-3 shrink-0 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-1"><Music className="w-7 h-7 text-black" strokeWidth={0} fill="currentColor" /></div>
                            <span className="text-2xl font-semibold tracking-tight text-gray-900">Volume</span>
                        </div>
                        <div className="bg-white rounded-2xl w-64 h-32 flex items-center justify-center gap-3 shrink-0 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-1"><Compass className="w-7 h-7 text-black" strokeWidth={2} /></div>
                            <span className="text-2xl font-semibold tracking-tight text-gray-900">Trace</span>
                        </div>
                        <div className="bg-white rounded-2xl w-64 h-32 flex items-center justify-center gap-3 shrink-0 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-1"><Gavel className="w-7 h-7 text-black" strokeWidth={0} fill="currentColor" /></div>
                            <span className="text-2xl font-semibold tracking-tight text-gray-900">Rise</span>
                        </div>
                        <div className="bg-white rounded-2xl w-64 h-32 flex items-center justify-center gap-3 shrink-0 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-1"><PawPrint className="w-7 h-7 text-black" strokeWidth={0} fill="currentColor" /></div>
                            <span className="text-2xl font-semibold tracking-tight text-gray-900">Clues</span>
                        </div>
                        <div className="bg-white rounded-2xl w-64 h-32 flex items-center justify-center gap-3 shrink-0 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-1"><Music className="w-7 h-7 text-black" strokeWidth={0} fill="currentColor" /></div>
                            <span className="text-2xl font-semibold tracking-tight text-gray-900">Volume</span>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="relative z-20 bg-[#f2f2f2] pb-12 pt-12 flex flex-col items-center justify-center text-center">
                <h2 className="text-3xl md:text-6xl font-semibold tracking-tighter text-gray-900 mb-12 max-w-4xl px-6 leading-tight">
                    We build digital experiences <br /> that people love.
                </h2>

                <div className="w-full max-w-6xl px-6 border-t border-gray-300 pt-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900 mb-1">Get in touch</p>
                        <a href="mailto:hello@sensorylab.com" className="text-xl md:text-2xl text-gray-500 hover:text-black transition-colors">hello@sensorylab.com</a>
                    </div>

                    <div className="flex gap-6">
                        <a href="#" className="text-gray-500 hover:text-black transition-colors"><Instagram className="w-6 h-6" strokeWidth={1.5} /></a>
                        <a href="#" className="text-gray-500 hover:text-black transition-colors"><Twitter className="w-6 h-6" strokeWidth={1.5} /></a>
                        <a href="#" className="text-gray-500 hover:text-black transition-colors"><Linkedin className="w-6 h-6" strokeWidth={1.5} /></a>
                    </div>

                    <p className="text-sm text-gray-400">© 2024 Sensory Lab Agency.</p>
                </div>
            </footer>
        </div>
    );
};
