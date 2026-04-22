import React from 'react';
import { X, FileText, UploadCloud, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import FileCard from './FileCard';

export default function FeedbackPanel({ 
  assignment, 
  result, 
  stagedFile, 
  isStaging, 
  isUploading, 
  onClose, 
  onStage, 
  onTurnIn, 
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

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col">
        {/* Content */}
        <div className="p-8 space-y-10">
          {/* Top Section: Assignment File & Grade Summary */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Assignment Info & File */}
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Assignment Details</h3>
                <p className="text-slate-600 leading-relaxed">{assignment.deskripsi}</p>
              </div>

              {assignment.file_path && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Reference Material</p>
                  <FileCard 
                    filename={getFilenameFromUrl(assignment.file_path)}
                    fileUrl={assignment.file_path}
                    onPreview={() => window.open(assignment.file_path, '_blank')}
                  />
                </div>
              )}
            </div>

            {/* Right: Grade Overview */}
            <div className="w-full lg:w-80 grid grid-cols-1 gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center shadow-sm">
                <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">Final Score</p>
                <p className="text-4xl font-black text-blue-900">{score}</p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-purple-50 border border-purple-100 rounded-2xl p-4 text-center shadow-sm">
                  <p className="text-purple-600 text-[10px] font-bold uppercase tracking-wider mb-1">Similarity</p>
                  <p className="text-xl font-black text-purple-900">{similarity}</p>
                </div>
                <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center flex flex-col items-center justify-center shadow-sm">
                  <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider mb-1">Grade</p>
                  <span className={cn(
                    "px-3 py-0.5 rounded-full text-xs font-bold",
                    parseFloat(score) >= 80 ? "bg-emerald-200 text-emerald-800" :
                    parseFloat(score) >= 60 ? "bg-yellow-200 text-yellow-800" : "bg-red-200 text-red-800"
                  )}>
                    {parseFloat(score) >= 80 ? 'A' : parseFloat(score) >= 60 ? 'B/C' : parseFloat(score) < 60 ? 'D/E' : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Teacher Feedback */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="text-blue-600" size={24} />
                Teacher's Feedback
              </h3>
              <div className={cn(
                "rounded-2xl p-8 border italic leading-relaxed text-lg shadow-inner",
                result ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-slate-50 border-slate-100 text-slate-400"
              )}>
                "{feedback}"
              </div>
            </div>

            {/* Criteria Breakdown */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="text-emerald-600" size={24} />
                Criteria Breakdown
              </h3>
              <div className="space-y-4">
                {criteria.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-200 transition-colors">
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
          </div>

          {/* Student Submission Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className={cn(stagedFile ? "text-blue-600" : "text-amber-600")} size={24} />
              Your Work
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result?.file_path && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Submitted Version</p>
                  <FileCard 
                    filename={getFilenameFromUrl(result.file_path)}
                    fileUrl={result.file_path}
                    onPreview={() => window.open(result.file_path, '_blank')}
                  />
                </div>
              )}
              {stagedFile && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">Staged for Turn In</p>
                  <FileCard 
                    filename={stagedFile.name}
                    isLoading={isStaging}
                    onPreview={() => {
                      const url = URL.createObjectURL(stagedFile);
                      window.open(url, '_blank');
                    }}
                  />
                </div>
              )}
              {!result?.file_path && !stagedFile && !isStaging && (
                <button 
                  onClick={onStage}
                  className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-3 group"
                >
                  <UploadCloud size={32} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                  <p className="text-slate-400 font-bold group-hover:text-blue-600">Click to upload your work</p>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 border border-slate-200 bg-white text-slate-700 rounded-2xl font-bold hover:bg-slate-100 transition shadow-sm"
          >
            Back to List
          </button>
          {isDeadlineOpen && (
            <div className="flex-1 flex gap-4">
              {(result || stagedFile) && (
                <button 
                  onClick={onStage}
                  disabled={isStaging || isUploading}
                  className="flex-1 py-4 border border-blue-200 bg-blue-50 text-blue-700 rounded-2xl font-bold hover:bg-blue-100 transition shadow-sm disabled:opacity-50"
                >
                  {result ? 'Upload New' : 'Change File'}
                </button>
              )}
              <button 
                onClick={onTurnIn}
                disabled={!stagedFile || isStaging || isUploading}
                className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-slate-400"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Turning in...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    {result ? 'Turn In Again' : 'Turn In'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
