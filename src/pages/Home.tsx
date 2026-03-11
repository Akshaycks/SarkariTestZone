import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, HelpCircle, LayoutDashboard, Flame, Target, CheckCircle2, Check, Star, Trophy, Bot, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user } = useAuth();
  const [streak, setStreak] = useState({ current_streak: 0, daily_goal_completed: 0 });
  const [updates, setUpdates] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [latestExams, setLatestExams] = useState<any[]>([]);

  const FIXED_CATEGORIES = [
    { name: 'SSC', color: 'bg-blue-500' },
    { name: 'Banking', color: 'bg-emerald-500' },
    { name: 'Railway', color: 'bg-orange-500' },
    { name: 'UPSC', color: 'bg-purple-500' },
    { name: 'Defence', color: 'bg-rose-500' }
  ];

  useEffect(() => {
    if (user) {
      fetch(`/api/streaks/${user.id}`)
        .then(res => res.json())
        .then(data => setStreak(data));
    }

    fetch('/api/updates')
      .then(res => res.json())
      .then(data => {
        if (user && user.exam_interest) {
          setUpdates(data.filter((u: any) => !u.category || u.category === user.exam_interest));
        } else {
          setUpdates(data);
        }
      });

    fetch('/api/faqs')
      .then(res => res.json())
      .then(data => setFaqs(data));

    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => setTestimonials(data));

    fetch('/api/exams')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLatestExams(data.slice(0, 6));
          
          const catsWithCounts = FIXED_CATEGORIES.map(cat => {
            const count = data.filter((exam: any) => exam.category === cat.name).length;
            return { ...cat, count };
          });
          
          setCategories(catsWithCounts);
        }
      })
      .catch(err => console.error("Error fetching exams:", err));
  }, [user]);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 lg:pt-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Text Content */}
            <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                  <span className="text-blue-600 bg-blue-50 px-2">SarkariTestZone,</span> <br />
                  Government Exams <br />
                  Simplified!!!
                </h1>
                
                <div className="pt-4">
                  <Link 
                    to="/register" 
                    className="inline-flex items-center justify-center bg-[#00D084] text-white px-8 lg:px-10 py-3 lg:py-4 rounded-full font-bold text-base lg:text-lg hover:bg-[#00B875] transition-all shadow-lg hover:scale-105"
                  >
                    Sign Up for Free
                  </Link>
                </div>

                <div className="flex flex-wrap justify-center lg:justify-start gap-x-4 lg:gap-x-6 gap-y-2 pt-4">
                  {['Aptitude', 'Reasoning', 'General Studies', 'English'].map((item) => (
                    <div key={item} className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs lg:text-sm">
                      <Check className="w-4 h-4 text-[#00D084] stroke-[3px]" />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Social Proof */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center lg:justify-start gap-4 pt-4"
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <img 
                      key={i}
                      src={`https://i.pravatar.cc/100?u=${i}`} 
                      className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-white shadow-sm"
                      alt="User"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-base lg:text-lg font-bold text-slate-900 leading-none">10 Million+</p>
                  <p className="text-[10px] lg:text-xs text-slate-500 font-medium">Monthly Active Learners</p>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Visuals */}
            <div className="relative hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10"
              >
                {/* Background Shape */}
                <div className="absolute -inset-4 bg-blue-600 rounded-[40px] rotate-3 opacity-5 blur-3xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[40px] -rotate-2 border border-blue-100/50"></div>
                
                {/* Main Image */}
                <div className="relative z-10 w-full h-[550px] overflow-hidden rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] group">
                  <img 
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" 
                    alt="Indian Students studying" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                </div>

                {/* Floating Badges */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] z-20 flex items-center gap-3 border border-slate-50"
                >
                  <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Success Story</p>
                    <p className="text-sm font-bold text-slate-900">Mayur Jain <span className="text-blue-600 ml-1">10 LPA</span></p>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-6 -right-6 bg-white p-5 rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] z-20 space-y-2 border border-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <span className="text-xl font-black text-slate-900">4.8</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Trustpilot Verified</p>
                  <div className="flex gap-1">
                    <div className="h-1.5 w-8 bg-blue-600 rounded-full"></div>
                    <div className="h-1.5 w-4 bg-slate-100 rounded-full"></div>
                    <div className="h-1.5 w-2 bg-slate-100 rounded-full"></div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Grid Background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] opacity-[0.15] pointer-events-none -z-10">
                <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#3b82f6 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Streak & Daily Goals (Only for logged in users) */}
      {user && (
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl mx-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Flame className="w-6 h-6 text-orange-400 fill-orange-400" />
                </div>
                <h2 className="text-2xl font-bold">Your Learning Streak</h2>
              </div>
              <p className="text-indigo-100 text-lg">
                You've been consistent for <span className="text-white font-bold text-3xl mx-1">{streak.current_streak}</span> days! Keep it up!
              </p>
              <div className="flex gap-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i < streak.current_streak % 7 ? 'bg-orange-400 border-orange-400 text-white' : 'border-white/30 text-white/30'}`}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold">Daily Goal</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded">1 Mock Test</span>
              </div>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${streak.daily_goal_completed ? 'bg-emerald-500' : 'bg-white/20'}`}>
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold">{streak.daily_goal_completed ? 'Goal Completed!' : 'Almost there!'}</p>
                  <p className="text-sm text-indigo-100">{streak.daily_goal_completed ? 'You have completed your goal for today.' : 'Complete 1 mock test to maintain your streak.'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="container mx-auto px-4 space-y-10">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Top Exam Categories</h2>
            <p className="text-slate-500 font-medium text-sm lg:text-base">Explore mock tests by your target exam category.</p>
          </div>
          <Link to="/exams" className="hidden sm:flex items-center gap-2 text-blue-600 font-bold hover:underline">
            View All Exams
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-8">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link
                to={`/category/${cat.name}`}
                className="bg-white p-6 lg:p-8 rounded-[24px] lg:rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)] hover:-translate-y-2 transition-all duration-500 cursor-pointer group relative overflow-hidden block"
              >
                <div className="absolute top-0 right-0 w-20 lg:w-24 h-20 lg:h-24 bg-slate-50 rounded-bl-[100px] -z-10 transition-colors group-hover:bg-blue-50"></div>
                <div className={`w-12 h-12 lg:w-14 lg:h-14 ${cat.color} rounded-xl lg:rounded-2xl mb-4 lg:mb-6 flex items-center justify-center text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                  <BookOpen className="w-6 h-6 lg:w-7 lg:h-7" />
                </div>
                <h3 className="text-xl lg:text-2xl font-black mb-2 text-slate-900 tracking-tight">{cat.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-slate-400 text-[10px] lg:text-xs font-black uppercase tracking-widest">{cat.count} Tests</p>
                  <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Latest Mock Tests Section */}
      <section className="container mx-auto px-4 space-y-10">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Latest Mock Tests</h2>
            <p className="text-slate-500 font-medium text-sm lg:text-base">Freshly added mock tests to boost your preparation.</p>
          </div>
          <Link to="/exams" className="flex items-center gap-2 text-blue-600 font-bold hover:underline">
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestExams.map((exam, idx) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
            >
              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {exam.category}
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
                  Take Mock Test
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">What Our Students Say</h2>
          <p className="text-slate-500 max-w-xl mx-auto font-medium text-sm lg:text-base">Join thousands of successful candidates who cracked their exams with SarkariTestZone.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={testimonial.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-slate-600 italic mb-6">"{testimonial.content}"</p>
              <div className="flex items-center gap-4">
                <img src={testimonial.avatar || `https://i.pravatar.cc/150?u=${testimonial.name}`} alt={testimonial.name} className="w-12 h-12 rounded-full border-2 border-blue-50 object-cover" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Latest Updates Section */}
      <section className="container mx-auto px-4">
        <div className="bg-white rounded-2xl md:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Vacancies */}
            <div className="p-6 md:p-8 space-y-4 md:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 rounded-lg md:rounded-xl flex items-center justify-center text-blue-600">
                  <Target className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <h3 className="text-lg md:text-xl font-black text-slate-900">Latest Vacancies</h3>
              </div>
              <div className="space-y-3 md:space-y-4">
                {updates.filter(u => u.type === 'vacancy').slice(0, 3).map((item, i) => (
                  <Link key={i} to={`/update/${item.id}`} className="block group cursor-pointer">
                    <p className="text-xs md:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">{item.title}</p>
                    <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase mt-1">
                      {new Date(item.posted_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </Link>
                ))}
              </div>
              <Link 
                to="/updates/vacancy" 
                className="inline-block text-blue-600 text-[10px] md:text-xs font-black uppercase tracking-widest hover:underline"
              >
                View All Vacancies
              </Link>
            </div>

            {/* Admit Cards */}
            <div className="p-6 md:p-8 space-y-4 md:space-y-6 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 rounded-lg md:rounded-xl flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <h3 className="text-lg md:text-xl font-black text-slate-900">Admit Cards</h3>
              </div>
              <div className="space-y-3 md:space-y-4">
                {updates.filter(u => u.type === 'admit_card').slice(0, 3).map((item, i) => (
                  <Link key={i} to={`/update/${item.id}`} className="block group cursor-pointer">
                    <p className="text-xs md:text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-2">{item.title}</p>
                    <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase mt-1">
                      {new Date(item.posted_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </Link>
                ))}
              </div>
              <Link 
                to="/updates/admit_card" 
                className="inline-block text-emerald-600 text-[10px] md:text-xs font-black uppercase tracking-widest hover:underline"
              >
                Download Admit Cards
              </Link>
            </div>

            {/* Results */}
            <div className="p-6 md:p-8 space-y-4 md:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-50 rounded-lg md:rounded-xl flex items-center justify-center text-orange-600">
                  <Trophy className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <h3 className="text-lg md:text-xl font-black text-slate-900">Exam Results</h3>
              </div>
              <div className="space-y-3 md:space-y-4">
                {updates.filter(u => u.type === 'result').slice(0, 3).map((item, i) => (
                  <Link key={i} to={`/update/${item.id}`} className="block group cursor-pointer">
                    <p className="text-xs md:text-sm font-bold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-2">{item.title}</p>
                    <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase mt-1">
                      {new Date(item.posted_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </Link>
                ))}
              </div>
              <Link 
                to="/updates/result" 
                className="inline-block text-orange-600 text-[10px] md:text-xs font-black uppercase tracking-widest hover:underline"
              >
                Check All Results
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Doubt Solver CTA */}
      <section className="container mx-auto px-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl md:rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-4 md:space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-blue-200" />
                <span className="text-[10px] font-black uppercase tracking-widest">New Feature</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight">Stuck on a problem? Ask our AI Expert!</h2>
              <p className="text-blue-100 text-sm md:text-lg font-medium max-w-md mx-auto md:mx-0">Get instant, step-by-step solutions for Math, Reasoning, and General Studies doubts. Available 24/7 for your success.</p>
              <Link 
                to="/ai-doubt-solver" 
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black hover:bg-blue-50 transition-all shadow-xl hover:scale-105 text-sm md:text-base"
              >
                Try AI Doubt Solver
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </Link>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="w-48 h-48 lg:w-64 lg:h-64 bg-white/10 rounded-[32px] lg:rounded-[40px] backdrop-blur-xl border border-white/20 flex items-center justify-center relative z-10">
                  <Bot className="w-24 h-24 lg:w-32 lg:h-32 text-white animate-bounce-slow" />
                </div>
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-blue-400 rounded-full blur-2xl opacity-50"></div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-indigo-400 rounded-full blur-3xl opacity-50"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-slate-500 max-w-xl mx-auto font-medium">Everything you need to know about SarkariTestZone and how we help you succeed.</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={faq.id || idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors group"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                {faq.question}
              </h3>
              <p className="text-slate-600 leading-relaxed pl-8">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
