import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Architect Mode · Autonomous CAD & GD&T",
  description: "Convert 3D solid models to ASME Y14.5 drafting sheets with automated tolerance synthesis and view projection.",
};

export default function ArchitectLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

