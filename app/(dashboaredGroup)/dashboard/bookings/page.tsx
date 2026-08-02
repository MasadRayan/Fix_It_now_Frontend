import { getMyBookings } from "../../_actions/getMyBookings";
import { BookingsList } from "../../_components/bookings-list";

export default async function UserBookingsPage() {
  const bookings = await getMyBookings();

  return <BookingsList bookings={bookings} />;
}
