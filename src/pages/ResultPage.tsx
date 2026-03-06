import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExamResult, Question } from '../types';
import { Trophy, Target, Clock, Zap, ChevronRight, BarChart3, BookOpen, CheckCircle2, XCircle, HelpCircle, Lightbulb, AlertTriangle } from 'lucide-react';
import { cn } from '../utils';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function ResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'analysis' | 'review'>('summary');

  useEffect(() => {
    fetch(`/api/results/${id}`)
      .then(res => res.json())
      .then(data => {
        setResult(data);
        // Fetch questions for review
        fetch(`/api/exams/${data.exam_id}`)
          .then(res => res.json())
          .then(examData => setQuestions(examData.questions));
      });
  }, [id]);

  if (!result) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  const pieData = [
    { name: 'Correct', value: result.correct_answers, color: '#10b981' },
    { name: 'Wrong', value: result.wrong_answers, color: '#ef4444' },
    { name: 'Unattempted', value: (result.exam_total_questions || 0) - result.total_attempted, color: '#94a3b8' },
  ];

  // Topic-wise analysis
  const topicStats = questions.reduce((acc: any[], q, idx) => {
    const topicName = q.topic || 'General';
    let topic = acc.find(t => t.name === topicName);
    if (!topic) {
      topic = { name: topicName, correct: 0, total: 0 };
      acc.push(topic);
    }
    topic.total++;
    if (result.user_answers[idx] === q.correct_option) {
      topic.correct++;
    }
    return acc;
  }, []);

  // Time analysis data
  const timeData = Object.entries(result.time_spent_per_question || {}).map(([idx, time]) => ({
    question: parseInt(idx) + 1,
    seconds: time
  }));

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
            <Trophy className="w-10 h-10 text-yellow-300" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Test Completed!</h1>
          <p className="text-indigo-100 text-lg">{result.exam_title}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10">
        {/* Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm p-1 mb-8 border border-slate-200 sticky top-4 z-10">
          {(['summary', 'analysis', 'review'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-3 rounded-lg font-bold text-sm transition-all capitalize",
                activeTab === tab ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'summary' && (
          <div className="space-y-8">
            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="text-slate-500 text-sm font-medium mb-1">Your Score</p>
                <p className="text-3xl font-bold text-slate-900">{result.score.toFixed(2)}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-slate-500 text-sm font-medium mb-1">Accuracy</p>
                <p className="text-3xl font-bold text-slate-900">{result.accuracy.toFixed(1)}%</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-slate-500 text-sm font-medium mb-1">Percentile</p>
                <p className="text-3xl font-bold text-slate-900">84.2</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-slate-500 text-sm font-medium mb-1">Tab Switches</p>
                <p className="text-3xl font-bold text-slate-900">{result.tab_switches}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Performance Chart */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Performance Breakdown
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                <h3 className="text-xl font-bold mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <span className="text-slate-600 font-medium">Total Questions</span>
                    <span className="font-bold">{result.exam_total_questions}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <span className="text-slate-600 font-medium">Attempted</span>
                    <span className="font-bold">{result.total_attempted}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-emerald-50 text-emerald-700 rounded-2xl">
                    <span className="font-medium">Correct Answers</span>
                    <span className="font-bold">{result.correct_answers}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-red-50 text-red-700 rounded-2xl">
                    <span className="font-medium">Wrong Answers</span>
                    <span className="font-bold">{result.wrong_answers}</span>
                  </div>
                </div>
                <Link 
                  to="/exams"
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Take Another Test
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-8">
            {/* Time Analysis */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Time Spent Per Question (Seconds)
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeData}>
                    <XAxis dataKey="question" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="seconds" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Topic Analysis */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold mb-6">Topic-wise Strength</h3>
              <div className="space-y-6">
                {topicStats.map((topic: any) => (
                  <div key={topic.name} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span>{topic.name}</span>
                      <span>{topic.correct}/{topic.total} Correct</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${(topic.correct / topic.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'review' && (
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">Question {idx + 1}</span>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{q.topic}</span>
                </div>
                
                <div className="space-y-4">
                  <p className="text-lg font-medium text-slate-800">{q.question_text}</p>
                  {q.question_hindi && <p className="text-slate-500 italic">{q.question_hindi}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'A', text: q.option_a },
                    { key: 'B', text: q.option_b },
                    { key: 'C', text: q.option_c },
                    { key: 'D', text: q.option_d },
                  ].map((opt) => {
                    const isUserChoice = result.user_answers[idx] === opt.key;
                    const isCorrect = q.correct_option === opt.key;
                    
                    return (
                      <div 
                        key={opt.key}
                        className={cn(
                          "p-4 rounded-xl border-2 flex items-center gap-3",
                          isCorrect 
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800" 
                            : isUserChoice && !isCorrect
                              ? "border-red-200 bg-red-50 text-red-800"
                              : "border-slate-50 bg-slate-50 text-slate-600"
                        )}
                      >
                        <span className="font-bold">{opt.key}.</span>
                        <span>{opt.text}</span>
                        {isCorrect && <CheckCircle2 className="w-5 h-5 ml-auto" />}
                        {isUserChoice && !isCorrect && <XCircle className="w-5 h-5 ml-auto" />}
                      </div>
                    );
                  })}
                </div>

                {(q.solution || q.tricks) && (
                  <div className="bg-indigo-50 p-6 rounded-2xl space-y-4">
                    {q.solution && (
                      <div className="flex gap-3">
                        <BookOpen className="w-5 h-5 text-indigo-600 shrink-0 mt-1" />
                        <div>
                          <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Detailed Solution</p>
                          <p className="text-slate-700 text-sm leading-relaxed">{q.solution}</p>
                        </div>
                      </div>
                    )}
                    {q.tricks && (
                      <div className="flex gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
                        <div>
                          <p className="text-xs font-bold text-amber-600 uppercase mb-1">Expert Trick</p>
                          <p className="text-slate-700 text-sm leading-relaxed">{q.tricks}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
