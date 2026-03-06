import { Link } from 'react-router-dom';
import { GraduationCap, Github, Twitter, Mail, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
              <GraduationCap className="w-8 h-8" />
              <span>ExamPrep Pro</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              India's most trusted platform for government exam preparation. Real CBT interface, high-quality content, and detailed analytics.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link to="/exams" className="hover:text-indigo-600 transition-colors">Browse Exams</Link></li>
              <li><Link to="/leaderboard" className="hover:text-indigo-600 transition-colors">Leaderboard</Link></li>
              <li><Link to="/register" className="hover:text-indigo-600 transition-colors">Create Account</Link></li>
              <li><Link to="/login" className="hover:text-indigo-600 transition-colors">Candidate Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Admin</h4>
            <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
              <ShieldCheck className="w-4 h-4" />
              Admin Portal
            </Link>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs">© 2024 ExamPrep Pro. All rights reserved. Made with ❤️ for Indian Students.</p>
          <div className="flex gap-4 text-slate-400">
            <a href="#" className="hover:text-indigo-600 transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-indigo-600 transition-colors"><Github className="w-5 h-5" /></a>
            <a href="#" className="hover:text-indigo-600 transition-colors"><Mail className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
