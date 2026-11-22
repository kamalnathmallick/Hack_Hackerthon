"use client";

import { DashboardLayout } from "@/components/ui/DashboardLayout";
import { ReactNode } from "react";

export default function MemberLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout role="TEAM_MEMBER">{children}</DashboardLayout>;
}
