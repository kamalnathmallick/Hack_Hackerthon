"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { Role } from "@/lib/types";

interface Props {
  allowedRole: Role;
  children: ReactNode;
}

export default function AuthGuard({ allowedRole, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== allowedRole) {
      if (user.role === "TEAM_LEADER") router.replace("/leader/dashboard");
      if (user.role === "TEAM_MEMBER") router.replace("/member/dashboard");
      return;
    }
    setReady(true);
  }, [allowedRole, pathname, router]);

  if (!ready) return <div className="p-8 text-slate-600">Checking access...</div>;
  return <>{children}</>;
}
