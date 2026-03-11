import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, ChevronRight, Search, Clock, HelpCircle } from 'lucide-react';
import { Exam } from '../types';
import { api } from '../services/api';

export default function CategoryPage() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.getExams()
      .then(data => {
        if (Array.isArray(data)) {
          const filtered = data.filter((exam: Exam) => exam.category === categoryName);
          setExams(filtered);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching exams:", err);
        setLoading(false);
      });
  }, [categoryName]);

  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryDescription = (name: string) => {
    switch (name) {
      case 'SSC': return 'Prepare for SSC CGL, CHSL, MTS, GD Constable, and other Staff Selection Commission exams.';
      case 'Banking': return 'Mock tests for IBPS PO, Clerk, SBI PO, Clerk, RRB, and other banking sector recruitment exams.';
      case 'Railway': return 'Practice for RRB NTPC, Group D, ALP, and other Indian Railway recruitment tests.';
      case 'UPSC': return 'Civil Services, NDA, CDS, and other Union Public Service Commission examination mocks.';
      case 'Defence': return 'Prepare for NDA, CDS, AFCAT, and other defence services exams.';
      case 'State Exams': return 'Mock tests for various state-level recruitment exams like UPPSC, BPSC, MPSC, etc.';
      default: return `High-quality mock tests for ${name} examinations.`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <section className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest">
            <Link to="/" className="hover:underline">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span>{categoryName} Exams</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{categoryName} Exams</h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
            {getCategoryDescription(categoryName || '')}
          </p>
        </div>
      </section>

      {/* Search within category */}
      <div className="max-w-2xl relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          placeholder={`Search in ${categoryName} Exams...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Exams Grid */}
      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam, idx) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                <div className="p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {exam.type}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      {exam.duration} Min
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                    {exam.title}
                  </h3>
                  <div className="flex items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-1">
                      <HelpCircle className="w-4 h-4 text-slate-300" />
                      {exam.total_questions} Questions
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <Link 
                    to={`/exams/${exam.id}/instructions`} 
                    className="w-full bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-2xl font-black hover:bg-blue-600 hover:text-white transition-all text-center flex items-center justify-center gap-2 text-sm"
                  >
                    Start Mock Test
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
          <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">No tests found</h3>
          <p className="text-slate-500">We are currently adding more tests for this category. Please check back soon!</p>
          <Link to="/exams" className="text-blue-600 font-bold hover:underline mt-4 inline-block">View all available tests</Link>
        </div>
      )}
    </div>
  );
}
