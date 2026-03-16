import { Link } from "wouter";
import { motion } from "framer-motion";
import { Brain, Sparkles, BookOpen, Clock, Target, MessageSquare, Zap, ArrowRight, Layers, Calendar, LayoutGrid, Shuffle, Gamepad2 } from "lucide-react";

export default function Landing() {
  const features = [
    { icon: Brain, title: "Smart Summaries", desc: "Turn hour-long lectures into 5-minute reads." },
    { icon: Zap, title: "AI Flashcards", desc: "Auto-generated spaced repetition decks." },
    { icon: Target, title: "Mock Quizzes", desc: "Test your knowledge before the actual exam." },
    { icon: Sparkles, title: "Mind Maps", desc: "Visualize complex topics instantly." },
    { icon: Clock, title: "Study Planner", desc: "Generate a custom day-by-day prep schedule." },
    { icon: MessageSquare, title: "Doubt Solver", desc: "Chat with an AI tutor that knows your syllabus." },
    { icon: Gamepad2, title: "Study Games", desc: "Learn through Memory Match, Speed Quiz & Word Scramble." },
  ];

  const studyModes = [
    {
      icon: Target,
      label: "Mock Quiz",
      desc: "MCQ, True/False, Fill-in-blank & Short Answer. Four difficulty levels.",
      color: "text-orange-400",
      bg: "from-orange-900/30 to-rose-900/30",
      border: "border-orange-500/20 hover:border-orange-400/40",
    },
    {
      icon: Layers,
      label: "Flashcards",
      desc: "Flip-card decks with XP rewards. Track mastery as you go.",
      color: "text-violet-400",
      bg: "from-violet-900/30 to-indigo-900/30",
      border: "border-violet-500/20 hover:border-violet-400/40",
    },
    {
      icon: Calendar,
      label: "Study Planner",
      desc: "Day-by-day schedule based on your exam date and hours available.",
      color: "text-accent",
      bg: "from-fuchsia-900/30 to-pink-900/30",
      border: "border-fuchsia-500/20 hover:border-fuchsia-400/40",
    },
    {
      icon: Gamepad2,
      label: "Games",
      desc: "Memory Match · Speed Quiz · Word Scramble. Study that doesn't feel like study.",
      color: "text-cyan-400",
      bg: "from-cyan-900/30 to-blue-900/30",
      border: "border-cyan-500/20 hover:border-cyan-400/40",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 py-12 lg:py-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 space-y-8 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm text-primary font-medium border-primary/30 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
              <Sparkles className="w-4 h-4" />
              Slay your exams with AI
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-display font-extrabold leading-tight text-white">
              Don't just pass.<br />
              <span className="text-gradient">Slay The Syllabus.</span>
            </h1>
            
            <p className="text-xl text-white/70 max-w-2xl mx-auto lg:mx-0">
              Upload your notes, PDFs, or YouTube links. Get instant summaries, quizzes, flashcards, a personalized study plan — and actually fun study games.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/dashboard" className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center gap-2">
                Start Grinding <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#modes" className="px-8 py-4 rounded-full glass-panel text-white font-bold text-lg hover:bg-white/10 transition-all">
                Explore Tools
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 relative w-full max-w-lg lg:max-w-none"
          >
            <div className="relative rounded-2xl overflow-hidden glass-card p-2 aspect-square max-h-[500px] glow-border">
              <img 
                src={`${import.meta.env.BASE_URL}images/avatar.png`} 
                alt="Student AI Avatar" 
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 -left-6 glass-panel px-4 py-3 rounded-2xl flex items-center gap-3"
              >
                <div className="bg-primary/20 p-2 rounded-lg text-primary"><BookOpen className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs text-white/50">Summary Generated</div>
                  <div className="text-sm font-bold text-white">2.5s</div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-20 -right-6 glass-panel px-4 py-3 rounded-2xl flex items-center gap-3"
              >
                <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400"><Target className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs text-white/50">Quiz Score</div>
                  <div className="text-sm font-bold text-white">100%</div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 -right-10 glass-panel px-4 py-3 rounded-2xl flex items-center gap-3"
              >
                <div className="bg-cyan-500/20 p-2 rounded-lg text-cyan-400"><Gamepad2 className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs text-white/50">XP Earned</div>
                  <div className="text-sm font-bold text-white">+150 XP</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* ---- Study Modes Section ---- */}
        <div id="modes" className="py-24">
          <div className="text-center mb-14">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 uppercase tracking-widest mb-4"
            >
              Study Modes
            </motion.div>
            <h2 className="text-3xl lg:text-5xl font-display font-bold text-white mb-4">Every Way to Learn, Covered</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">From structured revision to fun games — choose your study style.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studyModes.map((mode, idx) => {
              const Icon = mode.icon;
              return (
                <motion.div
                  key={mode.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link href="/dashboard">
                    <div className={`group glass-card p-7 rounded-3xl border bg-gradient-to-br cursor-pointer transition-all duration-300 hover:-translate-y-1 ${mode.bg} ${mode.border}`}>
                      <div className="flex items-start gap-5">
                        <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-white/10 transition-colors`}>
                          <Icon className={`w-7 h-7 ${mode.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-display font-bold text-white mb-2 flex items-center gap-2">
                            {mode.label}
                            <ArrowRight className={`w-4 h-4 ${mode.color} opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform transition-transform`} />
                          </h3>
                          <p className="text-white/60 text-sm leading-relaxed">{mode.desc}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              Open Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* ---- Full Features Grid ---- */}
        <div id="features" className="py-24 border-t border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-display font-bold text-white mb-4">Your Ultimate Study Arsenal</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">Everything you need to turn raw chaotic notes into structured knowledge.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.07 }}
                className="glass-card p-8 rounded-3xl hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:text-primary transition-colors border border-white/10">
                  <feat.icon className="w-7 h-7 text-white/70 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-3">{feat.title}</h3>
                <p className="text-white/60 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-16 text-center"
        >
          <div className="glass-card glow-border rounded-3xl p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[80px]" />
            <div className="relative">
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white mb-4">Ready to Slay?</h2>
              <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">Paste your notes, fire up the AI, and walk into your exam like you own the place.</p>
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(124,58,237,0.5)]">
                Start for Free <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
