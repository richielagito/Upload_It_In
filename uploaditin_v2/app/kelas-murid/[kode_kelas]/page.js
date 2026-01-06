"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Upload, Download, CheckCircle, Clock, AlertCircle, UploadCloud } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
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

  const handleUploadAnswer = async (e, assignmentId) => {
      e.preventDefault();
      const file = e.target.file.files[0];
      if (!file) return;

      setUploadingId(assignmentId);
      const formData = new FormData();
      formData.append('file', file);

      try {
          const res = await fetch(`/api/assignments/upload/${assignmentId}`, {
              method: 'POST',
              body: formData
          });
          const data = await res.json();
          if (res.ok && data.success) {
              toast.success('Uploaded successfully!');
              setSelectedFiles(prev => ({...prev, [assignmentId]: null}));
              fetchAssignments(); // Refresh status (is_submitted)
              setTimeout(() => window.location.reload(), 1000); // Reload to ensure sync
          } else {
              toast.error(data.error || "Upload failed");
          }
      } catch (err) {
          console.error(err);
          toast.error('An unexpected error occurred during upload');
      } finally {
          setUploadingId(null);
      }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;

  return (
    <DashboardShell role="Student" username={user?.user_metadata?.username} onLogout={() => router.push('/logout')}>
        <div className="mb-8">
            <Link href="/dashboard" className="text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-4 text-sm font-medium">
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">{classInfo?.nama_kelas}</h1>
            <p className="text-slate-500">View assignments and your grades</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {assignments.map(ass => {
                 const deadlineDate = ass.deadline ? new Date(ass.deadline.replace(' ', 'T')) : null;
                 const isClosed = deadlineDate && new Date() > deadlineDate;

                 return (
                    <div key={ass.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-slate-900">{ass.judul}</h3>
                            {ass.is_submitted && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded flex items-center gap-1"><CheckCircle size={12}/> Submitted</span>}
                        </div>
                        <p className="text-slate-600 mb-6 text-sm leading-relaxed">{ass.deskripsi}</p>
                        
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Clock size={16} /> 
                                <span className={isClosed ? "text-red-500 font-bold" : ""}>
                                    Deadline: {ass.deadline} {isClosed && "(Closed)"}
                                </span>
                            </div>
                            {ass.file_path && (
                                <a 
                                    href={ass.file_path + (ass.file_path.includes('?') ? '&download' : '?download')} 
                                    className="flex items-center gap-2 text-sm text-blue-600 font-bold hover:underline"
                                >
                                    <Download size={16} /> Download Assignment File
                                </a>
                            )}
                        </div>

                        <div className="border-t border-slate-150">
                            {isClosed ? (
                                <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg text-sm font-bold justify-center">
                                    <AlertCircle size={18} /> Assignment Closed
                                </div>
                            ) : (
                                <form onSubmit={(e) => handleUploadAnswer(e, ass.id)} className="space-y-4 pt-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Upload Answer
                                        </label>
                                        <div className="relative group">
                                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors group-hover:bg-slate-50 group-hover:border-blue-400 bg-slate-50/50">
                                                <input 
                                                    type="file" 
                                                    name="file" 
                                                    required 
                                                    onChange={(e) => {
                                                        const fileName = e.target.files[0]?.name;
                                                        setSelectedFiles(prev => ({...prev, [ass.id]: fileName}));
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                                />
                                                <UploadCloud className={cn("mb-2 transition-colors", selectedFiles[ass.id] ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500")} size={32} />
                                                
                                                {selectedFiles[ass.id] ? (
                                                    <div>
                                                        <p className="text-sm font-bold text-blue-700 break-all">{selectedFiles[ass.id]}</p>
                                                        <p className="text-xs text-slate-400 mt-1">Click to change file</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-600">
                                                            <span className="text-blue-600 font-bold">Click to upload</span> or drag and drop
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-1">PDF, DOCX up to 10MB</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={uploadingId === ass.id}
                                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {uploadingId === ass.id ? "Uploading..." : (
                                            <>
                                                {ass.is_submitted ? <UploadCloud size={18} /> : <Upload size={18} />} 
                                                {ass.is_submitted ? "Upload Again" : "Submit Answer"}
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                 );
            })}
            {assignments.length === 0 && <div className="col-span-full text-center py-10 text-slate-500">No assignments active.</div>}
        </div>

        {/* My Grades */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900">My Grades</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Assignment</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Grade</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Similarity</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {myResults.map((res, idx) => (
                             <tr key={idx} className="hover:bg-slate-50">
                                 <td className="px-6 py-4 font-medium text-slate-500">{res.judul_assignment || "-"}</td>
                                 <td className="px-6 py-4 font-bold text-slate-500">{res.nilai || res.grade || "-"}</td>
                                 <td className="px-6 py-4 text-slate-500">{res.similarity || "-"}</td>
                                 <td className="px-6 py-4">
                                     <span className={cn(
                                        "px-2 py-1 rounded text-xs font-bold",
                                        parseFloat(res.nilai) >= 80 ? "bg-green-100 text-green-700" :
                                        parseFloat(res.nilai) >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                     )}>
                                        {parseFloat(res.nilai) >= 80 ? 'A' : parseFloat(res.nilai) >= 60 ? 'B/C' : parseFloat(res.nilai) < 60 ? 'D/E' : '-'}
                                     </span>
                                 </td>
                             </tr>
                        ))}
                         {myResults.length === 0 && <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No grades yet.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>

    </DashboardShell>
  );
}
