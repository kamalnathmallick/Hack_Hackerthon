"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    router.replace(user.role === "TEAM_LEADER" ? "/leader/dashboard" : "/member/dashboard");
  }, [router]);

  return <div className="p-8">Redirecting...</div>;
}
