"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Edit, Trash2, Download, FileText, Calendar, UploadCloud, X 
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

export default function ClassDetailsTeacher() {
  const { kode_kelas } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState(null);
  
  const [classInfo, setClassInfo] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  // Modals
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [editClassName, setEditClassName] = useState('');

  // Form State
  const [newAssignment, setNewAssignment] = useState({
      judul: '',
      deskripsi: '',
      deadline: '',
      file: null,
      jawabanGuru: null
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/login-register');
            return;
        }
        setUser(session.user);
        await Promise.all([fetchClassInfo(), fetchAssignments()]);
        setLoading(false);
    };
    init();
  }, [kode_kelas]);

  const fetchClassInfo = async () => {
      try {
          const res = await fetch('/api/classes');
          if (res.ok) {
              const data = await res.json();
              const cls = data.find(c => c.kode_kelas === kode_kelas);
              if (cls) {
                  setClassInfo(cls);
                  setEditClassName(cls.nama_kelas);
              } else {
                 router.push('/dashboard'); // Class not found or not authorized
              }
          }
      } catch (e) {
          console.error(e);
      }
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

  const fetchResults = async (assignmentId) => {
      setResults([]); // Clear previous
      setSelectedAssignmentId(assignmentId);
      try {
          const res = await fetch(`/api/results/assignment/${assignmentId}`);
          if (res.ok) {
              const data = await res.json();
              setResults(data);
          }
      } catch (e) { console.error(e); }
  };

  const handleDeleteClass = async () => {
      const result = await Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#dc2626',
          cancelButtonColor: '#64748b',
          confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
           try {
              const res = await fetch(`/api/class/delete`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ kode_kelas })
              });
              if (res.ok) {
                  toast.success('Class has been deleted.');
                  router.push('/dashboard');
              } else {
                  toast.error('Failed to delete class');
              }
           } catch (e) { console.error(e); }
      }
  };

  const handleEditClass = async (e) => {
      e.preventDefault();
      try {
          const res = await fetch('/api/class/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ kode_kelas, nama_kelas: editClassName })
          });
          if (res.ok) {
              toast.success('Class updated successfully');
              setIsEditClassOpen(false);
              fetchClassInfo();
          } else {
             toast.error('Failed to update class');
          }
      } catch(e) { console.error(e); }
  };

  const handleAddAssignment = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      const formData = new FormData();
      formData.append('judulAssignment', newAssignment.judul);
      formData.append('deskripsiAssignment', newAssignment.deskripsi);
      formData.append('deadlineAssignment', newAssignment.deadline);
      formData.append('fileAssignment', newAssignment.file);
      formData.append('jawabanGuru', newAssignment.jawabanGuru);
      formData.append('kelas_id', classInfo.id);

      try {
          const res = await fetch('/api/assignments', {
              method: 'POST',
              body: formData
          });
          if (res.ok) {
              toast.success('Assignment created!');
              setIsAddAssignmentOpen(false);
              fetchAssignments();
              setNewAssignment({ judul: '', deskripsi: '', deadline: '', file: null, jawabanGuru: null });
          } else {
              const err = await res.json();
              toast.error(err.error || "Failed to create assignment");
          }
      } catch(e) { 
          console.error(e); 
          toast.error('An unexpected error occurred'); 
      }
      finally { setSubmitting(false); }
  };

  const handleDeleteAssignment = async (id) => {
      const result = await Swal.fire({
          title: 'Are you sure?',
          text: "Delete this assignment?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#dc2626',
          cancelButtonColor: '#64748b',
          confirmButtonText: 'Yes, delete it!'
      });
      if (!result.isConfirmed) return;

      try {
          const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
          if(res.ok) {
              toast.success('Assignment deleted');
              fetchAssignments();
              if(selectedAssignmentId === id) {
                  setSelectedAssignmentId(null);
                  setResults([]);
              }
          } else {
              const err = await res.json();
              toast.error(err.message || "Failed");
          }
      } catch(e) { console.error(e); }
  };
  
 const handleDeleteResult = async (id) => {
      const result = await Swal.fire({
          title: 'Are you sure?',
          text: "Delete this submission?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#dc2626',
          cancelButtonColor: '#64748b',
          confirmButtonText: 'Yes, delete it!'
      });
      if (!result.isConfirmed) return;

      try {
          const res = await fetch(`/api/upload/delete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id })
          });
          if(res.ok) {
              toast.success('Submission deleted');
              fetchResults(selectedAssignmentId);
          } else {
              toast.error('Failed to delete submission');
          }
      } catch(e) { console.error(e); }
  };

  const downloadCSV = async (assignmentId) => {
       window.open(`/api/assignments/${assignmentId}/download-csv`, '_blank');
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;

  return (
    <DashboardShell role="Teacher" username={user?.user_metadata?.username} onLogout={() => router.push('/logout')}>
        <div className="mb-6">
            <Link href="/dashboard" className="text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-4 text-sm font-medium">
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                     <h1 className="text-3xl font-bold text-slate-900 mb-1">{classInfo?.nama_kelas}</h1>
                     <p className="text-slate-500 font-mono text-sm bg-slate-100 px-2 py-1 rounded inline-block">Code: {classInfo?.kode_kelas}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsEditClassOpen(true)} className="px-4 py-2 border cursor-pointer border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 flex items-center gap-2 font-medium">
                        <Edit size={16} /> Edit Class
                    </button>
                    <button onClick={handleDeleteClass} className="px-4 py-2 bg-red-50 text-red-600 border cursor-pointer border-red-100 rounded-xl hover:bg-red-100 flex items-center gap-2 font-medium">
                        <Trash2 size={16} /> Delete Class
                    </button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Assignments List */}
            <div className="lg:col-span-1 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Assignments</h3>
                    <button 
                        onClick={() => setIsAddAssignmentOpen(true)} 
                        className="p-2 bg-blue-600 text-white cursor-pointer rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    {assignments.length === 0 && <p className="text-slate-500 text-sm italic">No assignments yet.</p>}
                    {assignments.map(ass => (
                        <div 
                            key={ass.id} 
                            onClick={() => fetchResults(ass.id)}
                            className={cn(
                                "p-5 rounded-2xl border cursor-pointer transition-all hover:shadow-md",
                                selectedAssignmentId === ass.id 
                                    ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500/20" 
                                    : "bg-white border-slate-200 hover:border-blue-300"
                            )}
                        >
                            <h4 className="font-bold text-slate-900 mb-1">{ass.judul}</h4>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-3">{ass.deskripsi}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                                <Calendar size={14} />
                                {ass.deadline}
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100/50">
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); downloadCSV(ass.id); }}
                                    className="text-xs font-bold cursor-pointer text-blue-600 hover:underline flex items-center gap-1"
                                 >
                                     <Download size={14} /> CSV
                                 </button>
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteAssignment(ass.id); }}
                                    className="text-xs font-bold cursor-pointer text-red-500 hover:text-red-700 flex items-center gap-1"
                                 >
                                     <Trash2 size={14} /> Delete
                                 </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Results Area */}
            <div className="lg:col-span-2 sticky top-6 self-start">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">
                            {selectedAssignmentId ? "Submission Results" : "Select an Assignment"}
                        </h3>
                    </div>
                    
                    {!selectedAssignmentId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                            <FileText size={48} className="mb-4 opacity-50" />
                            <p>Select an assignment from the left to view grades and submissions.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            {results.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">No submissions yet.</div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Student</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Grade</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Similarity</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {results.map((res, idx) => (
                                            <tr key={res.id || idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">{res.nama_murid || res.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "px-2 py-1 rounded text-xs font-bold",
                                                        parseFloat(res.nilai) >= 80 ? "bg-green-100 text-green-700" :
                                                        parseFloat(res.nilai) >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                                    )}>
                                                        {res.nilai || res.grade}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 text-sm">{res.similarity || '-'}</td>
                                                <td className="px-6 py-4">
                                                     <button 
                                                        onClick={() => handleDeleteResult(res.id)}
                                                        className="p-2 text-slate-400 cursor-pointer hover:text-red-600 transition-colors"
                                                        title="Delete Submission"
                                                     >
                                                         <Trash2 size={16} />
                                                     </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Add Assignment Modal */}
        {isAddAssignmentOpen && (
             <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                 <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl text-slate-800 font-bold">New Assignment</h3>
                        <button onClick={() => setIsAddAssignmentOpen(false)}><X size={24} className="text-slate-400 cursor-pointer" /></button>
                     </div>
                     <form onSubmit={handleAddAssignment} className="space-y-3">
                         <div>
                             <label className="block text-slate-600 text-sm font-medium mb-1">Title</label>
                             <input type="text" required value={newAssignment.judul} onChange={e => setNewAssignment({...newAssignment, judul: e.target.value})} placeholder="Enter assignment title" className="w-full border text-slate-500 rounded-lg px-4 py-2" />
                         </div>
                         <div>
                             <label className="block text-slate-600 text-sm font-medium mb-1">Description</label>
                             <textarea required value={newAssignment.deskripsi} onChange={e => setNewAssignment({...newAssignment, deskripsi: e.target.value})} placeholder="Enter assignment description" className="w-full border text-slate-500 rounded-lg px-4 py-2" rows="3"></textarea>
                         </div>
                         <div>
                             <label className="block text-slate-600 text-sm font-medium mb-1">Deadline</label>
                             <input type="datetime-local" required value={newAssignment.deadline} onChange={e => setNewAssignment({...newAssignment, deadline: e.target.value})} placeholder="Select deadline" className="w-full border text-slate-500 rounded-lg px-4 py-2" />
                         </div>
                          <div>
                              <label className="block text-slate-600 text-sm font-medium mb-1">Assignment File</label>
                              <div className="relative group">
                                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors group-hover:bg-slate-50 group-hover:border-blue-400 bg-slate-50/50">
                                      <input 
                                          type="file" 
                                          required 
                                          onChange={e => setNewAssignment({...newAssignment, file: e.target.files[0]})} 
                                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                      />
                                      <UploadCloud className={cn("mb-2 transition-colors", newAssignment.file ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500")} size={32} />
                                      
                                      {newAssignment.file ? (
                                          <div>
                                              <p className="text-sm font-bold text-blue-700 break-all">{newAssignment.file.name}</p>
                                              <p className="text-xs text-blue-500 mt-1">Click to change file</p>
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
                          <div>
                              <label className="block text-slate-600 text-sm font-medium mb-1">Teacher Answer Key (Standard)</label>
                              <div className="relative group">
                                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors group-hover:bg-slate-50 group-hover:border-blue-400 bg-slate-50/50">
                                      <input 
                                          type="file" 
                                          required 
                                          onChange={e => setNewAssignment({...newAssignment, jawabanGuru: e.target.files[0]})} 
                                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                      />
                                      <UploadCloud className={cn("mb-2 transition-colors", newAssignment.jawabanGuru ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500")} size={32} />
                                      
                                      {newAssignment.jawabanGuru ? (
                                          <div>
                                              <p className="text-sm font-bold text-blue-700 break-all">{newAssignment.jawabanGuru.name}</p>
                                              <p className="text-xs text-blue-500 mt-1">Click to change file</p>
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
                         <button disabled={submitting} type="submit" className="w-full cursor-pointer py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
                             {submitting ? 'Creating...' : 'Create Assignment'}
                         </button>
                     </form>
                 </div>
             </div>
        )}

        {/* Edit Class Modal */}
        {isEditClassOpen && (
             <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                 <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                     <h3 className="text-xl text-slate-600 font-bold mb-4">Edit Class Name</h3>
                     <form onSubmit={handleEditClass}>
                         <input type="text" value={editClassName} onChange={e => setEditClassName(e.target.value)} className="w-full text-slate-500 border rounded-lg px-4 py-2 mb-4" />
                         <div className="flex justify-end gap-2">
                             <button type="button" onClick={() => setIsEditClassOpen(false)} className="px-4 py-2 text-slate-600 cursor-pointer hover:bg-slate-100 rounded-lg">Cancel</button>
                             <button type="submit" className="px-4 py-2 bg-blue-600 text-white cursor-pointer rounded-lg">Save</button>
                         </div>
                     </form>
                 </div>
             </div>
        )}
    </DashboardShell>
  );
}
