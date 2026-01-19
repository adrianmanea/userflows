import { cn } from "@/utils/cn";

export function DisclaimerFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("w-full py-4", className)}>
      <div className="mx-auto px-6 text-xs text-muted-foreground/60 space-y-2">
        <p>
          PageInspo is an educational library of UI patterns. All trademarks and
          brand names are the property of their respective owners and used here
          for descriptive purposes only. The code provided is a clean-room
          reconstruction for educational and transformative use.
        </p>
        <div className="flex gap-4 pt-2">
          <a href="/privacy" className="hover:text-foreground hover:underline">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-foreground hover:underline">
            Terms of Service
          </a>
          <span className="ml-auto">
            © {new Date().getFullYear()} PageInspo
          </span>
        </div>
      </div>
    </footer>
  );
}
