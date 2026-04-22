import React from 'react';
import { FileText, Download, Eye, Loader2, FileCode, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';

const getFileIcon = (filename) => {
  if (!filename) return <FileText size={24} />;
  const ext = filename.split('.').pop().toLowerCase();
  switch (ext) {
    case 'pdf': return <FileText size={24} className="text-red-500" />;
    case 'docx':
    case 'doc': return <FileText size={24} className="text-blue-500" />;
    case 'txt': return <FileText size={24} className="text-slate-500" />;
    case 'jpg':
    case 'jpeg':
    case 'png': return <FileImage size={24} className="text-purple-500" />;
    default: return <FileCode size={24} className="text-slate-500" />;
  }
};

export default function FileCard({ 
  filename, 
  fileUrl, 
  isLoading = false, 
  onPreview, 
  onDownload,
  className 
}) {
  return (
    <div className={cn(
      "group relative flex items-center p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 overflow-hidden",
      isLoading && "opacity-75 cursor-not-allowed",
      className
    )}>
      {/* File Icon Container */}
      <div className="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-50 transition-colors">
        {isLoading ? (
          <Loader2 size={24} className="text-blue-600 animate-spin" />
        ) : (
          getFileIcon(filename)
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-bold text-slate-900 truncate mb-1">
          {filename || "Unnamed File"}
        </p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {isLoading ? "Uploading..." : "Click to view or download"}
        </p>
      </div>

      {/* Actions */}
      {!isLoading && (
        <div className="flex items-center gap-2">
          {onPreview && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
              title="Preview"
            >
              <Eye size={18} />
            </button>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (onDownload) onDownload();
              else if (fileUrl) window.open(fileUrl, '_blank');
            }}
            className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
            title="Download"
          >
            <Download size={18} />
          </button>
        </div>
      )}

      {/* Loading Progress Bar - Animated Underline */}
      {isLoading && (
        <div className="absolute bottom-0 left-0 h-1 bg-blue-100 w-full overflow-hidden">
          <div className="h-full bg-blue-600 animate-loading-bar"></div>
        </div>
      )}
    </div>
  );
}
