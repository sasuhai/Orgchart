
import React, { useState } from 'react';
import { Employee, Department } from '../types';

interface OnboardingFormProps {
  onClose: () => void;
  onSave: (employee: Partial<Employee>) => void;
  employees: Employee[];
  initialParentId: string | null;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ onClose, onSave, employees, initialParentId }) => {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    department: '' as Department,
    email: '',
    description: '',
    parentId: initialParentId,
    imageUrl: `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-dark w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <header className="flex items-center justify-between px-10 py-6 border-b dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="size-8 flex items-center justify-center text-primary bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined">person_add</span>
            </div>
            <h2 className="text-xl font-bold">Onboard New Team Member</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
            <button
              onClick={() => onSave(formData)}
              className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-600 shadow-sm transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">save</span>
              Save Connection
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-8">
              <section>
                <h3 className="text-lg font-bold mb-6">Employee Information</h3>
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-1 space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <input
                      className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary h-12 px-4"
                      placeholder="e.g. Jane Doe"
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <input
                      className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary h-12 px-4"
                      placeholder="jane@company.com"
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Job Title</label>
                    <input
                      className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary h-12 px-4"
                      placeholder="e.g. Senior Product Designer"
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <label className="text-sm font-medium">Department</label>
                    <select
                      className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary h-12 px-4"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                    >
                      <option value="">(None)</option>
                      {Object.values(Department).map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 space-y-2">
                    <label className="text-sm font-medium">Reports To</label>
                    <select
                      className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary h-12 px-4"
                      value={formData.parentId || ''}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                    >
                      <option value="">No Manager (Root)</option>
                      {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} - {emp.title}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Role Description</label>
                    <textarea
                      className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary h-32 px-4 py-3 resize-none"
                      placeholder="Briefly describe responsibilities..."
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center gap-6">
                <h3 className="text-lg font-bold self-start">Organizational Preview</h3>
                <div className="flex flex-col items-center gap-4 w-full">
                  {formData.parentId && (
                    <div className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700 flex items-center gap-4">
                      <div className="size-10 rounded-full bg-slate-200 animate-pulse"></div>
                      <div>
                        <p className="text-sm font-bold">{employees.find(e => e.id === formData.parentId)?.name}</p>
                        <p className="text-xs text-gray-500">Manager</p>
                      </div>
                    </div>
                  )}
                  {formData.parentId && <div className="h-6 w-px bg-slate-300"></div>}
                  <div className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 border-primary/50 flex items-center gap-4">
                    <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-400">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold italic opacity-50">{formData.name || 'New Employee'}</p>
                      <p className="text-xs text-gray-500">{formData.title || 'Pending details...'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 text-sm text-blue-800 dark:text-blue-100">
                  <span className="material-symbols-outlined text-lg">info</span>
                  <p>Changes will update the live chart immediately after saving.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
