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

  const getLinkClasses = (path: string) => {
    // Exact match for root, startsWith for others to handle potential sub-routes if any
    const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

    return `px-4 py-1.5 text-sm font-medium rounded-md transition-all ${isActive
      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary dark:text-white font-bold'
      : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
      }`;
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#f0f2f4] dark:border-[#1f2937] bg-white dark:bg-[#111827] px-8 py-3 shrink-0 z-30">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-4 text-[#111418] dark:text-white hover:opacity-80 transition-opacity group">
            <div className="size-8 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">account_tree</span>
            </div>
            {isEditing ? (
              <input
                autoFocus
                className="text-lg font-bold leading-tight tracking-[-0.015em] bg-transparent border-b border-primary text-[#111418] dark:text-white focus:outline-none min-w-[150px]"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.preventDefault()} // Prevent Link nav
              />
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                  {settings.companyName}
                </h2>
                <button
                  onClick={startEditing}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-primary"
                  title="Edit Company Name"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>
            )}
          </Link>

          <nav className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <Link to="/" className={getLinkClasses('/')}>
              Chart
            </Link>
            <Link to="/d01" className={getLinkClasses('/d01')}>
              D01
            </Link>
            <Link to="/d02" className={getLinkClasses('/d02')}>
              D02
            </Link>
            <Link to="/d03" className={getLinkClasses('/d03')}>
              D03
            </Link>
            <Link to="/d04" className={getLinkClasses('/d04')}>
              D04
            </Link>
            <Link to="/d05" className={getLinkClasses('/d05')}>
              D05
            </Link>
          </nav>
        </div>

        <label ref={searchContainerRef} className="hidden md:flex flex-col min-w-40 !h-10 max-w-64 relative">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div className="text-[#617289] dark:text-gray-400 flex border-none bg-[#f0f2f4] dark:bg-[#1f2937] items-center justify-center pl-4 rounded-l-lg border-r-0">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-0 border-none bg-[#f0f2f4] dark:bg-[#1f2937] focus:border-none h-full placeholder:text-[#617289] px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal"
              placeholder="Find employee..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                {filteredEmployees.map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => handleSelectResult(emp.id)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-0 transition-colors flex items-center gap-3"
                  >
                    <img src={emp.imageUrl} alt={emp.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{emp.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{emp.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </label>
      </div>
      <div className="flex flex-1 justify-end gap-6 items-center">
        <div className="flex items-center gap-2">
          {saveStatus === 'unsaved' && (
            <span className="text-amber-600 dark:text-amber-400 text-xs font-medium mr-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">warning</span>
              Unsaved to File
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="text-blue-600 dark:text-blue-400 text-xs font-medium mr-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm animate-spin">sync</span>
              Saving...
            </span>
          )}
          <button
            onClick={onImport}
            className="flex items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-[#f0f2f4] dark:bg-[#1f2937] hover:bg-gray-200 dark:hover:bg-gray-700 text-[#111418] dark:text-gray-200 text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
          >
            <span className="truncate">Import</span>
          </button>
          <button
            onClick={onExport}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary hover:bg-blue-600 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
          >
            <span className="truncate">Export</span>
          </button>
        </div>
        <div
          className="bg-center bg-no-repeat bg-cover rounded-full size-9 border-2 border-white dark:border-gray-700 shadow-sm cursor-pointer"
          style={{ backgroundImage: 'url("https://picsum.photos/100/100?random=1")' }}
        ></div>
      </div>
    </header>
  );
};
