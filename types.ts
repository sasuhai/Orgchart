
export enum Department {
  Executive = 'Executive',
  Engineering = 'Engineering',
  Marketing = 'Marketing',
  Finance = 'Finance',
  HR = 'HR',
  Product = 'Product',
  Sales = 'Sales'
}

export interface Employee {
  id: string;
  name: string;
  title: string;
  department: Department;
  imageUrl: string;
  parentId: string | null;
  roles: string[];
  description: string;
  email: string;
  showDepartment?: boolean;
}

export interface TreeState {
  employees: Employee[];
  selectedEmployeeId: string | null;
  searchQuery: string;
  zoom: number;
  showDepartmentAbove: boolean;
  expandedIds: Set<string>;
  showPhotos: boolean;
  isEditMode: boolean;
}
