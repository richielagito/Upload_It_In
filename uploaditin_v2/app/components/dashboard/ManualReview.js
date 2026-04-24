"use client";
import React, { useState } from 'react';
import { X, ArrowLeft, ArrowRight, ChevronDown, Check, Info, FileText, BookOpen, Clock, Download, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, renderHighlightedEssay } from '@/lib/utils';
import FileCard from './FileCard';

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

  const similarity = result?.similarity ? (result.similarity * 100).toFixed(1) : "0";

  const getFilenameFromUrl = (url) => {
    if (!url) return "";
    return url.split('/').pop().split('?')[0];
  };

  return (
    <div className="fixed inset-0 bg-white z-[150] flex flex-col font-sans text-slate-900 animate-in fade-in duration-300">
      {/* Topbar */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm relative z-20">
        <div className="flex items-center gap-6">
            <button onClick={onClose} className="group flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold font-headline">
                <ArrowLeft size={20} />
                <span>Exit Review</span>
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <h2 className="text-lg font-extrabold text-foreground font-headline tracking-tight">{assignment?.judul}</h2>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-2">
                <span className="text-primary">{assignment?.class_name}</span>
                <span className="text-slate-300">&bull;</span>
                <span>{result?.nama_murid || result?.name}</span>
              </div>
            </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            disabled={isSubmitting}
            onClick={() => handleSave('draft')} 
            className="px-6 py-2.5 text-slate-600 text-sm font-bold rounded-2xl hover:bg-slate-50 transition-all disabled:opacity-50 font-headline"
          >
            Save Draft
          </button>
          <button 
            disabled={isSubmitting}
            onClick={() => handleSave('published')}
            className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-2xl hover:bg-primary-container transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 font-headline"
          >
            {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <Check size={18} />
            )}
            Approve & Publish
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Essay Panel */}
        <div className="flex-1 bg-white overflow-y-auto relative z-10 border-r border-slate-100">
           <div className="max-w-4xl mx-auto p-10 lg:p-16 space-y-12">
                {/* Header Info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-3xl bg-primary/5 text-primary flex items-center justify-center font-black text-2xl border-2 border-primary/10 shadow-sm">
                            {result?.nama_murid?.charAt(0) || result?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                            <div className="text-xl font-extrabold text-foreground font-headline tracking-tight">{result?.nama_murid || result?.name}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-1.5">
                                <Clock size={14} className="text-primary/60" />
                                Submitted {result?.created_at}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Simplified Assignment Description */}
                <div className="space-y-4">
                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Assignment Description
                    </div>
                    <p className="text-slate-600 leading-relaxed font-sans font-medium text-base">
                        {assignment?.deskripsi}
                    </p>
                    
                    {/* Assignment Files (Simple list) */}
                    {assignment?.file_path && (
                        <div className="flex items-center gap-3 pt-2">
                             <div 
                                onClick={() => window.open(assignment.file_path, '_blank')}
                                className="flex items-center gap-2 text-xs font-bold text-primary hover:underline cursor-pointer"
                             >
                                <FileText size={14} />
                                {getFilenameFromUrl(assignment.file_path)}
                             </div>
                        </div>
                    )}
                </div>

                {/* View Controls & Content */}
                <div className="space-y-8 pt-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                        <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
                            <button 
                                onClick={() => setViewMode('highlight')}
                                className={cn(
                                    "px-6 py-2.5 text-xs font-bold rounded-xl transition-all font-headline",
                                    viewMode === 'highlight' ? "bg-white text-primary shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                AI Highlights
                            </button>
                            <button 
                                onClick={() => setViewMode('plain')}
                                className={cn(
                                    "px-6 py-2.5 text-xs font-bold rounded-xl transition-all font-headline",
                                    viewMode === 'plain' ? "bg-white text-primary shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                Original Text
                            </button>
                        </div>

                        {viewMode === 'highlight' && (
                             <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50"></div>
                                    Strengths
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50"></div>
                                    Improvements
                                </div>
                             </div>
                        )}
                    </div>

                    <div className="relative overflow-visible">
                        <div className="prose prose-slate max-w-none overflow-visible">
                            <div className="text-slate-800 leading-[2.2] font-serif text-[19px] whitespace-pre-wrap antialiased overflow-visible">
                                {viewMode === 'plain' ? (
                                    result?.essay_text || "No essay text available."
                                ) : (
                                    renderHighlightedEssay(result?.essay_text, result?.highlights)
                                )}
                            </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-slate-50 flex justify-end">
                            <span className="text-xs text-slate-400 font-medium italic flex items-center gap-2">
                                <Info size={14} />
                                Hover over highlights to see detailed feedback from Gemini
                            </span>
                        </div>
                    </div>
                </div>
           </div>
        </div>

        {/* Sidebar Panel */}
        <div className="w-full lg:w-[420px] bg-slate-50/50 overflow-y-auto relative z-10 flex flex-col shadow-[inset_1px_0_0_0_rgba(0,0,0,0.05)]">
            <div className="p-8 lg:p-10 space-y-10 flex-1">
                {/* Score Section */}
                <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 shadow-sm text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-125 duration-700"></div>
                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 font-sans relative z-10">AI Prediction</div>
                    <div className="text-7xl font-black text-primary font-headline tracking-tighter relative z-10">
                        {reviewForm.grade}<span className="text-slate-300 text-3xl font-medium tracking-normal ml-1">/100</span>
                    </div>
                    <div className="mt-8 inline-flex items-center gap-2 px-5 py-2 bg-primary/5 text-primary rounded-full text-[11px] font-black uppercase tracking-widest border border-primary/10 relative z-10">
                        <BookOpen size={16} />
                        Gemini 3.1 Pro
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm group hover:border-primary/20 transition-all text-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-sans">Similarity</div>
                        <div className="text-2xl font-mono font-black text-slate-700 tracking-tighter">{similarity}%</div>
                    </div>
                    <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm group hover:border-primary/20 transition-all text-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-sans">Confidence</div>
                        <div className="text-2xl font-mono font-black text-slate-700 tracking-tighter">High</div>
                    </div>
                </div>

                {/* AI Summary Section */}
                <div className="space-y-4">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 font-sans">AI Executive Summary</div>
                    <div className="bg-primary/5 border-2 border-primary/10 rounded-[2rem] p-8 shadow-sm relative group">
                        <p className="text-[15px] text-slate-700 leading-relaxed font-semibold italic text-center lg:text-left">
                            &quot;{result?.feedback || "Gemini has finished analyzing the essay and provided detailed feedback below."}&quot;
                        </p>
                    </div>
                </div>

                {/* Aspects Breakdown */}
                <div className="space-y-6">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 font-sans">Detailed Breakdown</div>
                    <div className="space-y-4">
                        {reviewForm.sub_criteria_scores && reviewForm.sub_criteria_scores.length > 0 ? (
                            reviewForm.sub_criteria_scores.map((sub, idx) => (
                                <div key={idx} className="bg-white border-2 border-slate-50 rounded-3xl p-6 shadow-sm group hover:border-primary/20 transition-all">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-extrabold text-foreground font-headline group-hover:text-primary transition-colors">Question {sub.question}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-mono font-bold text-slate-400">{(sub.similarity * 100).toFixed(0)}% Match</span>
                                            <input 
                                                type="number"
                                                value={sub.grade}
                                                onChange={e => {
                                                    const newScores = [...reviewForm.sub_criteria_scores];
                                                    newScores[idx].grade = parseInt(e.target.value) || 0;
                                                    setReviewForm({...reviewForm, sub_criteria_scores: newScores});
                                                }}
                                                className="w-16 text-right bg-surface-low border border-slate-100 rounded-xl px-3 py-2 text-sm font-black text-primary focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary transition-all duration-700" 
                                            style={{ width: `${(sub.similarity * 100) || 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            ['Content Accuracy', 'Grammar & Style', 'Structure'].map(aspect => (
                                <div key={aspect} className="bg-white border-2 border-slate-50 rounded-3xl p-6 shadow-sm text-center lg:text-left">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-extrabold text-foreground font-headline">{aspect}</span>
                                        <span className="text-sm font-black text-primary">{reviewForm.grade > 0 ? Math.floor(reviewForm.grade * 0.9) : '-'}/100</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${reviewForm.grade || 0}%` }}></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Manual Override Form */}
                <div className="space-y-6 pt-10 border-t-2 border-slate-100 border-dashed">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 font-sans">Final Adjustments</div>
                    <div className="space-y-8 pb-20">
                        <div className="bg-white border-2 border-primary/20 rounded-[2rem] p-8 shadow-md shadow-primary/5">
                            <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-5 ml-1 font-sans">Official Score Override</label>
                            <div className="flex items-center gap-5">
                                <input 
                                    type="number" 
                                    min="0" max="100"
                                    value={reviewForm.grade}
                                    onChange={(e) => setReviewForm({ ...reviewForm, grade: parseInt(e.target.value) || 0 })}
                                    className="w-32 bg-surface-low border-2 border-slate-100 rounded-3xl px-6 py-5 text-4xl font-black text-primary focus:border-primary focus:ring-8 focus:ring-primary/10 outline-none transition-all shadow-inner"
                                />
                                <div className="text-slate-300 font-black text-3xl font-headline">/ 100</div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1 font-sans">Feedback & Guidance to Student</label>
                            <textarea 
                                value={reviewForm.feedback}
                                onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                                className="w-full bg-white border-2 border-slate-100 rounded-[2.5rem] px-8 py-8 text-[15px] font-medium text-slate-600 focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none transition-all min-h-[300px] shadow-sm leading-relaxed"
                                placeholder="Write your professional feedback here..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
