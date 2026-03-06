import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Exam, Question, QuestionStatus } from '../types';
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, User, Monitor, Languages, AlertTriangle } from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../context/AuthContext';
import { shuffle } from 'lodash';

export default function ExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState<Exam & { questions: Question[] } | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [statuses, setStatuses] = useState<Record<number, QuestionStatus>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [tabSwitches, setTabSwitches] = useState(0);
  const [timeSpent, setTimeSpent] = useState<Record<number, number>>({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({ issueType: 'Wrong Question', comment: '' });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());

  // Initialize exam
  useEffect(() => {
    fetch(`/api/exams/${id}`)
      .then(res => res.json())
      .then(data => {
        // Randomize questions
        const shuffledQuestions = shuffle(data.questions);
        const examData = { ...data, questions: shuffledQuestions };
        setExam(examData);
        
        // Check for auto-saved progress
        const savedProgress = localStorage.getItem(`exam_progress_${id}`);
        if (savedProgress) {
          const { savedAnswers, savedStatuses, savedTimeLeft, savedCurrentIdx } = JSON.parse(savedProgress);
          setAnswers(savedAnswers);
          setStatuses(savedStatuses);
          setTimeLeft(savedTimeLeft);
          setCurrentIdx(savedCurrentIdx);
        } else {
          setTimeLeft(data.duration * 60);
          const initialStatuses: Record<number, QuestionStatus> = {};
          data.questions.forEach((_: any, idx: number) => {
            initialStatuses[idx] = 'not_visited';
          });
          initialStatuses[0] = 'not_answered';
          setStatuses(initialStatuses);
        }
      });
  }, [id]);

  // Auto-save progress
  useEffect(() => {
    if (!exam || timeLeft <= 0) return;
    const progress = {
      savedAnswers: answers,
      savedStatuses: statuses,
      savedTimeLeft: timeLeft,
      savedCurrentIdx: currentIdx
    };
    localStorage.setItem(`exam_progress_${id}`, JSON.stringify(progress));
  }, [answers, statuses, timeLeft, currentIdx, id, exam]);

  // Timer and Time Tracking
  useEffect(() => {
    if (timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
      
      // Track time for current question
      setTimeSpent(prev => ({
        ...prev,
        [currentIdx]: (prev[currentIdx] || 0) + 1
      }));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, currentIdx]);

  // Anti-cheating: Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        alert("Warning: Tab switching is not allowed during the exam. This incident will be reported.");
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Security: Prevent right click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: option }));
  };

  const handleSaveAndNext = () => {
    if (answers[currentIdx]) {
      setStatuses(prev => ({ ...prev, [currentIdx]: 'answered' }));
    } else {
      setStatuses(prev => ({ ...prev, [currentIdx]: 'not_answered' }));
    }
    
    if (currentIdx < (exam?.questions.length || 0) - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      if (statuses[nextIdx] === 'not_visited') {
        setStatuses(prev => ({ ...prev, [nextIdx]: 'not_answered' }));
      }
    }
  };

  const handleMarkForReview = () => {
    setStatuses(prev => ({ ...prev, [currentIdx]: 'marked_for_review' }));
    if (currentIdx < (exam?.questions.length || 0) - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      if (statuses[nextIdx] === 'not_visited') {
        setStatuses(prev => ({ ...prev, [nextIdx]: 'not_answered' }));
      }
    }
  };

  const handleClearResponse = () => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentIdx];
      return newAnswers;
    });
    setStatuses(prev => ({ ...prev, [currentIdx]: 'not_answered' }));
  };

  const handleSubmit = async () => {
    if (!exam || !user) return;
    
    let correct = 0;
    let wrong = 0;
    exam.questions.forEach((q, idx) => {
      if (answers[idx]) {
        if (answers[idx] === q.correct_option) {
          correct++;
        } else {
          wrong++;
        }
      }
    });

    const totalAttempted = Object.keys(answers).length;
    // Score calculation with negative marking
    const score = (correct * 2) - (wrong * (exam.negative_marking || 0.25));
    const accuracy = totalAttempted > 0 ? (correct / totalAttempted) * 100 : 0;

    const resultData = {
      examId: exam.id,
      userId: user.id,
      studentName: user.name,
      score,
      totalAttempted,
      correctAnswers: correct,
      wrongAnswers: wrong,
      accuracy,
      timeSpentPerQuestion: timeSpent,
      userAnswers: answers,
      tabSwitches
    };

    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultData)
    });
    
    localStorage.removeItem(`exam_progress_${id}`);
    const { id: resultId } = await res.json();

    // Update streak
    await fetch('/api/streaks/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });

    navigate(`/results/${resultId}`);
  };

  const handleReport = async () => {
    if (!exam || !user) return;
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: exam.questions[currentIdx].id,
        userId: user.id,
        ...reportData
      })
    });
    setShowReportModal(false);
    alert("Report submitted. Thank you!");
  };

  if (!exam) return null;

  const currentQuestion = exam.questions[currentIdx];
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  return (
    <div className="fixed inset-0 bg-slate-100 flex flex-col z-[100]">
      {/* Header */}
      <header className="bg-slate-800 text-white h-14 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
          <Monitor className="w-5 h-5 text-indigo-400 hidden xs:block" />
          <h1 className="font-bold text-xs md:text-base truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">{exam.title}</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 md:gap-2 bg-slate-700 px-2 md:px-3 py-1 rounded text-[10px] md:text-xs font-bold hover:bg-slate-600 transition-colors"
          >
            <Languages className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden xs:inline">{language === 'en' ? 'Hindi' : 'English'}</span>
            <span className="xs:hidden">{language === 'en' ? 'HI' : 'EN'}</span>
          </button>
          <div className="hidden lg:flex items-center gap-2 bg-slate-700 px-3 py-1 rounded">
            <User className="w-4 h-4" />
            <span className="text-xs font-medium">{user?.name}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 bg-indigo-600 px-2 md:px-4 py-1 rounded font-mono">
            <Clock className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-sm md:text-lg font-bold">{formatTime(timeLeft)}</span>
          </div>
          <button 
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            className="lg:hidden p-1.5 bg-slate-700 rounded hover:bg-slate-600 transition-colors"
          >
            <Monitor className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Question Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden border-r border-slate-200">
          <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center px-4 justify-between">
            <span className="text-[10px] md:text-xs font-bold text-slate-600 truncate mr-2">
              Q. {currentIdx + 1} | Topic: {currentQuestion.topic || 'General'}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowReportModal(true)}
                className="text-[10px] bg-white border border-red-200 text-red-600 px-2 py-0.5 rounded hover:bg-red-50 flex items-center gap-1"
              >
                <AlertTriangle className="w-3 h-3" />
                <span className="hidden xs:inline">Report</span>
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 md:space-y-8">
            <div className="text-base md:text-lg font-medium text-slate-800 leading-relaxed">
              {language === 'hi' && currentQuestion.question_hindi ? currentQuestion.question_hindi : currentQuestion.question_text}
            </div>

            <div className="space-y-2 md:space-y-3">
              {[
                { key: 'A', text: language === 'hi' && currentQuestion.option_a_hindi ? currentQuestion.option_a_hindi : currentQuestion.option_a },
                { key: 'B', text: language === 'hi' && currentQuestion.option_b_hindi ? currentQuestion.option_b_hindi : currentQuestion.option_b },
                { key: 'C', text: language === 'hi' && currentQuestion.option_c_hindi ? currentQuestion.option_c_hindi : currentQuestion.option_c },
                { key: 'D', text: language === 'hi' && currentQuestion.option_d_hindi ? currentQuestion.option_d_hindi : currentQuestion.option_d },
              ].map((opt) => (
                <label 
                  key={opt.key}
                  className={cn(
                    "flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all",
                    answers[currentIdx] === opt.key 
                      ? "border-indigo-600 bg-indigo-50" 
                      : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <input 
                    type="radio" 
                    name="option" 
                    className="w-4 h-4 md:w-5 md:h-5 text-indigo-600"
                    checked={answers[currentIdx] === opt.key}
                    onChange={() => handleOptionSelect(opt.key)}
                  />
                  <span className="font-bold text-slate-400 text-sm md:text-base">{opt.key}.</span>
                  <span className="text-slate-700 text-sm md:text-base">{opt.text}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="h-auto min-h-[64px] py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between px-2 sm:px-4 shrink-0 gap-2">
            <div className="flex gap-1 sm:gap-2">
              <button 
                onClick={handleMarkForReview}
                className="bg-white border border-purple-600 text-purple-600 px-2 sm:px-4 py-2 rounded font-bold text-[10px] sm:text-xs hover:bg-purple-50 transition-colors"
              >
                Review & Next
              </button>
              <button 
                onClick={handleClearResponse}
                className="bg-white border border-slate-300 text-slate-600 px-2 sm:px-4 py-2 rounded font-bold text-[10px] sm:text-xs hover:bg-slate-100 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="flex gap-1 sm:gap-2">
              <button 
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                className="bg-white border border-slate-300 text-slate-600 px-2 sm:px-4 py-2 rounded font-bold text-[10px] sm:text-xs hover:bg-slate-100 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleSaveAndNext}
                className="bg-indigo-600 text-white px-3 sm:px-6 py-2 rounded font-bold text-[10px] sm:text-xs hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
              >
                Save & Next
              </button>
            </div>
          </div>
        </div>

        {/* Right: Palette */}
        <div className={cn(
          "w-full sm:w-80 bg-slate-50 flex flex-col shrink-0 border-l border-slate-200 absolute inset-y-0 right-0 z-50 transition-transform duration-300 lg:relative lg:translate-x-0 lg:flex",
          isPaletteOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between lg:hidden mb-4">
              <h3 className="font-bold text-slate-800">Palette</h3>
              <button onClick={() => setIsPaletteOpen(false)} className="p-1 hover:bg-slate-200 rounded">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-lg border border-slate-200">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-200 rounded flex items-center justify-center">
                <User className="w-6 h-6 md:w-8 md:h-8 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs font-bold text-slate-800">{user?.name}</p>
                <p className="text-[9px] md:text-[10px] text-slate-500 uppercase">Roll No: 2024001</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] md:text-xs font-bold text-slate-600 uppercase tracking-wider">Question Palette</h3>
              <div className="grid grid-cols-5 gap-2">
                {exam.questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIdx(idx);
                      if (window.innerWidth < 1024) setIsPaletteOpen(false);
                    }}
                    className={cn(
                      "w-8 h-8 md:w-10 md:h-10 rounded flex items-center justify-center text-[10px] md:text-xs font-bold transition-all",
                      currentIdx === idx ? "ring-2 ring-indigo-600 ring-offset-2" : "",
                      statuses[idx] === 'not_visited' && "bg-slate-200 text-slate-600",
                      statuses[idx] === 'not_answered' && "bg-red-500 text-white",
                      statuses[idx] === 'answered' && "bg-emerald-500 text-white",
                      statuses[idx] === 'marked_for_review' && "bg-purple-500 text-white"
                    )}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 md:w-4 md:h-4 bg-emerald-500 rounded"></span>
                <span className="text-[9px] md:text-[10px] font-medium">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded"></span>
                <span className="text-[9px] md:text-[10px] font-medium">Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 md:w-4 md:h-4 bg-slate-200 rounded"></span>
                <span className="text-[9px] md:text-[10px] font-medium">Not Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 md:w-4 md:h-4 bg-purple-500 rounded"></span>
                <span className="text-[9px] md:text-[10px] font-medium">Marked for Review</span>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-white">
            <button 
              onClick={handleSubmit}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 text-sm"
            >
              Submit Test
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold">Report Question</h3>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Issue Type</label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={reportData.issueType}
                onChange={e => setReportData({ ...reportData, issueType: e.target.value })}
              >
                <option>Wrong Question</option>
                <option>Wrong Options</option>
                <option>Translation Error</option>
                <option>Formatting Issue</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Comment</label>
              <textarea 
                className="w-full p-2 border rounded-lg h-24"
                value={reportData.comment}
                onChange={e => setReportData({ ...reportData, comment: e.target.value })}
                placeholder="Describe the issue..."
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowReportModal(false)} className="flex-1 py-2 border rounded-lg font-bold">Cancel</button>
              <button onClick={handleReport} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
