import React, { useState, useEffect } from 'react';
import { Exam, Question } from '../types';
import { Plus, Trash2, Edit3, Save, X, LayoutDashboard, Database, ListChecks } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState<'exams' | 'questions'>('exams');
  const [newExam, setNewExam] = useState({ 
    title: '', 
    category: 'SSC', 
    type: 'Full Mock',
    duration: 60, 
    totalQuestions: 100,
    negativeMarking: 0.25 
  });
  const [newQuestion, setNewQuestion] = useState({ 
    examId: 0, 
    topic: '',
    questionText: '', 
    questionHindi: '',
    optionA: '', 
    optionAHindi: '',
    optionB: '', 
    optionBHindi: '',
    optionC: '', 
    optionCHindi: '',
    optionD: '', 
    optionDHindi: '',
    correctOption: 'A',
    solution: '',
    tricks: ''
  });

  useEffect(() => {
    fetch('/api/exams')
      .then(res => res.json())
      .then(data => {
        setExams(data);
        if (data.length > 0) setNewQuestion(prev => ({ ...prev, examId: data[0].id }));
      });
  }, []);

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExam)
    });
    if (res.ok) {
      const data = await res.json();
      setExams([{ ...newExam, id: data.id, created_at: new Date().toISOString() } as any, ...exams]);
      setNewExam({ title: '', category: 'SSC', duration: 60, totalQuestions: 100 });
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQuestion)
    });
    if (res.ok) {
      alert('Question added successfully!');
      setNewQuestion({ ...newQuestion, questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <LayoutDashboard className="w-10 h-10 text-indigo-600" />
          Admin Panel
        </h1>
        <div className="flex bg-white border border-slate-200 rounded-xl p-1">
          <button 
            onClick={() => setActiveTab('exams')}
            className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${activeTab === 'exams' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Database className="w-4 h-4" />
            Exams
          </button>
          <button 
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${activeTab === 'questions' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ListChecks className="w-4 h-4" />
            Questions
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1 space-y-6">
          {activeTab === 'exams' ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold">Add New Exam</h2>
              <form onSubmit={handleAddExam} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Exam Title</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newExam.title}
                    onChange={e => setNewExam({ ...newExam, title: e.target.value })}
                    placeholder="e.g. SSC CGL 2024 - Mock 1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                    <select 
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newExam.category}
                      onChange={e => setNewExam({ ...newExam, category: e.target.value })}
                    >
                      <option>SSC</option>
                      <option>Banking</option>
                      <option>Railway</option>
                      <option>UPSC</option>
                      <option>State Exams</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                    <select 
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newExam.type}
                      onChange={e => setNewExam({ ...newExam, type: e.target.value as any })}
                    >
                      <option>Full Mock</option>
                      <option>Subject-wise</option>
                      <option>Chapter-wise</option>
                      <option>PYP</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Duration</label>
                    <input 
                      type="number" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newExam.duration}
                      onChange={e => setNewExam({ ...newExam, duration: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Total Qs</label>
                    <input 
                      type="number" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newExam.totalQuestions}
                      onChange={e => setNewExam({ ...newExam, totalQuestions: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Neg. Mark</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newExam.negativeMarking}
                      onChange={e => setNewExam({ ...newExam, negativeMarking: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Exam
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold">Add Question</h2>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Select Exam</label>
                    <select 
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newQuestion.examId}
                      onChange={e => setNewQuestion({ ...newQuestion, examId: parseInt(e.target.value) })}
                    >
                      {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Topic</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newQuestion.topic}
                      onChange={e => setNewQuestion({ ...newQuestion, topic: e.target.value })}
                      placeholder="e.g. Mathematics"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Question (English)</label>
                  <textarea 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[60px]"
                    value={newQuestion.questionText}
                    onChange={e => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Question (Hindi)</label>
                  <textarea 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[60px]"
                    value={newQuestion.questionHindi}
                    onChange={e => setNewQuestion({ ...newQuestion, questionHindi: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Option A (En)" className="px-4 py-2 rounded-xl border border-slate-200" value={newQuestion.optionA} onChange={e => setNewQuestion({ ...newQuestion, optionA: e.target.value })} required />
                  <input placeholder="Option A (Hi)" className="px-4 py-2 rounded-xl border border-slate-200" value={newQuestion.optionAHindi} onChange={e => setNewQuestion({ ...newQuestion, optionAHindi: e.target.value })} />
                  <input placeholder="Option B (En)" className="px-4 py-2 rounded-xl border border-slate-200" value={newQuestion.optionB} onChange={e => setNewQuestion({ ...newQuestion, optionB: e.target.value })} required />
                  <input placeholder="Option B (Hi)" className="px-4 py-2 rounded-xl border border-slate-200" value={newQuestion.optionBHindi} onChange={e => setNewQuestion({ ...newQuestion, optionBHindi: e.target.value })} />
                  <input placeholder="Option C (En)" className="px-4 py-2 rounded-xl border border-slate-200" value={newQuestion.optionC} onChange={e => setNewQuestion({ ...newQuestion, optionC: e.target.value })} required />
                  <input placeholder="Option C (Hi)" className="px-4 py-2 rounded-xl border border-slate-200" value={newQuestion.optionCHindi} onChange={e => setNewQuestion({ ...newQuestion, optionCHindi: e.target.value })} />
                  <input placeholder="Option D (En)" className="px-4 py-2 rounded-xl border border-slate-200" value={newQuestion.optionD} onChange={e => setNewQuestion({ ...newQuestion, optionD: e.target.value })} required />
                  <input placeholder="Option D (Hi)" className="px-4 py-2 rounded-xl border border-slate-200" value={newQuestion.optionDHindi} onChange={e => setNewQuestion({ ...newQuestion, optionDHindi: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Correct Option</label>
                    <select 
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newQuestion.correctOption}
                      onChange={e => setNewQuestion({ ...newQuestion, correctOption: e.target.value })}
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Solution</label>
                  <textarea 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[60px]"
                    value={newQuestion.solution}
                    onChange={e => setNewQuestion({ ...newQuestion, solution: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Expert Tricks</label>
                  <textarea 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[60px]"
                    value={newQuestion.tricks}
                    onChange={e => setNewQuestion({ ...newQuestion, tricks: e.target.value })}
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Question
                </button>
              </form>
            </div>
          )}
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent Exams</h2>
              <span className="text-slate-400 text-sm font-medium">{exams.length} Total</span>
            </div>
            <div className="divide-y divide-slate-100">
              {exams.map(ex => (
                <div key={ex.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <h3 className="font-bold text-slate-900">{ex.title}</h3>
                    <p className="text-sm text-slate-500">{ex.category} • {ex.duration} Mins • {ex.total_questions} Questions</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 className="w-5 h-5" /></button>
                    <button className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
