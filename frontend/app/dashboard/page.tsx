"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusBadgeVariant, getPriorityBadgeVariant, formatStatus } from "@/lib/helpers";
import Link from "next/link";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!user) return;
      try {
        setLoading(true);
        let endpoint = "/complaints";
        if (user.role === "student") {
          endpoint = `/students/${user.id}/complaints`;
        } else if (user.role === "staff") {
          endpoint = `/staff/${user.id}/complaints`;
        }
        
        const { data } = await api.get(endpoint);
        // Depending on backend, data might be an array or { data: [] }
        setComplaints(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Failed to load complaints:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [user]);

  if (authLoading || (loading && complaints.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
      </div>
    );
  }

  const filteredComplaints = complaints.filter(c => 
    c.title?.toLowerCase().includes(search.toLowerCase()) || 
    c.id?.toString().includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-neutral-400 mt-1">Manage and track campus complaints.</p>
        </div>
        {user?.role === "student" && (
          <Link href="/complaints/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Complaint
            </Button>
          </Link>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input 
            placeholder="Search complaints..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredComplaints.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-48 text-center">
              <p className="text-neutral-400 mb-2">No complaints found.</p>
              {user?.role === "student" && (
                <Link href="/complaints/new">
                  <Button variant="outline" size="sm">Create your first complaint</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredComplaints.map((complaint) => (
            <Link key={complaint.id} href={`/complaints/${complaint.id}`}>
              <Card className="hover:border-neutral-700 transition-colors cursor-pointer group">
                <CardHeader className="py-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-lg group-hover:text-neutral-200 transition-colors">
                        {complaint.title}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-3">
                        <span>#{complaint.id}</span>
                        <span>•</span>
                        <span>{new Date(complaint.created_at || Date.now()).toLocaleDateString()}</span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <Badge variant={getPriorityBadgeVariant(complaint.priority)}>
                        {formatStatus(complaint.priority || 'low')}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(complaint.status)}>
                        {formatStatus(complaint.status || 'pending')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
