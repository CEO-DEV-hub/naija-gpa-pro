import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ScaleType, GRADES_4_SCALE, GRADES_5_SCALE } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getGradeValue(label: string, scale: ScaleType): number {
  const numericScale = Number(scale);
  // Strictly select the grade list based on the scale. 
  // We use a small epsilon check to be absolutely sure about the scale selection.
  const is4Scale = Math.abs(numericScale - 4.0) < 0.1;
  const gradeList = is4Scale ? GRADES_4_SCALE : GRADES_5_SCALE;
  const grade = gradeList.find(g => g.label === label);
  
  if (!grade) return 0;
  
  // Double-check: if we are on 4.0 scale, no grade can be > 4
  if (is4Scale && grade.value > 4) return 4;
  
  return grade.value;
}

export function calculateGPA(courses: { units: number; gradeLabel: string }[], scale: ScaleType) {
  const numericScale = Number(scale);
  let totalUnits = 0;
  let totalQualityPoints = 0;

  courses.forEach(course => {
    const units = Number(course.units) || 0;
    const gradeValue = getGradeValue(course.gradeLabel, numericScale as ScaleType);
    totalUnits += units;
    totalQualityPoints += (units * gradeValue);
  });
  
  if (totalUnits === 0) return 0;
  const gpa = totalQualityPoints / totalUnits;
  
  // Strictly cap at scale maximum to prevent any floating point overflow or logic errors
  return Math.min(gpa, numericScale);
}

export function calculateCGPA(semesters: { courses: { units: number; gradeLabel: string }[] }[], scale: ScaleType) {
  const numericScale = Number(scale);
  let totalUnits = 0;
  let totalQualityPoints = 0;
  
  semesters.forEach(sem => {
    sem.courses.forEach(course => {
      const units = Number(course.units) || 0;
      const gradeValue = getGradeValue(course.gradeLabel, numericScale as ScaleType);
      totalUnits += units;
      totalQualityPoints += (units * gradeValue);
    });
  });
  
  if (totalUnits === 0) return 0;
  const cgpa = totalQualityPoints / totalUnits;
  
  return Math.min(cgpa, numericScale);
}
