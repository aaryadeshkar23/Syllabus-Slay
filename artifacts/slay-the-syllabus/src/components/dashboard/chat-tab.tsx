import { useState, useRef, useEffect } from "react";
import { useStudyStore } from "@/store/use-study-store";
import { useChatWithAI } from "@workspace/api-client-react";
import type { ChatMessage } from "@workspace/api-client-react";
import { MessageSquare, Send, Bot, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export function ChatTab() {
  const { content } = useStudyStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { mutate: chat, isPending } = useChatWithAI();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isPending) return;

    const newMsgs = [...messages, { role: "user" as const, content: input }];
    setMessages(newMsgs);
    setInput("");

    chat({ 
      data: { messages: newMsgs, context: content } 
    }, {
      onSuccess: (data) => {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col glass-card rounded-3xl overflow-hidden glow-border">
      {/* Header */}
      <div className="bg-black/40 p-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-white leading-tight">AI Tutor</h3>
          <p className="text-xs text-white/50">Ask anything about your syllabus</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-white/40 space-y-4">
            <MessageSquare className="w-16 h-16 opacity-50" />
            <p>I'm ready. Ask me to explain a concept, give you a pop question, or summarize a sub-topic.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className={cn(
              "flex gap-4 max-w-[85%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1",
              msg.role === "user" ? "bg-white/10" : "bg-primary/20 text-primary"
            )}>
              {msg.role === "user" ? <User className="w-4 h-4 text-white/70" /> : <Bot className="w-4 h-4" />}
            </div>
            
            <div className={cn(
              "px-5 py-3.5 rounded-2xl text-sm leading-relaxed",
              msg.role === "user" 
                ? "bg-primary text-white rounded-tr-sm" 
                : "bg-black/40 border border-white/10 text-white/90 rounded-tl-sm markdown-body"
            )}>
              {msg.role === "user" ? msg.content : <ReactMarkdown>{msg.content}</ReactMarkdown>}
            </div>
          </motion.div>
        ))}

        {isPending && (
          <div className="flex gap-4 max-w-[85%] mr-auto">
            <div className="w-8 h-8 rounded-full shrink-0 bg-primary/20 text-primary flex items-center justify-center mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-5 py-4 rounded-2xl bg-black/40 border border-white/10 rounded-tl-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-black/40 border-t border-white/5">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            disabled={isPending || !content}
            className="w-full bg-white/5 border border-white/10 rounded-full pl-6 pr-14 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isPending || !input.trim() || !content}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center disabled:opacity-50 transition-colors"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
          </button>
        </form>
        {!content && (
          <p className="text-center text-xs text-red-400 mt-2">Please upload syllabus content first to use the AI Tutor.</p>
        )}
      </div>
    </div>
  );
}
