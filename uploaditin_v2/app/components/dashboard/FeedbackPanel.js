import React from 'react';
import { X, FileText, UploadCloud, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FeedbackPanel({ assignment, result, onClose, onReupload, isDeadlineOpen }) {
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-end">
      <div className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{assignment.judul}</h2>
            <p className="text-slate-500 text-sm">Feedback & Grading Details</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Grade Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
              <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">Final Score</p>
              <p className="text-3xl font-black text-blue-900">{score}</p>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-center">
              <p className="text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">Similarity</p>
              <p className="text-3xl font-black text-purple-900">{similarity}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center flex flex-col items-center justify-center">
              <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">Grade</p>
              <span className={cn(
                "px-3 py-1 rounded-full text-sm font-bold",
                parseFloat(score) >= 80 ? "bg-emerald-200 text-emerald-800" :
                parseFloat(score) >= 60 ? "bg-yellow-200 text-yellow-800" : "bg-red-200 text-red-800"
              )}>
                {parseFloat(score) >= 80 ? 'A' : parseFloat(score) >= 60 ? 'B/C' : parseFloat(score) < 60 ? 'D/E' : '-'}
              </span>
            </div>
          </div>

          {/* Teacher Feedback */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="text-blue-600" size={20} />
              Teacher's Feedback
            </h3>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 italic text-slate-700 leading-relaxed">
              "{feedback}"
            </div>
          </div>

          {/* Criteria Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Criteria Breakdown</h3>
            <div className="space-y-3">
              {criteria.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <div>
                    <p className="font-bold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400 font-medium">Weight: {c.weight}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900">{c.score}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submission Info */}
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-amber-600 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-bold text-amber-900">Submission History</p>
              <p className="text-xs text-amber-700 mb-2">You can view the file you submitted for this assignment.</p>
              <a 
                href={result?.file_path || "#"} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
              >
                View Submitted File
              </a>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-3 border border-slate-200 bg-white text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition shadow-sm"
          >
            Close
          </button>
          {isDeadlineOpen && (
            <button 
              onClick={() => {
                onClose();
                onReupload();
              }}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2"
            >
              <UploadCloud size={18} />
              Re-upload Answer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
