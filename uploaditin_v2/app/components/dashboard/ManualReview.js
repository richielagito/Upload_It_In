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
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
      {/* Topbar */}
      <div className="bg-surface-low border-b border-slate-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white hover:bg-slate-50 flex items-center justify-center transition-all border border-slate-100 shadow-sm">
                <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-foreground font-headline tracking-tight">Manual Review — {assignment?.judul}</h2>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
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
            className="px-6 py-3 bg-white border-2 border-slate-100 text-slate-600 text-sm font-bold rounded-2xl hover:bg-slate-50 hover:border-primary/20 hover:text-primary transition-all disabled:opacity-50 font-headline"
          >
            Save as Draft
          </button>
          <button 
            disabled={isSubmitting}
            onClick={() => handleSave('published')}
            className="px-8 py-3 bg-primary text-white text-sm font-bold rounded-2xl hover:bg-primary-container transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 font-headline"
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

      <div className="flex flex-col lg:flex-row min-h-[700px]">
        {/* Main Essay Panel */}
        <div className="flex-1 bg-white border-r border-slate-100 overflow-y-auto">
           <div className="p-8 lg:p-10 space-y-10">
                {/* Header Info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center font-black text-xl border-2 border-primary/10">
                            {result?.nama_murid?.charAt(0) || result?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                            <div className="text-lg font-extrabold text-foreground font-headline tracking-tight">{result?.nama_murid || result?.name}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                                <Clock size={12} />
                                Submitted {result?.created_at}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assignment Context */}
                <div className="space-y-6">
                    <div className="bg-surface-low/50 border-2 border-slate-50 rounded-3xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110 duration-500"></div>
                        <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-2 relative z-10">
                            <Info size={14} />
                            Assignment Description
                        </div>
                        <p className="text-slate-600 leading-relaxed font-sans font-medium relative z-10 italic">
                            &quot;{assignment?.deskripsi}&quot;
                        </p>
                    </div>

                    {/* Assignment Files */}
                    {assignment?.file_path && (
                        <div className="px-2">
                             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <FileText size={12} />
                                Assignment Materials
                             </div>
                             <div className="max-w-md">
                                <FileCard 
                                    filename={getFilenameFromUrl(assignment.file_path)}
                                    fileUrl={assignment.file_path}
                                    onPreview={() => window.open(assignment.file_path, '_blank')}
                                />
                             </div>
                        </div>
                    )}
                </div>

                {/* View Controls */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex bg-surface-low p-1.5 rounded-2xl w-fit">
                            <button 
                                onClick={() => setViewMode('highlight')}
                                className={cn(
                                    "px-6 py-2.5 text-xs font-bold rounded-xl transition-all font-headline",
                                    viewMode === 'highlight' ? "bg-white text-primary shadow-md border border-slate-100" : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                Highlight View
                            </button>
                            <button 
                                onClick={() => setViewMode('plain')}
                                className={cn(
                                    "px-6 py-2.5 text-xs font-bold rounded-xl transition-all font-headline",
                                    viewMode === 'plain' ? "bg-white text-primary shadow-md border border-slate-100" : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                Plain Text
                            </button>
                        </div>

                        {viewMode === 'highlight' && (
                             <div className="flex items-center gap-6 px-4 py-2 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
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

                    {/* Essay Content */}
                    <div className="relative">
                        <div className={cn(
                            "w-full rounded-3xl p-10 bg-white border-2 border-slate-100 shadow-sm font-sans text-lg leading-relaxed text-slate-700 transition-all min-h-[400px]",
                        )}>
                            {viewMode === 'plain' ? (
                                <div className="whitespace-pre-wrap">{result?.essay_text || "No essay text available."}</div>
                            ) : (
                                <div className="whitespace-pre-wrap">
                                    {renderHighlightedEssay(result?.essay_text, result?.highlights)}
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <span className="text-[10px] text-slate-400 font-medium italic">* Hover over highlights to see AI rationale</span>
                        </div>
                    </div>
                </div>
           </div>
        </div>

        {/* Sidebar Panel */}
        <div className="w-full lg:w-[400px] bg-slate-50/30 overflow-y-auto">
            <div className="p-8 space-y-10">
                {/* Score Section */}
                <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 shadow-sm text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-125 duration-700"></div>
                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 font-sans relative z-10">AI Predicted Score</div>
                    <div className="text-6xl font-black text-primary font-headline tracking-tighter relative z-10">
                        {reviewForm.grade}<span className="text-slate-300 text-2xl font-medium tracking-normal ml-1">/100</span>
                    </div>
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10 relative z-10">
                        <BookOpen size={14} />
                        Gemini 3.1 Analysis
                    </div>
                </div>

                {/* Similarity Stats */}
                <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
                    <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">Similarity Match</div>
                        <div className="text-3xl font-mono font-black text-slate-700 tracking-tighter group-hover:text-primary transition-colors">{similarity}%</div>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-surface-low flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                        <Check size={28} />
                    </div>
                </div>

                {/* AI Summary Section */}
                <div className="bg-primary/5 border-2 border-primary/10 rounded-3xl p-6 shadow-sm relative group">
                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-2 font-sans">
                        <div className="w-1 h-3 bg-primary rounded-full"></div>
                        AI Executive Summary
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed font-semibold italic">
                        &quot;{result?.feedback?.substring(0, 200)}...&quot;
                    </p>
                </div>

                {/* Aspects Breakdown */}
                <div className="space-y-6">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 font-sans">Detailed Breakdown</div>
                    <div className="space-y-4">
                        {reviewForm.sub_criteria_scores && reviewForm.sub_criteria_scores.length > 0 ? (
                            reviewForm.sub_criteria_scores.map((sub, idx) => (
                                <div key={idx} className="bg-white border-2 border-slate-50 rounded-2xl p-5 shadow-sm group hover:border-primary/20 transition-all">
                                    <div className="flex justify-between items-center mb-3">
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
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary transition-all duration-700" 
                                            style={{ width: `${(sub.similarity * 100) || 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            ['Content Accuracy', 'Grammar & Style', 'Structure'].map(aspect => (
                                <div key={aspect} className="bg-white border-2 border-slate-50 rounded-2xl p-5 shadow-sm">
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
                <div className="space-y-6 pt-6 border-t-2 border-slate-100 border-dashed">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 font-sans">Final Adjustments</div>
                    <div className="space-y-6">
                        <div className="bg-white border-2 border-primary/20 rounded-3xl p-6 shadow-md shadow-primary/5">
                            <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 ml-1 font-sans">Official Score Override</label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="number" 
                                    min="0" max="100"
                                    value={reviewForm.grade}
                                    onChange={(e) => setReviewForm({ ...reviewForm, grade: parseInt(e.target.value) || 0 })}
                                    className="w-28 bg-surface-low border-2 border-slate-100 rounded-2xl px-5 py-4 text-3xl font-black text-primary focus:border-primary focus:ring-8 focus:ring-primary/10 outline-none transition-all shadow-inner"
                                />
                                <div className="text-slate-300 font-black text-2xl font-headline">/ 100</div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1 font-sans text-center lg:text-left">Feedback & Guidance to Student</label>
                            <textarea 
                                value={reviewForm.feedback}
                                onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                                className="w-full bg-white border-2 border-slate-100 rounded-[2rem] px-8 py-8 text-sm font-medium text-slate-600 focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none transition-all min-h-[220px] shadow-sm leading-relaxed"
                                placeholder="Write your professional feedback here..."
                            />
                        </div>
                    </div>
                </div>

                {/* Student Submission Card */}
                {result?.file_path && (
                    <div className="pt-4 pb-10">
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1 font-sans">Student Original Document</div>
                         <FileCard 
                            filename={getFilenameFromUrl(result.file_path)}
                            fileUrl={result.file_path}
                            onPreview={() => window.open(result.file_path, '_blank')}
                         />
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
