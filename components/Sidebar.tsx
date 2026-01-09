
import React, { useState, useEffect } from 'react';
import { Employee, Department } from '../types';
import { GeminiService } from '../services/geminiService';

interface SidebarProps {
  employee: Employee | null;
  employees: Employee[];
  onClose: () => void;
  onUpdate: (updated: Employee) => void;
  onDelete: (id: string) => void;
  isEditMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ employee, employees, onClose, onUpdate, onDelete, isEditMode }) => {
  const [formData, setFormData] = useState<Employee | null>(null);
  const [isResearching, setIsResearching] = useState(false);

  useEffect(() => {
    setFormData(employee);
  }, [employee]);

  if (!formData) return null;

  const handleSmartDescription = async () => {
    setIsResearching(true);
    const result = await GeminiService.researchRole(formData.title, formData.department);
    setFormData({ ...formData, description: result });
    setIsResearching(false);
  };

  const handleSave = () => {
    if (formData) onUpdate(formData);
  };

  return (
    <aside className={`fixed top-[60px] right-0 bottom-0 w-96 flex flex-col bg-white dark:bg-[#1e293b] border-l border-gray-200 dark:border-gray-800 shadow-2xl z-40 transition-transform duration-300 ${employee ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <h2 className="text-[#111418] dark:text-white text-xl font-bold leading-tight">
          {isEditMode ? 'Edit Employee' : 'Employee Details'}
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="p-6 flex flex-col gap-6 overflow-y-auto flex-1">
        <div className="flex flex-col gap-3 items-center">
          <div className="relative group">
            <div
              className="w-24 h-24 rounded-full bg-cover bg-center border-4 border-gray-50 dark:border-gray-700 shadow-md"
              style={{ backgroundImage: `url(${formData.imageUrl})` }}
            ></div>
            {isEditMode && (
              <button className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-lg hover:bg-blue-600 transition-colors">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Profile ID: {formData.id}</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input
              disabled={!isEditMode}
              className="w-full h-10 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Job Title</label>
            <input
              disabled={!isEditMode}
              className="w-full h-10 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
            <select
              disabled={!isEditMode}
              className="w-full h-10 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-3 appearance-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
            >
              <option value="">(None)</option>
              {Object.values(Department).map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reports To</label>
            <select
              disabled={!isEditMode}
              className="w-full h-10 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-3 appearance-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              value={formData.parentId || ''}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
            >
              <option value="">No Manager (Root)</option>
              {employees
                .filter(emp => {
                  if (emp.id === formData.id) return false;
                  return emp.id !== formData.id;
                })
                .map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} - {emp.title}</option>
                ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              {isEditMode && (
                <button
                  onClick={handleSmartDescription}
                  disabled={isResearching}
                  className="text-primary text-xs flex items-center gap-1 hover:underline disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                  {isResearching ? 'Thinking...' : 'AI Research'}
                </button>
              )}
            </div>
            <textarea
              disabled={!isEditMode}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white p-3 h-24 resize-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        {isEditMode && (
          <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-3">
            <button
              onClick={handleSave}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary h-10 px-4 text-white text-sm font-bold shadow hover:bg-blue-600 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">save</span>
              Save Changes
            </button>
            <button
              onClick={() => onDelete(formData.id)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900 h-10 px-4 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
              Delete Employee
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
