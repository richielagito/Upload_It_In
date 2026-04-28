"use client";
import React, { useState } from "react";
import { FileText, UploadCloud, CheckCircle, Clock, ExternalLink, AlertCircle, RotateCcw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import FileCard from "./FileCard";

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
    isListView = false,
}) {
    const [isDragging, setIsDragging] = useState(false);
    const isSubmitted = !!result;
    const isGraded = !!result && assignment.is_published;
    const hasSubmittedBefore = (assignment.max_version || 0) > 0;

    const getFilenameFromUrl = (url) => {
        if (!url) return "";
        return url.split("/").pop().split("?")[0];
    };

    const getFileExtension = (url) => {
        if (!url) return "";
        const filename = getFilenameFromUrl(url);
        return filename.split(".").pop().toUpperCase();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        try {
            const isoString = dateStr.replace(" ", "T");
            const dateObj = new Date(isoString);

            if (isNaN(dateObj)) return dateStr;

            const datePart = dateObj.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });

            const timePart = dateObj
                .toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                })
                .replace(".", ":");

            return `${datePart} | ${timePart}`;
        } catch (e) {
            return dateStr;
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        if (isDeadlineOpen && !isUploading) setIsDragging(true);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        if (isDeadlineOpen && !isUploading && !isDragging) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        // Only stop dragging if we're actually leaving the button itself
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragging(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (isDeadlineOpen && !isUploading && e.dataTransfer.files?.[0]) {
            onStage(e.dataTransfer.files[0]);
        }
    };

    // Determine Turn In button text
    const getTurnInLabel = () => {
        if (hasSubmittedBefore) return "Turn In Again";
        return "Turn In";
    };

    return (
        <div
            className={cn(
                "break-inside-avoid-column bg-white rounded-4xl border p-8 shadow-sm transition-all flex flex-col group",
                isListView ? "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 mb-8 last:mb-0 border-slate-100" : "border-slate-100 shadow-primary/5",
            )}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <h3 className={cn("text-2xl font-extrabold text-foreground font-headline transition-colors", isListView && "group-hover:text-primary")}>{assignment.judul}</h3>
                {isSubmitted && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm animate-in fade-in zoom-in duration-300">
                        <CheckCircle size={12} />
                        Submitted
                    </div>
                )}
            </div>

            {/* Description */}
            <p className={cn("text-slate-600 mb-8 text-sm leading-relaxed font-sans font-medium", isListView ? "line-clamp-3" : "")}>{assignment.deskripsi}</p>

            {/* Reference Material */}
            {assignment.file_path && (
                <div className="mb-8 space-y-3">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-sans ml-1">Reference Material</p>
                    <div className="flex items-center gap-4 p-4 bg-slate-100 rounded-2xl border border-slate-200 hover:bg-slate-200 transition-all group/ref cursor-pointer" onClick={() => window.open(assignment.file_path, "_blank")}>
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-primary transition-transform">
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
            <div className="mt-auto space-y-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-[11px] font-bold font-sans uppercase tracking-widest">
                    <Clock size={14} className={cn(!isDeadlineOpen ? "text-red-500" : "text-primary")} />
                    <span className={cn(!isDeadlineOpen ? "text-red-500" : "text-slate-500")}>
                        Deadline: {formatDate(assignment.deadline)} {!isDeadlineOpen && "(Closed)"}
                    </span>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col flex-1">
                    {/* Submission State Display */}
                    <div className={cn("flex flex-col", !stagedFile && !isSubmitted ? "flex-1 mb-0" : "mb-6")}>
                        {stagedFile ? (
                            /* File is staged but not yet turned in — allow remove */
                            <div className="space-y-3">
                                <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest font-sans ml-1">Ready to Turn In</p>
                                <FileCard
                                    filename={stagedFile.name}
                                    isLoading={isStaging}
                                    onPreview={() => {
                                        const url = URL.createObjectURL(stagedFile);
                                        window.open(url, "_blank");
                                    }}
                                    onRemove={() => onStage(null)}
                                />
                            </div>
                        ) : isSubmitted ? (
                            /* File is turned in (locked) — NO remove action */
                            <div className="space-y-3">
                                <div className="px-1">
                                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-sans">Your Submission</p>
                                </div>
                                <FileCard
                                    filename={getFilenameFromUrl(result.file_path)}
                                    fileUrl={result.file_path}
                                    onPreview={() => window.open(result.file_path, "_blank")}
                                    /* No onRemove — file is locked after turn in */
                                />
                            </div>
                        ) : (
                            /* No submission — show upload zone */
                            <button
                                onClick={() => onStage()}
                                onDragEnter={handleDragEnter}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                disabled={!isDeadlineOpen || isUploading}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 w-full h-full flex-1 py-8 border-3 border-dashed rounded-3xl text-slate-400 font-extrabold transition-all group/upload disabled:opacity-50 disabled:cursor-not-allowed font-headline",
                                    isDragging ? "border-primary bg-primary/5 text-primary" : "border-slate-100",
                                    isDeadlineOpen && !isUploading && !isDragging && "hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
                                )}
                            >
                                <div className="pointer-events-none flex flex-col items-center justify-center gap-2">
                                    <UploadCloud size={32} />
                                    <span className="text-sm">{isDragging ? "Drop to stage file" : "Select or drop file to upload"}</span>
                                    <p className="text-[9px] font-bold uppercase tracking-tighter opacity-60">PDF, DOCX, or TXT</p>
                                </div>
                            </button>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {stagedFile ? (
                            /* Staged file ready — show Turn In / Turn In Again */
                            <button
                                onClick={onTurnIn}
                                disabled={isStaging || isUploading || !isDeadlineOpen}
                                className={cn(
                                    "w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-lg font-headline",
                                    !isUploading ? "bg-linear-to-r from-primary to-primary-container text-white hover:shadow-primary/30" : "bg-slate-200 text-slate-400 cursor-not-allowed",
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
                                        <span>{getTurnInLabel()}</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            isSubmitted &&
                            !isGraded &&
                            isDeadlineOpen && (
                                /* Submitted & locked — show Undo Turn In */
                                <button
                                    onClick={onUndo}
                                    className="w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-lg font-headline bg-white border-2 border-slate-100 text-slate-600 hover:text-red-500 hover:border-red-100 hover:bg-red-50 hover:-translate-y-0.5"
                                >
                                    <RotateCcw size={20} />
                                    <span>Undo Turn In</span>
                                </button>
                            )
                        )}

                        {isGraded && onViewDetail && (
                            <button
                                onClick={onViewDetail}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20 font-headline hover:bg-primary-container hover:-translate-y-0.5"
                            >
                                <FileText size={20} />
                                View Feedback
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
