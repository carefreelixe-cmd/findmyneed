import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaBars,
  FaBriefcase,
  FaCheck,
  FaChevronDown,
  FaClock,
  FaLocationDot,
  FaMagnifyingGlass,
  FaShieldHalved,
  FaStar,
  FaUserCheck,
  FaXmark,
} from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import {
  cities as fallbackCities,
  professionals as fallbackProfessionals,
  reviews as fallbackReviews,
  services as fallbackServices,
} from "../data/marketplace";
import { api } from "../lib/api";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [service, setService] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [content, setContent] = useState(null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/api/marketplace/home"), api.get("/api/marketplace/locations")])
      .then(([homeResponse, locationResponse]) => {
        if (!active) return;
        setContent(homeResponse.data);
        setLocations(locationResponse.data);
      })
      .catch((error) => console.error("Unable to load marketplace content:", error));
    return () => {
      active = false;
    };
  }, []);

  const services = content?.categories?.length
    ? content.categories.map((item) => ({
        ...item,
        id: item.slug,
        category: "Local service",
        price: 499,
        icon:
          fallbackServices.find((serviceItem) =>
            item.name.toLowerCase().includes(serviceItem.name.split(" ")[0].toLowerCase()),
          )?.icon || FaBriefcase,
      }))
    : fallbackServices;
  const cities = locations.length ? locations.map((item) => item.city) : fallbackCities;
  const professionals = content?.featuredProviders?.length
    ? content.featuredProviders.map((item) => ({
        id: item.id,
        name: item.business_name,
        category: "Verified professional",
        city: item.city,
        area: item.suburb || item.city,
        rating: item.rating || "New",
        reviews: item.total_reviews || 0,
        price: 499,
        initials: item.business_name
          .split(" ")
          .slice(0, 2)
          .map((word) => word[0])
          .join("")
          .toUpperCase(),
        tags: ["Verified", "Local professional"],
      }))
    : fallbackProfessionals;
  const reviews = content?.reviews?.length
    ? content.reviews.map((item) => [
        `${item.first_name} ${item.last_name?.[0] || ""}.`,
        item.business_name,
        item.comment,
      ])
    : fallbackReviews;
  const stats = [
    [content?.stats?.bookings?.toLocaleString?.() || "25,000+", "jobs completed"],
    ["4.8 / 5", "average rating"],
    [content?.stats?.providers?.toLocaleString?.() || "1,200+", "verified professionals"],
  ];

  function submit(event) {
    event.preventDefault();
    navigate(`/search?service=${encodeURIComponent(service)}&city=${encodeURIComponent(city)}`);
  }

  return (
    <div className="min-h-screen bg-[#fbfaf5] text-[#17231c]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fbfaf5]/95 backdrop-blur">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3 text-xl font-black">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#173c2b] text-[#d9f99d]">
              <FaBriefcase />
            </span>
            findmy<span className="-ml-3 text-[#e85d3f]">need</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-bold lg:flex">
            <div className="group relative py-6">
              <Link to="/search" className="flex items-center gap-2">
                Services <FaChevronDown className="text-[10px]" />
              </Link>
              <div className="invisible absolute left-1/2 top-full w-[720px] -translate-x-1/2 rounded-3xl border border-black/10 bg-white p-6 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
                <div className="grid grid-cols-3 gap-2">
                  {services.map((item) => (
                    <Link
                      key={item.id}
                      to={`/search?service=${item.id}`}
                      className="flex items-center gap-3 rounded-2xl p-3 hover:bg-[#f3f2e9]"
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef7ea] text-[#246c49]">
                        <item.icon />
                      </span>
                      <span>
                        <b className="block">{item.name}</b>
                        <small className="text-black/45">From ₹{item.price}</small>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link to="/search">Professionals</Link>
            <a href="#how">How it works</a>
            <a href="#trust">Why us</a>
            <Link to="/register">Become a professional</Link>
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            {user ? (
              <Link
                to={`/${user.role}`}
                className="rounded-full bg-[#173c2b] px-5 py-3 text-sm font-bold text-white"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 text-sm font-bold">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-[#173c2b] px-5 py-3 text-sm font-bold text-white"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
          <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FaXmark /> : <FaBars />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="flex flex-col gap-4 border-t border-black/10 bg-white p-5 font-bold lg:hidden">
            <Link to="/search">All services</Link>
            {services.slice(0, 7).map((item) => (
              <Link key={item.id} to={`/search?service=${item.id}`}>
                {item.name}
              </Link>
            ))}
            <Link to="/login">Log in</Link>
            <Link to="/register">Create account</Link>
          </nav>
        )}
      </header>

      <main>
        <section className="relative min-h-[720px] overflow-hidden bg-[#173c2b] text-white">
          <img
            src="/images/marketplace/hero-local-services.png"
            alt="A homeowner welcoming a trusted service professional"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#10291e] via-[#10291e]/90 to-[#10291e]/10" />
          <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-[#d9f99d]">
                <FaShieldHalved /> Verified local help
              </span>
              <h1 className="mt-8 text-6xl font-black leading-[.92] tracking-[-.055em] text-white sm:text-7xl lg:text-[88px]">
                Everyday services,{" "}
                <em className="font-display font-semibold text-[#d9f99d]">made easy.</em>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70">
                Compare verified professionals, choose a convenient time and pay safely—from home
                repairs and car care to personal services.
              </p>
            </div>
            <form
              onSubmit={submit}
              className="mt-12 grid max-w-4xl gap-3 rounded-[28px] bg-white p-4 text-[#17231c] shadow-2xl md:grid-cols-[1fr_1fr_auto]"
            >
              <label className="rounded-2xl bg-[#f3f2e9] px-5 py-3 text-xs font-black uppercase tracking-wider text-black/45">
                What do you need?
                <select
                  required
                  value={service}
                  onChange={(event) => setService(event.target.value)}
                  className="mt-1 block w-full bg-transparent text-base font-bold normal-case text-[#17231c] outline-none"
                >
                  <option value="">Choose a service</option>
                  {services.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="rounded-2xl bg-[#f3f2e9] px-5 py-3 text-xs font-black uppercase tracking-wider text-black/45">
                Your location
                <select
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="mt-1 block w-full bg-transparent text-base font-bold normal-case text-[#17231c] outline-none"
                >
                  {cities.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <button className="flex items-center justify-center gap-2 rounded-2xl bg-[#e85d3f] px-8 py-5 font-black text-white">
                <FaMagnifyingGlass /> Find help
              </button>
            </form>
            <div className="mt-6 flex flex-wrap gap-6 text-sm font-bold text-white/65">
              <span className="flex items-center gap-2">
                <FaCheck className="text-[#d9f99d]" /> Identity checked
              </span>
              <span className="flex items-center gap-2">
                <FaStar className="text-[#d9f99d]" /> Customer reviewed
              </span>
              <span className="flex items-center gap-2">
                <FaCheck className="text-[#d9f99d]" /> Booking protected
              </span>
            </div>
          </div>
        </section>

        <section className="border-b border-black/10 bg-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 py-7 text-center sm:grid-cols-3 lg:px-8">
            {stats.map(([value, label]) => (
              <div key={label}>
                <b className="text-2xl">{value}</b>
                <p className="mt-1 text-xs font-black uppercase tracking-wider text-black/45">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[.2em] text-[#e85d3f]">
                Everything in one place
              </p>
              <h2 className="mt-3 text-5xl font-black tracking-[-.04em] sm:text-6xl">
                What can we help with?
              </h2>
            </div>
            <Link to="/search" className="flex items-center gap-2 font-black text-[#246c49]">
              Browse all services <FaArrowRight />
            </Link>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((item) => (
              <Link
                to={`/search?service=${item.id}`}
                key={item.id}
                className="group rounded-[28px] border border-black/10 bg-white p-6 hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eef7ea] text-2xl text-[#246c49]">
                  <item.icon />
                </span>
                <p className="mt-6 text-xs font-black uppercase tracking-wider text-[#246c49]">
                  {item.category}
                </p>
                <h3 className="mt-2 text-xl font-black">{item.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-black/50">{item.description}</p>
                <p className="mt-5 flex items-center justify-between text-sm font-black">
                  <span>From ₹{item.price}</span>
                  <FaArrowRight />
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section id="trust" className="bg-white py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-2 lg:px-8">
            <div className="overflow-hidden rounded-[40px]">
              <img
                src="/images/marketplace/trusted-professionals.png"
                alt="A team of trusted local professionals"
                className="h-full min-h-[500px] w-full object-cover"
              />
            </div>
            <div className="self-center lg:pl-8">
              <p className="text-xs font-black uppercase tracking-[.2em] text-[#e85d3f]">
                What we are
              </p>
              <h2 className="mt-4 text-5xl font-black tracking-[-.04em] sm:text-6xl">
                A better way to book local expertise.
              </h2>
              <p className="mt-6 text-lg leading-8 text-black/55">
                FindMyNeed brings discovery, comparison, scheduling, secure payment and support into
                one transparent marketplace.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  [
                    FaUserCheck,
                    "Verified people",
                    "Identity, skills and business details are checked.",
                  ],
                  [FaClock, "Convenient timing", "Choose available dates without phone calls."],
                  [FaLocationDot, "Local choice", "Compare professionals serving your area."],
                  [FaShieldHalved, "Protected work", "Track progress and keep payment recorded."],
                ].map(([Icon, title, copy]) => (
                  <article key={title} className="rounded-2xl border border-black/10 p-5">
                    {Icon({ className: "text-xl text-[#e85d3f]" })}
                    <h3 className="mt-4 font-black">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-black/50">{copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#246c49]">
              Simple from start to finish
            </p>
            <h2 className="mt-3 text-5xl font-black tracking-[-.04em]">
              Book in three clear steps
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              [
                "01",
                "Describe the job",
                "Select the category and share your item, issue and location.",
              ],
              [
                "02",
                "Choose your professional",
                "Compare ratings, experience, prices and availability.",
              ],
              [
                "03",
                "Book and pay safely",
                "Confirm the slot and track every update in your dashboard.",
              ],
            ].map(([number, title, copy]) => (
              <article key={number} className="rounded-[32px] bg-[#173c2b] p-8 text-white">
                <b className="text-4xl text-[#d9f99d]">{number}</b>
                <h3 className="mt-10 text-2xl font-black text-white">{title}</h3>
                <p className="mt-4 leading-7 text-white/55">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex justify-between gap-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[.2em] text-[#e85d3f]">
                  Trusted near you
                </p>
                <h2 className="mt-3 text-5xl font-black tracking-[-.04em]">
                  Popular professionals
                </h2>
              </div>
              <Link to="/search" className="hidden font-black text-[#246c49] sm:block">
                See everyone →
              </Link>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {professionals.map((item) => (
                <Link
                  to={`/providers/${item.id}`}
                  key={item.id}
                  className="rounded-[28px] border border-black/10 p-6 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#d9f99d] text-xl font-black">
                      {item.initials}
                    </span>
                    <span className="rounded-full bg-[#f3f2e9] px-3 py-2 text-xs font-black">
                      ★ {item.rating}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-black">{item.name}</h3>
                  <p className="mt-2 text-sm text-black/50">
                    {item.category} · {item.area}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#f3f2e9] px-3 py-1 text-xs font-bold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-between border-t border-black/10 pt-5">
                    <b>From ₹{item.price}</b>
                    <span className="font-black text-[#246c49]">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#d9f99d] py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#246c49]">
              Customer stories
            </p>
            <h2 className="mt-3 max-w-2xl text-5xl font-black tracking-[-.04em]">
              Helpful people. Properly done.
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {reviews.map(([name, detail, quote]) => (
                <article key={name} className="rounded-[28px] bg-white p-7">
                  <div className="text-[#e85d3f]">★★★★★</div>
                  <blockquote className="mt-5 text-lg font-bold leading-8">“{quote}”</blockquote>
                  <p className="mt-7 text-sm font-black">{name}</p>
                  <p className="mt-1 text-xs text-black/45">{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="grid overflow-hidden rounded-[40px] bg-[#173c2b] text-white lg:grid-cols-2">
            <div className="p-10 lg:p-14">
              <p className="text-xs font-black uppercase tracking-[.2em] text-[#d9f99d]">
                Offer your skills
              </p>
              <h2 className="mt-4 text-5xl font-black tracking-[-.04em] text-white">
                Grow your service business with us.
              </h2>
              <p className="mt-5 leading-7 text-white/60">
                Receive qualified requests, manage work and payments, and build your reputation from
                one provider dashboard.
              </p>
              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#e85d3f] px-7 py-4 font-black text-white"
              >
                Join as a professional <FaArrowRight />
              </Link>
            </div>
            <img
              src="/images/marketplace/ac-service-banner.png"
              alt="Professional technician providing an in-home service"
              className="h-full min-h-[360px] w-full object-cover"
            />
          </div>
        </section>
      </main>

      <footer className="bg-[#10291e] py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div>
            <div className="text-xl font-black">
              findmy<span className="text-[#d9f99d]">need</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/50">
              Dependable local help, booked with confidence.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm text-white/60">
            <b className="mb-1 text-white">Customers</b>
            <Link to="/search">Explore services</Link>
            <a href="#how">How it works</a>
            <Link to="/login">Log in</Link>
          </div>
          <div className="flex flex-col gap-3 text-sm text-white/60">
            <b className="mb-1 text-white">Professionals</b>
            <Link to="/register">Join FindMyNeed</Link>
            <Link to="/login">Provider login</Link>
            <Link to="/search">Browse professionals</Link>
          </div>
          <div className="text-sm text-white/45 lg:text-right">
            © 2026 FindMyNeed
            <br />
            Bengaluru · Delhi · Mumbai
            <br />
            <div className="mt-4">Privacy · Terms · Help</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
