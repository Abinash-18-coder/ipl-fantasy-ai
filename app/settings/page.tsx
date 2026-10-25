// File: app/settings/page.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <div className="glass-card rounded-2xl p-8 space-y-3 shadow-glass-panel">
      <Badge variant="outline">MUMBAI (ap-south-1) AUTH</Badge>
      <h1 className="text-2xl font-extrabold text-white">
        Account Login & Franchise Theme Settings
      </h1>
      <p className="text-sm text-slate-300">
        Supabase SSR Google OAuth, Magic Link login, and favorite IPL franchise
        ambient theme selector will be wired here in Week 2.
      </p>
    </div>
  );
}