"use client";

import { DashboardLayout } from "@/components/ui/DashboardLayout";
import { ReactNode } from "react";

export default function LeaderLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout role="TEAM_LEADER">{children}</DashboardLayout>;
}
