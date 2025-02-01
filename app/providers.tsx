"use client";

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <>{children}</>; // Skip server-side rendering

  return (
    <ThemeProvider enableSystem={true} attribute="class">
      {children}
    </ThemeProvider>
  );
};
