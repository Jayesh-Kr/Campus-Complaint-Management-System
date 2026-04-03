"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-lg tracking-tight text-foreground">
            Campus Desk
          </Link>
          {user && !loading && (
            <div className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <Link href="/dashboard" className="transition-colors hover:text-foreground">
                Dashboard
              </Link>
              {user.role === 'admin' || user.role === 'staff' ? (
                <Link href="/reports" className="transition-colors hover:text-foreground">
                  Reports
                </Link>
              ) : null}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user && !loading ? (
            <>
              <div className="text-sm hidden sm:block">
                <span className="text-muted-foreground">Signed in as </span>
                <span className="font-medium text-foreground">{user.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive">
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
