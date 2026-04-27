"use client";
import React from 'react';
import { FileText, UploadCloud, CheckCircle, Clock, ExternalLink, AlertCircle, RotateCcw, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import FileCard from './FileCard';

export default function AssignmentCard({
  assignment,
  result,
  stagedFile,
  isStaging,
  isUploading,
  isDeadlineOpen,
  onStage,
  onTurnIn,
  onUndo,
  onViewDetail, // Optional: for list view
  isListView = false
}) {
  const isSubmitted = !!result;
  const isGraded = !!result && assignment.is_published;

  const getFilenameFromUrl = (url) => {
    if (!url) return "";
    return url.split('/').pop().split('?')[0];
  };

  const getFileExtension = (url) => {
    if (!url) return "";
    const filename = getFilenameFromUrl(url);
    return filename.split('.').pop().toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      // Handle "YYYY-MM-DD HH:MM:SS" format from backend
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
    <div className={cn(
        "break-inside-avoid-column bg-white rounded-4xl border p-8 shadow-sm transition-all flex flex-col group",
        isListView ? "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 mb-8 last:mb-0 border-slate-100" : "border-slate-100 shadow-primary/5"
    )}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className={cn(
            "text-2xl font-extrabold text-foreground font-headline transition-colors",
            isListView && "group-hover:text-primary"
        )}>
            {assignment.judul}
        </h3>
        {isSubmitted && (
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
            <CheckCircle size={10} /> Submitted
          </span>
        )}
      </div>

      {/* Description */}
      <p className={cn(
          "text-slate-600 mb-8 text-sm leading-relaxed font-sans font-medium",
          isListView ? "line-clamp-3" : ""
      )}>
        {assignment.deskripsi}
      </p>

      {/* Reference Material */}
      {assignment.file_path && (
        <div className="mb-8 space-y-3">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-sans ml-1">Reference Material</p>
          <div
            className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all group/ref cursor-pointer max-w-md"
            onClick={() => window.open(assignment.file_path, '_blank')}
          >
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-primary group-hover/ref:scale-110 transition-transform">
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-700 truncate">{getFilenameFromUrl(assignment.file_path)}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{getFileExtension(assignment.file_path)} File</p>
            </div>
            <ExternalLink size={14} className="text-slate-300 group-hover/ref:text-primary transition-colors" />
          </div>
        </div>
      )}

      {/* Submission Area */}
      <div className="mt-auto space-y-6">
        <div className="flex items-center gap-3 text-sm font-bold font-sans uppercase tracking-widest">
            <Clock size={16} className={cn(!isDeadlineOpen ? "text-red-500" : "text-primary")} />
            <span className={cn(!isDeadlineOpen ? "text-red-500" : "text-slate-500")}>
                Deadline: {formatDate(assignment.deadline)} {!isDeadlineOpen && "(Closed)"}
            </span>
        </div>

        <div className="pt-6 border-t border-slate-100">
            {/* If Not Submitted: Show Upload/Turn In Logic */}
            {!isSubmitted || stagedFile ? (
                <div className="space-y-4">
                    {stagedFile ? (
                        <div className="space-y-4">
                            <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest font-sans ml-1">Ready to Turn In</p>
                            <FileCard
                                filename={stagedFile.name}
                                isLoading={isStaging}
                                onPreview={() => {
                                    const url = URL.createObjectURL(stagedFile);
                                    window.open(url, '_blank');
                                }}
                                onRemove={() => onStage(null)}
                            />
                            <button
                                onClick={onTurnIn}
                                disabled={isStaging || isUploading || !isDeadlineOpen}
                                className={cn(
                                    "w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-lg font-headline",
                                    !isUploading 
                                        ? "bg-linear-to-r from-primary to-primary-container text-white hover:shadow-primary/30 hover:-translate-y-0.5" 
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                )}
                            >
                                {isUploading ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Turning in...</span>
                                    </div>
                                ) : (
                                    <>
                                        <CheckCircle size={20} />
                                        <span>{isSubmitted ? 'Turn In Again' : 'Turn In'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => onStage()}
                            disabled={!isDeadlineOpen || isUploading}
                            className={cn(
                                "flex flex-col items-center justify-center gap-2 w-full py-8 border-3 border-dashed border-slate-100 rounded-3xl text-slate-400 font-extrabold transition-all group/upload disabled:opacity-50 disabled:cursor-not-allowed font-headline",
                                isDeadlineOpen && !isUploading && "hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                            )}
                        >
                            <UploadCloud size={32} className={cn("transition-transform", isDeadlineOpen && "group-hover/upload:scale-110")} />
                            <span className="text-sm">Select File to Upload</span>
                            <p className="text-[9px] font-bold uppercase tracking-tighter opacity-60">PDF, DOCX, or TXT</p>
                        </button>
                    )}
                </div>
            ) : (
                /* If Submitted: Show Submitted File + Actions */
                <div className="space-y-4">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-sans ml-1">Your Submission</p>
                    <FileCard
                        filename={getFilenameFromUrl(result.file_path)}
                        fileUrl={result.file_path}
                        onPreview={() => window.open(result.file_path, '_blank')}
                    />
                    
                    <div className="flex gap-3">
                        {isDeadlineOpen && (
                            <button 
                                onClick={onUndo}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-slate-100 text-xs font-bold text-slate-500 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all font-headline"
                            >
                                <RotateCcw size={14} />
                                Undo Turn In
                            </button>
                        )}
                        
                        {onViewDetail && isGraded && (
                            <button
                                onClick={onViewDetail}
                                className="flex-1 py-3 px-4 rounded-2xl font-extrabold transition-all flex items-center justify-center gap-2 font-headline bg-primary text-white hover:bg-primary-container shadow-lg shadow-primary/20"
                            >
                                <FileText size={16} /> 
                                Feedback
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
