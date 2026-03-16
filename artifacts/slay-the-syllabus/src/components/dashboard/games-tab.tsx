import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, LayoutGrid, Zap, Shuffle, ChevronLeft } from "lucide-react";
import { MemoryMatchGame } from "./games/memory-match";
import { SpeedQuizGame } from "./games/speed-quiz";
import { WordScrambleGame } from "./games/word-scramble";
import { cn } from "@/lib/utils";

type GameId = "menu" | "memory" | "speed" | "scramble";

const GAMES = [
  {
    id: "memory" as GameId,
    title: "Memory Match",
    emoji: "🃏",
    description: "Flip cards and match study terms to their definitions. Train your recall!",
    badge: "Recall",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    gradient: "from-cyan-900/40 to-blue-900/40",
    border: "border-cyan-500/20 hover:border-cyan-400/50",
    glow: "hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]",
    icon: LayoutGrid,
    iconColor: "text-cyan-400",
    xp: "+15 XP per match",
  },
  {
    id: "speed" as GameId,
    title: "Speed Quiz",
    emoji: "⚡",
    description: "Answer MCQ questions against the clock. Faster answers = more points and combo bonuses!",
    badge: "Timed",
    badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    gradient: "from-orange-900/40 to-rose-900/40",
    border: "border-orange-500/20 hover:border-orange-400/50",
    glow: "hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]",
    icon: Zap,
    iconColor: "text-orange-400",
    xp: "+10–20 XP per question",
  },
  {
    id: "scramble" as GameId,
    title: "Word Scramble",
    emoji: "🔤",
    description: "Unscramble key terms extracted from your study material. Use hints when stuck!",
    badge: "Vocabulary",
    badgeColor: "text-green-400 bg-green-500/10 border-green-500/30",
    gradient: "from-green-900/40 to-emerald-900/40",
    border: "border-green-500/20 hover:border-green-400/50",
    glow: "hover:shadow-[0_0_20px_rgba(22,163,74,0.2)]",
    icon: Shuffle,
    iconColor: "text-green-400",
    xp: "+20 XP per word",
  },
];

export function GamesTab() {
  const [activeGame, setActiveGame] = useState<GameId>("menu");

  const game = GAMES.find(g => g.id === activeGame);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        {activeGame !== "menu" && (
          <button
            onClick={() => setActiveGame("menu")}
            className="p-2 rounded-xl glass-panel hover:bg-white/10 transition-colors border border-white/10"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}
        <div>
          <h2 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <Gamepad2 className="w-7 h-7 text-primary" />
            {activeGame === "menu" ? "Study Games" : game?.title}
          </h2>
          <p className="text-white/50 text-sm mt-0.5">
            {activeGame === "menu" ? "Learn while you play — earn XP for every correct answer" : game?.description}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeGame === "menu" ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {GAMES.map((g) => {
              const Icon = g.icon;
              return (
                <motion.button
                  key={g.id}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveGame(g.id)}
                  className={cn(
                    "group text-left p-6 rounded-3xl border bg-gradient-to-br transition-all duration-300 relative overflow-hidden",
                    g.gradient, g.border, g.glow, "glass-card"
                  )}
                >
                  <div className="absolute top-4 right-4 text-3xl">{g.emoji}</div>
                  <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-5 border border-white/10 group-hover:bg-white/10 transition-colors")}>
                    <Icon className={cn("w-6 h-6", g.iconColor)} />
                  </div>
                  <span className={cn("text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-full border mb-3 inline-block", g.badgeColor)}>
                    {g.badge}
                  </span>
                  <h3 className="text-xl font-display font-bold text-white mb-2">{g.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed mb-4">{g.description}</p>
                  <div className="text-xs font-medium text-white/40">{g.xp}</div>
                </motion.button>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="glass-card rounded-3xl p-6"
          >
            {activeGame === "memory" && <MemoryMatchGame />}
            {activeGame === "speed" && <SpeedQuizGame />}
            {activeGame === "scramble" && <WordScrambleGame />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
