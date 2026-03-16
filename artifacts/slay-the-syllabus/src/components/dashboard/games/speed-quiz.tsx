import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudyStore } from "@/store/use-study-store";
import { useGenerateQuiz } from "@workspace/api-client-react";
import { Loader2, Zap, Trophy, Timer, RefreshCcw, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

const TIME_PER_QUESTION = 15;

export function SpeedQuizGame() {
  const { content, addXP } = useStudyStore();
  const [gameState, setGameState] = useState<"idle" | "playing" | "result">("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const { mutate: generate, isPending, data } = useGenerateQuiz();

  const questions = data?.questions ?? [];
  const currentQ = questions[currentIndex];

  const goNext = useCallback(() => {
    setSelected(null);
    setIsCorrect(null);
    setTimeLeft(TIME_PER_QUESTION);
    if (currentIndex + 1 >= questions.length) {
      setGameState("result");
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
    } else {
      setCurrentIndex(i => i + 1);
    }
  }, [currentIndex, questions.length]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== "playing" || selected !== null) return;
    if (timeLeft <= 0) {
      // Time out — mark wrong
      setIsCorrect(false);
      setCombo(0);
      setAnswers(prev => [...prev, false]);
      setTimeout(goNext, 1200);
      return;
    }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameState, selected, goNext]);

  const startGame = () => {
    if (!content) return;
    generate({ data: { content, difficulty: "medium", questionType: "mcq", count: 8 } }, {
      onSuccess: () => {
        setGameState("playing");
        setCurrentIndex(0);
        setScore(0);
        setTimeLeft(TIME_PER_QUESTION);
        setSelected(null);
        setIsCorrect(null);
        setCombo(0);
        setMaxCombo(0);
        setAnswers([]);
      },
    });
  };

  const handleAnswer = (option: string) => {
    if (selected || !currentQ) return;
    setSelected(option);
    const correct = option === currentQ.correctAnswer;
    setIsCorrect(correct);
    setAnswers(prev => [...prev, correct]);

    if (correct) {
      // Speed bonus: more points for faster answers
      const speedBonus = Math.ceil((timeLeft / TIME_PER_QUESTION) * 10);
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(m => Math.max(m, newCombo));
      const pts = 10 + speedBonus + (newCombo > 2 ? newCombo * 2 : 0);
      setScore(s => s + pts);
      addXP(pts);
    } else {
      setCombo(0);
    }

    setTimeout(goNext, 1500);
  };

  if (!content) {
    return (
      <div className="text-center py-12 text-white/40">
        <p>Add content in the Knowledge Base tab first to play!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {gameState === "idle" && (
        <div className="text-center py-8 space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center">
            <Zap className="w-10 h-10 text-orange-400" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-white mb-2">Speed Quiz</h3>
            <p className="text-white/60 max-w-sm mx-auto">8 MCQ questions. 15 seconds each. Faster answers = more points. Chain combos for bonus XP!</p>
          </div>
          <button
            onClick={startGame}
            disabled={isPending}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold rounded-xl flex items-center gap-2 mx-auto shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:opacity-90 transition-opacity"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            {isPending ? "Generating..." : "Start Speed Quiz!"}
          </button>
        </div>
      )}

      {gameState === "playing" && currentQ && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="space-y-5"
          >
            {/* HUD */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-white/60">Q {currentIndex + 1}/{questions.length}</span>
                <span className="text-yellow-400 font-bold">{score} pts</span>
                {combo > 1 && (
                  <motion.span
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="text-orange-400 font-bold text-xs bg-orange-500/20 px-2 py-1 rounded-full"
                  >
                    {combo}x COMBO!
                  </motion.span>
                )}
              </div>
              {/* Timer bar */}
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-white/50" />
                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full transition-colors", timeLeft > 8 ? "bg-green-400" : timeLeft > 4 ? "bg-yellow-400" : "bg-red-400")}
                    style={{ width: `${(timeLeft / TIME_PER_QUESTION) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className={cn("text-sm font-bold w-6 text-right", timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-white")}>{timeLeft}</span>
              </div>
            </div>

            {/* Question */}
            <div className="glass-card p-6 rounded-2xl">
              <p className="text-lg font-medium text-white leading-relaxed">{currentQ.question}</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((opt, i) => {
                const isSelected = selected === opt;
                const isRight = opt === currentQ.correctAnswer;
                let cls = "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20";
                if (selected) {
                  if (isRight) cls = "border-green-400 bg-green-500/20 text-green-200";
                  else if (isSelected && !isRight) cls = "border-red-400 bg-red-500/20 text-red-200";
                  else cls = "border-white/5 bg-white/5 text-white/30 opacity-60";
                }
                return (
                  <motion.button
                    key={i}
                    whileHover={!selected ? { scale: 1.02 } : {}}
                    whileTap={!selected ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(opt)}
                    disabled={!!selected}
                    className={cn("p-4 rounded-xl text-left text-sm font-medium transition-all border", cls)}
                  >
                    <span className="mr-3 text-white/40 font-mono">{["A", "B", "C", "D"][i]}.</span>
                    {opt}
                    {selected && isRight && <CheckCircle2 className="w-4 h-4 text-green-400 inline ml-2" />}
                    {selected && isSelected && !isRight && <XCircle className="w-4 h-4 text-red-400 inline ml-2" />}
                  </motion.button>
                );
              })}
            </div>

            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("p-4 rounded-xl text-sm", isCorrect ? "bg-green-500/10 border border-green-500/30 text-green-300" : "bg-red-500/10 border border-red-500/30 text-red-300")}
              >
                {currentQ.explanation}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {gameState === "result" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6 space-y-6"
        >
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
          <div>
            <h3 className="text-3xl font-display font-bold text-white mb-1">Time's Up!</h3>
            <p className="text-white/60">{answers.filter(Boolean).length} / {questions.length} correct</p>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            <div className="glass-card p-4 rounded-2xl text-center">
              <div className="text-2xl font-bold text-yellow-400">{score}</div>
              <div className="text-xs text-white/50">Total Points</div>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <div className="text-2xl font-bold text-orange-400">{maxCombo}x</div>
              <div className="text-xs text-white/50">Best Combo</div>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <div className="text-2xl font-bold text-green-400">{Math.round((answers.filter(Boolean).length / questions.length) * 100)}%</div>
              <div className="text-xs text-white/50">Accuracy</div>
            </div>
          </div>
          {/* Answer recap */}
          <div className="flex gap-1.5 justify-center">
            {answers.map((a, i) => (
              <div key={i} className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", a ? "bg-green-500/30 text-green-300" : "bg-red-500/30 text-red-300")}>
                {a ? "✓" : "✗"}
              </div>
            ))}
          </div>
          <button
            onClick={startGame}
            disabled={isPending}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold rounded-xl flex items-center gap-2 mx-auto"
          >
            <RefreshCcw className="w-5 h-5" /> Play Again
          </button>
        </motion.div>
      )}
    </div>
  );
}
