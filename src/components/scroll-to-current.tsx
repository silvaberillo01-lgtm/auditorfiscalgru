"use client";

import { useEffect } from "react";

export default function ScrollToCurrent() {
  useEffect(() => {
    document.getElementById("semana-atual")?.scrollIntoView({ block: "center" });
  }, []);
  return null;
}
