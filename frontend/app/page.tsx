import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Zap, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center space-y-12 py-10">
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[var(--hero-from)] to-[var(--hero-to)]">
          Streamline Campus Operations
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          A centralized, modern platform for managing issues, tracking reports, and ensuring a seamless campus experience for everyone.
        </p>
        
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link href="/register">
            <Button size="lg" className="h-11 px-8">
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="h-11 px-8">
              Login to Account
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-16 pt-16 border-t border-border">
        <div className="flex flex-col items-center text-center space-y-3 p-4">
          <div className="w-12 h-12 rounded-full border border-border bg-muted flex items-center justify-center mb-2">
            <Zap className="w-5 h-5 text-foreground" />
          </div>
          <h3 className="font-semibold text-lg">Fast Resolution</h3>
          <p className="text-sm text-muted-foreground">
            Real-time tracking and automated assignments ensure issues are addressed immediately.
          </p>
        </div>

        <div className="flex flex-col items-center text-center space-y-3 p-4">
          <div className="w-12 h-12 rounded-full border border-border bg-muted flex items-center justify-center mb-2">
            <ShieldCheck className="w-5 h-5 text-foreground" />
          </div>
          <h3 className="font-semibold text-lg">Transparent Process</h3>
          <p className="text-sm text-muted-foreground">
            Communicate directly with staff and get updates at every stage of the resolution.
          </p>
        </div>

        <div className="flex flex-col items-center text-center space-y-3 p-4">
          <div className="w-12 h-12 rounded-full border border-border bg-muted flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-foreground" />
          </div>
          <h3 className="font-semibold text-lg">Detailed Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive reporting dashboards for admins to monitor campus-wide metrics.
          </p>
        </div>
      </div>
    </div>
  );
}
