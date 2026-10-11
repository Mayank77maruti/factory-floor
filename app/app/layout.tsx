import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AutoDraft Studio · Precision 2D Blueprinting",
  description: "Interactive ASME Y14.5 CAD drafting studio and automated inspection canvas.",
};

export default function AppStudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

