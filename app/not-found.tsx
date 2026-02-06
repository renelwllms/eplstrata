import Link from "next/link";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="app-shell-bg min-h-screen flex items-center justify-center p-6">
      <div className="card-surface max-w-md p-8 text-center">
        <h2 className="text-2xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-ink-700">The page you’re looking for doesn’t exist.</p>
        <Button asChild className="mt-6">
          <Link href="/app/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
