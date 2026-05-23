"use client";

import React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

/**
 * Wrapper component that isolates NextThemesProvider to avoid server‑side script tag warnings.
 * Rendered only on the client, ensuring internal script tags from next‑themes are handled correctly.
 */
export default function ClientRoot({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}

// Re‑export for convenience if other modules import directly.
export { ClientRoot as ThemeProvider };
