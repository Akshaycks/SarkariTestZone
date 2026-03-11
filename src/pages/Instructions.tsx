import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { cn } from '../utils';
import { Exam } from '../types';
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function Instructions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedLang, setSelectedLang] = useState('');

  useEffect(() => {
    if (id) {
      api.getExamById(id).then(data => setExam(data));
    }
  }, [id]);

  if (!exam) return null;

  if (page === 1) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-2xl font-bold text-slate-900">General Instructions</h1>
          </div>
          
          <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
            <section className="space-y-4">
              <p className="font-medium">1: The clock will be set at the server. The countdown timer at the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You need not terminate the examination or submit your paper.</p>
              <p className="font-medium">2: The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                <li className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="w-8 h-8 bg-white border border-slate-300 rounded flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <span>You have not visited the question yet.</span>
                </li>
                <li className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <span>You have not answered the question.</span>
                </li>
                <li className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="w-8 h-8 bg-emerald-500 text-white rounded flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <span>You have answered the question.</span>
                </li>
                <li className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="w-8 h-8 bg-purple-500 text-white rounded flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  <span>You have NOT answered the question, but have marked the question for review.</span>
                </li>
                <li className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="w-8 h-8 bg-yellow-400 text-slate-900 rounded flex items-center justify-center text-xs font-bold shrink-0">5</span>
                  <span>You have answered the question also marked it for review.</span>
                </li>
              </ul>
              <div className="p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-800 text-xs italic">
                The Mark For Review status for a question simply indicates that you would like to look at that question again. If a question is answered but marked for review, then the answer will be considered for evaluation unless the status is modified by the candidate.
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <section className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Navigating to a Question :</h3>
                <p>3: To answer a question, do the following:</p>
                <div className="space-y-3 pl-4">
                  <p><span className="font-bold text-blue-600">A:</span> Click on the question number in the Question Palette at the right of your screen to go to that numbered question directly. Note that using this option does NOT save your answer to the current question.</p>
                  <p><span className="font-bold text-blue-600">B:</span> Click on <span className="font-bold">Next</span> to save your answer for the current question and then go to the next question.</p>
                </div>
                <p className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 font-medium">
                  Note that your answer for the current question will not be saved if you navigate to another question directly by clicking on a question number without saving the answer to the previous question.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Answering a Question :</h3>
                <p>4: Procedure for answering a multiple choice (MCQ) type question:</p>
                <div className="space-y-2 pl-4">
                  <p><span className="font-bold text-blue-600">A:</span> Choose one answer from the options given below the question, click on the option to select that option.</p>
                  <p><span className="font-bold text-blue-600">B:</span> To deselect your chosen answer, click on the bubble of the chosen option again.</p>
                  <p><span className="font-bold text-blue-600">C:</span> To change your chosen answer, click on the bubble of another option.</p>
                  <p><span className="font-bold text-blue-600">D:</span> To save your answer, you MUST click on the <span className="font-bold">Next</span>.</p>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end">
          <button 
            onClick={() => setPage(2)}
            className="bg-blue-600 text-white px-12 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 space-y-8">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-slate-900">Other Important Instructions</h1>
        </div>
        
        <div className="space-y-8 text-sm text-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="border border-slate-700 p-3 text-left">Sl No.</th>
                  <th className="border border-slate-700 p-3 text-left">Section Name</th>
                  <th className="border border-slate-700 p-3 text-center">No. of Question</th>
                  <th className="border border-slate-700 p-3 text-center">Maximum Marks</th>
                  <th className="border border-slate-700 p-3 text-center">Sectional Timing</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {[
                  { id: 1, name: 'General Intelligence & Reasoning', q: 50, m: 50, t: '30 Min' },
                  { id: 2, name: 'General Knowledge & General Awareness', q: 50, m: 50, t: '30 Min' },
                  { id: 3, name: 'Quantitative Aptitude', q: 50, m: 50, t: '30 Min' },
                  { id: 4, name: 'English Comprehension', q: 50, m: 50, t: '30 Min' },
                ].map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-200 p-3">{row.id}</td>
                    <td className="border border-slate-200 p-3 font-medium">{row.name}</td>
                    <td className="border border-slate-200 p-3 text-center">{row.q}</td>
                    <td className="border border-slate-200 p-3 text-center">{row.m}</td>
                    <td className="border border-slate-200 p-3 text-center">{row.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900">AI Security & Proctoring:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0"></span>
                  <span className="text-red-600 font-bold">Camera access is mandatory. Your face movement and eye contact are monitored in real-time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0"></span>
                  <span className="text-red-600 font-bold">If your face is not detected or eye contact is lost, you will receive 3 warnings. After the 3rd warning, the test will be submitted automatically.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0"></span>
                  <span className="text-red-600 font-bold">If more than one face is detected (Dual Face) or a mobile phone is detected, the test will be submitted immediately without warning.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0"></span>
                  <span className="text-red-600 font-bold">Switching tabs or minimizing the window will result in immediate automatic submission.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="space-y-3">
                <label className="font-bold text-slate-800 block">Choose default Language:</label>
                <select 
                  className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 ring-blue-500 outline-none transition-all"
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                >
                  <option value="">Choose a Language</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>

              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex items-center mt-1">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                </div>
                <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors leading-relaxed">
                  I have read all the instructions carefully and have understood them. I agree not to chat or use unfair means in examinations. I understood that using unfair means of any sort for my own or someone else's advantage will lead to my immediate disqualification.
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-between items-center">
        <button 
          onClick={() => setPage(1)}
          className="text-slate-500 font-bold hover:text-slate-800 px-4 py-2"
        >
          Previous
        </button>
        <button 
          disabled={!agreed || !selectedLang}
          onClick={() => navigate(`/exams/${exam.id}/test?lang=${selectedLang}`)}
          className={cn(
            "px-12 py-3 rounded-lg font-bold transition-all shadow-lg",
            agreed && selectedLang
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100" 
              : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
          )}
        >
          I am ready to begin
        </button>
      </div>
    </div>
  );
}
