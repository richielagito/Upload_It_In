import React from 'react';
import { X, FileText, UploadCloud, CheckCircle, Clock, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import { cn, renderHighlightedEssay } from '@/lib/utils';
import FileCard from './FileCard';

export default function FeedbackPanel({
  assignment,
  result,
  stagedFile,
  isStaging,
  isEditing,
  isUploading,
  onClose,
  onStage,
  isDeadlineOpen
}) {
  if (!assignment) return null;

  const score = result?.nilai || result?.grade || "-";
  const similarity = result?.similarity || "0%";
  const feedback = result?.feedback || "No feedback provided yet.";

  // Use real sub-criteria scores if available, otherwise fallback to mock
  const criteria = result?.sub_criteria_scores && Array.isArray(result.sub_criteria_scores)
    ? result.sub_criteria_scores.map(s => ({
      name: `Question ${s.question}`,
      score: s.grade,
      weight: "Score"
    }))
    : [
      { name: "Content Accuracy", score: score > 0 ? Math.min(100, parseInt(score) + 5) : "-", weight: "40%" },
      { name: "Grammar & Structure", score: score > 0 ? Math.max(0, parseInt(score) - 5) : "-", weight: "30%" },
      { name: "Relevance to Prompt", score: score || "-", weight: "30%" }
    ];

  const getFilenameFromUrl = (url) => {
    if (!url) return "";
    return url.split('/').pop().split('?')[0];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const parts = dateStr.includes(' ') ? dateStr.split(' ') : [dateStr];
      const dateParts = parts[0].split('-');
      let formattedDate = "";

      if (dateParts.length === 3) {
        if (dateParts[0].length === 4) formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        else formattedDate = `${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`;
      } else {
        formattedDate = dateStr;
      }

      if (parts.length > 1) {
        const timeParts = parts[1].split(':');
        formattedDate += ` ${timeParts[0]}:${timeParts[1]}`;
      }

      return formattedDate;
    } catch (e) { return dateStr; }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col">
        {/* Content */}
        <div className="p-8 space-y-10">
          {/* Top Section: Assignment File & Grade Summary */}
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left: Assignment Info & File */}
            <div className="flex flex-col justify-between flex-1 space-y-6">
              <div>
                {assignment.deadline && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest mb-3 bg-primary/5 w-fit px-3 py-1 rounded-lg border border-primary/10">
                    <Clock size={12} />
                    Due {formatDate(assignment.deadline)}
                  </div>
                )}
                <h3 className="text-2xl font-extrabold text-foreground mb-3 font-headline">Assignment Overview</h3>
                <p className="text-slate-600 leading-relaxed font-sans font-medium">{assignment.deskripsi}</p>
              </div>

              {assignment.file_path && (
                <div className="space-y-4">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-sans ml-1">Reference Material</p>
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

            {/* Right: Grade Overview - 1 Column Stack */}
            <div className="w-full lg:w-72 flex flex-col gap-4">
              <div className="bg-primary/5 border-2 border-primary/10 rounded-3xl p-6 text-center shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-700"></div>
                <p className="text-primary text-[10px] font-extrabold uppercase tracking-[0.2em] mb-2 font-sans">Final Score</p>
                <p className="text-5xl font-black text-primary font-headline tracking-tighter">{score}</p>
              </div>

              <div className="bg-surface-low/50 border border-slate-100 rounded-2xl p-4 text-center flex items-center justify-between shadow-sm px-6">
                <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest font-sans">Grade</p>
                <span className={cn(
                  "px-4 py-1 rounded-xl text-sm font-black shadow-sm",
                  parseFloat(score) >= 80 ? "bg-green-100 text-green-700 border border-green-200" :
                    parseFloat(score) >= 60 ? "bg-yellow-100 text-yellow-700 border border-yellow-200" : "bg-red-100 text-red-700 border border-red-200"
                )}>
                  {parseFloat(score) >= 80 ? 'A' : parseFloat(score) >= 60 ? 'B/C' : parseFloat(score) < 60 ? 'D/E' : '-'}
                </span>
              </div>

              <div className="bg-surface-low/50 border border-slate-100 rounded-2xl p-4 text-center flex items-center justify-between shadow-sm px-6">
                <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest font-sans">Similarity</p>
                <p className="text-xl font-black text-slate-700 font-mono tracking-tighter">{similarity}</p>
              </div>
            </div>
          </div>

          {/* Teacher Feedback - Full Width Row */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-xl font-extrabold text-foreground flex items-center gap-3 font-headline">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText size={20} />
              </div>
              Teacher&apos;s Feedback
            </h3>
            <div className={cn(
              "w-full rounded-3xl p-8 border-2 italic leading-relaxed text-lg shadow-sm transition-all font-sans font-medium",
              result ? "bg-primary/5 border-primary/10 text-slate-700" : "bg-surface-low border-slate-100 text-slate-400"
            )}>
              &quot;{feedback}&quot;
            </div>
          </div>

          {/* Essay Analysis - Highlighted Text */}
          {result?.essay_text && (
            <div className="flex flex-col space-y-4">
              <h3 className="text-xl font-extrabold text-foreground flex items-center gap-3 font-headline">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <BookOpen size={20} />
                  </div>
                Essay Analysis
              </h3>
              <div className="w-full rounded-3xl p-8 bg-white border-2 border-slate-100 shadow-sm font-sans text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">
                {renderHighlightedEssay(result.essay_text, result.highlights)}
              </div>
              <div className="flex gap-4 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Strengths</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Improvements</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium italic ml-auto">* Hover over highlights to see detailed feedback</span>
              </div>
            </div>
          )}

          {/* Criteria Breakdown - Full Width Row */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-xl font-extrabold text-foreground flex items-center gap-3 font-headline">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <CheckCircle size={20} />
              </div>
              Criteria Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {criteria.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-white border-2 border-slate-50 rounded-3xl shadow-sm hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
                  <div>
                    <p className="font-extrabold text-foreground text-lg font-headline group-hover:text-primary transition-colors">{c.name}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest font-sans mt-1">Weight: {c.weight}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-foreground font-headline tracking-tighter group-hover:text-primary transition-colors">{c.score}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Submission Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-foreground flex items-center gap-3 font-headline">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", stagedFile ? "bg-primary/10 text-primary" : "bg-amber-50 text-amber-600")}>
                <Clock size={20} />
              </div>
              Your Work
            </h3>
            <div className="flex flex-wrap gap-6">
              {result?.file_path && (
                <div className="space-y-3 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-sans ml-1">Submitted Version</p>
                  <FileCard
                    filename={getFilenameFromUrl(result.file_path)}
                    fileUrl={result.file_path}
                    onPreview={() => window.open(result.file_path, '_blank')}
                    onChangeFile={isEditing ? onStage : null}
                    onRemove={isEditing ? () => onStage(null) : null}
                  />
                </div>
              )}
              {stagedFile && (
                <div className="space-y-3 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                  <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest font-sans ml-1">Staged for Turn In</p>
                  <FileCard
                    filename={stagedFile.name}
                    isLoading={isStaging}
                    onPreview={() => {
                      const url = URL.createObjectURL(stagedFile);
                      window.open(url, '_blank');
                    }}
                    onRemove={() => onStage(null)}
                    onChangeFile={onStage}
                  />
                </div>
              )}
              {(!result || isEditing) && !stagedFile && !isStaging && (
                <button
                  onClick={onStage}
                  disabled={!isDeadlineOpen}
                  className="flex flex-col items-center justify-center gap-3 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] h-32 border-3 border-dashed border-slate-100 rounded-4xl text-slate-400 font-extrabold hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all group disabled:opacity-50 disabled:cursor-not-allowed font-headline"
                >
                  <div className="w-12 h-12 rounded-2xl bg-surface-low flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <UploadCloud size={28} className="transition-transform group-hover:scale-110" />
                  </div>
                  Attach File
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
