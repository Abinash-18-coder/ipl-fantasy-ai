"use client";

import React, { useEffect, useState } from "react";

export function CursorGridBackdrop() {
  const [coords, setCoords] = useState<{ x: number; y: number }>({
    x: -1000,
    y: -1000,
  });

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      setCoords({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  const maskStyle: React.CSSProperties = {
    WebkitMaskImage: `radial-gradient(360px circle at ${coords.x}px ${coords.y}px, black 0%, transparent 100%)`,
    maskImage: `radial-gradient(360px circle at ${coords.x}px ${coords.y}px, black 0%, transparent 100%)`,
  };

  const spotlightStyle: React.CSSProperties = {
    background: `radial-gradient(520px circle at ${coords.x}px ${coords.y}px, rgba(200, 178, 115, 0.075), rgba(59, 110, 165, 0.04) 45%, transparent 80%)`,
  };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 starlight-grid opacity-55" />
      <div
        className="absolute inset-0 starlight-grid-glow transition-opacity duration-300"
        style={maskStyle}
      />
      <div className="absolute inset-0" style={spotlightStyle} />
      <div className="absolute -top-32 left-1/4 h-130 w-130 rounded-full bg-[#c8b273]/4 blur-[140px] animate-mist-drift" />
      <div className="absolute top-1/2 -right-24 h-115 w-115 rounded-full bg-franchise-mi/5 blur-[150px] animate-mist-drift" />
    </div>
  );
}