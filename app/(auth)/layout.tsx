import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6">
      <div className="mb-8 flex flex-col items-center">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          FixItNow
        </Link>
        <p className="mt-1 text-sm text-zinc-500">
          Home services marketplace
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
      <Button asChild variant="link" className="mt-6 text-sm text-zinc-500">
        <Link href="/">← Back to home</Link>
      </Button>
    </div>
  );
}
