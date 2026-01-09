
import { Department, Employee } from './types';

import orgChartData from './data/orgchart_data.json';

export const INITIAL_EMPLOYEES: Employee[] = orgChartData as unknown as Employee[];
