"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="w-screen px-5 py-10 sm:px-20 sm:py-10 flex justify-between items-center">
      <div className="flex justify-start items-center gap-x-5 sm:gap-x-10">
        <Link href="/" className="px-4 py-2 border rounded">
          Home
        </Link>

        <Link href="/add-package" className="px-4 py-2 border rounded">
          Add Package
        </Link>
      </div>
      <Button
        className="flex-shrink-0 p-2.5 ring-0 focus:ring-0 focus:border-none text-grayscale-textIcon-title border"
        variant="ghost"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        <SunIcon className="size-6 transition-all scale-100 rotate-0 dark:-rotate-90 dark:scale-0" />
        <MoonIcon className="absolute size-6 transition-all scale-0 rotate-90 dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
}
