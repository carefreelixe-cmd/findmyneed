import { useMemo, useState } from "react";
import { ArrowLeft, BadgeCheck, MapPin, Search, ShieldCheck, Star } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { locations, professionals } from "../data/marketplace";

const categoryIds = {
  Electrician: "electrician",
  "AC service & repair": "ac",
  "Car repair": "car",
  "Home cleaning": "cleaning",
  Plumber: "plumber",
};

export function ProfessionalsSearch() {
  const params = new URLSearchParams(useLocation().search);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(params.get("location") || "All locations");
  const [rating, setRating] = useState("0");
  const requestedService = params.get("service") || "";
  const results = useMemo(
    () =>
      professionals.filter((item) => {
        const matchesQuery = `${item.name} ${item.category} ${item.area}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesLocation = location === "All locations" || item.city === location;
        const matchesRating = item.rating >= Number(rating);
        const matchesService = !requestedService || categoryIds[item.category] === requestedService;
        return matchesQuery && matchesLocation && matchesRating && matchesService;
      }),
    [location, query, rating, requestedService],
  );

  return (
    <main className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[.2em] text-coral">
        Compare local experts
      </p>
      <h1 className="mt-3 font-display text-6xl">Professionals you can trust</h1>
      <div className="mt-9 grid gap-3 rounded-3xl bg-white p-4 shadow-soft md:grid-cols-[1fr_220px_180px]">
        <label className="flex items-center gap-3 rounded-2xl bg-cream px-4">
          <Search size={18} className="text-leaf" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, service or area"
            className="w-full bg-transparent py-4 outline-none"
          />
        </label>
        <select
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          className="rounded-2xl bg-cream px-4 py-4 font-bold outline-none"
        >
          <option>All locations</option>
          {locations.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          className="rounded-2xl bg-cream px-4 py-4 font-bold outline-none"
        >
          <option value="0">Any rating</option>
          <option value="4.5">4.5+ stars</option>
          <option value="4.8">4.8+ stars</option>
        </select>
      </div>
      <p className="mt-7 text-sm font-bold text-ink/45">
        {results.length} verified professionals found
      </p>
      <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {results.map((item) => (
          <ProfessionalCard key={item.id} item={item} />
        ))}
      </div>
      {!results.length && (
        <div className="mt-8 rounded-3xl bg-white p-10 text-center">
          <h2 className="text-2xl font-extrabold">No exact matches yet</h2>
          <p className="mt-2 text-ink/50">Try another service, location or rating.</p>
        </div>
      )}
    </main>
  );
}

function ProfessionalCard({ item }) {
  return (
    <Link
      to={`/professionals/${item.id}`}
      className="rounded-3xl border border-ink/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="flex items-start justify-between">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-lime text-xl font-black">
          {item.initials}
        </span>
        <span className="rounded-full bg-cream px-3 py-2 text-xs font-bold">
          ★ {item.rating} ({item.reviews})
        </span>
      </div>
      <h2 className="mt-6 text-xl font-extrabold">{item.name}</h2>
      <p className="mt-2 text-sm text-ink/50">{item.category}</p>
      <p className="mt-3 flex items-center gap-2 text-sm">
        <MapPin size={15} className="text-leaf" /> {item.area}, {item.city}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.badges.map((badge) => (
          <span key={badge} className="rounded-full bg-cream px-3 py-1 text-xs font-bold">
            {badge}
          </span>
        ))}
      </div>
      <div className="mt-6 flex justify-between border-t border-ink/10 pt-5">
        <b>From ₹{item.price}</b>
        <span className="font-bold text-leaf">View profile →</span>
      </div>
    </Link>
  );
}

export function ProfessionalProfile() {
  const { id } = useParams();
  const item = professionals.find((professional) => professional.id === id);
  if (!item)
    return (
      <main className="mx-auto max-w-4xl px-5 py-20 text-center">
        <h1 className="font-display text-5xl">Professional not found</h1>
        <Link to="/professionals" className="mt-6 inline-block font-bold text-leaf">
          Browse professionals
        </Link>
      </main>
    );
  const serviceId = categoryIds[item.category] || "electrician";
  return (
    <main className="mx-auto max-w-6xl px-5 py-14 lg:px-8">
      <Link
        to="/professionals"
        className="inline-flex items-center gap-2 text-sm font-bold text-leaf"
      >
        <ArrowLeft size={16} /> Back to results
      </Link>
      <section className="mt-7 grid gap-7 lg:grid-cols-[1fr_340px]">
        <div className="rounded-[2rem] bg-white p-8 shadow-soft">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <span className="grid h-24 w-24 place-items-center rounded-3xl bg-lime text-3xl font-black">
              {item.initials}
            </span>
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-leaf">
                <BadgeCheck size={17} /> Verified professional
              </div>
              <h1 className="mt-2 font-display text-5xl">{item.name}</h1>
              <p className="mt-2 flex items-center gap-2 text-ink/50">
                <MapPin size={16} /> {item.area}, {item.city}
              </p>
            </div>
          </div>
          <div className="mt-8 grid gap-4 border-y border-ink/10 py-6 sm:grid-cols-3">
            <div>
              <b className="flex items-center gap-2 text-xl">
                <Star size={18} className="fill-coral text-coral" /> {item.rating}
              </b>
              <p className="mt-1 text-xs text-ink/45">{item.reviews} reviews</p>
            </div>
            <div>
              <b className="text-xl">{item.jobs}+</b>
              <p className="mt-1 text-xs text-ink/45">jobs completed</p>
            </div>
            <div>
              <b className="text-xl">4 years</b>
              <p className="mt-1 text-xs text-ink/45">on FindMyNeed</p>
            </div>
          </div>
          <h2 className="mt-8 text-2xl font-extrabold">About this professional</h2>
          <p className="mt-3 leading-8 text-ink/60">
            Experienced {item.category.toLowerCase()} specialists serving {item.city}. Every booking
            includes clear estimates, progress updates and FindMyNeed service protection.
          </p>
          <h2 className="mt-8 text-2xl font-extrabold">Why customers choose them</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {item.badges.concat(["Upfront estimates", "Service support"]).map((badge) => (
              <p
                key={badge}
                className="flex items-center gap-2 rounded-xl bg-cream p-4 text-sm font-bold"
              >
                <ShieldCheck size={17} className="text-leaf" /> {badge}
              </p>
            ))}
          </div>
        </div>
        <aside className="h-fit rounded-[2rem] bg-ink p-7 text-white lg:sticky lg:top-24">
          <p className="text-xs font-black uppercase tracking-wider text-lime">
            Book with confidence
          </p>
          <p className="mt-4 text-sm text-white/55">Services start from</p>
          <p className="mt-1 text-4xl font-black">₹{item.price}</p>
          <Link
            to={`/find/${serviceId}`}
            className="mt-7 block rounded-xl bg-coral p-4 text-center font-extrabold"
          >
            Choose service & book
          </Link>
          <p className="mt-4 text-center text-xs text-white/40">No hidden platform fees</p>
        </aside>
      </section>
    </main>
  );
}
