
import { Employee } from './types';
import appData from './data/app_data.json';

export const INITIAL_EMPLOYEES: Employee[] = appData.employees as unknown as Employee[];
