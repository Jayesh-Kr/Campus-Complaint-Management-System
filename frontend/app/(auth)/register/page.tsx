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

export default function RegisterPage() {
  const [roleMode, setRoleMode] = useState<"student" | "staff">("student");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    password: "",
    role: "staff" // for staff registration
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (roleMode === "student") {
        const { data } = await api.post("/students/register", formData);
        
        if (data.token && (data.student || data.user)) {
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
          router.push("/login?registered=true");
        }
      } else {
        const { data } = await api.post("/staff/register", {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          password: formData.password,
          role: formData.role
        });

        const userData = data.staff || data.user;
        const normalizedUser = {
          id: userData.staff_id || userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role || formData.role
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
      const fallbackMessage = err instanceof Error ? err.message : "Error creating account. Please try again.";
      setError(responseMessage || fallbackMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            {roleMode === "student" ? "Register as a student to submit complaints" : "Register as campus staff or admin"}
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

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 text-sm bg-red-950/50 border border-red-900 rounded-md text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder={roleMode === "student" ? "student@student.edu" : "staff@college.edu"}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={`grid ${roleMode === "student" ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              {roleMode === "student" && (
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input 
                    id="department" 
                    placeholder="Computer Science"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
            </div>

            {roleMode === "staff" && (
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select 
                  id="role"
                  className="flex h-9 w-full rounded-md border border-neutral-800 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="staff" className="bg-[#141414]">Staff</option>
                  <option value="admin" className="bg-[#141414]">Admin</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-neutral-800 pt-6">
          <p className="text-sm text-neutral-400">
            Already have an account?{" "}
            <Link href="/login" className="text-neutral-50 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
