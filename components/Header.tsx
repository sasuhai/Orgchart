
import React from 'react';
import { Link } from 'react-router-dom';

export type SaveStatus = 'saved' | 'saving' | 'unsaved';

interface HeaderProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onExport: () => void;
  onImport: () => void;
  saveStatus: SaveStatus;
}

export const Header: React.FC<HeaderProps> = ({ onSearchChange, searchQuery, onExport, onImport, saveStatus }) => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#f0f2f4] dark:border-[#1f2937] bg-white dark:bg-[#111827] px-8 py-3 shrink-0 z-30">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-4 text-[#111418] dark:text-white hover:opacity-80 transition-opacity">
            <div className="size-8 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">account_tree</span>
            </div>
            <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">OrgChart Pro</h2>
          </Link>

          <nav className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <Link to="/" className="px-4 py-1.5 text-sm font-medium rounded-md hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm transition-all text-gray-700 dark:text-gray-200">
              Chart
            </Link>
            <Link to="/d01" className="px-4 py-1.5 text-sm font-medium rounded-md hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm transition-all text-gray-700 dark:text-gray-200">
              D01
            </Link>
            <Link to="/d02" className="px-4 py-1.5 text-sm font-medium rounded-md hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm transition-all text-gray-700 dark:text-gray-200">
              D02
            </Link>
          </nav>
        </div>

        <label className="hidden md:flex flex-col min-w-40 !h-10 max-w-64">
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
