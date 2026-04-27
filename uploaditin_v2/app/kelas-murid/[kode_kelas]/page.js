"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Upload, Download, CheckCircle, Clock, AlertCircle, UploadCloud } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import FeedbackPanel from '@/app/components/dashboard/FeedbackPanel';
import AssignmentCard from '@/app/components/dashboard/AssignmentCard';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ClassDetailsStudent() {
    const { kode_kelas } = useParams();
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState(null);

    const [classInfo, setClassInfo] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [myResults, setMyResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState({});

    // View Management State
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
    const [activeAssignment, setActiveAssignment] = useState(null);
    const [activeResult, setActiveResult] = useState(null);
    const [stagedFile, setStagedFile] = useState(null);
    const [isStaging, setIsStaging] = useState(false);

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login-register');
                return;
            }
            setUser(session.user);
            await Promise.all([fetchClassInfo(), fetchAssignments(), fetchMyResults()]);
            setLoading(false);
        };
        init();
    }, [kode_kelas]);

    const fetchClassInfo = async () => {
        try {
            const res = await fetch('/api/joined-classes');
            if (res.ok) {
                const data = await res.json();
                const cls = data.find(c => c.kode_kelas === kode_kelas);
                if (cls) setClassInfo(cls);
                else router.push('/dashboard');
            }
        } catch (e) { console.error(e); }
    };

    const fetchAssignments = async () => {
        try {
            const res = await fetch(`/api/assignments/${kode_kelas}`);
            if (res.ok) {
                const data = await res.json();
                setAssignments(data);
            }
        } catch (e) { console.error(e); }
    };

    const fetchMyResults = async () => {
        try {
            const res = await fetch(`/api/results/kelas-kode/${kode_kelas}`);
            if (res.ok) {
                const data = await res.json();
                setMyResults(data);
            }
        } catch (e) { console.error(e); }
    };

    const handleStageFile = async (e, assignmentId) => {
        const file = e.target?.files?.[0];
        if (!file) return;

        setIsStaging(true);
        setStagedFile(file);

        // Simulate upload progress
        setTimeout(() => {
            setIsStaging(false);
            toast.info(`${file.name} is ready to turn in.`);
        }, 1500);
    };

    const handleTurnIn = async () => {
        if (!stagedFile || !activeAssignment) return;

        setUploadingId(activeAssignment.id);
        const formData = new FormData();
        formData.append('file', stagedFile);

        try {
            const res = await fetch(`/api/assignments/upload/${activeAssignment.id}`, {
                method: 'POST',
                body: formData
            });

            let data;
            try {
                data = await res.json();
            } catch (e) {
                throw new Error(`Server returned an invalid response (Status: ${res.status}). This usually means the request timed out because the AI took too long to respond.`);
            }

            if (res.ok && data?.success) {
                toast.success('Assignment turned in successfully!');
                setStagedFile(null);
                await Promise.all([fetchAssignments(), fetchMyResults()]);

                // Find the new result to update the view
                const newRes = await fetch(`/api/results/kelas-kode/${kode_kelas}`);
                if (newRes.ok) {
                    const resultsData = await newRes.json();
                    const updatedResult = resultsData.find(r => r.assignment_id === activeAssignment.id);
                    setActiveResult(updatedResult);
                }
            } else {
                toast.error(data.error || "Turn in failed");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'An unexpected error occurred during turn in');
        } finally {
            setUploadingId(null);
        }
    };

    const handleUndo = async () => {
        if (!activeAssignment) return;

        try {
            const res = await fetch(`/api/submissions/undo/${activeAssignment.id}`, {
                method: 'POST'
            });
            const data = await res.json();

            if (res.ok && data.success) {
                toast.success(data.message);
                await Promise.all([fetchAssignments(), fetchMyResults()]);
                // Update local state to reflect no submission
                setActiveResult(null);
                setStagedFile(null);
            } else {
                toast.error(data.error || "Failed to undo submission");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error undoing submission");
        }
    };

    const resultsMap = useMemo(() => new Map(myResults.map(r => [r.assignment_id, r])), [myResults]);

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;

    const activeDeadlineDate = activeAssignment?.deadline ? new Date(activeAssignment.deadline.replace(' ', 'T')) : null;
    const isActiveDeadlineOpen = !activeDeadlineDate || new Date() < activeDeadlineDate;

    return (
        <DashboardShell role="Student" username={user?.user_metadata?.username}>
            <div className="mb-8">
                {viewMode === 'list' ? (
                    <Link href="/dashboard" className="text-slate-500 hover:text-primary flex items-center gap-2 mb-6 text-sm font-bold font-sans transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <ArrowLeft size={16} />
                        </div>
                        Back to Dashboard
                    </Link>
                ) : (
                    <button
                        onClick={() => {
                            setViewMode('list');
                            setStagedFile(null);
                        }}
                        className="text-slate-500 hover:text-primary flex items-center gap-2 mb-6 text-sm font-bold font-sans transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <ArrowLeft size={16} />
                        </div>
                        Back to {classInfo?.nama_kelas || 'Class'}
                    </button>
                )}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm shadow-primary/5">
                    <div className="flex-1">
                        <h1 className="text-3xl font-extrabold text-foreground mb-2 font-headline tracking-tight">
                            {viewMode === 'detail' && activeAssignment ? activeAssignment.judul : classInfo?.nama_kelas}
                        </h1>
                        <p className="text-slate-500 font-sans font-medium">
                            {viewMode === 'detail' ? 'Assignment Details & Feedback' : 'View assignments and your performance'}
                        </p>
                    </div>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="columns-1 md:columns-2 gap-8 space-y-8 mb-12">
                    {assignments.map(ass => {
                        const deadlineDate = ass.deadline ? new Date(ass.deadline.replace(' ', 'T')) : null;
                        const isClosed = deadlineDate && new Date() > deadlineDate;
                        const result = resultsMap.get(ass.id);
                        const isGraded = !!result && ass.is_published;

                            // This should have been the assignment cards
                            return (
                            <div key={ass.id} className="break-inside-avoid-column bg-white rounded-[2rem] border-2 border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all flex flex-col mb-8 last:mb-0 group">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-extrabold text-foreground font-headline group-hover:text-primary transition-colors">{ass.judul}</h3>
                                    {ass.is_submitted && (
                                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                                            Submitted
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-600 mb-8 text-sm leading-relaxed flex-1 font-sans font-medium line-clamp-3">{ass.deskripsi}</p>

                                {/* Grade Summary (if graded AND published) */}
                                {isGraded && (
                                    <div className="mb-8 p-5 bg-surface-low border border-primary/10 rounded-[1.5rem] flex items-center justify-between shadow-inner">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-sans mb-1">Score</span>
                                            <span className="text-2xl font-black text-primary font-headline">{result.nilai || result.grade}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center font-sans mb-1">Grade</span>
                                            <span className={cn(
                                                "px-3 py-1 rounded-lg text-xs font-black shadow-sm",
                                                parseFloat(result.nilai) >= 80 ? "bg-green-100 text-green-700 border border-green-200" :
                                                    parseFloat(result.nilai) >= 60 ? "bg-yellow-100 text-yellow-700 border border-yellow-200" : "bg-red-100 text-red-700 border border-red-200"
                                            )}>
                                                {parseFloat(result.nilai) >= 80 ? 'A' : parseFloat(result.nilai) >= 60 ? 'B/C' : parseFloat(result.nilai) < 60 ? 'D/E' : '-'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-sans mb-1">Similarity</span>
                                            <span className="text-sm font-black text-slate-700 font-mono">{(result.similarity * 100).toFixed(0)}%</span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3 mb-8 text-sm font-bold font-sans uppercase tracking-widest text-slate-400">
                                    <div className="flex items-center gap-3">
                                        <Clock size={16} className="text-primary" />
                                        <span className={isClosed ? "text-red-500" : "text-slate-500"}>
                                            Deadline: {ass.deadline} {isClosed && "(Closed)"}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 mt-auto">
                                    <button
                                        onClick={() => {
                                            setActiveAssignment(ass);
                                            setActiveResult(result);
                                            setViewMode('detail');
                                            setStagedFile(null);
                                        }}
                                        className="w-full py-4 bg-primary text-white rounded-2xl font-extrabold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 font-headline"
                                    >
                                        <FileText size={20} /> View Detail {isGraded && "& Feedback"}
                                    </button>
                                </div>
                            </div>
                            );
                        })}
                    {assignments.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-surface-low rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={32} className="text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-bold font-headline">No assignments active at the moment.</p>
                        </div>
                    )}
                </div>
            ) : (
                activeAssignment && (
                    <div className="space-y-8">
                        <input
                            type="file"
                            id={`file-stage-input`}
                            className="hidden"
                            onChange={(e) => handleStageFile(e, activeAssignment.id)}
                        />

                        <AssignmentCard
                            assignment={activeAssignment}
                            result={activeResult}
                            stagedFile={stagedFile}
                            isStaging={isStaging}
                            isUploading={uploadingId === activeAssignment.id}
                            isDeadlineOpen={isActiveDeadlineOpen}
                            onStage={(val) => {
                                if (val === null) setStagedFile(null);
                                else document.getElementById(`file-stage-input`)?.click();
                            }}
                            onTurnIn={handleTurnIn}
                            onUndo={handleUndo}
                        />

                        {activeResult && activeAssignment.is_published && (
                            <FeedbackPanel
                                assignment={activeAssignment}
                                result={activeResult}
                                onClose={() => setViewMode('list')}
                            />
                        )}
                    </div>
                )
            )}
        </DashboardShell>
    );
}
