import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Exam } from '../types';
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Instructions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    fetch(`/api/exams/${id}`)
      .then(res => res.json())
      .then(data => setExam(data));
  }, [id]);

  if (!exam) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-12 space-y-6 md:space-y-8">
      <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm space-y-4 md:space-y-6">
        <div className="flex items-center gap-3 text-indigo-600">
          <Info className="w-6 h-6 md:w-8 md:h-8" />
          <h1 className="text-2xl md:text-3xl font-bold">General Instructions</h1>
        </div>

        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p className="font-bold text-slate-900 text-sm md:text-base">Please read the instructions carefully before starting the test:</p>
          
          <div className="bg-amber-50 border-l-4 border-amber-400 p-3 md:p-4 rounded-r-lg flex gap-3">
            <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-amber-600 shrink-0" />
            <p className="text-xs md:text-sm text-amber-800">
              This is a mock test designed to simulate the real exam environment. Ensure you have a stable internet connection and a quiet environment.
            </p>
          </div>

          <ul className="list-disc pl-5 md:pl-6 space-y-2 text-sm md:text-base">
            <li>Total duration of the exam: <span className="font-bold text-slate-900">{exam.duration} minutes</span>.</li>
            <li>Total number of questions: <span className="font-bold text-slate-900">{exam.total_questions}</span>.</li>
            <li>The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination.</li>
            <li>The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:
              <ul className="mt-2 space-y-2">
                <li className="flex items-center gap-2"><span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-slate-200"></span> Not Visited</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-red-500"></span> Not Answered</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-emerald-500"></span> Answered</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-purple-500"></span> Marked for Review</li>
              </ul>
            </li>
            <li>Click on the question number in the Question Palette to go to that question directly.</li>
            <li>Click on <span className="font-bold">Save & Next</span> to save your answer for the current question and then go to the next question.</li>
          </ul>
        </div>

        <div className="pt-4 md:pt-6 border-t border-slate-100">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-4 h-4 md:w-5 md:h-5 mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="text-xs md:text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
              I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. I declare that I am not in possession of any prohibited gadgets like mobile phone, bluetooth devices etc.
            </span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
          <Link to="/exams" className="text-slate-500 font-semibold hover:text-slate-900 text-sm md:text-base">Back to Exams</Link>
          <button 
            disabled={!agreed}
            onClick={() => navigate(`/exams/${exam.id}/test`)}
            className={`w-full sm:w-auto px-6 md:px-10 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all flex items-center justify-center gap-2 ${
              agreed 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            I am ready to begin
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
