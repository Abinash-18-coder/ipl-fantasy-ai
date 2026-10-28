
"use client";

import React, { useEffect, useState } from "react";

interface AmbientThemeColors {
  primaryHex: string;
  secondaryHex: string;
  code: string;
}

const DEFAULT_AMBIENT: AmbientThemeColors = {
  primaryHex: "#c8b273",
  secondaryHex: "#3b6ea5",
  code: "DEFAULT",
};

function getInitialTheme(): AmbientThemeColors {
  if (typeof window === "undefined") {
    return DEFAULT_AMBIENT;
  }

  try {
    const saved = window.localStorage.getItem("cricintel_franchise_theme");

    if (saved) {
      const parsed = JSON.parse(saved) as Partial<AmbientThemeColors>;

      if (
        typeof parsed.primaryHex === "string" &&
        typeof parsed.secondaryHex === "string" &&
        typeof parsed.code === "string"
      ) {
        return {
          primaryHex: parsed.primaryHex,
          secondaryHex: parsed.secondaryHex,
          code: parsed.code,
        };
      }
    }
  } catch {
    // Ignore invalid JSON or localStorage access errors.
  }

  return DEFAULT_AMBIENT;
}

export function dispatchFranchiseThemeEvent(theme: AmbientThemeColors) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      "cricintel_franchise_theme",
      JSON.stringify(theme)
    );
  } catch {
    // The event should still update the theme if storage is unavailable.
  }

  window.dispatchEvent(
    new CustomEvent<AmbientThemeColors>("cricintel:franchise-theme", {
      detail: theme,
    })
  );
}

export function CursorGridBackdrop() {
  const [coords, setCoords] = useState<{ x: number; y: number }>({
    x: -1000,
    y: -1000,
  });

  const [theme, setTheme] = useState<AmbientThemeColors>(getInitialTheme);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      setCoords({ x: event.clientX, y: event.clientY });
    };

    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<AmbientThemeColors>;
      const nextTheme = customEvent.detail;

      if (
        nextTheme &&
        typeof nextTheme.primaryHex === "string" &&
        typeof nextTheme.secondaryHex === "string" &&
        typeof nextTheme.code === "string"
      ) {
        setTheme(nextTheme);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    window.addEventListener(
      "cricintel:franchise-theme",
      handleThemeChange
    );

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener(
        "cricintel:franchise-theme",
        handleThemeChange
      );
    };
  }, []);

  const maskStyle: React.CSSProperties = {
    WebkitMaskImage: `radial-gradient(380px circle at ${coords.x}px ${coords.y}px, black 0%, transparent 100%)`,
    maskImage: `radial-gradient(380px circle at ${coords.x}px ${coords.y}px, black 0%, transparent 100%)`,
  };

  const spotlightStyle: React.CSSProperties = {
    background: `radial-gradient(560px circle at ${coords.x}px ${coords.y}px, ${theme.primaryHex}18, ${theme.secondaryHex}10 45%, transparent 80%)`,
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

      <div
        className="absolute inset-0 transition-colors duration-700"
        style={spotlightStyle}
      />

      <div
        className="absolute -top-32 left-1/4 h-135 w-135 rounded-full blur-[150px] animate-mist-drift transition-colors duration-1000"
        style={{ backgroundColor: `${theme.primaryHex}14` }}
      />

      <div
        className="absolute top-1/2 -right-24 h-120 w-120 rounded-full blur-[160px] animate-mist-drift transition-colors duration-1000"
        style={{ backgroundColor: `${theme.secondaryHex}14` }}
      />
    </div>
  );
}
