import React, { useState, useCallback, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './src/pages/Home';
import { D01 } from './src/pages/D01';
import { D02 } from './src/pages/D02';
import { D03 } from './src/pages/D03';
import { D04 } from './src/pages/D04';
import { D05 } from './src/pages/D05';
import { INITIAL_EMPLOYEES } from './constants';
import { Employee } from './types';
import { useSettings } from './src/context/SettingsContext';

// Helper to force redirect to home on initial load/refresh if desired
const RedirectToHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only redirect if we are not at root and we haven't redirected yet in this session logic
    // Actually, on refresh, hasRedirected is false.
    if (!hasRedirected.current && location.pathname !== '/') {
      hasRedirected.current = true;
      navigate('/', { replace: true });
    }
  }, [navigate, location]);

  return null;
};

const App: React.FC = () => {
  // Always load from static JSON on initial load
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [fileHandle, setFileHandle] = useState<any>(null);

  const lastSavedEmployees = useRef(employees);

  // Autosave ONLY if a file handle is active (user explicitly imported/exported)
  useEffect(() => {
    // Skip if data hasn't changed (reference check works because we use immutable updates)
    if (employees === lastSavedEmployees.current) {
      return;
    }
    lastSavedEmployees.current = employees;

    let timeoutId: any;

    const saveData = async () => {
      if (fileHandle) {
        setSaveStatus('saving');
        try {
          const writable = await fileHandle.createWritable();
          await writable.write(JSON.stringify(employees, null, 2));
          await writable.close();
          setSaveStatus('saved');
        } catch (err) {
          console.error("Autosave failed", err);
          setSaveStatus('unsaved');
        }
      } else {
        setSaveStatus('unsaved');
      }
    };

    // Debounce save
    timeoutId = setTimeout(saveData, 1000);

    return () => clearTimeout(timeoutId);
  }, [employees, fileHandle]);

  // Warn on closing if unsaved
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'unsaved') {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  const handleUpdate = useCallback((updated: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id).map(e => e.parentId === id ? { ...e, parentId: null } : e));
  }, []);

  const handleAddEmployee = useCallback((newEmployee: Employee) => {
    setEmployees(prev => [...prev, newEmployee]);
  }, []);

  const handleMoveNode = useCallback((draggedId: string, targetId: string, position: 'inside' | 'before' | 'after') => {
    if (draggedId === targetId) return;

    setEmployees(prev => {
      const draggedNode = prev.find(e => e.id === draggedId);
      const targetNode = prev.find(e => e.id === targetId);

      if (!draggedNode || !targetNode) return prev;

      const otherEmployees = prev.filter(e => e.id !== draggedId);

      if (position === 'before' || position === 'after') {
        if (draggedNode.parentId === targetNode.parentId) {
          const targetIndex = otherEmployees.findIndex(e => e.id === targetId);
          const newEmployees = [...otherEmployees];
          const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
          newEmployees.splice(insertIndex, 0, draggedNode);
          return newEmployees;
        } else {
          const newParentId = targetNode.parentId;
          const targetIndex = otherEmployees.findIndex(e => e.id === targetId);
          const newEmployees = [...otherEmployees];
          const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
          const updatedDraggedNode = { ...draggedNode, parentId: newParentId };
          newEmployees.splice(insertIndex, 0, updatedDraggedNode);
          return newEmployees;
        }
      }

      const isDescendant = (parentId: string, childId: string, list: Employee[]): boolean => {
        if (parentId === childId) return true;
        const children = list.filter(e => e.parentId === parentId);
        for (const child of children) {
          if (isDescendant(child.id, childId, list)) return true;
        }
        return false;
      };

      if (isDescendant(draggedId, targetId, prev)) {
        console.warn("Cannot move a node into its own descendant");
        return prev;
      }

      return prev.map(e =>
        e.id === draggedId ? { ...e, parentId: targetId } : e
      );
    });
  }, []);

  const { settings, updateSettings, updateD01Settings } = useSettings();

  const handleImport = useCallback(async () => {
    if (!window.confirm("Importing data will overwrite existing data. Continue?")) return;
    try {
      // @ts-ignore - File System Access API
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'JSON File', accept: { 'application/json': ['.json'] } }],
      });
      const file = await handle.getFile();
      const text = await file.text();
      const data = JSON.parse(text);

      if (Array.isArray(data)) {
        // Legacy support: file is just an array of employees
        lastSavedEmployees.current = data;
        setEmployees(data);
        setFileHandle(handle);
        setSaveStatus('saved');
      } else if (data.employees && data.settings) {
        // New format: object with employees and settings
        lastSavedEmployees.current = data.employees;
        setEmployees(data.employees);

        // Update settings
        updateSettings(data.settings);
        // Note: updateSettings in context merges, but here we probably want to replace or merge deeply.
        // Actually, our updateSettings implements shallow merge. Let's rely on that or reset logic if needed.
        // For simplicity, we assume data.settings matches the shape.

        setFileHandle(handle);
        setSaveStatus('saved');
      } else {
        alert("Invalid JSON data format");
      }
    } catch (err) {
      console.error(err);
    }
  }, [updateSettings]);

  const handleExport = useCallback(async (shouldConfirm = true) => {
    if (shouldConfirm && !window.confirm("Export data to a new file?")) return;
    try {
      // @ts-ignore - File System Access API
      const handle = await window.showSaveFilePicker({
        types: [{ description: 'JSON File', accept: { 'application/json': ['.json'] } }],
        suggestedName: 'orgchart_data.json'
      });

      const exportData = {
        employees,
        settings
      };

      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(exportData, null, 2));
      await writable.close();
      setFileHandle(handle);
      setSaveStatus('saved');
      // Sync ref to current state to consider this "saved"
      lastSavedEmployees.current = employees;
    } catch (err) {
      console.error(err);
    }
  }, [employees, settings]);

  const [focusedEmployeeId, setFocusedEmployeeId] = useState<string | null>(null);

  const handleSearchSelect = useCallback((id: string) => {
    setFocusedEmployeeId(id);
    // Optional: Reset after a delay if needed by pages to re-trigger, 
    // but usually purely reactive is fine.
    // However, if searching same person twice, we might want to re-trigger.
    // For now simple state set is fine.
  }, []);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <RedirectToHome />
      <div className="flex flex-col h-screen overflow-hidden">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onExport={() => handleExport(true)}
          onImport={handleImport}
          saveStatus={saveStatus}
          employees={employees}
          onSelectEmployee={handleSearchSelect}
        />

        <Routes>
          <Route path="/" element={
            <Home
              employees={employees}
              searchQuery={searchQuery}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onAddEmployee={handleAddEmployee}
              onMoveNode={handleMoveNode}
              focusedEmployeeId={focusedEmployeeId}
            />
          } />
          <Route path="/d01" element={<D01 employees={employees} focusedEmployeeId={focusedEmployeeId} />} />
          <Route path="/d02" element={<D02 employees={employees} focusedEmployeeId={focusedEmployeeId} />} />
          <Route path="/d03" element={<D03 employees={employees} focusedEmployeeId={focusedEmployeeId} />} />
          <Route path="/d04" element={<D04 employees={employees} focusedEmployeeId={focusedEmployeeId} />} />
          <Route path="/d05" element={<D05 employees={employees} focusedEmployeeId={focusedEmployeeId} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
