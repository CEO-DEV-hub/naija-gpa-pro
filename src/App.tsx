import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw, 
  ChevronRight, 
  GraduationCap, 
  Calculator,
  Share2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn, calculateGPA, calculateCGPA } from './lib/utils';
import { sanitizeInput, validateString } from './shared/validation';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  ScaleType, 
  Semester, 
  Course, 
  GRADES_4_SCALE, 
  GRADES_5_SCALE 
} from './types';

interface SemesterCardProps {
  semester: Semester;
  sIdx: number;
  scale: ScaleType;
  grades: { label: string; value: number }[];
  onAddCourse: (semesterId: string) => void;
  onRemoveCourse: (semesterId: string, courseId: string) => void;
  onUpdateCourse: (semesterId: string, courseId: string, updates: Partial<Course>) => void;
  onUpdateName: (semesterId: string, name: string) => void;
  key?: React.Key;
}

function SemesterCard({ 
  semester, 
  sIdx, 
  scale, 
  grades, 
  onAddCourse, 
  onRemoveCourse, 
  onUpdateCourse,
  onUpdateName
}: SemesterCardProps) {
  return (
    <section
      className="glass-card p-6 relative overflow-hidden group/card"
    >
      <div className="flex items-center justify-between mb-8 gap-6 static">
        <div className="flex items-center gap-6 flex-1 min-w-0 static">
          {/* Title Group */}
          <div className="flex items-center gap-3 flex-1 min-w-0 static">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white/40 shrink-0">
              0{sIdx + 1}
            </div>
            <input 
              value={semester.name}
              onChange={(e) => onUpdateName(semester.id, e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-xl font-display font-bold text-white placeholder:text-white/20 w-full pointer-events-auto"
              placeholder="Semester Name"
            />
          </div>
          
          {/* GPA Group */}
          <div className="shrink-0 text-right hidden sm:block border-l border-white/5 pl-6 mr-12 lg:mr-36">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">GPA</p>
            <p className="text-xl font-display font-bold text-neon-cyan">
              {calculateGPA(semester.courses, scale).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-12 gap-4 px-2 text-[10px] uppercase tracking-widest font-bold text-white/30">
          <div className="col-span-5">Course Code</div>
          <div className="col-span-3 text-center">Units</div>
          <div className="col-span-3 text-center">Grade</div>
          <div className="col-span-1"></div>
        </div>

        <AnimatePresence mode="popLayout">
          {semester.courses.map((course) => (
            <motion.div 
              key={course.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="grid grid-cols-12 gap-4 items-center bg-white/5 p-2 rounded-xl border border-white/5 hover:border-white/10 transition-colors group"
            >
              <div className="col-span-5">
                <input 
                  value={course.code}
                  onChange={(e) => onUpdateCourse(semester.id, course.id, { code: e.target.value })}
                  placeholder="e.g. CSC401"
                  className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-white/10"
                />
              </div>
              <div className="col-span-3 flex justify-center">
                <select 
                  value={course.units}
                  onChange={(e) => onUpdateCourse(semester.id, course.id, { units: Number(e.target.value) })}
                  className="bg-charcoal border border-white/10 rounded-lg text-xs px-2 py-1 focus:ring-1 focus:ring-neon-cyan outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map(u => (
                    <option key={u} value={u}>{u} Units</option>
                  ))}
                </select>
              </div>
              <div className="col-span-3 flex justify-center">
                <select 
                  value={course.gradeLabel}
                  onChange={(e) => onUpdateCourse(semester.id, course.id, { gradeLabel: e.target.value })}
                  className="bg-charcoal border border-white/10 rounded-lg text-xs px-2 py-1 focus:ring-1 focus:ring-neon-purple outline-none w-full"
                >
                  {grades.map(g => (
                    <option key={g.label} value={g.label}>{g.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1 flex justify-end">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveCourse(semester.id, course.id);
                  }}
                  className="p-1.5 text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button 
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAddCourse(semester.id);
        }}
        className="mt-6 w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-white/30 hover:text-neon-cyan hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all flex items-center justify-center gap-2 group cursor-pointer"
      >
        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
        <span className="text-sm font-bold uppercase tracking-wider">Add Course</span>
      </button>

      <div className="sm:hidden mb-6 p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Semester GPA</p>
        <p className="text-xl font-display font-bold text-neon-cyan">
          {calculateGPA(semester.courses, scale).toFixed(2)}
        </p>
      </div>
    </section>
  );
}

export default function App() {
  const [scale, setScale] = useState<ScaleType>(5.0);
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: String(Date.now()), name: 'Semester 1', courses: [{ id: uuidv4(), code: '', units: 3, gradeLabel: 'A' }] }
  ]);
  const [sessionId] = useState(() => {
    const saved = localStorage.getItem('naija_gpa_session');
    if (saved) return saved;
    const newId = uuidv4();
    localStorage.setItem('naija_gpa_session', newId);
    return newId;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [finalCGPA, setFinalCGPA] = useState(0);
  const [refreshCount, setRefreshCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastPDFDownloadTime, setLastPDFDownloadTime] = useState(0);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load existing record on mount
  useEffect(() => {
    const loadRecord = () => {
      setIsLoading(true);
      try {
        const savedData = localStorage.getItem('naijaGpaProData');
        if (savedData) {
          const data = JSON.parse(savedData);
          setScale(data.scaleType as ScaleType);
          setSemesters(data.semesters.map((s: any) => ({
            id: String(Date.now() + Math.random()),
            name: s.semesterName,
            courses: s.courses.map((c: any) => ({
              id: uuidv4(),
              code: c.code,
              units: c.units,
              gradeLabel: c.gradeLabel || (c.gradeValue >= 4 ? 'A' : 'F') // Fallback for old records
            }))
          })));
        }
      } catch (error) {
        console.error("Error loading record from localStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadRecord();
  }, []);

  useEffect(() => {
    setFinalCGPA(calculateCGPA(semesters, scale));
  }, [semesters, scale]);

  const addSemester = () => {
    const newId = String(Date.now());
    setSemesters(prev => [
      ...prev,
      { 
        id: newId, 
        name: `Semester ${prev.length + 1}`, 
        courses: [{ id: uuidv4(), code: '', units: 3, gradeLabel: 'A' }] 
      }
    ]);
  };

  // 1. The Robust Delete Function
  const handleDeleteSemester = (idToDelete: string) => {
    console.log("Nuclear Delete Initiated for ID:", idToDelete);
    
    // Use a functional update with a brand new array reference [...] 
    // to force React to notice the change.
    setSemesters((prevSemesters) => {
      const filtered = prevSemesters.filter(s => s.id !== idToDelete);
      console.log("New State Count:", filtered.length);
      return [...filtered]; 
    });
  };

  const addCourse = (semesterId: string) => {
    setSemesters(prev => prev.map(sem => {
      if (sem.id === semesterId) {
        return {
          ...sem,
          courses: [...sem.courses, { id: uuidv4(), code: '', units: 3, gradeLabel: 'A' }]
        };
      }
      return sem;
    }));
  };

  const removeCourse = (semesterId: string, courseId: string) => {
    setSemesters(prev => prev.map(sem => {
      if (sem.id === semesterId) {
        if (sem.courses.length === 1) return sem;
        return {
          ...sem,
          courses: sem.courses.filter(c => c.id !== courseId)
        };
      }
      return sem;
    }));
  };

  const updateCourse = (semesterId: string, courseId: string, updates: Partial<Course>) => {
    if (updates.code) {
      const sanitizedCode = sanitizeInput(updates.code);
      if (!validateString(sanitizedCode, 20)) {
        showToast('Course code is too long.', 'error');
        return;
      }
      updates.code = sanitizedCode;
    }

    if (updates.units) {
      const units = Number(updates.units);
      if (units < 1 || units > 6) {
        showToast('Invalid course units.', 'error');
        return;
      }
    }

    if (updates.gradeLabel) {
      const validGrades = grades.map(g => g.label);
      if (!validGrades.includes(updates.gradeLabel)) {
        showToast('Invalid grade.', 'error');
        return;
      }
    }

    setSemesters(prev => prev.map(sem => {
      if (sem.id === semesterId) {
        return {
          ...sem,
          courses: sem.courses.map(c => c.id === courseId ? { ...c, ...updates } : c)
        };
      }
      return sem;
    }));
  };

  // --- THE SAVE FUNCTION ---
  const handleSaveRecord = () => {
    setIsSaving(true); // Instant visual feedback: button changes IMMEDIATELY
    setSaveStatus('idle');
    
    try {
      console.log("Starting Save process to localStorage...");
      
      const dataToSave = {
        scaleType: scale,
        semesters: semesters.map(s => ({
          semesterName: s.name,
          courses: s.courses.map(c => ({ code: c.code, units: c.units, gradeLabel: c.gradeLabel })),
          semesterGPA: calculateGPA(s.courses, scale)
        })),
        finalCGPA,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('naijaGpaProData', JSON.stringify(dataToSave));
      
      setSaveStatus('success');
      alert("✅ Saved Successfully!");
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      console.log("Save Error:", error);
      setSaveStatus('error');
      alert("❌ Failed to save locally.");
    } finally {
      setIsSaving(false); // Return button to normal state
    }
  };

  // --- THE SHARE FUNCTION ---
  const handleShareResults = async () => {
    setIsSharing(true); // Instant visual feedback
    
    try {
      console.log("Generating shareable image...");
      const shareData = {
        title: 'My GPA Results',
        text: `My current CGPA is ${finalCGPA.toFixed(2)} on a ${scale.toFixed(1)} scale! Calculated with Naija GPA Pro.`,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert("✅ Results copied to clipboard!");
      }
    } catch (error) {
      console.log("Share Error:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const downloadPDF = async () => {
    const now = Date.now();
    if (now - lastPDFDownloadTime < 10000) {
      showToast('Please wait before downloading again.', 'error');
      return;
    }

    const element = document.getElementById('printable-content');
    if (!element) {
      alert("Capture area not found!");
      return;
    }
    setIsGenerating(true);
    setLastPDFDownloadTime(now);
    await new Promise(r => setTimeout(r, 1000));

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        // CRITICAL FIX: This clones the UI and deletes the problematic 'oklab' colors
        onclone: (clonedDoc) => {
          // Remove all stylesheets to prevent html2canvas CSS parser from crashing on Tailwind's oklab variables
          clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach(s => s.remove());
          
          const el = clonedDoc.getElementById('printable-content');
          if (el) {
            el.style.position = 'static'; // Bring it into view for the clone
            el.style.left = '0';
            el.style.color = 'black';
            el.style.background = 'white';
            el.querySelectorAll('*').forEach(node => {
              const htmlNode = node as HTMLElement;
              htmlNode.style.color = 'black';
              htmlNode.style.background = 'transparent';
              htmlNode.style.boxShadow = 'none';
              htmlNode.style.textShadow = 'none';
            });
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save('GPA_Statement.pdf');
    } catch (err) {
      console.error("PDF Crash:", err);
      alert("PDF generation failed. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateSemesterName = (semesterId: string, name: string) => {
    const sanitizedName = sanitizeInput(name);
    if (!validateString(sanitizedName, 50)) {
      showToast('Semester name is too long.', 'error');
      return;
    }
    setSemesters(prev => prev.map(s => s.id === semesterId ? { ...s, name: sanitizedName } : s));
  };

  const grades = scale === 5.0 ? GRADES_5_SCALE : GRADES_4_SCALE;

  return (
    <div className="min-h-screen bg-charcoal text-white selection:bg-neon-cyan/30">
      {/* Hidden Transcript Template - A4 Styled */}
      <div 
        id="printable-content" 
        ref={transcriptRef}
        className="bg-white text-black"
        style={{ 
          position: 'fixed', 
          left: '-9999px', 
          top: 0,
          width: '210mm', 
          minHeight: '297mm', // Standard A4 Height
          padding: '40px', 
          background: 'white', 
          color: 'black', 
          fontFamily: 'serif',
          zIndex: -100 // Stays behind everything but stays "in the DOM"
        }}
      >
        <div style={{ textAlign: 'center', borderBottom: '3px double black', paddingBottom: '10px', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', margin: 0 }}>OFFICIAL STATEMENT OF RESULTS</h1>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>(Unofficial Academic Transcript)</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '10px' }}>
            <span>Date: {new Date().toLocaleDateString()}</span>
            <span>System Ref: {Math.random().toString(36).toUpperCase().substring(7)}</span>
          </div>
        </div>

        {semesters.map((sem, index) => (
          <div key={sem.id} style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', backgroundColor: '#f3f4f6', padding: '4px' }}>
              Semester {index + 1}
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid black' }}>
                  <th style={{ padding: '8px', fontSize: '12px' }}>COURSE CODE</th>
                  <th style={{ padding: '8px', fontSize: '12px' }}>UNITS</th>
                  <th style={{ padding: '8px', fontSize: '12px' }}>GRADE</th>
                  <th style={{ padding: '8px', fontSize: '12px' }}>GP</th>
                </tr>
              </thead>
              <tbody>
                {sem.courses.map((course, i) => {
                  const gradeValue = (scale === 5 
                    ? GRADES_5_SCALE.find(g => g.label === course.gradeLabel)?.value 
                    : GRADES_4_SCALE.find(g => g.label === course.gradeLabel)?.value) || 0;
                  
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px', fontSize: '12px' }}>{course.code || `COURSE ${i+1}`}</td>
                      <td style={{ padding: '8px', fontSize: '12px' }}>{course.units}</td>
                      <td style={{ padding: '8px', fontSize: '12px' }}>{course.gradeLabel}</td>
                      <td style={{ padding: '8px', fontSize: '12px' }}>{(course.units * gradeValue).toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '14px', marginTop: '5px' }}>
              Semester GPA: {calculateGPA(sem.courses, scale).toFixed(2)}
            </p>
          </div>
        ))}

        <div style={{ marginTop: '50px', border: '2px solid black', padding: '15px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>FINAL ACADEMIC SUMMARY</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p><strong>Grading Scale:</strong> {scale.toFixed(2)}</p>
            <p><strong>Final CGPA:</strong> <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{finalCGPA.toFixed(2)}</span></p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
              "fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] px-6 py-3 rounded-xl font-display font-bold shadow-2xl flex items-center gap-3 border",
              toast.type === 'success' ? "bg-emerald-500 border-emerald-400 text-white" : "bg-red-500 border-red-400 text-white"
            )}
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-charcoal/80 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="text-neon-cyan animate-spin" size={48} />
              <p className="text-sm font-display font-bold uppercase tracking-widest text-white/60">Retrieving Records...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-charcoal/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-xl flex items-center justify-center neon-glow-cyan">
              <GraduationCap className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight">
              NAIJA<span className="text-neon-cyan">GPA</span> PRO
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
              <button 
                type="button"
                onClick={() => setScale(4.0)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer",
                  scale === 4.0 ? "bg-neon-cyan text-charcoal shadow-lg" : "text-white/60 hover:text-white"
                )}
              >
                4.0
              </button>
              <button 
                type="button"
                onClick={() => setScale(5.0)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer",
                  scale === 5.0 ? "bg-neon-purple text-white shadow-lg" : "text-white/60 hover:text-white"
                )}
              >
                5.0
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="popLayout">
            {/* 2. The Clean Rendering Logic (Inside your return/JSX) */}
            {semesters.map((semester, index) => (
              <div key={semester.id || index} className="relative">
                {/* Your Semester Card UI remains here */}
                <SemesterCard
                  semester={semester}
                  sIdx={index}
                  scale={scale}
                  grades={grades}
                  onAddCourse={addCourse}
                  onRemoveCourse={removeCourse}
                  onUpdateCourse={updateCourse}
                  onUpdateName={updateSemesterName}
                />
                
                {/* Only show delete for Semester 2 and above */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteSemester(semester.id);
                    }}
                    style={{ position: 'relative', zIndex: 9999, pointerEvents: 'auto' }}
                    className="bg-red-500 hover:bg-red-700 text-white p-2 rounded-lg mt-4"
                  >
                    Delete Semester
                  </button>
                )}
              </div>
            ))}
          </AnimatePresence>

          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addSemester();
            }}
            className="w-full py-6 glass-card border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 hover:border-neon-purple/50 hover:bg-neon-purple/5 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-neon-purple/20 transition-colors">
              <Plus size={24} className="text-white/20 group-hover:text-neon-purple" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-white/40 group-hover:text-white">Add New Semester</span>
          </button>
        </div>

        {/* Right Column: Stats & Actions */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white p-8 text-black border rounded-lg space-y-6">
              {/* CGPA Card */}
              <div className="glass-card p-8 relative overflow-hidden group border-black/10">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-neon-cyan/10 blur-3xl group-hover:bg-neon-cyan/20 transition-all pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-neon-purple/10 blur-3xl group-hover:bg-neon-purple/20 transition-all pointer-events-none" />
                
                <div className="relative z-10 text-center space-y-4">
                  <p className="text-xs font-bold text-black/40 uppercase tracking-[0.2em]">Cumulative CGPA</p>
                  
                  <div className="relative inline-block">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-black/5"
                      />
                      <motion.circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={552.92}
                        initial={{ strokeDashoffset: 552.92 }}
                        animate={{ strokeDashoffset: 552.92 - (552.92 * (finalCGPA / scale)) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={cn(
                          "transition-all duration-500",
                          scale === 5.0 ? "text-neon-purple" : "text-neon-cyan"
                        )}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span 
                        key={finalCGPA}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-5xl font-display font-black text-black"
                      >
                        {finalCGPA.toFixed(2)}
                      </motion.span>
                      <span className="text-xs font-bold text-black/20">out of {scale.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scale Info */}
              <div className="glass-card p-6 space-y-4 border-black/10">
                <div className="flex items-center gap-2 text-black/40">
                  <AlertCircle size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Grading Info</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {grades.map(g => (
                    <div key={g.label} className="flex items-center justify-between p-2 rounded-lg bg-black/5 border border-black/5">
                      <span className="text-sm font-bold text-black/60">{g.label}</span>
                      <span className="text-sm font-display font-bold text-neon-cyan">{g.value}.0</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <button 
              onClick={downloadPDF}
              disabled={isGenerating}
              className={`w-full py-5 rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl
                ${isGenerating 
                  ? 'bg-gray-600 cursor-wait' 
                  : 'bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 active:scale-95'
                }`}
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin">🌀</span> 
                  GENERATING YOUR PDF...
                </>
              ) : (
                <>
                  <span style={{ fontSize: '20px' }}>📄</span> 
                  DOWNLOAD STATEMENT OF RESULTS
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-white/5 text-center space-y-4">
        <p className="text-white/20 text-xs font-medium">
          Developed and Designed by Okafor Emmanuel Chukwuemeka 
        </p>
      </footer>
    </div>
  );
}
