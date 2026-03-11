import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, ArrowRight, ChevronRight, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ExamUpdate } from '../types';

const AllUpdates: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const { user } = useAuth();
  const [updates, setUpdates] = useState<ExamUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.getUpdates()
      .then(data => {
        let filtered = data.filter((u: ExamUpdate) => u.type === type);
        if (user && user.exam_interest) {
          filtered = filtered.filter((u: ExamUpdate) => !u.category || u.category === user.exam_interest);
        }
        setUpdates(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching updates:', err);
        setLoading(false);
      });
  }, [type, user]);

  const getTitle = () => {
    switch (type) {
      case 'vacancy': return 'Latest Vacancies';
      case 'admit_card': return 'Admit Cards';
      case 'result': return 'Exam Results';
      default: return 'Latest Updates';
    }
  };

  const filteredUpdates = updates.filter(u => 
    u.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm text-slate-500" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li><Link to="/" className="hover:text-emerald-600">Home</Link></li>
            <li><ChevronRight className="w-4 h-4" /></li>
            <li className="font-medium text-slate-900">{getTitle()}</li>
          </ol>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
          <h1 className="text-3xl font-bold text-slate-900">{getTitle()}</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search updates..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-64 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredUpdates.length > 0 ? (
          <div className="grid gap-6">
            {filteredUpdates.map((update, index) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/update/${update.id}`}
                  className="block bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-emerald-200 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 uppercase tracking-wider mb-2">
                        <span className="px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                          {update.type.replace('_', ' ')}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400 normal-case font-normal">
                          <Calendar className="w-3 h-3" />
                          {new Date(update.posted_date).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {update.title}
                      </h3>
                      <p className="text-slate-600 mt-2 line-clamp-2 text-sm">
                        {update.content}
                      </p>
                    </div>
                    <div className="flex items-center text-emerald-600 font-medium text-sm group-hover:translate-x-1 transition-transform whitespace-nowrap">
                      Read Details <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No updates found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your search or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUpdates;
