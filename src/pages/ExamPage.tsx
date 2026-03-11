import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Exam, Question, QuestionStatus } from '../types';
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, User, Monitor, Languages, AlertTriangle, Camera, ShieldAlert } from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../context/AuthContext';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as faceDetection from '@tensorflow-models/face-detection';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { api } from '../services/api';

export default function ExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState<Exam & { questions: Question[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [statuses, setStatuses] = useState<Record<number, QuestionStatus>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [tabSwitches, setTabSwitches] = useState(0);
  const [timeSpent, setTimeSpent] = useState<Record<number, number>>({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({ issueType: 'Wrong Question', comment: '' });
  const [faceWarnings, setFaceWarnings] = useState(0);
  const [isProctoringReady, setIsProctoringReady] = useState(false);
  const [phoneDetected, setPhoneDetected] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const detectorRef = useRef<faceDetection.FaceDetector | null>(null);
  const objectModelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const proctorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const submitRef = useRef<() => void>(() => {});

  // Update submitRef to always have the latest handleSubmit
  useEffect(() => {
    submitRef.current = handleSubmit;
  }, [answers, statuses, timeLeft, currentIdx, exam, user, timeSpent, tabSwitches]);

  // Initialize exam
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getExamById(id)
      .then(data => {
        const examData = data;
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
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
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

  // Anti-cheating: Comprehensive security measures
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        setConfirmModal({
          show: true,
          title: "Security Violation",
          message: "Tab switching detected. Your test is being submitted automatically.",
          onConfirm: () => submitRef.current()
        });
        // Auto-submit after a short delay if they don't click
        setTimeout(() => submitRef.current(), 3000);
      }
    };

    const handleBlur = () => {
      setTabSwitches(prev => prev + 1);
      // For blur, we might just want to warn or submit depending on strictness
      // submitRef.current(); 
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+U, Ctrl+C, Ctrl+V, Ctrl+S
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 'c') ||
        (e.ctrlKey && e.key === 'v') ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.key === 'p')
      ) {
        e.preventDefault();
        return false;
      }
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Request Fullscreen
    const enterFullscreen = () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    
    // Attempt fullscreen on mount
    enterFullscreen();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
    };
  }, []);

  // AI Proctoring: Face & Object Detection
  useEffect(() => {
    const initDetector = async () => {
      await tf.ready();
      
      // Face Detector
      const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
      const detectorConfig: faceDetection.MediaPipeFaceDetectorTfjsModelConfig = {
        runtime: 'tfjs',
      };
      detectorRef.current = await faceDetection.createDetector(model, detectorConfig);
      
      // Object Detector (for phone detection)
      objectModelRef.current = await cocoSsd.load();
      
      setIsProctoringReady(true);
    };

    initDetector();

    return () => {
      if (proctorIntervalRef.current) clearInterval(proctorIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isProctoringReady || !exam) return;

    proctorIntervalRef.current = setInterval(async () => {
      if (webcamRef.current && webcamRef.current.video && detectorRef.current && objectModelRef.current) {
        const video = webcamRef.current.video;
        if (video.readyState === 4) {
          // 1. Face Detection
          const faces = await detectorRef.current.estimateFaces(video);
          
          // Dual Face Detection
          if (faces.length > 1) {
            setConfirmModal({
              show: true,
              title: "Security Violation",
              message: "Multiple faces detected. Your test is being submitted automatically.",
              onConfirm: () => submitRef.current()
            });
            setTimeout(() => submitRef.current(), 3000);
            return;
          }

          // 2. Object Detection (Phone)
          const predictions = await objectModelRef.current.detect(video);
          const hasPhone = predictions.some(p => p.class === 'cell phone' && p.score > 0.6);
          
          if (hasPhone) {
            setPhoneDetected(true);
            setConfirmModal({
              show: true,
              title: "Security Violation",
              message: "Mobile phone detected. Your test is being submitted automatically.",
              onConfirm: () => submitRef.current()
            });
            setTimeout(() => submitRef.current(), 3000);
            return;
          }

          // 3. Eye Contact / Face Presence Detection
          if (faces.length === 0) {
            setFaceWarnings(prev => {
              const newCount = prev + 1;
              if (newCount >= 3) {
                setConfirmModal({
                  show: true,
                  title: "Security Violation",
                  message: "Face not detected for too long. Your test is being submitted automatically.",
                  onConfirm: () => submitRef.current()
                });
                setTimeout(() => submitRef.current(), 3000);
              } else {
                setConfirmModal({
                  show: true,
                  title: "Security Warning",
                  message: `WARNING (${newCount}/3): Please look at the camera. Failure to do so will lead to automatic submission.`,
                  onConfirm: () => {}
                });
              }
              return newCount;
            });
          } else {
            // Basic Eye Contact Approximation using landmarks
            const face = faces[0];
            const keypoints = face.keypoints;
            if (keypoints) {
              const leftEye = keypoints.find(kp => kp.name === 'leftEye');
              const rightEye = keypoints.find(kp => kp.name === 'rightEye');
              const nose = keypoints.find(kp => kp.name === 'noseTip');

              if (leftEye && rightEye && nose) {
                // Check if nose is roughly between eyes (facing forward)
                const eyeMidX = (leftEye.x + rightEye.x) / 2;
                const noseOffset = Math.abs(nose.x - eyeMidX);
                const eyeDist = Math.abs(rightEye.x - leftEye.x);

                if (noseOffset > eyeDist * 0.5) {
                  setFaceWarnings(prev => {
                    const newCount = prev + 1;
                    if (newCount >= 3) {
                      setConfirmModal({
                        show: true,
                        title: "Security Violation",
                        message: "Looking away from the screen detected. Your test is being submitted automatically.",
                        onConfirm: () => submitRef.current()
                      });
                      setTimeout(() => submitRef.current(), 3000);
                    } else {
                      setConfirmModal({
                        show: true,
                        title: "Security Warning",
                        message: `WARNING (${newCount}/3): Please look directly at the screen. Looking away is not allowed.`,
                        onConfirm: () => {}
                      });
                    }
                    return newCount;
                  });
                }
              }
            }
          }
        }
      }
    }, 5000); // Check every 5 seconds

    return () => {
      if (proctorIntervalRef.current) clearInterval(proctorIntervalRef.current);
    };
  }, [isProctoringReady, exam]);

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
      tabSwitches: tabSwitches,
      faceIncidents: faceWarnings,
      phoneDetected: phoneDetected
    };

    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultData)
    }).catch(() => {
      // Netlify Fallback
      const mockResultId = Date.now();
      // Store in localStorage so ResultPage can find it
      localStorage.setItem(`mock_result_${mockResultId}`, JSON.stringify({
        id: mockResultId,
        ...resultData,
        submittedAt: new Date().toISOString()
      }));
      return {
        ok: true,
        json: async () => ({ id: mockResultId })
      } as Response;
    });
    
    localStorage.removeItem(`exam_progress_${id}`);
    const { id: resultId } = await res.json();

    // Update streak
    await fetch('/api/streaks/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    }).catch(() => {
      // Ignore streak update failure on Netlify
      return { ok: true } as Response;
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
    setConfirmModal({
      show: true,
      title: "Report Submitted",
      message: "Your report has been submitted successfully. Thank you for your feedback!",
      onConfirm: () => {}
    });
  };

  const handleSubmitSection = () => {
    if (!exam) return;
    const currentSection = exam.questions[currentIdx].topic || 'General';
    const sections = Array.from(new Set(exam.questions.map(q => q.topic || 'General')));
    const currentSectionIdx = sections.indexOf(currentSection);
    
    if (currentSectionIdx < sections.length - 1) {
      const nextSection = sections[currentSectionIdx + 1];
      const nextIdx = exam.questions.findIndex(q => (q.topic || 'General') === nextSection);
      if (nextIdx !== -1) {
        setConfirmModal({
          show: true,
          title: "Submit Section",
          message: `Are you sure you want to submit the ${currentSection} section and move to ${nextSection}?`,
          onConfirm: () => setCurrentIdx(nextIdx)
        });
      }
    } else {
      setConfirmModal({
        show: true,
        title: "Submit Test",
        message: "This is the last section. Do you want to submit the entire test?",
        onConfirm: () => handleSubmit()
      });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-[200]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading Exam...</p>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-[200]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-800">Oops! Something went wrong</h2>
          <p className="text-slate-600">{error || 'Exam not found'}</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">Go Back Home</button>
        </div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentIdx];
  const sections = Array.from(new Set(exam.questions.map(q => q.topic || 'General')));
  const currentSection = currentQuestion.topic || 'General';

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-[100] font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 shrink-0 shadow-sm relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-200">S</div>
            <div className="flex flex-col">
              <span className="text-slate-900 font-black text-xl leading-none tracking-tight">Sarkari</span>
              <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">TestZone</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>
          <h1 className="font-bold text-sm md:text-base text-slate-700 truncate max-w-[200px] md:max-w-none">
            {exam.title}
          </h1>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500">Viewing in:</span>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
              className="border border-slate-200 rounded px-2 py-1 text-xs font-medium bg-slate-50 outline-none focus:ring-1 ring-blue-500"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-100" />
                <circle 
                  cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="3" fill="transparent" 
                  className="text-blue-600"
                  strokeDasharray={113}
                  strokeDashoffset={113 - (113 * (timeLeft / (exam.duration * 60)))}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-4 bg-blue-600 rounded-full mx-0.5"></div>
                <div className="w-1.5 h-4 bg-blue-600 rounded-full mx-0.5"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none">{formatTime(timeLeft)}</span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Time Left</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sections Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-xs font-bold text-slate-500 uppercase mr-2 shrink-0">Sections:</span>
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => {
              const firstIdx = exam.questions.findIndex(q => (q.topic || 'General') === section);
              if (firstIdx !== -1) setCurrentIdx(firstIdx);
            }}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap",
              currentSection === section 
                ? "bg-blue-50 border-blue-600 text-blue-600" 
                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
            )}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Question Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Question Header */}
          <div className="px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-slate-800">Question {currentIdx + 1}</h2>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  <CheckCircle className="w-3 h-3" /> +1
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                  <AlertTriangle className="w-3 h-3" /> -0.25
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-bold">Time {formatTime(timeSpent[currentIdx] || 0).split(':').slice(1).join(':')}</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowReportModal(true)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <Flag className="w-5 h-5" />
                </button>
                <button className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 px-6 py-2 overflow-y-auto select-none">
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap font-medium">
                {language === 'hi' && currentQuestion.question_hindi ? currentQuestion.question_hindi : currentQuestion.question_text}
              </p>
            </div>

            <div className="mt-8 space-y-3 max-w-3xl">
              {[
                { key: 'A', text: language === 'hi' && currentQuestion.option_a_hindi ? currentQuestion.option_a_hindi : currentQuestion.option_a },
                { key: 'B', text: language === 'hi' && currentQuestion.option_b_hindi ? currentQuestion.option_b_hindi : currentQuestion.option_b },
                { key: 'C', text: language === 'hi' && currentQuestion.option_c_hindi ? currentQuestion.option_c_hindi : currentQuestion.option_c },
                { key: 'D', text: language === 'hi' && currentQuestion.option_d_hindi ? currentQuestion.option_d_hindi : currentQuestion.option_d },
              ].map((opt) => (
                <button 
                  key={opt.key}
                  onClick={() => handleOptionSelect(opt.key)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                    answers[currentIdx] === opt.key 
                      ? "border-blue-600 bg-blue-50/50" 
                      : "border-slate-100 hover:border-slate-200 bg-white"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                    answers[currentIdx] === opt.key 
                      ? "border-blue-600 bg-blue-600" 
                      : "border-slate-200 group-hover:border-slate-300"
                  )}>
                    {answers[currentIdx] === opt.key && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className="text-slate-700 font-medium">{opt.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex gap-3">
              <button 
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="px-8 py-2.5 border border-slate-200 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                onClick={handleClearResponse}
                className="px-8 py-2.5 border border-slate-200 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Clear Response
              </button>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleMarkForReview}
                className="px-6 py-2.5 border border-slate-200 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Mark for Review & Next
              </button>
              <button 
                onClick={handleSaveAndNext}
                className="px-12 py-2.5 bg-yellow-400 text-slate-900 rounded-lg font-bold text-sm hover:bg-yellow-500 transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Right: Sidebar Palette */}
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0">
          <div className="p-4 flex-1 overflow-y-auto">
            {/* User Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200 shadow-inner flex items-center justify-center text-slate-400">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ width: 128, height: 128, facingMode: "user" }}
                    onUserMediaError={() => {
                      setConfirmModal({
                        show: true,
                        title: "Camera Error",
                        message: "Camera access is mandatory for this exam. Please enable your camera and refresh the page to continue.",
                        onConfirm: () => window.location.reload()
                      });
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 leading-tight">{user?.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Candidate</p>
                <div className="flex items-center gap-1 mt-1">
                  <ShieldAlert className={cn("w-3 h-3", faceWarnings > 0 ? "text-red-500" : "text-emerald-500")} />
                  <span className={cn("text-[9px] font-bold uppercase", faceWarnings > 0 ? "text-red-500" : "text-emerald-500")}>
                    {faceWarnings > 0 ? `Warnings: ${faceWarnings}/3` : "Secure Session"}
                  </span>
                </div>
              </div>
            </div>

            <h3 className="font-bold text-slate-800 mb-4">Question Palette</h3>

            {/* View Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
              <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold bg-blue-600 text-white shadow-sm">
                <Monitor className="w-3.5 h-3.5" /> Grid View
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold text-slate-500 hover:text-slate-700">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg> List View
              </button>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                <span className="text-[10px] font-bold text-slate-500">Attempted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full"></div>
                <span className="text-[10px] font-bold text-slate-500">Unattempted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-slate-100 rounded-full"></div>
                <span className="text-[10px] font-bold text-slate-500">Unseen</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
                <span className="text-[10px] font-bold text-slate-500">Marked</span>
              </div>
            </div>

            {/* Section Header in Palette */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-800">{currentSection}</h4>
              <ChevronLeft className="w-4 h-4 text-slate-400 transform rotate-90" />
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-6 gap-2">
              {exam.questions.map((q, idx) => {
                const isCurrentSection = (q.topic || 'General') === currentSection;
                if (!isCurrentSection) return null;

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all border",
                      currentIdx === idx ? "ring-2 ring-blue-600 ring-offset-2" : "",
                      statuses[idx] === 'not_visited' && "bg-slate-50 text-slate-400 border-slate-100",
                      statuses[idx] === 'not_answered' && "bg-slate-800 text-white border-slate-800",
                      statuses[idx] === 'answered' && "bg-blue-600 text-white border-blue-600",
                      statuses[idx] === 'marked_for_review' && "bg-yellow-400 text-slate-900 border-yellow-400"
                    )}
                  >
                    {(idx % 50) + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-200 space-y-3 bg-slate-50/50">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative group">
                <button className="w-full py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all">Instructions</button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  View exam instructions & guidelines
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                </div>
              </div>
              <div className="relative group">
                <button className="w-full py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all">Questions</button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  View full question paper
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                </div>
              </div>
            </div>
            <button 
              onClick={handleSubmitSection}
              className="w-full py-2.5 bg-yellow-400 text-slate-900 rounded-lg font-bold text-xs hover:bg-yellow-500 transition-colors shadow-sm active:transform active:scale-[0.98]"
            >
              Submit Section
            </button>
            <button 
              onClick={handleSubmit}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition-colors shadow-md active:transform active:scale-[0.98]"
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md space-y-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-900">Report Question</h3>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Issue Type</label>
              <select 
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 ring-indigo-500 outline-none"
                value={reportData.issueType}
                onChange={e => setReportData({ ...reportData, issueType: e.target.value })}
              >
                <option>Wrong Question</option>
                <option>Wrong Options</option>
                <option>Translation Error</option>
                <option>Formatting Issue</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Comment</label>
              <textarea 
                className="w-full p-3 border border-slate-200 rounded-xl h-32 bg-slate-50 focus:ring-2 ring-indigo-500 outline-none resize-none"
                value={reportData.comment}
                onChange={e => setReportData({ ...reportData, comment: e.target.value })}
                placeholder="Describe the issue in detail..."
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowReportModal(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={handleReport} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Submit Report</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal?.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[300] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md space-y-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500 mb-2">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">{confirmModal.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{confirmModal.message}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal(null)} 
                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }} 
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
