import { Link } from "wouter";
import { motion } from "framer-motion";
import { Brain, Sparkles, BookOpen, Clock, Target, MessageSquare, Zap, ArrowRight } from "lucide-react";

export default function Landing() {
  const features = [
    { icon: Brain, title: "Smart Summaries", desc: "Turn hour-long lectures into 5-minute reads." },
    { icon: Zap, title: "AI Flashcards", desc: "Auto-generated spaced repetition decks." },
    { icon: Target, title: "Mock Quizzes", desc: "Test your knowledge before the actual exam." },
    { icon: Sparkles, title: "Mind Maps", desc: "Visualize complex topics instantly." },
    { icon: Clock, title: "Study Planner", desc: "Generate a custom day-by-day prep schedule." },
    { icon: MessageSquare, title: "Doubt Solver", desc: "Chat with an AI tutor that knows your syllabus." },
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
              Upload your notes, PDFs, or YouTube links. Get instant summaries, quizzes, flashcards, and a personalized study plan.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/dashboard" className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center gap-2">
                Start Grinding <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="px-8 py-4 rounded-full glass-panel text-white font-bold text-lg hover:bg-white/10 transition-all">
                See Features
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
              
              {/* Floating feature badges */}
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
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div id="features" className="py-24">
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
                transition={{ delay: idx * 0.1 }}
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

      </div>
    </div>
  );
}
