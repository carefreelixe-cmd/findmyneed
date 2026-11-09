import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { locations, professionals, testimonials } from "../data/marketplace";

export default function MarketplaceHome({ services }) {
  const navigate = useNavigate();
  const [service, setService] = useState("");
  const [location, setLocation] = useState("Bengaluru");
  const nearby = useMemo(
    () => professionals.filter((item) => item.city === location).slice(0, 3),
    [location],
  );
  const displayed = nearby.length ? nearby : professionals.slice(0, 3);

  function search(event) {
    event.preventDefault();
    navigate(
      `/professionals?service=${encodeURIComponent(service)}&location=${encodeURIComponent(location)}`,
    );
  }

  return (
    <main>
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute -right-24 top-16 h-96 w-96 rounded-full bg-leaf/30 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-coral/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="max-w-4xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[.2em] text-lime">
              <BadgeCheck size={15} /> Verified help, wherever you need it
            </p>
            <h1 className="mt-8 font-display text-6xl leading-[.9] sm:text-7xl lg:text-8xl">
              Home, car and everyday services <em className="text-lime">made easy.</em>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
              Compare trusted local professionals, choose a convenient time and pay safely—all in
              one place.
            </p>
          </div>

          <form
            onSubmit={search}
            className="mt-12 grid gap-3 rounded-[2rem] bg-white p-4 text-ink shadow-2xl md:grid-cols-[1fr_1fr_auto] md:p-5"
          >
            <label className="rounded-2xl bg-cream px-5 py-3 text-xs font-black uppercase tracking-wider text-ink/45">
              What do you need?
              <select
                required
                value={service}
                onChange={(event) => setService(event.target.value)}
                className="mt-1 block w-full bg-transparent text-base font-bold normal-case text-ink outline-none"
              >
                <option value="">Choose a service</option>
                {services.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="rounded-2xl bg-cream px-5 py-3 text-xs font-black uppercase tracking-wider text-ink/45">
              Your location
              <select
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="mt-1 block w-full bg-transparent text-base font-bold normal-case text-ink outline-none"
              >
                {locations.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <button className="flex items-center justify-center gap-2 rounded-2xl bg-coral px-8 py-5 font-extrabold text-white">
              <Search size={19} /> Find help
            </button>
          </form>
          <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-sm font-bold text-white/60">
            <span className="flex items-center gap-2">
              <ShieldCheck size={17} className="text-lime" /> Identity checked
            </span>
            <span className="flex items-center gap-2">
              <Star size={17} className="text-lime" /> Customer reviewed
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-lime" /> Service protected
            </span>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 text-center sm:grid-cols-3 lg:px-8">
          {[
            ["25,000+", "completed jobs"],
            ["4.8/5", "average customer rating"],
            ["1,200+", "verified professionals"],
          ].map(([number, label]) => (
            <div key={label}>
              <b className="text-2xl">{number}</b>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-ink/45">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-coral">
              Everything in one place
            </p>
            <h2 className="mt-3 font-display text-5xl sm:text-6xl">What can we help with?</h2>
          </div>
          <Link to="/services" className="flex items-center gap-2 font-bold text-leaf">
            Browse every service <ArrowRight size={18} />
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((item) => (
            <Link
              key={item._id}
              to={`/find/${item._id}`}
              state={{ service: item }}
              className="group rounded-3xl border border-ink/10 bg-white p-6 transition hover:-translate-y-1 hover:border-leaf hover:shadow-soft"
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-cream text-3xl">
                {item.icon || "🔧"}
              </span>
              <p className="mt-6 text-xs font-black uppercase tracking-wider text-leaf">
                {item.category}
              </p>
              <h3 className="mt-2 text-xl font-extrabold">{item.name}</h3>
              <p className="mt-2 min-h-10 text-sm leading-6 text-ink/50">{item.description}</p>
              <span className="mt-6 flex items-center gap-2 text-sm font-bold">
                Book from ₹{item.basePrice} <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <div className="rounded-[2.5rem] bg-leaf p-9 text-white sm:p-12">
            <p className="text-xs font-black uppercase tracking-[.2em] text-lime">What we are</p>
            <h2 className="mt-4 font-display text-5xl">A better way to book local expertise.</h2>
            <p className="mt-6 text-lg leading-8 text-white/70">
              FindMyNeed brings discovery, comparison, scheduling, secure payment and support into
              one transparent experience.
            </p>
            <Link
              to="/how-it-works"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 font-extrabold text-ink"
            >
              How FindMyNeed works <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [
                ShieldCheck,
                "Verified professionals",
                "Identity, experience and service details are checked before a provider goes live.",
              ],
              [
                Clock3,
                "Convenient scheduling",
                "Choose a date and time that works without waiting on phone calls.",
              ],
              [
                Users,
                "Real local choice",
                "Compare independent professionals and established service businesses.",
              ],
              [
                CheckCircle2,
                "Protected bookings",
                "Track every stage and pay through a secure, recorded checkout.",
              ],
            ].map(([Icon, title, copy]) => (
              <article key={title} className="rounded-3xl border border-ink/10 p-6">
                <Icon className="text-coral" />
                <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/50">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[.2em] text-leaf">
            Simple from start to finish
          </p>
          <h2 className="mt-3 font-display text-5xl">Book in three clear steps</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            [
              "01",
              "Describe the job",
              "Choose a category and share the specific item, issue and location.",
            ],
            [
              "02",
              "Choose your professional",
              "Compare ratings, prices, experience and availability.",
            ],
            [
              "03",
              "Book and pay safely",
              "Confirm the slot, make payment and track progress from your dashboard.",
            ],
          ].map(([number, title, copy]) => (
            <article key={number} className="rounded-3xl bg-ink p-8 text-white">
              <b className="text-4xl text-lime">{number}</b>
              <h3 className="mt-10 text-2xl font-extrabold">{title}</h3>
              <p className="mt-4 leading-7 text-white/55">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[.2em] text-coral">
                Trusted near you
              </p>
              <h2 className="mt-3 font-display text-5xl">Top professionals in {location}</h2>
            </div>
            <label className="flex items-center gap-3 rounded-full border border-ink/10 bg-cream px-5 py-3 text-sm font-bold">
              <MapPin size={17} className="text-leaf" />
              <select
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="bg-transparent outline-none"
              >
                {locations.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {displayed.map((item) => (
              <Link
                to={`/professionals/${item.id}`}
                key={item.id}
                className="rounded-3xl border border-ink/10 p-6 transition hover:shadow-soft"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-16 w-16 place-items-center rounded-2xl bg-lime text-xl font-black">
                    {item.initials}
                  </span>
                  <span className="rounded-full bg-cream px-3 py-2 text-xs font-bold">
                    ★ {item.rating} ({item.reviews})
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-extrabold">{item.name}</h3>
                <p className="mt-2 text-sm text-ink/50">
                  {item.category} · {item.area}
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
            ))}
          </div>
          <Link
            to={`/professionals?location=${encodeURIComponent(location)}`}
            className="mx-auto mt-9 flex w-fit items-center gap-2 rounded-full border border-ink/15 px-6 py-4 font-extrabold"
          >
            See all professionals <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="bg-lime py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="text-xs font-black uppercase tracking-[.2em] text-leaf">Customer stories</p>
          <h2 className="mt-3 max-w-2xl font-display text-5xl">Helpful people. Properly done.</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.name} className="rounded-3xl bg-white p-7">
                <div className="text-coral">★★★★★</div>
                <blockquote className="mt-5 text-lg font-bold leading-8">“{item.quote}”</blockquote>
                <p className="mt-7 text-sm font-extrabold">{item.name}</p>
                <p className="mt-1 text-xs text-ink/45">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 rounded-[2.5rem] bg-coral p-9 text-white sm:p-12 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-white/60">
              Offer your skills
            </p>
            <h2 className="mt-3 font-display text-5xl">Grow your service business with us.</h2>
            <p className="mt-4 max-w-2xl text-white/70">
              Receive qualified requests, manage work and payments, and build your reputation from
              one provider dashboard.
            </p>
          </div>
          <Link
            to="/signup"
            className="shrink-0 rounded-full bg-white px-7 py-4 font-extrabold text-ink"
          >
            Join as a professional
          </Link>
        </div>
      </section>
    </main>
  );
}
