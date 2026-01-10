
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { OrgChartTree } from '../../components/OrgChartTree';
import { Sidebar } from '../../components/Sidebar';
import { OnboardingForm } from '../../components/OnboardingForm';
import { Employee } from '../../types';

interface HomeProps {
    employees: Employee[];
    searchQuery: string;
    onUpdate: (updated: Employee) => void;
    onDelete: (id: string) => void;
    onAddEmployee: (newEmployee: Employee) => void;
    onMoveNode: (draggedId: string, targetId: string, position: 'inside' | 'before' | 'after') => void;
    focusedEmployeeId?: string | null;
}

export const Home: React.FC<HomeProps> = ({
    employees,
    searchQuery,
    onUpdate,
    onDelete,
    onAddEmployee,
    onMoveNode,
    focusedEmployeeId
}) => {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [showDepartmentAbove, setShowDepartmentAbove] = useState(false);
    // Initialize expandedIds with all IDs on first load or prop?
    // Since Home remounts on route change, we might lose expanded state.
    // Ideally this should be lifted, but for now let's keep it here.
    const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(employees.map(e => e.id)));
    const [showPhotos, setShowPhotos] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isOnboarding, setIsOnboarding] = useState(false);
    const [initialParentId, setInitialParentId] = useState<string | null>(null);

    const handleSelect = useCallback((id: string) => {
        setSelectedEmployeeId(id);
    }, []);

    useEffect(() => {
        if (focusedEmployeeId) {
            handleSelect(focusedEmployeeId);
        }
    }, [focusedEmployeeId, handleSelect]);

    const foundEmployees = useMemo(() => {
        if (!searchQuery) return [];
        return employees
            .filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(e => e.id);
    }, [employees, searchQuery]);

    const handleAddChild = useCallback((parentId: string) => {
        setInitialParentId(parentId);
        setIsOnboarding(true);
    }, []);

    const handleOnboardSave = useCallback((data: Partial<Employee>) => {
        const newEmployee: Employee = {
            id: Date.now().toString(),
            name: data.name || 'Unknown',
            title: data.title || 'Untitled Role',
            department: data.department!,
            imageUrl: data.imageUrl || `https://picsum.photos/200/200?random=${Date.now()}`,
            parentId: data.parentId || null,
            roles: [],
            description: data.description || '',
            email: data.email || ''
        };
        onAddEmployee(newEmployee);
        setExpandedIds(prev => new Set([...prev, newEmployee.id]));
        setIsOnboarding(false);
        setInitialParentId(null);
    }, [onAddEmployee]);

    const handleZoom = (delta: number) => {
        setZoom(prev => Math.min(Math.max(0.5, prev + delta), 2));
    };

    const handleToggleExpandAll = () => {
        if (expandedIds.size > 0) {
            setExpandedIds(new Set());
        } else {
            setExpandedIds(new Set(employees.map(e => e.id)));
        }
    };

    const handleToggleNode = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        setIsDragging(true);
        setStartPos({ x: e.pageX, y: e.pageY });
        setScrollPos({
            left: containerRef.current.scrollLeft,
            top: containerRef.current.scrollTop
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current) return;
        e.preventDefault();
        const x = e.pageX - startPos.x;
        const y = e.pageY - startPos.y;
        containerRef.current.scrollLeft = scrollPos.left - x;
        containerRef.current.scrollTop = scrollPos.top - y;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleUpdateInternal = useCallback((updated: Employee) => {
        onUpdate(updated);
        setSelectedEmployeeId(null);
    }, [onUpdate]);

    const handleDeleteInternal = useCallback((id: string) => {
        onDelete(id);
        setSelectedEmployeeId(null);
    }, [onDelete]);


    return (
        <div className="flex flex-1 overflow-hidden relative h-[calc(100vh-64px)]">
            <main
                ref={containerRef}
                className={`flex-1 relative overflow-auto bg-background-light dark:bg-background-dark bg-grid-pattern ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div
                    className="min-w-full w-fit min-h-full flex flex-col pt-20 pb-40 px-20 origin-top transition-transform duration-300"
                    id="chart-canvas"
                    style={{ transform: `scale(${zoom})` }}
                >
                    <OrgChartTree
                        employees={employees}
                        parentId={null}
                        selectedEmployeeId={selectedEmployeeId}
                        foundEmployeeIds={foundEmployees}
                        onSelect={handleSelect}
                        onAddChild={handleAddChild}
                        showDepartmentAbove={showDepartmentAbove}
                        onMoveNode={onMoveNode}
                        expandedIds={expandedIds}
                        onToggleExpand={handleToggleNode}
                        showPhotos={showPhotos}
                        isEditMode={isEditMode}
                    />
                </div>

                {/* Floating Toolbar */}
                <div className="absolute top-8 right-8 z-40">
                    <div className="flex items-center gap-1 p-2 bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-gray-700">

                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`p-2.5 rounded-lg transition-colors ${isEditMode
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            title={isEditMode ? "Switch to View Only" : "Switch to Edit Mode"}
                        >
                            <span className="material-symbols-outlined text-xl">{isEditMode ? 'edit' : 'visibility'}</span>
                        </button>

                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1"></div>

                        <button
                            onClick={() => setShowDepartmentAbove(!showDepartmentAbove)}
                            className={`p-2.5 rounded-lg transition-colors ${showDepartmentAbove ? 'text-primary bg-primary/10' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            title={showDepartmentAbove ? "Show Department Inside Card" : "Show Department Above Card"}
                        >
                            <span className="material-symbols-outlined text-xl">domain</span>
                        </button>

                        <button
                            onClick={() => setShowPhotos(!showPhotos)}
                            className={`p-2.5 rounded-lg transition-colors ${showPhotos ? 'text-primary bg-primary/10' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            title={showPhotos ? "Hide Photos" : "Show Photos"}
                        >
                            <span className="material-symbols-outlined text-xl">image</span>
                        </button>

                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1"></div>

                        <button
                            onClick={handleToggleExpandAll}
                            className={`p-2.5 rounded-lg transition-colors ${expandedIds.size > 0 ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-gray-400'}`}
                            title={expandedIds.size > 0 ? "Collapse All" : "Expand All"}
                        >
                            <span className="material-symbols-outlined text-xl">{expandedIds.size > 0 ? 'unfold_less' : 'unfold_more'}</span>
                        </button>

                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1"></div>

                        <button onClick={() => handleZoom(0.1)} className="p-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Zoom In">
                            <span className="material-symbols-outlined text-xl">add</span>
                        </button>
                        <button onClick={() => handleZoom(-0.1)} className="p-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Zoom Out">
                            <span className="material-symbols-outlined text-xl">remove</span>
                        </button>
                        <button onClick={() => setZoom(1)} className="p-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Reset Zoom">
                            <span className="material-symbols-outlined text-xl">center_focus_strong</span>
                        </button>

                        {isEditMode && (
                            <>
                                <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1"></div>
                                <button
                                    onClick={() => { setInitialParentId(null); setIsOnboarding(true); }}
                                    className="flex items-center justify-center p-2.5 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors"
                                    title="Add New Node"
                                >
                                    <span className="material-symbols-outlined text-xl">person_add</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <Sidebar
                    employee={employees.find(e => e.id === selectedEmployeeId) || null}
                    employees={employees}
                    onClose={() => setSelectedEmployeeId(null)}
                    onUpdate={handleUpdateInternal}
                    onDelete={handleDeleteInternal}
                    isEditMode={isEditMode}
                />

                {isOnboarding && (
                    <OnboardingForm
                        onClose={() => setIsOnboarding(false)}
                        onSave={handleOnboardSave}
                        employees={employees}
                        initialParentId={initialParentId}
                    />
                )}
            </main>
        </div>
    );
};
