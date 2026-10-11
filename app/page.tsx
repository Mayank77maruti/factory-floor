"use client";

import { ArchitectHero } from "./components/ArchitectHero";
import { ArchitectModeExperience } from "./components/ArchitectModeExperience";
import { ExploreFrontlineMode } from "./components/ExploreFrontlineMode";
import { LandingFooter } from "./components/LandingFooter";

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-[#f4ebd7]">
        <ArchitectHero brandName="Manufy" />
        <ArchitectModeExperience />
        <ExploreFrontlineMode />
      </main>
      <LandingFooter />
    </>
  );
}
