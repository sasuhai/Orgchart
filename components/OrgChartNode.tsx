
import React from 'react';
import { Employee, Department } from '../types';

interface OrgChartNodeProps {
  employee: Employee;
  isSelected: boolean;
  isFound: boolean;
  onSelect: (id: string) => void;
  onAddChild: (id: string) => void;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  showDepartmentAbove: boolean;
  onMoveNode: (draggedId: string, targetId: string, position: 'inside' | 'before' | 'after') => void;
  showPhotos: boolean;
  isEditMode: boolean;
}

export const OrgChartNode: React.FC<OrgChartNodeProps> = ({
  employee,
  isSelected,
  isFound,
  onSelect,
  onAddChild,
  hasChildren,
  isExpanded,
  onToggleExpand,
  showDepartmentAbove,
  onMoveNode,
  showPhotos,
  isEditMode
}) => {
  const [dragOverPosition, setDragOverPosition] = React.useState<'inside' | 'before' | 'after' | null>(null);

  const handleDragStart = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.dataTransfer.setData('text/plain', employee.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';

    // Calculate drop zone
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    // Define zones: 25% left (before), 50% middle (inside), 25% right (after)
    if (x < width * 0.25) {
      setDragOverPosition('before');
    } else if (x > width * 0.75) {
      setDragOverPosition('after');
    } else {
      setDragOverPosition('inside');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Prevent flickering when dragging over children
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && dragOverPosition) {
      onMoveNode(draggedId, employee.id, dragOverPosition);
    }
    setDragOverPosition(null);
  };

  const getDeptColor = (dept: Department) => {
    switch (dept) {
      case Department.Engineering: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case Department.Marketing: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case Department.Finance: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case Department.HR: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case Department.Product: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const shouldShow = (employee.showDepartment !== false) && (employee.department && employee.department.trim() !== '');

  // Helper for conditional border styles
  const getDragStyle = () => {
    switch (dragOverPosition) {
      case 'inside': return 'drag-target-inside';
      case 'before': return 'drag-target-before'; // Left border heavy
      case 'after': return 'drag-target-after'; // Right border heavy
      default: return 'border-transparent hover:border-primary/50';
    }
  };

  return (
    <div className="flex flex-col items-center group">
      {/* Department Card (Above) */}
      {showDepartmentAbove && shouldShow && (
        <>
          <div className={`
            px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm mb-1 z-10
            ${getDeptColor(employee.department)}
          `}>
            {employee.department}
          </div>
          <div className="h-3 w-px bg-[#cbd5e1] dark:bg-[#334155]"></div>
        </>
      )}

      <div
        draggable={isEditMode}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => onSelect(employee.id)}
        className={`
          relative w-60 org-card rounded-xl cursor-pointer z-10 p-3 flex items-center gap-3 border-2 transition-all
          ${isSelected ? 'border-primary ring-2 ring-primary/20' : ''}
          ${dragOverPosition && isEditMode ? getDragStyle() : 'border-transparent hover:border-primary/50'}
          ${isFound ? 'found-card' : ''}
          ${!isEditMode ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
        `}
      >
        {showPhotos && (
          <div
            className="w-10 h-10 rounded-full bg-cover bg-center shrink-0 shadow-sm pointer-events-none"
            style={{ backgroundImage: `url(${employee.imageUrl})` }}
          ></div>
        )}
        <div className="flex flex-col min-w-0 flex-1 pointer-events-none">
          <h3 className="text-[#111418] dark:text-white text-sm font-bold truncate">{employee.name}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-xs font-medium truncate">{employee.title}</p>

          {/* Department rendered inside if NOT showing above */}
          {(!showDepartmentAbove && shouldShow) && (
            <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded text-[10px] font-medium w-fit self-center ${getDeptColor(employee.department)}`}>
              {employee.department}
            </span>
          )}
        </div>
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center bg-white dark:bg-[#1e293b] rounded-full shadow-md border border-gray-100 dark:border-gray-700 text-gray-500 hover:text-primary hover:scale-110 transition-transform z-20"
          >
            <span className="material-symbols-outlined text-sm">{isExpanded ? 'remove' : 'add'}</span>
          </button>
        )}
      </div>

      {/* Add Child Button - Only in Edit Mode */}
      {isEditMode && !hasChildren && (
        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddChild(employee.id)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white shadow hover:bg-blue-600"
          >
            <span className="material-symbols-outlined text-lg">add</span>
          </button>
        </div>
      )}
    </div>
  );
};
