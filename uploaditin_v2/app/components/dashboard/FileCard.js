import React, { useState, useRef, useEffect } from 'react';
import { FileText, Download, Eye, Loader2, FileCode, FileImage, MoreVertical, Trash2, RefreshCw } from 'lucide-react';
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
  onRemove,
  onChangeFile,
  className 
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCardClick = () => {
    if (!isLoading && onPreview) {
      onPreview();
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={cn(
        "group relative flex items-center p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 cursor-pointer",
        isLoading && "opacity-75 cursor-not-allowed",
        className
      )}
    >
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
        <p className="text-sm font-bold text-slate-900 truncate">
          {filename || "Unnamed File"}
        </p>
        
        {!isLoading && onChangeFile && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onChangeFile();
            }}
            className="mt-1 text-[10px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 uppercase tracking-wider transition-colors"
          >
            <RefreshCw size={10} /> Change File
          </button>
        )}

        {isLoading && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Uploading...
          </p>
        )}
        
        {!isLoading && !onChangeFile && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Click to preview
          </p>
        )}
      </div>

      {/* Actions Menu */}
      {!isLoading && (
        <div className="relative" ref={menuRef}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <MoreVertical size={18} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  if (onDownload) onDownload();
                  else if (fileUrl) window.open(fileUrl, '_blank');
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
              >
                <Download size={16} /> Download
              </button>
              
              {onRemove && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onRemove();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <Trash2 size={16} /> Remove
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading Progress Bar - Animated Underline */}
      {isLoading && (
        <div className="absolute bottom-0 left-0 h-1 bg-blue-100 w-full overflow-hidden rounded-b-2xl">
          <div className="h-full bg-blue-600 animate-loading-bar"></div>
        </div>
      )}
    </div>
  );
}
