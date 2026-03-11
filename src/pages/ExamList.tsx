import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Exam } from '../types';
import { BookOpen, Clock, HelpCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../utils';

export default function ExamList() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetch('/api/exams')
      .then(res => res.json())
      .then(data => {
        setExams(data);
        setLoading(false);
      });
  }, []);

  const filteredExams = activeCategory === 'All' 
    ? exams 
    : exams.filter(exam => exam.category === activeCategory);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-4xl font-bold tracking-tight">Available Mock Tests</h1>
        <div className="flex flex-wrap gap-2">
          {['All', 'SSC', 'Banking', 'Railway', 'UPSC', 'Defence'].map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full border transition-all text-sm font-bold uppercase tracking-widest",
                activeCategory === cat 
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                  : "border-slate-200 text-slate-500 hover:bg-slate-100"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((exam, idx) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {exam.category}
                </span>
                <span className="text-slate-400 text-xs font-medium">Added recently</span>
              </div>
              <h3 className="text-xl font-bold group-hover:text-indigo-600 transition-colors">{exam.title}</h3>
              <div className="flex items-center gap-4 text-slate-500 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{exam.duration} Mins</span>
                </div>
                <div className="flex items-center gap-1">
                  <HelpCircle className="w-4 h-4" />
                  <span>{exam.total_questions} Qs</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <Link to={`/exams/${exam.id}/instructions`} className="w-full bg-white border border-indigo-600 text-indigo-600 py-2 rounded-lg font-bold hover:bg-indigo-600 hover:text-white transition-all text-center flex items-center justify-center gap-2">
                Take Test
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
