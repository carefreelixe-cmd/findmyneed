import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, IndianRupee, Users } from "lucide-react";
import { api, money } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard({ Protected }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  useEffect(() => {
    api
      .get("/bookings")
      .then((response) => setBookings(response.data.bookings))
      .catch(() => {});
  }, []);
  async function update(id, status) {
    await api.patch(`/bookings/${id}/status`, { status });
    setBookings((items) => items.map((item) => (item._id === id ? { ...item, status } : item)));
  }
  const revenue = bookings
    .filter((item) => item.paymentStatus === "paid")
    .reduce((total, item) => total + item.amount, 0);
  return (
    <Protected role="admin">
      <main className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <p className="text-sm font-bold text-leaf">Administrator · {user?.name}</p>
        <h1 className="mt-2 font-display text-6xl">Marketplace control centre</h1>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              Clock3,
              "Pending requests",
              bookings.filter((item) => item.status === "pending").length,
            ],
            [
              CheckCircle2,
              "Completed jobs",
              bookings.filter((item) => item.status === "completed").length,
            ],
            [IndianRupee, "Paid volume", money(revenue)],
            [Users, "Active roles", "3 panels"],
          ].map(([Icon, label, value]) => (
            <article key={label} className="rounded-2xl bg-white p-6">
              <Icon className="text-coral" />
              <p className="mt-5 text-sm text-ink/50">{label}</p>
              <b className="mt-2 block text-3xl">{value}</b>
            </article>
          ))}
        </div>
        <section className="mt-9 rounded-3xl bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-coral">Operations</p>
              <h2 className="mt-1 text-2xl font-extrabold">All bookings</h2>
            </div>
            <span className="rounded-full bg-cream px-4 py-2 text-sm font-bold">
              {bookings.length} total
            </span>
          </div>
          <div className="mt-6 space-y-3">
            {bookings.length ? (
              bookings.map((booking) => (
                <article
                  key={booking._id}
                  className="grid gap-4 rounded-2xl border border-ink/10 p-5 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-leaf">
                      {booking.status.replace("_", " ")}
                    </p>
                    <h3 className="mt-1 text-lg font-extrabold">{booking.serviceName}</h3>
                    <p className="mt-1 text-sm text-ink/45">
                      {booking.date} · {booking.time} · {booking.address}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <b className="mr-2">{money(booking.amount)}</b>
                    {["confirmed", "in_progress", "completed", "cancelled"].map((status) => (
                      <button
                        key={status}
                        onClick={() => update(booking._id, status)}
                        className="rounded-lg bg-cream px-3 py-2 text-xs font-bold hover:bg-lime"
                      >
                        {status.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <p className="py-10 text-center text-ink/45">Bookings will appear here.</p>
            )}
          </div>
        </section>
      </main>
    </Protected>
  );
}
