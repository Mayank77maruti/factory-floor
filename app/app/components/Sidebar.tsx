"use client";

import React from "react";
import { ActiveRunState } from "../runState";

interface SidebarProps {
  onNewDrawing?: () => void;
  selectedRunId?: string;
  onSelectRun?: (runId: string) => void;
  activeRunState?: ActiveRunState | null;
  currentFileName?: string;
}

export function Sidebar(_props: SidebarProps) {
  return null;
}

export default Sidebar;

