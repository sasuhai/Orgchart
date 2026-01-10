
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../src/context/SettingsContext';
import { Employee } from '../types';

export type SaveStatus = 'saved' | 'saving' | 'unsaved';

interface HeaderProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onExport: () => void;
  onImport: () => void;
  saveStatus: SaveStatus;
  employees: Employee[];
  onSelectEmployee: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchChange, searchQuery, onExport, onImport, saveStatus,
  employees, onSelectEmployee
}) => {
  const location = useLocation();
  const { settings, updateSettings } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(settings.companyName);

  // Search Logic
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      const matches = employees.filter(e =>
        e.name.toLowerCase().includes(lower) ||
        e.title.toLowerCase().includes(lower)
      ).slice(0, 8);
      setFilteredEmployees(matches);
      setShowDropdown(true);
    } else {
      setFilteredEmployees([]);
      setShowDropdown(false);
    }
  }, [searchQuery, employees]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (id: string) => {
    onSelectEmployee(id);
    setShowDropdown(false);
    onSearchChange('');
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateSettings({ companyName: tempName });
    } else {
      setTempName(settings.companyName); // Revert if empty
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setTempName(settings.companyName);
      setIsEditing(false);
    }
  };

  const startEditing = (e: React.MouseEvent) => {
    e.preventDefault();
    setTempName(settings.companyName);
    setIsEditing(true);
  };

  return (
    <header className="sticky top-0 flex items-center justify-between whitespace-nowrap border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-6 py-3 shrink-0 z-50 shadow-sm transition-all text-slate-900 dark:text-white">
      <div className="flex items-center gap-8">
        {/* Brand / Logo Section */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 text-slate-800 dark:text-white hover:opacity-80 transition-opacity group">
            <div className="size-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="material-symbols-outlined text-[20px]">account_tree</span>
            </div>
            {isEditing ? (
              <input
                autoFocus
                className="text-lg font-bold leading-tight bg-transparent border-b-2 border-primary text-slate-900 dark:text-white focus:outline-none min-w-[180px] py-0.5"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.preventDefault()}
              />
            ) : (
              <div className="flex items-center gap-2 group/edit">
                <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">
                  {settings.companyName}
                </h2>
                <button
                  onClick={startEditing}
                  className="opacity-0 group-hover/edit:opacity-100 transition-all p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary scale-90 hover:scale-100"
                  title="Edit Company Name"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>
            )}
          </Link>

          {/* Navigation - Segmented Pill */}
          <nav className="hidden lg:flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            {['/', '/d01', '/d02', '/d03', '/d04', '/d05', '/d06'].map((path) => (
              <Link
                key={path}
                to={path}
                className={`
                  px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
                  ${(path === '/' ? location.pathname === '/' : location.pathname.startsWith(path))
                    ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400 font-semibold ring-1 ring-black/5 dark:ring-white/5'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'}
                `}
              >
                {path === '/' ? 'Chart' : path.substring(1).toUpperCase()}
              </Link>
            ))}
          </nav>
        </div>

        {/* Global Search */}
        <div ref={searchContainerRef} className="hidden md:block relative max-w-md w-full min-w-[300px]">
          <div className="relative group input-wrapper">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">search</span>
            </div>
            <input
              className="
                w-full pl-10 pr-4 py-2 bg-slate-100/50 dark:bg-slate-800/50 
                border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700
                focus:bg-white dark:focus:bg-slate-900 focus:border-primary/50 focus:ring-4 focus:ring-primary/10
                rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-500
                transition-all duration-200 outline-none
              "
              placeholder="Search employees, roles..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Search Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-3 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200/60 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {filteredEmployees.length > 0 ? 'Results' : 'No results found'}
              </div>
              {filteredEmployees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => handleSelectResult(emp.id)}
                  className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-3 group"
                >
                  <img src={emp.imageUrl} alt={emp.name} className="size-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/30 transition-all" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{emp.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{emp.title}</p>
                  </div>
                  <span className="ml-auto material-symbols-outlined text-slate-300 group-hover:text-primary text-lg opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                    arrow_forward
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Status Indicators */}
        <div className="flex items-center gap-3 px-3">
          {saveStatus === 'unsaved' && (
            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full border border-amber-100 dark:border-amber-800">
              <span className="material-symbols-outlined text-base">warning</span>
              <span className="text-xs font-semibold">Unsaved</span>
            </div>
          )}
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full border border-blue-100 dark:border-blue-800">
              <span className="material-symbols-outlined text-base animate-spin">sync</span>
              <span className="text-xs font-semibold">Saving...</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onImport}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all hover:shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            Import
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-blue-600 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
        </div>

        {/* Profile */}
        <div className="relative group cursor-pointer pl-2">
          <div className="size-10 rounded-full bg-slate-200 p-0.5 ring-2 ring-transparent group-hover:ring-primary/50 transition-all">
            <div
              className="w-full h-full bg-center bg-no-repeat bg-cover rounded-full"
              style={{ backgroundImage: 'url("https://picsum.photos/100/100?random=1")' }}
            ></div>
          </div>
          <div className="absolute top-1 right-0 size-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
        </div>
      </div>
    </header>
  );
};
