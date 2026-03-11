import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Tag, Share2, Bookmark, ExternalLink, FileText } from 'lucide-react';

interface Update {
  id: number;
  type: 'vacancy' | 'admit_card' | 'result';
  title: string;
  content: string;
  apply_link?: string;
  syllabus_link?: string;
  posted_date: string;
}

export default function UpdateBlog() {
  const { id } = useParams();
  const [update, setUpdate] = useState<Update | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/updates/${id}`)
      .then(res => res.json())
      .then(data => {
        setUpdate(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!update) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Update not found</h2>
        <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">Go back home</Link>
      </div>
    );
  }

  const typeColors = {
    vacancy: 'bg-blue-100 text-blue-700',
    admit_card: 'bg-emerald-100 text-emerald-700',
    result: 'bg-orange-100 text-orange-700'
  };

  const typeLabels = {
    vacancy: 'Latest Vacancy',
    admit_card: 'Admit Card',
    result: 'Exam Result'
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-12 max-w-4xl">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-6 md:mb-8 transition-colors group text-sm md:text-base"
      >
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Updates
      </Link>

      <motion.article 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl md:rounded-[40px] border border-slate-100 shadow-xl overflow-hidden"
      >
        {/* Header Image Placeholder */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-slate-100 to-slate-200 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Tag className="w-24 h-24 md:w-32 md:h-32" />
          </div>
          <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8">
            <span className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest ${typeColors[update.type]}`}>
              {typeLabels[update.type]}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-12 space-y-6 md:space-y-8">
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              {update.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-slate-400 font-bold text-[10px] md:text-sm uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                {new Date(update.posted_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-3 h-3 md:w-4 md:h-4" />
                {typeLabels[update.type]}
              </div>
            </div>
          </div>

          <div className="prose prose-slate prose-sm md:prose-lg max-w-none">
            <p className="text-base md:text-xl text-slate-600 leading-relaxed font-medium">
              {update.content}
            </p>
            {/* Mocking more content for blog feel */}
            <div className="mt-6 md:mt-8 space-y-4 md:space-y-6 text-slate-600 leading-relaxed text-sm md:text-base">
              <p>Candidates are advised to read the official notification carefully before applying. Ensure you meet all the eligibility criteria including age limit, educational qualification, and category-specific relaxations.</p>
              <h3 className="text-xl md:text-2xl font-black text-slate-900">Key Highlights:</h3>
              <ul className="list-disc pl-5 md:pl-6 space-y-1 md:space-y-2">
                <li>Official website link is active for registration.</li>
                <li>Last date for online application is approaching soon.</li>
                <li>Make sure to upload documents in the specified format and size.</li>
                <li>Keep a printout of the application form for future reference.</li>
              </ul>
              <p>Stay tuned to Prepinsta for more such updates and high-quality mock tests to boost your preparation.</p>
            </div>

            {/* Action Links */}
            <div className="mt-10 flex flex-wrap gap-4">
              {update.apply_link && (
                <a 
                  href={update.apply_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 group"
                >
                  <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {update.type === 'vacancy' ? 'Apply Now' : update.type === 'admit_card' ? 'Download Admit Card' : 'Check Result'}
                </a>
              )}
              {update.syllabus_link && (
                <a 
                  href={update.syllabus_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-black hover:border-blue-600 hover:text-blue-600 transition-all group"
                >
                  <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Download Syllabus
                </a>
              )}
            </div>
          </div>

          <div className="pt-8 md:pt-12 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors text-xs md:text-sm">
                <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                Share
              </button>
              <button className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors text-xs md:text-sm">
                <Bookmark className="w-4 h-4 md:w-5 md:h-5" />
                Save
              </button>
            </div>
            <div className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">
              Prepinsta Updates
            </div>
          </div>
        </div>
      </motion.article>

      {/* Recommended Section */}
      <div className="mt-12 md:mt-16 space-y-6 md:space-y-8">
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Other Recent Updates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* This would normally be fetched, but we'll just show a CTA */}
          <div className="bg-blue-600 p-6 md:p-8 rounded-2xl md:rounded-[32px] text-white space-y-3 md:space-y-4">
            <h3 className="text-lg md:text-xl font-bold">Prepare for this exam?</h3>
            <p className="text-blue-100 text-sm md:text-base">Take our latest mock tests designed by experts to crack this exam in your first attempt.</p>
            <Link to="/exams" className="inline-block bg-white text-blue-600 px-5 md:px-6 py-2 md:py-3 rounded-xl font-black hover:bg-blue-50 transition-all text-sm md:text-base">
              Explore Mock Tests
            </Link>
          </div>
          <div className="bg-slate-900 p-6 md:p-8 rounded-2xl md:rounded-[32px] text-white space-y-3 md:space-y-4">
            <h3 className="text-lg md:text-xl font-bold">Have any doubts?</h3>
            <p className="text-slate-400 text-sm md:text-base">Our AI Doubt Solver is available 24/7 to help you with any question related to this update.</p>
            <Link to="/ai-doubt-solver" className="inline-block bg-blue-600 text-white px-5 md:px-6 py-2 md:py-3 rounded-xl font-black hover:bg-blue-700 transition-all text-sm md:text-base">
              Ask AI Expert
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
