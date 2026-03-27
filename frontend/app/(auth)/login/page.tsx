"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [roleMode, setRoleMode] = useState<"student" | "staff">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (roleMode === "student") {
        const { data } = await api.post("/students/login", { email, password });
        
        const userData = data.student || data.user;
        const normalizedUser = {
          id: userData.student_id || userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'student'
        };

        login(data.token, normalizedUser);
        router.push("/dashboard");
      } else {
        const { data } = await api.post("/staff/login", { email, password });

        const userData = data.staff || data.user;
        const normalizedUser = {
          id: userData.staff_id || userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'staff'
        };

        login(data.token, normalizedUser);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const responseMessage =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      const fallbackMessage = err instanceof Error ? err.message : "Invalid credentials or server error";
      setError(responseMessage || fallbackMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex bg-neutral-900 p-1 rounded-md mb-6">
            <button
              onClick={() => { setRoleMode("student"); setError(""); }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-sm transition-colors ${roleMode === "student" ? "bg-neutral-800 text-neutral-50 shadow" : "text-neutral-400 hover:text-neutral-200"}`}
            >
              Student
            </button>
            <button
              onClick={() => { setRoleMode("staff"); setError(""); }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-sm transition-colors ${roleMode === "staff" ? "bg-neutral-800 text-neutral-50 shadow" : "text-neutral-400 hover:text-neutral-200"}`}
            >
              Staff / Admin
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 text-sm bg-red-950/50 border border-red-900 rounded-md text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder={roleMode === "student" ? "student@student.edu" : "staff@college.edu"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-neutral-800 pt-6">
          <p className="text-sm text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-neutral-50 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
