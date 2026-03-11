import React, { useState, useEffect } from 'react';
import { Exam, Question } from '../types';
import { Plus, Trash2, Edit3, Save, X, LayoutDashboard, Database, ListChecks, Bell, Users, BarChart3, HelpCircle, Quote, ShieldAlert, Trophy, User } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../utils';

export default function AdminDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [stats, setStats] = useState({ exams: 0, questions: 0, users: 0, results: 0 });
  const [activeTab, setActiveTab] = useState<'exams' | 'questions' | 'updates' | 'faqs' | 'testimonials' | 'students' | 'security' | 'results'>('exams');
  const [students, setStudents] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [newExam, setNewExam] = useState({ 
    title: '', 
    category: 'SSC', 
    type: 'Full Mock',
    duration: 60, 
    totalQuestions: 100,
    negativeMarking: 0.25 
  });
  const [newUpdate, setNewUpdate] = useState({
    type: 'vacancy',
    category: 'SSC',
    title: '',
    content: '',
    apply_link: '',
    syllabus_link: ''
  });
  const [newFaq, setNewFaq] = useState({
    question: '',
    answer: '',
    order_index: 0
  });
  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    role: '',
    content: '',
    avatar: '',
    rating: 5
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

    fetch('/api/updates')
      .then(res => res.json())
      .then(data => setUpdates(data));

    fetch('/api/faqs')
      .then(res => res.json())
      .then(data => setFaqs(data));

    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => setTestimonials(data));

    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data));

    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => setStudents(data));

    fetch('/api/admin/results')
      .then(res => res.json())
      .then(data => setResults(data));
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
      setExams([{ ...newExam, id: data.id, created_at: new Date().toISOString(), total_questions: newExam.totalQuestions } as any, ...exams]);
      setNewExam({ title: '', category: 'SSC', type: 'Full Mock', duration: 60, totalQuestions: 100, negativeMarking: 0.25 });
      setStats(prev => ({ ...prev, exams: prev.exams + 1 }));
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteExam = async (id: number) => {
    setConfirmModal({
      show: true,
      title: "Delete Exam",
      message: "Are you sure? This will delete all questions in this exam. This action cannot be undone.",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/exams/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setExams(exams.filter(ex => ex.id !== id));
          setStats(prev => ({ ...prev, exams: prev.exams - 1 }));
          showNotification('Exam deleted successfully');
        }
      }
    });
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUpdate)
    });
    if (res.ok) {
      const data = await res.json();
      setUpdates([{ ...newUpdate, id: data.id, posted_date: new Date().toISOString() }, ...updates]);
      setNewUpdate({ type: 'vacancy', category: 'SSC', title: '', content: '', apply_link: '', syllabus_link: '' });
      showNotification('Update added successfully');
    }
  };

  const handleDeleteUpdate = async (id: number) => {
    setConfirmModal({
      show: true,
      title: "Delete Update",
      message: "Are you sure you want to delete this update?",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/updates/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setUpdates(updates.filter(u => u.id !== id));
          showNotification('Update deleted successfully');
        }
      }
    });
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFaq)
    });
    if (res.ok) {
      const data = await res.json();
      setFaqs([...faqs, { ...newFaq, id: data.id }]);
      setNewFaq({ question: '', answer: '', order_index: 0 });
      showNotification('FAQ added successfully');
    }
  };

  const handleDeleteFaq = async (id: number) => {
    setConfirmModal({
      show: true,
      title: "Delete FAQ",
      message: "Are you sure you want to delete this FAQ?",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setFaqs(faqs.filter(f => f.id !== id));
          showNotification('FAQ deleted successfully');
        }
      }
    });
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTestimonial)
    });
    if (res.ok) {
      const data = await res.json();
      setTestimonials([...testimonials, { ...newTestimonial, id: data.id }]);
      setNewTestimonial({ name: '', role: '', content: '', avatar: '', rating: 5 });
      showNotification('Testimonial added successfully');
    }
  };

  const handleDeleteTestimonial = async (id: number) => {
    setConfirmModal({
      show: true,
      title: "Delete Testimonial",
      message: "Are you sure you want to delete this testimonial?",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setTestimonials(testimonials.filter(t => t.id !== id));
          showNotification('Testimonial deleted successfully');
        }
      }
    });
  };

  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [editingItem, setEditingItem] = useState<{ type: string; id: number; data: any } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);

  const handleEdit = (type: string, item: any) => {
    setEditingItem({ type, id: item.id, data: { ...item } });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const { type, id, data } = editingItem;
    const endpoint = `/api/admin/${type}/${id}`;
    
    let payload = { ...data };
    if (type === 'exams') {
      payload = {
        title: data.title,
        category: data.category,
        type: data.type,
        duration: data.duration,
        totalQuestions: data.total_questions || data.totalQuestions,
        negativeMarking: data.negative_marking || data.negativeMarking
      };
    } else if (type === 'questions') {
      payload = {
        topic: data.topic,
        questionText: data.question_text || data.questionText,
        questionHindi: data.question_hindi || data.questionHindi,
        optionA: data.option_a || data.optionA,
        optionAHindi: data.option_a_hindi || data.optionAHindi,
        optionB: data.option_b || data.optionB,
        optionBHindi: data.option_b_hindi || data.optionBHindi,
        optionC: data.option_c || data.optionC,
        optionCHindi: data.option_c_hindi || data.optionCHindi,
        optionD: data.option_d || data.optionD,
        optionDHindi: data.option_d_hindi || data.optionDHindi,
        correctOption: data.correct_option || data.correctOption,
        solution: data.solution,
        tricks: data.tricks
      };
    }

    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showNotification(`${type.slice(0, -1)} updated successfully!`);
      if (type === 'exams') {
        setExams(exams.map(ex => ex.id === id ? { ...ex, ...data } : ex));
      } else if (type === 'updates') {
        setUpdates(updates.map(u => u.id === id ? { ...u, ...data } : u));
      } else if (type === 'faqs') {
        setFaqs(faqs.map(f => f.id === id ? { ...f, ...data } : f));
      } else if (type === 'testimonials') {
        setTestimonials(testimonials.map(t => t.id === id ? { ...t, ...data } : t));
      } else if (type === 'questions') {
        setExamQuestions(examQuestions.map(q => q.id === id ? { ...q, ...data } : q));
      } else if (type === 'users') {
        setStudents(students.map(s => s.id === id ? { ...s, ...data } : s));
      }
      setEditingItem(null);
    }
  };

  const fetchExamQuestions = async (examId: number) => {
    setSelectedExamId(examId);
    setActiveTab('questions');
    const res = await fetch(`/api/exams/${examId}`);
    if (res.ok) {
      const data = await res.json();
      setExamQuestions(data.questions);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    setConfirmModal({
      show: true,
      title: "Delete Question",
      message: "Are you sure you want to delete this question?",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setExamQuestions(examQuestions.filter(q => q.id !== id));
          setStats(prev => ({ ...prev, questions: prev.questions - 1 }));
          showNotification('Question deleted successfully');
        }
      }
    });
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQuestion)
    });
    if (res.ok) {
      showNotification('Question added successfully!');
      setNewQuestion({ 
        examId: newQuestion.examId, 
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
      setStats(prev => ({ ...prev, questions: prev.questions + 1 }));
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
          <button 
            onClick={() => setActiveTab('updates')}
            className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${activeTab === 'updates' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Bell className="w-4 h-4" />
            Updates
          </button>
          <button 
            onClick={() => setActiveTab('faqs')}
            className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${activeTab === 'faqs' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <HelpCircle className="w-4 h-4" />
            FAQs
          </button>
          <button 
            onClick={() => setActiveTab('testimonials')}
            className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${activeTab === 'testimonials' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Quote className="w-4 h-4" />
            Testimonials
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${activeTab === 'students' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Users className="w-4 h-4" />
            Students
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${activeTab === 'security' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ShieldAlert className="w-4 h-4" />
            Security
          </button>
          <button 
            onClick={() => setActiveTab('results')}
            className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${activeTab === 'results' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Trophy className="w-4 h-4" />
            Results
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Exams', value: stats.exams, icon: Database, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Questions', value: stats.questions, icon: ListChecks, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Users', value: stats.users, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Tests Taken', value: stats.results, icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
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
          ) : activeTab === 'questions' ? (
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
                      <option value="0">Choose an exam...</option>
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
          ) : activeTab === 'updates' ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold">Add New Update</h2>
              <form onSubmit={handleAddUpdate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Update Type</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newUpdate.type}
                    onChange={e => setNewUpdate({ ...newUpdate, type: e.target.value })}
                  >
                    <option value="vacancy">Vacancy</option>
                    <option value="admit_card">Admit Card</option>
                    <option value="result">Result</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Category (Target Exam)</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newUpdate.category}
                    onChange={e => setNewUpdate({ ...newUpdate, category: e.target.value })}
                  >
                    <option value="SSC">SSC</option>
                    <option value="Banking">Banking</option>
                    <option value="Railway">Railway</option>
                    <option value="Defence">Defence</option>
                    <option value="State Exams">State Exams</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newUpdate.title}
                    onChange={e => setNewUpdate({ ...newUpdate, title: e.target.value })}
                    placeholder="e.g. SSC CGL 2024 Notification"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Content</label>
                  <textarea 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                    value={newUpdate.content}
                    onChange={e => setNewUpdate({ ...newUpdate, content: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Apply Link</label>
                  <input 
                    type="url" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newUpdate.apply_link}
                    onChange={e => setNewUpdate({ ...newUpdate, apply_link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Syllabus Link</label>
                  <input 
                    type="url" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newUpdate.syllabus_link}
                    onChange={e => setNewUpdate({ ...newUpdate, syllabus_link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  Post Update
                </button>
              </form>
            </div>
          ) : activeTab === 'faqs' ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold">Add New FAQ</h2>
              <form onSubmit={handleAddFaq} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Question</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newFaq.question}
                    onChange={e => setNewFaq({ ...newFaq, question: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Answer</label>
                  <textarea 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                    value={newFaq.answer}
                    onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Order Index</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newFaq.order_index}
                    onChange={e => setNewFaq({ ...newFaq, order_index: parseInt(e.target.value) })}
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add FAQ
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold">Add Testimonial</h2>
              <form onSubmit={handleAddTestimonial} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newTestimonial.name}
                    onChange={e => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newTestimonial.role}
                    onChange={e => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Content</label>
                  <textarea 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                    value={newTestimonial.content}
                    onChange={e => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Avatar URL</label>
                  <input 
                    type="url" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newTestimonial.avatar}
                    onChange={e => setNewTestimonial({ ...newTestimonial, avatar: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Testimonial
                </button>
              </form>
            </div>
          )}
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {activeTab === 'exams' ? 'Recent Exams' : 
                 activeTab === 'questions' ? 'Questions Management' : 
                 activeTab === 'updates' ? 'Recent Updates' : 
                 activeTab === 'faqs' ? 'FAQ Management' : 
                 activeTab === 'students' ? 'Registered Students' :
                 activeTab === 'security' ? 'Security Incidents' :
                 activeTab === 'results' ? 'Exam Results & Ranks' :
                 'Testimonials Management'}
              </h2>
              <span className="text-slate-400 text-sm font-medium">
                {activeTab === 'exams' ? exams.length : 
                 activeTab === 'updates' ? updates.length : 
                 activeTab === 'faqs' ? faqs.length : 
                 activeTab === 'students' ? students.length :
                 activeTab === 'security' ? results.filter(r => r.tab_switches > 0 || r.face_incidents > 0 || r.phone_detected).length :
                 activeTab === 'results' ? results.length :
                 activeTab === 'testimonials' ? testimonials.length : ''} Total
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {activeTab === 'students' && students.map(s => (
                <div key={s.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{s.name}</h3>
                      <p className="text-sm text-slate-500">{s.phone} • {s.exam_interest}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Joined</p>
                      <p className="text-sm font-bold text-slate-700">{new Date(s.created_at).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={() => handleEdit('users', s)}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Edit Student"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {activeTab === 'results' && results.sort((a, b) => b.score - a.score).map((r, idx) => (
                <div key={r.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-black">
                      #{idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{r.student_name}</h3>
                      <p className="text-sm text-slate-500">{r.exam_title || 'Mock Test'} • {new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accuracy</p>
                      <p className="text-sm font-bold text-slate-700">{r.accuracy}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score</p>
                      <p className="text-lg font-black text-indigo-600">{r.score.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {activeTab === 'security' && results.filter(r => r.tab_switches > 0 || r.face_incidents > 0 || r.phone_detected).map(r => (
                <div key={r.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      <h3 className="font-bold text-slate-900">{r.student_name}</h3>
                    </div>
                    <p className="text-sm text-slate-500">Exam: {r.exam_title || 'Mock Test'}</p>
                    <div className="flex gap-3 mt-2">
                      {r.tab_switches > 0 && <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded">Tab Switches: {r.tab_switches}</span>}
                      {r.face_incidents > 0 && <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded">Face Warnings: {r.face_incidents}</span>}
                      {r.phone_detected && <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded">Phone Detected</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score</p>
                    <p className="text-lg font-black text-red-600">{r.score.toFixed(2)}</p>
                  </div>
                </div>
              ))}
              {activeTab === 'exams' && exams.map(ex => (
                <div key={ex.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <h3 className="font-bold text-slate-900">{ex.title}</h3>
                    <p className="text-sm text-slate-500">{ex.category} • {ex.duration} Mins • {ex.total_questions} Questions</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => fetchExamQuestions(ex.id)}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Manage Questions"
                    >
                      <ListChecks className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleEdit('exams', ex)}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Edit Exam"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteExam(ex.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {activeTab === 'updates' && updates.map(u => (
                <div key={u.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded text-slate-500">{u.type}</span>
                      <h3 className="font-bold text-slate-900">{u.title}</h3>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-1">{u.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit('updates', u)}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Edit Update"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteUpdate(u.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {activeTab === 'faqs' && faqs.map(f => (
                <div key={f.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <h3 className="font-bold text-slate-900">{f.question}</h3>
                    <p className="text-sm text-slate-500 line-clamp-1">{f.answer}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit('faqs', f)}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Edit FAQ"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteFaq(f.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {activeTab === 'testimonials' && testimonials.map(t => (
                <div key={t.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h3 className="font-bold text-slate-900">{t.name}</h3>
                      <p className="text-sm text-slate-500">{t.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit('testimonials', t)}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Edit Testimonial"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTestimonial(t.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {activeTab === 'questions' && (
                <div className="divide-y divide-slate-100">
                  {selectedExamId ? (
                    examQuestions.length > 0 ? (
                      examQuestions.map((q, i) => (
                        <div key={q.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded text-slate-500">Q{i+1} • {q.topic}</span>
                            </div>
                            <h3 className="font-bold text-slate-900 line-clamp-2">{q.question_text}</h3>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEdit('questions', q)}
                              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                              title="Edit Question"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                          <ListChecks className="w-8 h-8" />
                        </div>
                        <p className="text-slate-500 font-medium">No questions found for this exam.<br/>Use the form on the left to add new questions.</p>
                      </div>
                    )
                  ) : (
                    <div className="p-12 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                        <ListChecks className="w-8 h-8" />
                      </div>
                      <p className="text-slate-500 font-medium">Please select an exam from the "Exams" tab to manage its questions.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                Edit {editingItem.type.slice(0, -1).charAt(0).toUpperCase() + editingItem.type.slice(1, -1)}
              </h2>
              <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="editForm" onSubmit={handleUpdate} className="space-y-6">
                {editingItem.type === 'exams' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Exam Title</label>
                        <input 
                          type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={editingItem.data.title}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                        <select 
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={editingItem.data.category}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })}
                        >
                          <option value="SSC">SSC</option>
                          <option value="Banking">Banking</option>
                          <option value="Railway">Railway</option>
                          <option value="Defence">Defence</option>
                          <option value="State Exams">State Exams</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Duration (Mins)</label>
                        <input 
                          type="number" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={editingItem.data.duration}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, duration: parseInt(e.target.value) } })}
                        />
                      </div>
                    </div>
                  </>
                )}

                {editingItem.type === 'updates' && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Update Title</label>
                        <input 
                          type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={editingItem.data.title}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Content</label>
                        <textarea 
                          required rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={editingItem.data.content}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, content: e.target.value } })}
                        />
                      </div>
                    </div>
                  </>
                )}

                {editingItem.type === 'faqs' && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Question</label>
                        <input 
                          type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={editingItem.data.question}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, question: e.target.value } })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Answer</label>
                        <textarea 
                          required rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={editingItem.data.answer}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, answer: e.target.value } })}
                        />
                      </div>
                    </div>
                  </>
                )}

                {editingItem.type === 'testimonials' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
                        <input 
                          type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={editingItem.data.name}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
                        <input 
                          type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={editingItem.data.role}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, role: e.target.value } })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Rating</label>
                        <input 
                          type="number" min="1" max="5" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={editingItem.data.rating}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, rating: parseInt(e.target.value) } })}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Content</label>
                        <textarea 
                          required rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={editingItem.data.content}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, content: e.target.value } })}
                        />
                      </div>
                    </div>
                  </>
                )}

                {editingItem.type === 'users' && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                        <input 
                          type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={editingItem.data.name}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                        <input 
                          type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={editingItem.data.phone}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, phone: e.target.value } })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Exam Interest</label>
                        <input 
                          type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={editingItem.data.exam_interest}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, exam_interest: e.target.value } })}
                        />
                      </div>
                    </div>
                  </>
                )}

                {editingItem.type === 'questions' && (
                  <>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Topic</label>
                          <input 
                            type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={editingItem.data.topic}
                            onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, topic: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Correct Option</label>
                          <select 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={editingItem.data.correct_option}
                            onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, correct_option: e.target.value } })}
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Question Text (English)</label>
                        <textarea 
                          required rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={editingItem.data.question_text}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, question_text: e.target.value } })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Question Text (Hindi)</label>
                        <textarea 
                          rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={editingItem.data.question_hindi}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, question_hindi: e.target.value } })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Option A</label>
                          <input 
                            type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={editingItem.data.option_a}
                            onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, option_a: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Option A (Hindi)</label>
                          <input 
                            type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={editingItem.data.option_a_hindi}
                            onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, option_a_hindi: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Option B</label>
                          <input 
                            type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={editingItem.data.option_b}
                            onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, option_b: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Option B (Hindi)</label>
                          <input 
                            type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={editingItem.data.option_b_hindi}
                            onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, option_b_hindi: e.target.value } })}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setEditingItem(null)}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                form="editForm"
                type="submit"
                className="flex-1 px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Notification */}
      {notification?.show && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "fixed bottom-8 right-8 px-6 py-3 rounded-2xl shadow-2xl z-[500] font-bold text-white flex items-center gap-3",
            notification.type === 'success' ? "bg-emerald-600" : "bg-red-600"
          )}
        >
          {notification.type === 'success' ? <ListChecks className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          {notification.message}
        </motion.div>
      )}

      {/* Confirmation Modal */}
      {confirmModal?.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[500] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md space-y-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 mb-2">
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
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
