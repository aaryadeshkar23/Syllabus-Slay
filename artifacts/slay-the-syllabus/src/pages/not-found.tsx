import { Link } from "wouter";
import { Ghost, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
      <div className="glass-card p-12 rounded-3xl max-w-md w-full glow-border">
        <Ghost className="w-20 h-20 text-white/20 mx-auto mb-6 animate-pulse" />
        <h1 className="text-4xl font-display font-bold text-white mb-2">404</h1>
        <p className="text-white/60 mb-8">The syllabus page you're looking for doesn't exist.</p>
        
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all">
          <ArrowLeft className="w-4 h-4" /> Go Home
        </Link>
      </div>
    </div>
  );
}
