"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";

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

const emptySubscribe = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

export function dispatchFranchiseThemeEvent(theme: AmbientThemeColors) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    "cricintel_franchise_theme",
    JSON.stringify(theme)
  );
  window.dispatchEvent(
    new CustomEvent<AmbientThemeColors>("cricintel:franchise-theme", {
      detail: theme,
    })
  );
}

export function CursorGridBackdrop() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    getClientMounted,
    getServerMounted
  );

  const [coords, setCoords] = useState<{ x: number; y: number }>({
    x: -1000,
    y: -1000,
  });
  const [theme, setTheme] = useState<AmbientThemeColors>(DEFAULT_AMBIENT);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem(
          "cricintel_franchise_theme"
        );
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<AmbientThemeColors>;
          if (parsed.primaryHex && parsed.secondaryHex && parsed.code) {
            setTheme({
              primaryHex: parsed.primaryHex,
              secondaryHex: parsed.secondaryHex,
              code: parsed.code,
            });
          }
        }
      } catch {
        // Ignore storage read errors
      }
    });

    const handlePointerMove = (event: PointerEvent) => {
      setCoords({ x: event.clientX, y: event.clientY });
    };

    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<AmbientThemeColors>;
      if (customEvent.detail) {
        setTheme(customEvent.detail);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("cricintel:franchise-theme", handleThemeChange);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener(
        "cricintel:franchise-theme",
        handleThemeChange
      );
    };
  }, []);

  const maskStyle: React.CSSProperties | undefined = isMounted
    ? {
        WebkitMaskImage: `radial-gradient(380px circle at ${coords.x}px ${coords.y}px, black 0%, transparent 100%)`,
        maskImage: `radial-gradient(380px circle at ${coords.x}px ${coords.y}px, black 0%, transparent 100%)`,
      }
    : undefined;

  const spotlightStyle: React.CSSProperties | undefined = isMounted
    ? {
        backgroundImage: `radial-gradient(560px circle at ${coords.x}px ${coords.y}px, ${theme.primaryHex}18, ${theme.secondaryHex}10 45%, transparent 80%)`,
      }
    : undefined;

  const primaryOrbStyle: React.CSSProperties | undefined = isMounted
    ? { backgroundColor: `${theme.primaryHex}14` }
    : undefined;

  const secondaryOrbStyle: React.CSSProperties | undefined = isMounted
    ? { backgroundColor: `${theme.secondaryHex}14` }
    : undefined;

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
        style={primaryOrbStyle}
      />
      <div
        className="absolute top-1/2 -right-24 h-120 w-120 rounded-full blur-[160px] animate-mist-drift transition-colors duration-1000"
        style={secondaryOrbStyle}
      />
    </div>
  );
}