"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, AlertOctagon, CheckCircle2, Clock, Users } from "lucide-react";

export default function ReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "admin" && user.role !== "staff"))) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        // Execute parallel requests to get reporting data
        const [
          byStatus,
          avgTime,
          openDash,
          staffPerf
        ] = await Promise.all([
          api.get("/reports/complaints-by-status"),
          api.get("/reports/average-resolution-time"),
          api.get("/reports/open-complaints-dashboard"),
          api.get("/reports/staff-performance")
        ]);

        setStats({
          status: byStatus.data,
          avgTime: avgTime.data,
          open: openDash.data,
          staff: staffPerf.data,
        });
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin" || user?.role === "staff") {
      fetchReports();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
      </div>
    );
  }

  // Helper to extract value safely depending on typical count structures
  const extractCount = (arr: any[], status: string) => {
    if (!Array.isArray(arr)) return 0;
    const item = arr.find(x => x.status === status);
    return item ? (item.count || item.total) : 0;
  };

  const totalOpen = extractCount(stats?.status, 'open') + extractCount(stats?.status, 'in_progress') + extractCount(stats?.status, 'pending');
  const totalResolved = extractCount(stats?.status, 'resolved') + extractCount(stats?.status, 'closed');
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Reports</h1>
        <p className="text-neutral-400 mt-1">Analytics and overview of platform operations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-neutral-400">Total Open</CardTitle>
            <AlertOctagon className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOpen}</div>
            <p className="text-xs text-neutral-500 mt-1">Pending action</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-neutral-400">Total Resolved</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResolved}</div>
            <p className="text-xs text-neutral-500 mt-1">Successfully handled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-neutral-400">Avg Resolution</CardTitle>
            <Clock className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.avgTime?.[0]?.avg_time ? `${parseFloat(stats.avgTime[0].avg_time).toFixed(1)} hrs` : 'N/A'}
            </div>
            <p className="text-xs text-neutral-500 mt-1">From open to closed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-neutral-400">Staff Active</CardTitle>
            <Users className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.staff?.length || 0}</div>
            <p className="text-xs text-neutral-500 mt-1">Managing complaints</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Complaints by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.status?.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-neutral-300">{item.status?.replace('_', ' ')}</span>
                  <span className="font-medium text-sm px-2 py-1 bg-neutral-800 rounded-md">
                    {item.count || item.total || 0}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Staff Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.staff?.slice(0, 5).map((staff: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b border-neutral-800 pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-neutral-200">{staff.staff_name || staff.name || `Staff #${staff.staff_id}`}</p>
                    <p className="text-xs text-neutral-500">Resolved: {staff.resolved_count || 0}</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-neutral-600" />
                </div>
              ))}
              {(!stats?.staff || stats.staff.length === 0) && (
                <p className="text-sm text-neutral-500 italic">No performance data available yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
