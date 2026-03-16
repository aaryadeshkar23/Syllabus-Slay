import { useState } from "react";
import { useStudyStore } from "@/store/use-study-store";
import { useGenerateQuiz } from "@workspace/api-client-react";
import type { QuizRequestDifficulty, QuizRequestQuestionType } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Loader2, ArrowRight, RefreshCcw } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

export function QuizTab() {
  const { content, addXP } = useStudyStore();
  const [difficulty, setDifficulty] = useState<QuizRequestDifficulty>("medium");
  const [count, setCount] = useState(5);
  
  const { mutate: generate, isPending, data } = useGenerateQuiz();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleStart = () => {
    if (!content) return;
    generate({ data: { content, difficulty, questionType: "mcq", count } });
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setQuizFinished(false);
  };

  const handleSelect = (option: string) => {
    if (showExplanation) return;
    setSelectedOption(option);
    setShowExplanation(true);
    
    if (!data) return;
    const isCorrect = option === data.questions[currentIndex].correctAnswer;
    if (isCorrect) {
      setScore(s => s + 1);
      addXP(10);
    }
  };

  const handleNext = () => {
    if (!data) return;
    if (currentIndex < data.questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
      if (score === data.questions.length) {
        confetti({ particleCount: 200, spread: 90, colors: ['#f59e0b', '#ef4444', '#10b981'] });
        addXP(100);
      }
    }
  };

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Target className="w-16 h-16 text-white/20 mb-4" />
        <h3 className="text-xl font-display text-white/60">No content provided yet.</h3>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {!data && !isPending && (
        <div className="glass-card p-10 rounded-3xl text-center space-y-8">
          <div>
            <Target className="w-16 h-16 text-orange-400 mx-auto mb-6" />
            <h2 className="text-3xl font-display font-bold text-white mb-2">Test Your Knowledge</h2>
            <p className="text-white/60">Generate a custom quiz based on your uploaded syllabus.</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-6 p-6 bg-black/20 rounded-2xl border border-white/5">
            <div className="flex flex-col gap-2 text-left">
              <label className="text-sm text-white/50 uppercase tracking-widest font-semibold">Difficulty</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400/50"
              >
                <option value="easy" className="bg-background">Easy</option>
                <option value="medium" className="bg-background">Medium</option>
                <option value="hard" className="bg-background">Hard</option>
                <option value="exam" className="bg-background">Exam Level</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2 text-left">
              <label className="text-sm text-white/50 uppercase tracking-widest font-semibold">Questions</label>
              <select 
                value={count} 
                onChange={(e) => setCount(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400/50"
              >
                <option value={5} className="bg-background">5 Questions</option>
                <option value={10} className="bg-background">10 Questions</option>
                <option value={15} className="bg-background">15 Questions</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] text-lg"
          >
            Start Quiz
          </button>
        </div>
      )}

      {isPending && (
        <div className="glass-card p-12 rounded-3xl flex flex-col items-center justify-center space-y-6">
          <Loader2 className="w-12 h-12 text-orange-400 animate-spin" />
          <h3 className="text-xl font-display text-white animate-pulse">Forging exam questions...</h3>
        </div>
      )}

      {data && !isPending && !quizFinished && (
        <motion.div 
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-3xl overflow-hidden glow-border border-orange-500/30"
        >
          <div className="bg-black/40 p-4 border-b border-white/5 flex justify-between items-center">
            <span className="text-orange-400 font-mono font-bold tracking-widest">
              Q {currentIndex + 1} / {data.questions.length}
            </span>
            <span className="text-white/50 text-sm">Score: {score}</span>
          </div>

          <div className="p-8 md:p-10 space-y-8">
            <h3 className="text-2xl md:text-3xl font-display font-semibold text-white leading-snug">
              {data.questions[currentIndex].question}
            </h3>

            <div className="space-y-3">
              {data.questions[currentIndex].options?.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === data.questions[currentIndex].correctAnswer;
                
                let stateClass = "bg-white/5 hover:bg-white/10 border-white/10";
                if (showExplanation) {
                  if (isCorrect) stateClass = "bg-green-500/20 border-green-500/50 text-green-100";
                  else if (isSelected) stateClass = "bg-red-500/20 border-red-500/50 text-red-100";
                  else stateClass = "bg-white/5 opacity-50 border-white/5";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(opt)}
                    disabled={showExplanation}
                    className={cn(
                      "w-full text-left p-5 rounded-xl border transition-all duration-300 text-lg",
                      stateClass
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-black/30 p-5 rounded-xl border border-white/10"
                >
                  <p className="text-white/80 leading-relaxed text-sm md:text-base">
                    <span className="text-orange-400 font-bold block mb-1">Explanation:</span>
                    {data.questions[currentIndex].explanation}
                  </p>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleNext}
                      className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all flex items-center gap-2"
                    >
                      {currentIndex === data.questions.length - 1 ? "View Results" : "Next Question"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {quizFinished && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 rounded-3xl text-center glow-border border-green-500/30"
        >
          <div className="text-6xl mb-6">
            {score === count ? "🏆" : score > count / 2 ? "🔥" : "📚"}
          </div>
          <h2 className="text-4xl font-display font-bold text-white mb-2">Quiz Complete!</h2>
          <p className="text-2xl text-white/80 mb-8">You scored <span className="text-green-400 font-bold">{score}</span> out of {count}</p>
          
          <button
            onClick={() => setQuizFinished(false) || generate({ data: { content, difficulty, questionType: "mcq", count } })}
            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center gap-2 mx-auto border border-white/20"
          >
            <RefreshCcw className="w-5 h-5" /> Retake Quiz
          </button>
        </motion.div>
      )}
    </div>
  );
}
