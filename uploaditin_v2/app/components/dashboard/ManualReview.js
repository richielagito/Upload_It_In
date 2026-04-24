"use client";
import React, { useState } from 'react';
import { X, ArrowLeft, ArrowRight, ChevronDown, Check, Info, FileText, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, renderHighlightedEssay } from '@/lib/utils';

export default function ManualReview({ result, assignment, onClose, onSave }) {
  const [viewMode, setViewMode] = useState('highlight'); // 'highlight' or 'plain'
  const [reviewForm, setReviewForm] = useState({
    grade: result?.nilai || result?.grade || 0,
    feedback: result?.feedback || '',
    sub_criteria_scores: result?.sub_criteria_scores || []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (status) => {
    setIsSubmitting(true);
    await onSave(reviewForm, status);
    setIsSubmitting(false);
  };

  const score = reviewForm.grade;
  const similarity = result?.similarity ? (result.similarity * 100).toFixed(1) : "0";

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col font-sans text-slate-900 animate-in fade-in duration-300">
      {/* Topbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                <ArrowLeft size={18} className="text-slate-500" />
            </button>
            <div>
              <div className="text-sm font-bold text-slate-900">Manual Review — {assignment?.judul}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                {assignment?.class_name || 'Class Review'} &middot; Submission Review
              </div>
            </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            disabled={isSubmitting}
            onClick={() => handleSave('draft')} 
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50"
          >
            Save Draft
          </button>
          <button 
            disabled={isSubmitting}
            onClick={() => handleSave('published')}
            className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Approve & Publish
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Essay Panel */}
        <div className="flex-1 bg-white border-r border-slate-200 overflow-y-auto">
           <div className="max-w-4xl mx-auto p-10">
                {/* Header & Nav */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/10">
                            {result?.nama_murid?.charAt(0) || result?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                            <div className="text-base font-bold text-slate-900">{result?.nama_murid || result?.name}</div>
                            <div className="text-xs text-slate-500 font-medium">Submitted {result?.created_at}</div>
                        </div>
                    </div>
                </div>

                {/* Question Box */}
                <div className="bg-slate-50 border-l-4 border-slate-300 rounded-xl p-6 mb-8">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Info size={12} />
                        Assignment Question
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                        {assignment?.deskripsi}
                    </p>
                </div>

                {/* View Toggles */}
                <div className="flex bg-slate-100 p-1 rounded-xl w-fit mb-6">
                    <button 
                        onClick={() => setViewMode('highlight')}
                        className={cn(
                            "px-4 py-2 text-xs font-bold rounded-lg transition-all",
                            viewMode === 'highlight' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Tampilan Highlight
                    </button>
                    <button 
                        onClick={() => setViewMode('plain')}
                        className={cn(
                            "px-4 py-2 text-xs font-bold rounded-lg transition-all",
                            viewMode === 'plain' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Tampilan Biasa
                    </button>
                </div>

                {/* Legend (only in highlight mode) */}
                {viewMode === 'highlight' && (
                    <div className="flex flex-wrap gap-4 mb-8 p-3 bg-slate-50/50 rounded-xl border border-slate-100 w-fit">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <div className="w-4 h-2 rounded bg-green-500/20 border-b-2 border-green-500"></div>
                            Argumen Kuat
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <div className="w-4 h-2 rounded bg-red-500/20 border-b-2 border-red-500"></div>
                            Perlu Perbaikan
                        </div>
                    </div>
                )}

                {/* Essay Content */}
                <div className="prose prose-slate max-w-none">
                    <div className={cn(
                        "text-slate-800 leading-[2] font-serif text-lg p-2 rounded-xl transition-all",
                        viewMode === 'highlight' ? "bg-white" : "bg-white"
                    )}>
                        {viewMode === 'plain' ? (
                            <div className="whitespace-pre-wrap">{result?.essay_text || "No essay text available."}</div>
                        ) : (
                            <div className="whitespace-pre-wrap">
                                {renderHighlightedEssay(result?.essay_text, result?.highlights)}
                            </div>
                        )}
                    </div>
                </div>
           </div>
        </div>

        {/* Sidebar Panel */}
        <div className="w-[380px] bg-slate-50/50 overflow-y-auto flex flex-col">
            <div className="p-6 space-y-8 flex-1">
                {/* Score Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-700"></div>
                    <div className="text-5xl font-black text-primary mb-1 relative z-10">
                        {reviewForm.grade}<span className="text-slate-300 text-xl font-medium">/100</span>
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 relative z-10">AI Estimated Score</div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-bold border border-primary/10 relative z-10">
                        Gemini 3.1 Flash-Lite
                    </div>
                </div>

                {/* Similarity Stats */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Similarity</div>
                        <div className="text-2xl font-mono font-black text-slate-700 tracking-tight">{similarity}%</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                        <Check size={24} className="text-primary" />
                    </div>
                </div>

                {/* Sub-criteria Analysis */}
                {reviewForm.sub_criteria_scores && reviewForm.sub_criteria_scores.length > 0 && (
                    <div className="space-y-4">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Detailed Analysis</div>
                        <div className="space-y-3">
                            {reviewForm.sub_criteria_scores.map((sub, idx) => (
                                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm group hover:border-primary/20 transition-all">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-bold text-slate-700">Question {sub.question}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-mono text-slate-400">{(sub.similarity * 100).toFixed(0)}% sim</span>
                                            <input 
                                                type="number"
                                                value={sub.grade}
                                                onChange={e => {
                                                    const newScores = [...reviewForm.sub_criteria_scores];
                                                    newScores[idx].grade = parseInt(e.target.value) || 0;
                                                    setReviewForm({...reviewForm, sub_criteria_scores: newScores});
                                                }}
                                                className="w-14 text-right bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-primary focus:border-primary focus:ring-0 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary transition-all duration-500" 
                                            style={{ width: `${(sub.similarity * 100) || 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Manual Override Form */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Manual Feedback</div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Overall Grade</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    min="0" max="100"
                                    value={reviewForm.grade}
                                    onChange={(e) => setReviewForm({ ...reviewForm, grade: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-xl font-black text-primary focus:border-primary focus:ring-0 outline-none transition-all shadow-sm"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">/ 100</div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Feedback to Student</label>
                            <textarea 
                                value={reviewForm.feedback}
                                onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-sm font-medium text-slate-600 focus:border-primary focus:ring-0 outline-none transition-all min-h-[160px] shadow-sm leading-relaxed"
                                placeholder="Add your professional feedback for the student..."
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Action Footer */}
            <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                <button 
                    disabled={isSubmitting}
                    onClick={() => handleSave('published')}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold font-headline hover:bg-primary-container shadow-xl shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>Publish Result <ArrowRight size={20} /></>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
