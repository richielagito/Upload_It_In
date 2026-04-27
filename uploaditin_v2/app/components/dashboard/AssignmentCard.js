"use client";
import React from 'react';
import { FileText, UploadCloud, CheckCircle, Clock, ExternalLink, AlertCircle, RotateCcw } from 'lucide-react';
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
  onUndo
}) {
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
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div className="p-8 lg:p-10 space-y-10">
        {/* Header & Description */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            {assignment.deadline && (
              <div className={cn(
                "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border",
                isDeadlineOpen 
                  ? "bg-primary/5 text-primary border-primary/10" 
                  : "bg-red-50 text-red-500 border-red-100"
              )}>
                <Clock size={12} />
                {isDeadlineOpen ? `Due ${formatDate(assignment.deadline)}` : "Closed"}
              </div>
            )}
            {result && (
               <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                <CheckCircle size={12} />
                Submitted
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-3xl font-black text-foreground mb-4 font-headline tracking-tight">{assignment.judul}</h2>
            <p className="text-slate-600 leading-relaxed font-sans font-medium text-lg">
              {assignment.deskripsi}
            </p>
          </div>

          {/* Reference Files */}
          {assignment.file_path && (
            <div className="space-y-4">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-sans ml-1">Reference Material</p>
              <div className="max-w-md">
                <div
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all group cursor-pointer"
                    onClick={() => window.open(assignment.file_path, '_blank')}
                >
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-primary group-hover:scale-110 transition-transform">
                        <FileText size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{getFilenameFromUrl(assignment.file_path)}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Reference File &bull; {getFileExtension(assignment.file_path)}</p>
                    </div>
                    <ExternalLink size={18} className="text-slate-300 group-hover:text-primary transition-colors mr-1" />
                </div>
              </div>
            </div>
          )}
        </div>

        <hr className="border-slate-100" />

        {/* Submission Logic */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-foreground flex items-center gap-3 font-headline">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                result ? "bg-emerald-50 text-emerald-600" : (stagedFile ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400")
              )}>
                {result ? <CheckCircle size={20} /> : <UploadCloud size={20} />}
              </div>
              Submission
            </h3>
            
            {result && isDeadlineOpen && (
              <button 
                onClick={onUndo}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-headline"
              >
                <RotateCcw size={14} />
                Undo Turn In
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Side: File Preview/Upload Button */}
            <div className="space-y-4">
              {result && !stagedFile ? (
                <div className="space-y-3">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-sans ml-1">Current Submission</p>
                  <FileCard
                    filename={getFilenameFromUrl(result.file_path)}
                    fileUrl={result.file_path}
                    onPreview={() => window.open(result.file_path, '_blank')}
                  />
                </div>
              ) : stagedFile ? (
                <div className="space-y-3">
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
                </div>
              ) : (
                <button
                  onClick={() => onStage()}
                  disabled={!isDeadlineOpen || isUploading}
                  className="flex flex-col items-center justify-center gap-3 w-full h-40 border-3 border-dashed border-slate-100 rounded-3xl text-slate-400 font-extrabold hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all group disabled:opacity-50 disabled:cursor-not-allowed font-headline"
                >
                  <div className="w-14 h-14 rounded-2xl bg-surface-low flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <UploadCloud size={32} className="transition-transform group-hover:scale-110" />
                  </div>
                  <span>Select File to Upload</span>
                  <p className="text-[10px] font-bold uppercase tracking-tighter opacity-60">PDF, DOCX, or TXT</p>
                </button>
              )}
            </div>

            {/* Right Side: Action Button & Info */}
            <div className="bg-slate-50 rounded-3xl p-8 flex flex-col justify-center space-y-6">
              {!result || stagedFile ? (
                <>
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 font-headline">Ready to submit?</h4>
                    <p className="text-sm text-slate-500 font-medium font-sans">
                      {stagedFile 
                        ? "Your file is staged. Click the button below to officially turn it in for grading."
                        : "Upload your essay file first to enable the Turn In button."}
                    </p>
                  </div>
                  
                  <button
                    onClick={onTurnIn}
                    disabled={!stagedFile || isStaging || isUploading || !isDeadlineOpen}
                    className={cn(
                      "w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-lg font-headline",
                      stagedFile && !isUploading 
                        ? "bg-gradient-to-r from-primary to-primary-container text-white hover:shadow-primary/30 hover:-translate-y-0.5" 
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    {isUploading ? (
                      <div className="flex items-center gap-3">
                         <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                         <span>Turning in...</span>
                      </div>
                    ) : (
                      <>
                        <CheckCircle size={22} />
                        <span>{result ? 'Turn In Again' : 'Turn In'}</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="space-y-6 text-center py-4">
                   <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle size={32} />
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-xl font-black text-slate-900 font-headline">Great work!</h4>
                      <p className="text-sm text-slate-500 font-medium font-sans px-4">
                        Your assignment has been received. You can view your feedback here once the teacher publishes the results.
                      </p>
                   </div>
                   {!assignment.is_published && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 text-[10px] font-bold uppercase tracking-widest">
                        <AlertCircle size={14} />
                        Feedback Pending Publication
                      </div>
                   )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
