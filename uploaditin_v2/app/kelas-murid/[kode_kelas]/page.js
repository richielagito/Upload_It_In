"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Upload, Download, CheckCircle, Clock, AlertCircle, UploadCloud } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import FeedbackPanel from '@/app/components/dashboard/FeedbackPanel';
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
  const [isEditing, setIsEditing] = useState(false);

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

  const handleUnTurnIn = () => {
      setIsEditing(true);
      toast.info("You can now change your submission.");
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
          const data = await res.json();
          if (res.ok && data.success) {
              toast.success('Assignment turned in successfully!');
              setStagedFile(null);
              setIsEditing(false);
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
          toast.error('An unexpected error occurred during turn in');
      } finally {
          setUploadingId(null);
      }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;

  const activeDeadlineDate = activeAssignment?.deadline ? new Date(activeAssignment.deadline.replace(' ', 'T')) : null;
  const isActiveDeadlineOpen = !activeDeadlineDate || new Date() < activeDeadlineDate;

  return (
    <DashboardShell role="Student" username={user?.user_metadata?.username}>
        <div className="mb-8">
            {viewMode === 'list' ? (
                <Link href="/dashboard" className="text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-4 text-sm font-medium transition-colors">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
            ) : (
                <button 
                    onClick={() => {
                        setViewMode('list');
                        setIsEditing(false);
                        setStagedFile(null);
                    }}
                    className="text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-4 text-sm font-medium transition-colors"
                >
                    <ArrowLeft size={16} /> Back to {classInfo?.nama_kelas || 'Class'}
                </button>
            )}
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">
                        {viewMode === 'detail' && activeAssignment ? activeAssignment.judul : classInfo?.nama_kelas}
                    </h1>
                    <p className="text-slate-500">
                        {viewMode === 'detail' ? 'Assignment Details & Feedback' : 'View assignments and your grades'}
                    </p>
                </div>
                
                {viewMode === 'detail' && activeAssignment && (
                    <div className="flex items-center gap-4">
                        {activeResult && !isEditing ? (
                            <>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Status</span>
                                    <span className="text-sm font-bold text-slate-900">Pending Review</span>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        disabled
                                        className="px-8 py-3 bg-slate-100 text-slate-400 rounded-xl font-bold cursor-not-allowed flex items-center gap-2"
                                    >
                                        <CheckCircle size={18} />
                                        Turned In
                                    </button>
                                    <button 
                                        onClick={handleUnTurnIn}
                                        disabled={!isActiveDeadlineOpen}
                                        className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Un Turn In
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button 
                                onClick={handleTurnIn}
                                disabled={!stagedFile || isStaging || uploadingId === activeAssignment.id || !isActiveDeadlineOpen}
                                className={cn(
                                    "px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-slate-400 min-w-[160px]",
                                    !activeResult && "px-10"
                                )}
                            >
                                {uploadingId === activeAssignment.id ? (
                                    <>
                                        <Clock className="animate-spin" size={18} />
                                        Turning in...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={18} />
                                        {activeResult ? 'Turn In Again' : 'Turn In'}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>

        {viewMode === 'list' ? (
            <div className="columns-1 md:columns-2 gap-8 space-y-8 mb-12">
                {assignments.map(ass => {
                    const deadlineDate = ass.deadline ? new Date(ass.deadline.replace(' ', 'T')) : null;
                    const isClosed = deadlineDate && new Date() > deadlineDate;
                    const result = myResults.find(r => r.assignment_id === ass.id);
                    const isGraded = !!result;
                    const isPending = ass.is_submitted && !isGraded;

                    return (
                        <div key={ass.id} className="break-inside-avoid-column bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col mb-8 last:mb-0">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-slate-900">{ass.judul}</h3>
                            </div>
                            <p className="text-slate-600 mb-6 text-sm leading-relaxed flex-1">{ass.deskripsi}</p>
                            
                            {/* Grade Summary (if graded) */}
                            {isGraded && (
                                <div className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</span>
                                        <span className="text-xl font-black text-slate-900">{result.nilai || result.grade}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Grade</span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-xs font-bold mt-0.5",
                                            parseFloat(result.nilai) >= 80 ? "bg-green-100 text-green-700" :
                                            parseFloat(result.nilai) >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                        )}>
                                            {parseFloat(result.nilai) >= 80 ? 'A' : parseFloat(result.nilai) >= 60 ? 'B/C' : parseFloat(result.nilai) < 60 ? 'D/E' : '-'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Similarity</span>
                                        <span className="text-sm font-bold text-slate-700">{result.similarity || "0%"}</span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2 mb-6 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} /> 
                                    <span className={isClosed ? "text-red-500 font-bold" : ""}>
                                        Deadline: {ass.deadline} {isClosed && "(Closed)"}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-slate-150 pt-4 mt-auto">
                                <button 
                                    onClick={() => {
                                        setActiveAssignment(ass);
                                        setActiveResult(result);
                                        setViewMode('detail');
                                        setStagedFile(null);
                                        setIsEditing(false);
                                    }}
                                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <FileText size={18} /> View Detail
                                </button>
                            </div>
                        </div>
                    );
                })}
                {assignments.length === 0 && <div className="col-span-full text-center py-10 text-slate-500">No assignments active.</div>}
            </div>
        ) : (
            activeAssignment && (
                <>
                    <input 
                        type="file" 
                        id={`file-stage-input`}
                        className="hidden" 
                        onChange={(e) => handleStageFile(e, activeAssignment.id)}
                    />
                    <FeedbackPanel 
                        assignment={activeAssignment}
                        result={activeResult}
                        stagedFile={stagedFile}
                        isStaging={isStaging}
                        isEditing={isEditing}
                        isUploading={uploadingId === activeAssignment.id}
                        onClose={() => {
                            setViewMode('list');
                            setStagedFile(null);
                            setIsEditing(false);
                        }}
                        onStage={(val) => {
                            if (val === null) setStagedFile(null);
                            else document.getElementById(`file-stage-input`)?.click();
                        }}
                        isDeadlineOpen={isActiveDeadlineOpen}
                    />
                </>
            )
        )}
    </DashboardShell>
  );
}
