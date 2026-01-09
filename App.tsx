
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './src/pages/Home';
import { D01 } from './src/pages/D01';
import { D02 } from './src/pages/D02';
import { INITIAL_EMPLOYEES } from './constants';
import { Employee } from './types';

const LOCAL_STORAGE_KEY = 'org-chart-data-v1';

const App: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [fileHandle, setFileHandle] = useState<any>(null);

  const lastSavedEmployees = useRef(employees);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(employees));
  }, [employees]);

  // Autosave or update status on changes
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
        // Sync ref to prevent autosave effect from firing immediately
        lastSavedEmployees.current = data;

        setEmployees(data);
        setFileHandle(handle);
        setSaveStatus('saved');
      } else {
        alert("Invalid JSON data format");
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleExport = useCallback(async (shouldConfirm = true) => {
    if (shouldConfirm && !window.confirm("Export data to a new file?")) return;
    try {
      // @ts-ignore - File System Access API
      const handle = await window.showSaveFilePicker({
        types: [{ description: 'JSON File', accept: { 'application/json': ['.json'] } }],
        suggestedName: 'orgchart_data.json'
      });
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(employees, null, 2));
      await writable.close();
      setFileHandle(handle);
      setSaveStatus('saved');
      // Sync ref to current state to consider this "saved"
      lastSavedEmployees.current = employees;
    } catch (err) {
      console.error(err);
    }
  }, [employees]);

  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen overflow-hidden">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onExport={() => handleExport(true)}
          onImport={handleImport}
          saveStatus={saveStatus}
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
            />
          } />
          <Route path="/d01" element={<D01 employees={employees} />} />
          <Route path="/d02" element={<D02 employees={employees} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
