export type ScaleType = 4.0 | 5.0;

export interface Course {
  id: string;
  code: string;
  units: number;
  gradeLabel: string;
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

export interface CalculationRecord {
  sessionId: string;
  scaleType: ScaleType;
  semesters: Semester[];
  finalCGPA: number;
  timestamp: any;
}

export const GRADES_5_SCALE = [
  { label: 'A', value: 5 },
  { label: 'B', value: 4 },
  { label: 'C', value: 3 },
  { label: 'D', value: 2 },
  { label: 'E', value: 1 },
  { label: 'F', value: 0 },
];

export const GRADES_4_SCALE = [
  { label: 'A', value: 4 },
  { label: 'B', value: 3 },
  { label: 'C', value: 2 },
  { label: 'D', value: 1 },
  { label: 'F', value: 0 },
];
