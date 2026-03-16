import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Pomodoro } from "@/components/layout/pomodoro";
import { ExplainFloatingAction } from "@/components/layout/explain-floating-action";
import { UploadTab } from "@/components/dashboard/upload-tab";
import { SummaryTab } from "@/components/dashboard/summary-tab";
import { FlashcardsTab } from "@/components/dashboard/flashcards-tab";
import { QuizTab } from "@/components/dashboard/quiz-tab";
import { MindMapTab } from "@/components/dashboard/mindmap-tab";
import { StudyPlannerTab } from "@/components/dashboard/study-planner-tab";
import { ChatTab } from "@/components/dashboard/chat-tab";
import { GamesTab } from "@/components/dashboard/games-tab";
import { Upload, FileText, Layers, Target, Workflow, Calendar, MessageSquare, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  { id: "upload", label: "Knowledge Base", icon: Upload },
  { id: "summary", label: "Smart Summary", icon: FileText },
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "quiz", label: "Mock Quiz", icon: Target },
  { id: "mindmap", label: "Mind Map", icon: Workflow },
  { id: "planner", label: "Study Plan", icon: Calendar },
  { id: "chat", label: "AI Tutor", icon: MessageSquare },
  { id: "games", label: "Games", icon: Gamepad2 },
] as const;

type TabId = typeof TABS[number]["id"];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("upload");

  const renderTab = () => {
    switch (activeTab) {
      case "upload": return <UploadTab />;
      case "summary": return <SummaryTab />;
      case "flashcards": return <FlashcardsTab />;
      case "quiz": return <QuizTab />;
      case "mindmap": return <MindMapTab />;
      case "planner": return <StudyPlannerTab />;
      case "chat": return <ChatTab />;
      case "games": return <GamesTab />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex pt-16 min-h-screen">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 pt-16 w-64 glass-panel border-r border-white/5 hidden lg:block z-30">
          <div className="p-4 space-y-2">
            <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4 px-4">Study Tools</div>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                    isActive 
                      ? "bg-gradient-to-r from-primary/20 to-transparent text-primary border border-primary/20" 
                      : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-white/40 group-hover:text-white/70")} />
                  {tab.label}
                  {isActive && (
                    <motion.div layoutId="sidebar-indicator" className="absolute left-0 w-1 h-8 bg-primary rounded-r-full" />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64 p-4 md:p-8">
          {/* Mobile Tabs Dropdown (Visible only on small screens) */}
          <div className="lg:hidden mb-6">
            <select 
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabId)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
            >
              {TABS.map(t => (
                <option key={t.id} value={t.id} className="bg-background">{t.label}</option>
              ))}
            </select>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Pomodoro />
      <ExplainFloatingAction />
    </div>
  );
}
