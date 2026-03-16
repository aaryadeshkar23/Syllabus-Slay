import { Link, useLocation } from "wouter";
import { Sparkles, Flame, Trophy, Menu, X } from "lucide-react";
import { useStudyStore } from "@/store/use-study-store";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location] = useLocation();
  const { xp, streak } = useStudyStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.5)] group-hover:shadow-[0_0_25px_rgba(124,58,237,0.8)] transition-all duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white tracking-wide">
              Slay<span className="text-primary">Syllabus</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-white",
                    location === link.href ? "text-white" : "text-white/60"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-white/10" />

            {/* Gamification Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-semibold shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                <Flame className="w-4 h-4" />
                {streak}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-foreground text-sm font-semibold shadow-[0_0_10px_rgba(124,58,237,0.1)]">
                <Trophy className="w-4 h-4 text-primary" />
                {xp} XP
              </div>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-x-0 border-t-0"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-base font-medium",
                    location === link.href ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="flex items-center gap-4 px-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-1.5 text-orange-400 font-semibold">
                  <Flame className="w-5 h-5" />
                  {streak} Day Streak
                </div>
                <div className="flex items-center gap-1.5 text-primary-foreground font-semibold">
                  <Trophy className="w-5 h-5 text-primary" />
                  {xp} XP Total
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
