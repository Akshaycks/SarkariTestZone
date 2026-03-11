import { useState, useEffect } from 'react';
import { ExamResult } from '../types';
import { Trophy, Medal, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { api } from '../services/api';

export default function Leaderboard() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard()
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching leaderboard:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Global <span className="text-indigo-600">Leaderboard</span></h1>
        <p className="text-slate-500">Top performers across all mock tests.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Exam</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Score</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Accuracy</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((res, idx) => (
                <motion.tr 
                  key={res.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {idx === 0 && <Medal className="w-5 h-5 text-amber-500" />}
                      {idx === 1 && <Medal className="w-5 h-5 text-slate-400" />}
                      {idx === 2 && <Medal className="w-5 h-5 text-amber-700" />}
                      <span className={idx < 3 ? "font-bold text-slate-900" : "text-slate-500"}>#{idx + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-900">{res.student_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{res.exam_title}</td>
                  <td className="px-6 py-4">
                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold text-sm">
                      {res.score}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-emerald-600 font-bold">{res.accuracy.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(res.created_at), 'MMM d, yyyy')}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
