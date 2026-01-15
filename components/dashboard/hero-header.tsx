"use client";

import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";

export function HeroHeader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col max-w-5xl items-start gap-4 mb-10 w-full w-full",
        className
      )}
    >
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.1]">
        Stop browsing screenshots. <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
          Start shipping logic.
        </span>{" "}
      </h1>
      <p className="text-xl text-muted-foreground/80 text-balance">
        A library of UI that has already been tested, shipped, and scaled by the
        world’s best teams. Grab the prompt, get the logic, and ship your app in
        record time.
      </p>
      <div className="mt-4">
        {/* Add Newsletter Signup Here */}
        {/* TODO */}
      </div>
    </div>
  );
}
