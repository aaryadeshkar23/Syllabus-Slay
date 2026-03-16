import { useState } from "react";
import { useStudyStore } from "@/store/use-study-store";
import { useGenerateStudyPlan } from "@workspace/api-client-react";
import { Calendar as CalendarIcon, Clock, BookOpen, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function StudyPlannerTab() {
  const { content } = useStudyStore();
  const [examDate, setExamDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(3);
  
  const { mutate: generate, isPending, data } = useGenerateStudyPlan();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !examDate) return;
    generate({ data: { syllabus: content, examDate, hoursPerDay } });
  };

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <CalendarIcon className="w-16 h-16 text-white/20 mb-4" />
        <h3 className="text-xl font-display text-white/60">Upload syllabus first.</h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Config Form */}
      <div className="glass-card p-6 rounded-3xl h-fit sticky top-24">
        <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-accent" />
          Plan Parameters
        </h3>
        
        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <label className="block text-sm text-white/70 mb-2">Exam Date</label>
            <input 
              type="date" 
              required
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 [color-scheme:dark]"
            />
          </div>
          
          <div>
            <label className="block text-sm text-white/70 mb-2">Hours Per Day ({hoursPerDay}h)</label>
            <input 
              type="range" 
              min="1" max="12" step="0.5"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || !examDate}
            className="w-full py-3 bg-gradient-to-r from-accent to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(217,70,239,0.3)]"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate Schedule"}
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="lg:col-span-2 space-y-6">
        {isPending && (
          <div className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
            <p className="text-white/60 animate-pulse">Calculating optimal study intervals...</p>
          </div>
        )}

        {data && !isPending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass-card p-6 rounded-3xl mb-6 bg-accent/5 border-accent/20">
              <h4 className="font-bold text-accent mb-2">Strategy Tips</h4>
              <ul className="list-disc pl-5 text-sm text-white/80 space-y-1">
                {data.tips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {data.plan.map((day, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-black/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-xs font-bold text-white z-10">
                    D{day.day}
                  </div>
                  
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-5 rounded-2xl glow-border">
                    <div className="flex justify-between items-center mb-3 text-xs font-medium text-white/50 border-b border-white/5 pb-2">
                      <span>{day.date}</span>
                      <span className="flex items-center gap-1 text-accent"><Clock className="w-3 h-3"/> {day.hours}h</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <strong className="text-sm text-white/90 flex items-center gap-1.5 mb-1.5"><BookOpen className="w-4 h-4 text-primary" /> Topics</strong>
                        <div className="flex flex-wrap gap-2">
                          {day.topics.map((t, i) => (
                            <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-white/70">{t}</span>
                          ))}
                        </div>
                      </div>
                      
                      {day.activities.length > 0 && (
                        <div className="pt-2 border-t border-white/5">
                          <strong className="text-xs text-white/50 uppercase tracking-wider block mb-1">Activities</strong>
                          <ul className="text-xs text-white/60 list-disc pl-4 space-y-0.5">
                            {day.activities.map((act, i) => <li key={i}>{act}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
