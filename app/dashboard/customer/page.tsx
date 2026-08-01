import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomerOverview() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Customer dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">
              Track and manage your home service bookings.
            </p>
            <Link
              href="/dashboard/customer/bookings"
              className="mt-3 inline-block text-sm font-medium text-zinc-900 underline"
            >
              View bookings
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Browse services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">
              Find technicians and book a service near you.
            </p>
            <Link
              href="/services"
              className="mt-3 inline-block text-sm font-medium text-zinc-900 underline"
            >
              Browse services
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
