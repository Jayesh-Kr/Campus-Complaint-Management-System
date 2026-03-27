"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, MessageSquare, Send, CheckCircle } from "lucide-react";
import Link from "next/link";
import { formatStatus, getPriorityBadgeVariant, getStatusBadgeVariant } from "@/lib/helpers";

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [complaint, setComplaint] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Forms state
  const [replyMessage, setReplyMessage] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("");
  const [assignStaffId, setAssignStaffId] = useState("");
  const [feedbackRating, setFeedbackRating] = useState("5");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, respRes] = await Promise.all([
        api.get(`/complaints/${id}`),
        api.get(`/responses/complaint/${id}`)
      ]);
      setComplaint(compRes.data);
      setResponses(Array.isArray(respRes.data) ? respRes.data : respRes.data.data || []);
      setStatusUpdate(compRes.data.status);
      setAssignStaffId(compRes.data.staff_id ? String(compRes.data.staff_id) : "");

      if (user?.role === 'admin' || user?.role === 'staff') {
        const staffRes = await api.get("/staff");
        setStaffList(Array.isArray(staffRes.data) ? staffRes.data : staffRes.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && user) {
      fetchData();
    }
  }, [id, user]);

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;
    try {
      await api.post("/responses", {
        complaint_id: parseInt(id as string),
        staff_id: user?.role === 'staff' || user?.role === 'admin' ? user.id : null,
        message: replyMessage
      });
      setReplyMessage("");
      fetchData();
    } catch (err) {
      console.error("Failed to send reply", err);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await api.patch(`/complaints/${id}`, { status: statusUpdate });
      fetchData();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleAssign = async () => {
    try {
      const normalizedStaffId = assignStaffId ? Number(assignStaffId) : null;
      await api.patch(`/complaints/${id}/assign`, {
        staff_id: Number.isInteger(normalizedStaffId) ? normalizedStaffId : null
      });
      fetchData();
    } catch (err) {
      console.error("Failed to assign", err);
    }
  };

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/feedback", {
        complaint_id: parseInt(id as string),
        student_id: user?.id,
        rating: parseInt(feedbackRating),
        message: feedbackMessage
      });
      fetchData();
    } catch (err) {
      console.error("Failed to submit feedback", err);
    }
  };

  if (loading || !complaint) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
      </div>
    );
  }

  const isResolved = complaint.status === 'resolved' || complaint.status === 'closed';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/dashboard" className="inline-flex items-center text-sm text-neutral-400 hover:text-neutral-50 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex gap-2 mb-2">
                    <Badge variant={getStatusBadgeVariant(complaint.status)}>
                      {formatStatus(complaint.status)}
                    </Badge>
                    <Badge variant={getPriorityBadgeVariant(complaint.priority)}>
                      {formatStatus(complaint.priority)} Priority
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mt-2">{complaint.title}</CardTitle>
                  <CardDescription className="mt-1">
                    Submitted on {new Date(complaint.date_filed || complaint.created_at).toLocaleString()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-medium text-sm text-neutral-400 mb-2">Description</h3>
              <p className="whitespace-pre-wrap text-neutral-200">{complaint.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Discussion thread
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {responses.length === 0 ? (
                <p className="text-sm text-neutral-500 italic">No responses yet.</p>
              ) : (
                <div className="space-y-4">
                  {responses.map((resp: any) => (
                    <div key={resp.response_id || resp.id} className={`p-4 rounded-lg flex flex-col ${resp.staff_id ? 'bg-neutral-800/50' : 'bg-neutral-900/40'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm text-neutral-300">
                          {resp.staff_id ? 'Staff/Admin' : 'Student'}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {new Date(resp.date_responded || resp.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-200 whitespace-pre-wrap">{resp.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {!isResolved && (
                <div className="mt-4 pt-4 border-t border-neutral-800 flex gap-2">
                  <Textarea 
                    placeholder="Type a response..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="flex-1 min-h-[40px] max-h-[120px]"
                  />
                  <Button onClick={handleSendReply} className="h-auto">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {isResolved && user?.role === 'student' && (
            <Card className="border-emerald-900/30 bg-emerald-950/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                  Provide Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFeedback} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rating (1-5)</Label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-neutral-800 bg-[#141414] px-3 py-1 text-sm shadow-sm"
                      value={feedbackRating}
                      onChange={(e) => setFeedbackRating(e.target.value)}
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num} Stars</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Feedback Message</Label>
                    <Textarea 
                      placeholder="Share your experience..." 
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" variant="outline" className="w-full">Submit Feedback</Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-neutral-500 block mb-1">Student ID</span>
                <span className="font-medium text-neutral-200">#{complaint.student_id}</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Category</span>
                <span className="font-medium text-neutral-200">{complaint.category?.name || complaint.category || `ID: ${complaint.category_id}`}</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Assigned Staff</span>
                {complaint.staff_id || complaint.assigned_staff ? (
                  <span className="font-medium text-neutral-200">
                    {complaint.assigned_staff || `Staff ID: #${complaint.staff_id}`}
                  </span>
                ) : (
                  <span className="text-neutral-500 italic">Unassigned</span>
                )}
              </div>
            </CardContent>
          </Card>

          {(user?.role === 'admin' || user?.role === 'staff') && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Management Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Update Status</Label>
                  <div className="flex gap-2">
                    <select 
                      className="flex h-9 w-full rounded-md border border-neutral-800 bg-[#141414] px-3 py-1 text-sm shadow-sm"
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <Button size="sm" onClick={handleUpdateStatus}>Update</Button>
                  </div>
                </div>

                {user.role === 'admin' && (
                  <div className="space-y-3 pt-4 border-t border-neutral-800">
                    <Label>Assign Staff</Label>
                    <div className="flex gap-2">
                      <select 
                        className="flex h-9 w-full rounded-md border border-neutral-800 bg-[#141414] px-3 py-1 text-sm shadow-sm"
                        value={assignStaffId}
                        onChange={(e) => setAssignStaffId(e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {staffList.map(s => (
                          <option key={s.staff_id} value={s.staff_id}>{s.name} ({s.department})</option>
                        ))}
                      </select>
                      <Button size="sm" onClick={handleAssign} variant="secondary">Assign</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
