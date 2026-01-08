
import React, { useState } from 'react';
import { Employee } from '../types';
import { OrgChartNode } from './OrgChartNode';

interface TreeProps {
  employees: Employee[];
  parentId: string | null;
  selectedEmployeeId: string | null;
  foundEmployeeIds: string[];
  onSelect: (id: string) => void;
  onAddChild: (id: string) => void;
  showDepartmentAbove: boolean;
  onMoveNode: (draggedId: string, targetId: string) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  showPhotos: boolean;
}

export const OrgChartTree: React.FC<TreeProps> = ({
  employees,
  parentId,
  selectedEmployeeId,
  foundEmployeeIds,
  onSelect,
  onAddChild,
  showDepartmentAbove,
  onMoveNode,
  expandedIds,
  onToggleExpand,
  showPhotos
}) => {
  const currentLevelEmployees = employees.filter(e => e.parentId === parentId);

  if (currentLevelEmployees.length === 0) return null;

  return (
    <div className="tree-container">
      {currentLevelEmployees.map(employee => {
        const children = employees.filter(e => e.parentId === employee.id);
        const isExpanded = expandedIds.has(employee.id);

        return (
          <div key={employee.id} className="tree-node-wrapper">
            <OrgChartNode
              employee={employee}
              isSelected={selectedEmployeeId === employee.id}
              isFound={foundEmployeeIds.includes(employee.id)}
              onSelect={onSelect}
              onAddChild={onAddChild}
              hasChildren={children.length > 0}
              isExpanded={isExpanded}
              onToggleExpand={() => onToggleExpand(employee.id)}
              showDepartmentAbove={showDepartmentAbove}
              onMoveNode={onMoveNode}
              showPhotos={showPhotos}
            />

            {/* Sub-tree */}
            {isExpanded && children.length > 0 && (
              <>
                <div className="line-down"></div>
                <OrgChartTree
                  employees={employees}
                  parentId={employee.id}
                  selectedEmployeeId={selectedEmployeeId}
                  foundEmployeeIds={foundEmployeeIds}
                  onSelect={onSelect}
                  onAddChild={onAddChild}
                  showDepartmentAbove={showDepartmentAbove}
                  onMoveNode={onMoveNode}
                  expandedIds={expandedIds}
                  onToggleExpand={onToggleExpand}
                  showPhotos={showPhotos}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
