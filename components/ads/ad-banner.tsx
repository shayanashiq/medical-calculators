"use client";
import { useEffect, useRef } from "react";

export function AdBanner() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.childElementCount > 0) return;

    const atOptions = document.createElement("script");
    atOptions.text = `atOptions = {'key':'1246652fd3a7aa6905ac2ef7eb9fda48','format':'iframe','height':90,'width':728,'params':{}};`;
    const invoke = document.createElement("script");
    invoke.src = "https://www.highperformanceformat.com/1246652fd3a7aa6905ac2ef7eb9fda48/invoke.js";

    container.appendChild(atOptions);
    container.appendChild(invoke);
  }, []);

  return <div ref={containerRef} className="my-4 flex justify-center overflow-hidden" />;
}
