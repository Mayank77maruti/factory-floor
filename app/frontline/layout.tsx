import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frontline Mode · Shop Floor Copilot",
  description: "Real-time frontline operations assistant, equipment drift monitoring, and autonomous dispatch.",
};

export default function FrontlineLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

