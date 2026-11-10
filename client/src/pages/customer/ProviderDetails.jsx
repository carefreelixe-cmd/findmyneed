import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarCheck,
  FaCheck,
  FaClock,
  FaLocationDot,
  FaShieldHalved,
  FaStar,
} from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import { professionals } from "../../data/marketplace";

const fallback = {
  id: "trusted-pro",
  name: "Trusted Local Professional",
  category: "Multi-service specialist",
  city: "Bengaluru",
  area: "Central",
  rating: 4.8,
  reviews: 214,
  price: 499,
  initials: "TP",
  tags: ["Verified", "Service warranty"],
};
const offerings = [
  [
    "Inspection & diagnosis",
    "A professional visit, issue assessment and clear estimate.",
    399,
    "45–60 min",
  ],
  [
    "Standard service",
    "Complete routine service using professional tools and materials.",
    799,
    "60–90 min",
  ],
  [
    "Repair visit",
    "Diagnosis plus common repair labour. Parts quoted separately.",
    1199,
    "1–2 hours",
  ],
];

export default function ProviderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const provider = professionals.find((item) => item.id === id) || fallback;
  const [selected, setSelected] = useState(offerings[1]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");

  function book(event) {
    event.preventDefault();
    if (!user) return navigate("/login");
    navigate("/customer", { state: { bookingCreated: true } });
  }

  return (
    <div className="min-h-screen bg-[#f5f4ed] text-[#17231c]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link to="/search" className="flex items-center gap-2 font-black text-[#246c49]">
            <FaArrowLeft /> Back to results
          </Link>
          <Link to="/" className="font-black">
            findmy<span className="text-[#e85d3f]">need</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <section className="grid gap-7 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <article className="rounded-[36px] bg-[#173c2b] p-8 text-white md:p-10">
              <div className="flex flex-col gap-7 sm:flex-row sm:items-center">
                <span className="grid h-28 w-28 shrink-0 place-items-center rounded-[28px] bg-[#d9f99d] text-4xl font-black text-[#17231c]">
                  {provider.initials}
                </span>
                <div>
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#d9f99d]">
                    <FaShieldHalved /> Identity and business verified
                  </p>
                  <h1 className="mt-3 text-5xl font-black tracking-[-.04em] text-white">
                    {provider.name}
                  </h1>
                  <p className="mt-3 flex items-center gap-2 text-white/55">
                    <FaLocationDot /> {provider.area}, {provider.city}
                  </p>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                <Metric value={`${provider.rating} ★`} label={`${provider.reviews} reviews`} />
                <Metric value="1,240+" label="jobs completed" />
                <Metric value="4 years" label="on FindMyNeed" />
              </div>
            </article>

            <article className="rounded-[32px] bg-white p-7">
              <p className="text-xs font-black uppercase tracking-wider text-[#e85d3f]">
                About the business
              </p>
              <h2 className="mt-2 text-3xl font-black">
                Reliable specialists for your local service needs
              </h2>
              <p className="mt-4 max-w-3xl leading-8 text-black/55">
                An experienced {provider.category.toLowerCase()} team serving {provider.city}. Every
                booking includes an upfront estimate, progress updates, secure payment and
                FindMyNeed support.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {provider.tags
                  .concat([
                    "Upfront pricing",
                    "Background checked",
                    "Service support",
                    "Digital invoice",
                  ])
                  .map((item) => (
                    <p
                      key={item}
                      className="flex items-center gap-3 rounded-xl bg-[#f5f4ed] p-4 text-sm font-bold"
                    >
                      <FaCheck className="text-[#246c49]" /> {item}
                    </p>
                  ))}
              </div>
            </article>

            <article className="rounded-[32px] bg-white p-7">
              <p className="text-xs font-black uppercase tracking-wider text-[#246c49]">
                Choose a service
              </p>
              <h2 className="mt-2 text-3xl font-black">Services and transparent pricing</h2>
              <div className="mt-6 space-y-3">
                {offerings.map((item) => (
                  <button
                    key={item[0]}
                    onClick={() => setSelected(item)}
                    className={`grid w-full gap-4 rounded-2xl border p-5 text-left sm:grid-cols-[1fr_auto] ${selected[0] === item[0] ? "border-[#246c49] bg-[#eef7ea]" : "border-black/10"}`}
                  >
                    <div>
                      <b>{item[0]}</b>
                      <p className="mt-2 text-sm text-black/50">{item[1]}</p>
                      <p className="mt-2 flex items-center gap-2 text-xs text-black/40">
                        <FaClock /> {item[3]}
                      </p>
                    </div>
                    <b className="text-lg">₹{item[2]}</b>
                  </button>
                ))}
              </div>
            </article>

            <article className="rounded-[32px] bg-[#d9f99d] p-7">
              <p className="text-xs font-black uppercase tracking-wider text-[#246c49]">
                Recent customer reviews
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  ["Ananya R.", "Professional, punctual and explained every step clearly."],
                  ["Rohan M.", "Good communication, clean work and no surprise charges."],
                ].map(([name, text]) => (
                  <blockquote key={name} className="rounded-2xl bg-white p-5">
                    <div className="text-[#e85d3f]">★★★★★</div>
                    <p className="mt-3 font-bold leading-7">“{text}”</p>
                    <footer className="mt-4 text-xs text-black/45">
                      {name} · Verified booking
                    </footer>
                  </blockquote>
                ))}
              </div>
            </article>
          </div>

          <form
            onSubmit={book}
            className="h-fit rounded-[32px] bg-white p-7 shadow-xl lg:sticky lg:top-6"
          >
            <p className="text-xs font-black uppercase tracking-wider text-[#e85d3f]">
              Book this professional
            </p>
            <h2 className="mt-2 text-2xl font-black">{selected[0]}</h2>
            <div className="mt-6 rounded-2xl bg-[#f5f4ed] p-5">
              <p className="text-xs text-black/40">Service price</p>
              <p className="mt-1 text-4xl font-black">₹{selected[2]}</p>
              <p className="mt-2 text-xs text-black/40">
                Final parts cost, if any, is approved before work.
              </p>
            </div>
            <label className="mt-5 block text-sm font-black">
              Preferred date
              <input
                required
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-2 w-full rounded-xl border border-black/10 p-3"
              />
            </label>
            <label className="mt-4 block text-sm font-black">
              Preferred time
              <select
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="mt-2 w-full rounded-xl border border-black/10 p-3"
              >
                <option>10:00</option>
                <option>12:00</option>
                <option>14:00</option>
                <option>16:00</option>
              </select>
            </label>
            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e85d3f] p-4 font-black text-white">
              <FaCalendarCheck /> Continue to booking
            </button>
            <p className="mt-4 text-center text-xs text-black/40">
              Secure checkout · Booking protection included
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}

function Metric({ value, label }) {
  return (
    <div>
      <b className="text-xl text-white">{value}</b>
      <p className="mt-1 text-xs text-white/40">{label}</p>
    </div>
  );
}
