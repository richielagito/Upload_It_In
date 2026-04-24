"use client";
import React, { useState } from 'react';
import { X, ArrowLeft, ArrowRight, ChevronDown, Check, Info, FileText, BookOpen, Clock, Download, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const similarity = result?.similarity ? (result.similarity * 100).toFixed(1) : "0";

  return (
    <div className="fixed inset-0 bg-[#f5f5f0] z-[100] flex flex-col font-sans text-[#1a1a18] animate-in fade-in duration-300">
      {/* Topbar */}
      <div className="bg-white border-b border-[#e8e6df] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-[#f0ede6] flex items-center justify-center transition-colors border border-transparent hover:border-[#d4d2c8]">
                <ArrowLeft size={18} className="text-[#444]" />
            </button>
            <div>
              <div className="text-[15px] font-semibold text-[#1a1a18]">Manual Review — {assignment?.judul}</div>
              <div className="text-[11px] text-[#888] font-medium mt-0.5">
                {assignment?.class_name || 'Class Review'} &middot; {result?.nama_murid || result?.name}
              </div>
            </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            disabled={isSubmitting}
            onClick={() => handleSave('draft')} 
            className="px-5 py-2 border border-[#d4d2c8] text-[#444] text-[13px] font-medium rounded-lg hover:bg-[#f0ede6] transition-all disabled:opacity-50"
          >
            Skip / Draft
          </button>
          <button 
            disabled={isSubmitting}
            onClick={() => handleSave('published')}
            className="px-6 py-2 bg-[#1D9E75] text-white text-[13px] font-medium rounded-lg hover:bg-[#158f68] transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <Check size={16} />
            )}
            Approve & Kirim ke Siswa
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Essay Panel */}
        <div className="flex-1 bg-white border-r border-[#e8e6df] overflow-y-auto">
           <div className="max-w-4xl mx-auto p-10">
                {/* Header & Nav */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#E1F5EE] text-[#0F6E56] flex items-center justify-center font-bold text-[13px]">
                            {result?.nama_murid?.charAt(0) || result?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                            <div className="text-[14px] font-semibold text-[#1a1a18]">{result?.nama_murid || result?.name}</div>
                            <div className="text-[12px] text-[#888] font-medium">Submitted {result?.created_at}</div>
                        </div>
                    </div>
                </div>

                {/* Question Box */}
                <div className="bg-[#f5f5f0] border-l-4 border-[#888] rounded-lg p-5 mb-8">
                    <div className="text-[11px] font-bold text-[#1a1a18] uppercase tracking-wider mb-2">Soal Essay</div>
                    <p className="text-[13px] text-[#555] leading-relaxed font-medium">
                        {assignment?.deskripsi}
                    </p>
                </div>

                {/* View Toggles */}
                <div className="flex bg-[#f0ede6] p-1 rounded-lg w-fit mb-6">
                    <button 
                        onClick={() => setViewMode('highlight')}
                        className={cn(
                            "px-4 py-1.5 text-[12px] font-medium rounded-md transition-all",
                            viewMode === 'highlight' ? "bg-white text-[#1a1a18] shadow-sm" : "text-[#666] hover:text-[#1a1a18]"
                        )}
                    >
                        Tampilan Highlight
                    </button>
                    <button 
                        onClick={() => setViewMode('plain')}
                        className={cn(
                            "px-4 py-1.5 text-[12px] font-medium rounded-md transition-all",
                            viewMode === 'plain' ? "bg-white text-[#1a1a18] shadow-sm" : "text-[#666] hover:text-[#1a1a18]"
                        )}
                    >
                        Tampilan Biasa
                    </button>
                </div>

                {/* Legend (only in highlight mode) */}
                <AnimatePresence>
                    {viewMode === 'highlight' && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-wrap gap-5 mb-8 p-3.5 bg-[#f9f8f4] rounded-lg border border-[#e8e6df] w-fit shadow-sm"
                        >
                            <div className="flex items-center gap-2 text-[12px] font-medium text-[#666]">
                                <div className="w-3 h-2 rounded bg-[#d4f0e4] border-b-2 border-[#1D9E75]"></div>
                                Argumen Kuat
                            </div>
                            <div className="flex items-center gap-2 text-[12px] font-medium text-[#666]">
                                <div className="w-3 h-2 rounded bg-[#fde8d8] border-b-2 border-[#D85A30]"></div>
                                Perlu Perbaikan
                            </div>
                            <div className="flex items-center gap-2 text-[12px] font-medium text-[#666]">
                                <div className="w-3 h-2 rounded bg-[#e8e6ff] border-b-2 border-[#7F77DD]"></div>
                                Klaim Tanpa Bukti
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Essay Content */}
                <div className="max-w-3xl mx-auto">
                    <div className={cn(
                        "text-[#1a1a18] leading-[1.85] font-serif text-[16px] transition-all",
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
        <div className="w-[360px] bg-[#fafaf7] overflow-y-auto flex flex-col">
            <div className="p-6 space-y-8 flex-1">
                {/* Score Section */}
                <div className="bg-white border border-[#e8e6df] rounded-2xl p-6 shadow-sm text-center">
                    <div className="text-[42px] font-bold text-[#1D9E75] leading-none mb-1">
                        {reviewForm.grade}<span className="text-[#aaa] text-[16px] font-normal">/100</span>
                    </div>
                    <div className="text-[12px] font-medium text-[#888] mt-1">Skor AI</div>
                    <div className="inline-block bg-[#E1F5EE] text-[#0F6E56] text-[11px] font-medium px-2 py-0.5 rounded-full mt-2 border border-[#1D9E75]/10">
                        Gemini 3.1 Flash
                    </div>
                </div>

                {/* Aspects Breakdown */}
                <div className="space-y-4">
                    <div className="text-[11px] font-semibold text-[#888] uppercase tracking-wider ml-1">Breakdown per aspek</div>
                    <div className="space-y-3">
                        {reviewForm.sub_criteria_scores && reviewForm.sub_criteria_scores.length > 0 ? (
                            reviewForm.sub_criteria_scores.map((sub, idx) => (
                                <div key={idx} className="bg-white border border-[#e8e6df] rounded-xl p-4 shadow-sm group hover:border-[#1D9E75]/30 transition-all">
                                    <div className="flex justify-between items-center mb-2.5">
                                        <span className="text-[13px] font-medium text-[#1a1a18]">Question {sub.question}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-mono text-[#888]">{(sub.similarity * 100).toFixed(0)}% sim</span>
                                            <input 
                                                type="number"
                                                value={sub.grade}
                                                onChange={e => {
                                                    const newScores = [...reviewForm.sub_criteria_scores];
                                                    newScores[idx].grade = parseInt(e.target.value) || 0;
                                                    setReviewForm({...reviewForm, sub_criteria_scores: newScores});
                                                }}
                                                className="w-14 text-right bg-[#f5f5f0] border border-[#e8e6df] rounded-md px-2 py-1 text-[13px] font-semibold text-[#1D9E75] focus:border-[#1D9E75] focus:ring-0 outline-none transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full h-1 bg-[#f0ede6] rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-[#1D9E75] transition-all duration-500" 
                                            style={{ width: `${(sub.similarity * 100) || 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            ['Kesesuaian', 'Struktur', 'Bahasa'].map(aspect => (
                                <div key={aspect} className="bg-white border border-[#e8e6df] rounded-xl p-4 shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[13px] font-medium text-[#1a1a18]">{aspect}</span>
                                        <span className="text-[13px] font-semibold text-[#1a1a18]">{reviewForm.grade > 0 ? Math.floor(reviewForm.grade * 0.9) : '-'}/100</span>
                                    </div>
                                    <div className="w-full h-1 bg-[#f0ede6] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#1D9E75]" style={{ width: `${reviewForm.grade || 0}%` }}></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* AI Summary Section */}
                <div className="bg-[#f0eeff] border border-[#d4cffa] rounded-xl p-4 shadow-sm">
                    <div className="text-[11px] font-bold text-[#7F77DD] uppercase tracking-wider mb-2">Ringkasan Otomatis</div>
                    <p className="text-[13px] text-[#3C3489] leading-relaxed font-medium line-clamp-4">
                        {result?.ai_summary || "Esai menunjukkan pemahaman yang baik tentang materi. Area yang perlu diperkuat adalah kesimpulan yang lebih spesifik."}
                    </p>
                </div>

                {/* Manual Override Form */}
                <div className="space-y-4 pt-4 border-t border-[#e8e6df]">
                    <div className="text-[11px] font-semibold text-[#888] uppercase tracking-wider ml-1">Override & Komentar</div>
                    <div className="space-y-4">
                        <div className="bg-white border border-[#e8e6df] rounded-xl p-4 shadow-sm">
                            <label className="block text-[11px] font-bold text-[#888] uppercase tracking-widest mb-3 ml-0.5">Skor Akhir</label>
                            <div className="flex items-center gap-3">
                                <input 
                                    type="number" 
                                    min="0" max="100"
                                    value={reviewForm.grade}
                                    onChange={(e) => setReviewForm({ ...reviewForm, grade: parseInt(e.target.value) || 0 })}
                                    className="w-24 bg-[#f5f5f0] border border-[#e8e6df] rounded-lg px-3 py-2 text-xl font-bold text-[#1D9E75] focus:border-[#1D9E75] focus:ring-0 outline-none transition-all shadow-inner"
                                />
                                <div className="text-[#aaa] font-semibold text-[16px]">/ 100</div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-[#888] uppercase tracking-widest mb-2 ml-1">Catatan ke Siswa</label>
                            <textarea 
                                value={reviewForm.feedback}
                                onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                                className="w-full bg-white border border-[#d4d2c8] rounded-xl px-4 py-4 text-[13px] font-medium text-[#1a1a18] focus:border-[#7F77DD] focus:ring-0 outline-none transition-all min-h-[140px] shadow-sm leading-relaxed"
                                placeholder="Tambahkan catatan personal untuk siswa ini..."
                            />
                        </div>
                    </div>
                </div>

                {/* Assignment File Card */}
                {result?.file_path && (
                    <div className="pt-4">
                         <div className="text-[11px] font-semibold text-[#888] uppercase tracking-wider mb-3 ml-1">File Unggahan Siswa</div>
                         <div 
                            onClick={() => window.open(result.file_path, '_blank')}
                            className="flex items-center gap-3 p-3 bg-white border border-[#e8e6df] rounded-xl cursor-pointer hover:bg-[#f0ede6] transition-all group"
                         >
                            <div className="w-10 h-10 rounded-lg bg-[#fde8d8] flex items-center justify-center text-[#D85A30] group-hover:scale-105 transition-transform">
                                <FileText size={20} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="text-[12px] font-bold text-[#1a1a18] truncate">Lihat Dokumen Asli</div>
                                <div className="text-[10px] text-[#888] font-medium uppercase tracking-wider flex items-center gap-1">
                                    PDF/DOCX <ExternalLink size={10} />
                                </div>
                            </div>
                         </div>
                    </div>
                )}
            </div>
            
            {/* Action Footer */}
            <div className="p-6 bg-white border-t border-[#e8e6df] shadow-sm">
                <button 
                    disabled={isSubmitting}
                    onClick={() => handleSave('published')}
                    className="w-full py-4 bg-[#1D9E75] text-white rounded-xl font-bold text-[14px] hover:bg-[#158f68] shadow-lg shadow-[#1D9E75]/10 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>Simpan & Kirim Nilai <ArrowRight size={20} /></>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
