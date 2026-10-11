import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Operations Admin · Shift Management",
  description: "Manager administration dashboard for frontline shift logs, tickets, and telemetry.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

