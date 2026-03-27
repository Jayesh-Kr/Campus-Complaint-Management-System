"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-neutral-800 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-lg tracking-tight text-neutral-100">
            Campus Desk
          </Link>
          {user && (
            <div className="hidden md:flex items-center gap-4 text-sm font-medium text-neutral-400">
              <Link href="/dashboard" className="hover:text-neutral-50 transition-colors">
                Dashboard
              </Link>
              {user.role === 'admin' || user.role === 'staff' ? (
                <Link href="/reports" className="hover:text-neutral-50 transition-colors">
                  Reports
                </Link>
              ) : null}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="text-sm hidden sm:block">
                <span className="text-neutral-400">Signed in as </span>
                <span className="font-medium text-neutral-200">{user.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className="text-neutral-400 hover:text-red-400">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
