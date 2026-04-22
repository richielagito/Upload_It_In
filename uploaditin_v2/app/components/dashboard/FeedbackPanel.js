import React from 'react';
import { X, FileText, UploadCloud, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
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
            <div className="flex-1 space-y-6">
              <div>
                {assignment.deadline && (
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-black uppercase tracking-widest mb-2">
                    <Clock size={12} />
                    Due {formatDate(assignment.deadline)}
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-900 mb-2">Assignment Details</h3>
                <p className="text-slate-600 leading-relaxed">{assignment.deskripsi}</p>
              </div>

              {assignment.file_path && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reference Material</p>
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
            <div className="w-full lg:w-64 flex flex-col gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center shadow-sm">
                <p className="text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-1">Final Score</p>
                <p className="text-4xl font-black text-blue-900">{score}</p>
              </div>
              
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center flex items-center justify-between shadow-sm px-6">
                <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Grade</p>
                <span className={cn(
                  "px-3 py-0.5 rounded-full text-xs font-bold",
                  parseFloat(score) >= 80 ? "bg-emerald-200 text-emerald-800" :
                  parseFloat(score) >= 60 ? "bg-yellow-200 text-yellow-800" : "bg-red-200 text-red-800"
                )}>
                  {parseFloat(score) >= 80 ? 'A' : parseFloat(score) >= 60 ? 'B/C' : parseFloat(score) < 60 ? 'D/E' : '-'}
                </span>
              </div>

              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-center flex items-center justify-between shadow-sm px-6">
                <p className="text-purple-600 text-[10px] font-bold uppercase tracking-wider">Similarity</p>
                <p className="text-lg font-black text-purple-900">{similarity}</p>
              </div>
            </div>
          </div>

          {/* Teacher Feedback - Full Width Row */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="text-blue-600" size={24} />
              Teacher&apos;s Feedback
            </h3>
            <div className={cn(
              "w-full rounded-2xl p-8 border italic leading-relaxed text-lg shadow-sm",
              result ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-slate-50 border-slate-100 text-slate-400"
            )}>
              &quot;{feedback}&quot;
            </div>
          </div>

          {/* Criteria Breakdown - Full Width Row */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="text-emerald-600" size={24} />
              Criteria Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {criteria.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-200 transition-all duration-300">
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{c.name}</p>
                    <p className="text-sm text-slate-400 font-medium tracking-wide">Weight: {c.weight}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900">{c.score}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Submission Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className={cn(stagedFile ? "text-blue-600" : "text-amber-600")} size={24} />
              Your Work
            </h3>
            <div className="flex flex-wrap gap-6">
              {result?.file_path && (
                <div className="space-y-2 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Submitted Version</p>
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
                <div className="space-y-2 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">Staged for Turn In</p>
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
                  className="flex items-center gap-2 px-6 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-blue-400 hover:bg-blue-50/30 hover:text-blue-600 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UploadCloud size={24} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
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
