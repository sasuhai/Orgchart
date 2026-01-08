
import React, { useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { OrgChartTree } from './components/OrgChartTree';
import { Sidebar } from './components/Sidebar';
import { OnboardingForm } from './components/OnboardingForm';
import { INITIAL_EMPLOYEES } from './constants';
import { Employee, TreeState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<TreeState>({
    // Fix typo from INITIAL_EMPLOYES to INITIAL_EMPLOYEES
    employees: INITIAL_EMPLOYEES,
    selectedEmployeeId: null,
    searchQuery: '',
    zoom: 1,
    showDepartmentAbove: false,
    expandedIds: new Set(INITIAL_EMPLOYEES.map(e => e.id)),
    showPhotos: true
  });

  const [isOnboarding, setIsOnboarding] = useState(false);
  const [initialParentId, setInitialParentId] = useState<string | null>(null);

  const foundEmployees = useMemo(() => {
    if (!state.searchQuery) return [];
    return state.employees
      .filter(e => e.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        e.title.toLowerCase().includes(state.searchQuery.toLowerCase()))
      .map(e => e.id);
  }, [state.employees, state.searchQuery]);

  const handleSelect = useCallback((id: string) => {
    setState(prev => ({ ...prev, selectedEmployeeId: id }));
  }, []);

  const handleUpdate = useCallback((updated: Employee) => {
    setState(prev => ({
      ...prev,
      employees: prev.employees.map(e => e.id === updated.id ? updated : e),
      selectedEmployeeId: null
    }));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      employees: prev.employees.filter(e => e.id !== id).map(e => e.parentId === id ? { ...e, parentId: null } : e),
      selectedEmployeeId: null
    }));
  }, []);

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
    setState(prev => ({
      ...prev,
      employees: [...prev.employees, newEmployee],
      expandedIds: new Set([...prev.expandedIds, newEmployee.id]) // Auto-expand new/parent? Maybe not needed strictly but safe
    }));
    setIsOnboarding(false);
    setInitialParentId(null);
  }, []);

  const handleMoveNode = useCallback((draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;

    setState(prev => {
      const draggedNode = prev.employees.find(e => e.id === draggedId);
      const targetNode = prev.employees.find(e => e.id === targetId);

      if (!draggedNode || !targetNode) return prev;

      // Case 1: Reordering siblings (same parent)
      if (draggedNode.parentId === targetNode.parentId) {
        const otherEmployees = prev.employees.filter(e => e.id !== draggedId);
        const targetIndex = otherEmployees.findIndex(e => e.id === targetId);

        // Insert dragged node at target index
        const newEmployees = [...otherEmployees];
        newEmployees.splice(targetIndex, 0, draggedNode);

        return {
          ...prev,
          employees: newEmployees
        };
      }

      // Case 2: Reparenting (different parents or different levels)
      // Helper to check if target is a descendant of dragged (prevent cycles)
      const isDescendant = (parentId: string, childId: string, list: Employee[]): boolean => {
        if (parentId === childId) return true;
        const children = list.filter(e => e.parentId === parentId);
        for (const child of children) {
          if (isDescendant(child.id, childId, list)) return true;
        }
        return false;
      };

      if (isDescendant(draggedId, targetId, prev.employees)) {
        console.warn("Cannot move a node into its own descendant");
        return prev;
      }

      return {
        ...prev,
        employees: prev.employees.map(e =>
          e.id === draggedId ? { ...e, parentId: targetId } : e
        )
      };
    });
  }, []);

  const handleZoom = (delta: number) => {
    setState(prev => ({ ...prev, zoom: Math.min(Math.max(0.5, prev.zoom + delta), 2) }));
  };

  const checkAllExpanded = useMemo(() => {
    // Basic heuristic: check if expandedIds size covers most employees, or just simply if it's > 0
    // Better: toggle between "Expand All" and "Collapse All"
    // For simplicity, let's provide two buttons or a smart toggle.
    // Let's implement independent buttons for expand all / collapse all.
    return state.expandedIds.size === state.employees.length;
  }, [state.expandedIds, state.employees]);

  const handleToggleExpandAll = () => {
    if (state.expandedIds.size > 0) {
      // If any expanded, collapse all
      setState(prev => ({ ...prev, expandedIds: new Set() }));
    } else {
      // Expand all
      setState(prev => ({ ...prev, expandedIds: new Set(prev.employees.map(e => e.id)) }));
    }
  };

  const handleToggleNode = (id: string) => {
    setState(prev => {
      const next = new Set(prev.expandedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, expandedIds: next };
    });
  };

  // Panning State
  const containerRef = React.useRef<HTMLDivElement>(null);
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

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header
        searchQuery={state.searchQuery}
        onSearchChange={(q) => setState(prev => ({ ...prev, searchQuery: q }))}
        onExport={() => alert('Exporting organizational data to PDF/JSON...')}
      />

      <div className="flex flex-1 overflow-hidden relative">
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
            style={{ transform: `scale(${state.zoom})` }}
          >
            <OrgChartTree
              employees={state.employees}
              parentId={null}
              selectedEmployeeId={state.selectedEmployeeId}
              foundEmployeeIds={foundEmployees}
              onSelect={handleSelect}
              onAddChild={handleAddChild}
              showDepartmentAbove={state.showDepartmentAbove}
              onMoveNode={handleMoveNode}
              expandedIds={state.expandedIds}
              onToggleExpand={handleToggleNode}
              showPhotos={state.showPhotos}
            />
          </div>

          {/* Floating Toolbar */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="flex items-center gap-1 p-2 bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setState(prev => ({ ...prev, showDepartmentAbove: !prev.showDepartmentAbove }))}
                className={`p-2.5 rounded-lg transition-colors ${state.showDepartmentAbove ? 'text-primary bg-primary/10' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                title={state.showDepartmentAbove ? "Show Department Inside Card" : "Show Department Above Card"}
              >
                <span className="material-symbols-outlined text-xl">domain</span>
              </button>

              <button
                onClick={() => setState(prev => ({ ...prev, showPhotos: !prev.showPhotos }))}
                className={`p-2.5 rounded-lg transition-colors ${state.showPhotos ? 'text-primary bg-primary/10' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                title={state.showPhotos ? "Hide Photos" : "Show Photos"}
              >
                <span className="material-symbols-outlined text-xl">image</span>
              </button>

              <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1"></div>

              <button
                onClick={handleToggleExpandAll}
                className={`p-2.5 rounded-lg transition-colors ${state.expandedIds.size > 0 ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-gray-400'}`}
                title={state.expandedIds.size > 0 ? "Collapse All" : "Expand All"}
              >
                <span className="material-symbols-outlined text-xl">{state.expandedIds.size > 0 ? 'unfold_less' : 'unfold_more'}</span>
              </button>

              <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1"></div>

              <button onClick={() => handleZoom(0.1)} className="p-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Zoom In">
                <span className="material-symbols-outlined text-xl">add</span>
              </button>
              <button onClick={() => handleZoom(-0.1)} className="p-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Zoom Out">
                <span className="material-symbols-outlined text-xl">remove</span>
              </button>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1"></div>
              <button onClick={() => setState(prev => ({ ...prev, zoom: 1 }))} className="p-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Reset Zoom">
                <span className="material-symbols-outlined text-xl">center_focus_strong</span>
              </button>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1"></div>
              <button
                onClick={() => { setInitialParentId(null); setIsOnboarding(true); }}
                className="flex items-center justify-center p-2.5 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors"
                title="Add New Node"
              >
                <span className="material-symbols-outlined text-xl">person_add</span>
              </button>
            </div>
          </div>
        </main>

        <Sidebar
          employee={state.employees.find(e => e.id === state.selectedEmployeeId) || null}
          onClose={() => setState(prev => ({ ...prev, selectedEmployeeId: null }))}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>

      {isOnboarding && (
        <OnboardingForm
          onClose={() => setIsOnboarding(false)}
          onSave={handleOnboardSave}
          employees={state.employees}
          initialParentId={initialParentId}
        />
      )}
    </div>
  );
};

export default App;
