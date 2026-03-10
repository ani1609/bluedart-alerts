"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex w-full items-center justify-between px-5 py-10 sm:px-20">
      <div className="flex items-center justify-start gap-x-5 sm:gap-x-10">
        <Link href="/" className="rounded border px-4 py-2">
          Home
        </Link>

        <Link href="/add-package" className="rounded border px-4 py-2">
          Add Package
        </Link>
      </div>
      <Button
        className="text-grayscale-textIcon-title shrink-0 border p-2.5 ring-0 focus:border-none focus:ring-0"
        variant="ghost"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        <SunIcon className="size-6 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <MoonIcon className="absolute size-6 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
}
