import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, ChevronRight, Search } from 'lucide-react';

const categoryData: Record<string, { title: string, description: string, subCategories: { name: string, count: number }[] }> = {
  'SSC': {
    title: 'SSC Exams',
    description: 'Prepare for SSC CGL, CHSL, MTS, GD Constable, and other Staff Selection Commission exams.',
    subCategories: [
      { name: 'SSC CGL', count: 45 },
      { name: 'SSC CHSL', count: 32 },
      { name: 'SSC MTS', count: 28 },
      { name: 'SSC GD Constable', count: 20 },
      { name: 'SSC CPO', count: 15 },
      { name: 'SSC Stenographer', count: 12 },
    ]
  },
  'Banking': {
    title: 'Banking Exams',
    description: 'Mock tests for IBPS PO, Clerk, SBI PO, Clerk, RRB, and other banking sector recruitment exams.',
    subCategories: [
      { name: 'SBI PO', count: 25 },
      { name: 'SBI Clerk', count: 30 },
      { name: 'IBPS PO', count: 28 },
      { name: 'IBPS Clerk', count: 35 },
      { name: 'IBPS RRB PO', count: 20 },
      { name: 'RBI Assistant', count: 10 },
    ]
  },
  'Railway': {
    title: 'Railway Exams',
    description: 'Practice for RRB NTPC, Group D, ALP, and other Indian Railway recruitment tests.',
    subCategories: [
      { name: 'RRB NTPC', count: 50 },
      { name: 'RRB Group D', count: 40 },
      { name: 'RRB ALP', count: 15 },
      { name: 'RRB JE', count: 10 },
    ]
  },
  'UPSC': {
    title: 'UPSC Exams',
    description: 'Civil Services, NDA, CDS, and other Union Public Service Commission examination mocks.',
    subCategories: [
      { name: 'UPSC CSE (IAS)', count: 15 },
      { name: 'UPSC NDA', count: 20 },
      { name: 'UPSC CDS', count: 18 },
      { name: 'UPSC CAPF', count: 10 },
    ]
  },
  'State Exams': {
    title: 'State Level Exams',
    description: 'Mock tests for various state-level recruitment exams like UPPSC, BPSC, MPSC, etc.',
    subCategories: [
      { name: 'UPPSC', count: 25 },
      { name: 'BPSC', count: 20 },
      { name: 'MPSC', count: 15 },
      { name: 'WBCS', count: 12 },
    ]
  }
};

export default function CategoryPage() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const data = categoryName ? categoryData[categoryName] : null;

  if (!data) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900">Category not found</h2>
        <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <section className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest">
            <Link to="/" className="hover:underline">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span>{data.title}</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">{data.title}</h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed">{data.description}</p>
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
          placeholder={`Search in ${data.title}...`}
        />
      </div>

      {/* Sub-categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.subCategories.map((sub, idx) => (
          <motion.div
            key={sub.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link 
              to="/exams" 
              className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{sub.name}</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{sub.count} Mock Tests</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
