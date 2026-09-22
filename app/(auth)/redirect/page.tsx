"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getDashboardRoute } from "@/lib/role-redirect";
import { Loader2 } from "lucide-react";

export default function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await authClient.getSession();
      const role = (data?.user as any)?.role;
      router.replace(getDashboardRoute(role));
    })();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}