import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground text-center px-4">
      <h1 className="text-9xl font-black text-primary/10 select-none">404</h1>
      <div className="absolute flex flex-col items-center gap-6 mt-8">
        <h2 className="text-3xl font-bold tracking-tight">Page Not Found</h2>
        <p className="text-muted-foreground max-w-[500px]">
          Sorry, we couldn't find the page you're looking for. It might have
          been moved or deleted.
        </p>
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
