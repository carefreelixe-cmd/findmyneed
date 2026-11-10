import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheck,
  FaFilter,
  FaLocationDot,
  FaMagnifyingGlass,
  FaSliders,
  FaStar,
} from "react-icons/fa6";
import { cities, professionals, services } from "../../data/marketplace";

const extendedProviders = [
  ...professionals,
  {
    id: "spark-pro",
    name: "SparkPro Electricals",
    category: "Electrician",
    city: "Delhi",
    area: "Saket",
    rating: 4.9,
    reviews: 289,
    price: 349,
    initials: "SP",
    tags: ["Licensed", "Emergency"],
  },
  {
    id: "pipe-doctor",
    name: "The Pipe Doctor",
    category: "Plumber",
    city: "Pune",
    area: "Baner",
    rating: 4.9,
    reviews: 197,
    price: 349,
    initials: "PD",
    tags: ["Leak specialist", "Same-day"],
  },
  {
    id: "colour-craft",
    name: "ColourCraft Painters",
    category: "Painter",
    city: "Chennai",
    area: "Adyar",
    rating: 4.7,
    reviews: 183,
    price: 799,
    initials: "CP",
    tags: ["Insured", "Free estimate"],
  },
  {
    id: "tech-rescue",
    name: "TechRescue Computers",
    category: "Computer repair",
    city: "Bengaluru",
    area: "Koramangala",
    rating: 4.8,
    reviews: 146,
    price: 499,
    initials: "TR",
    tags: ["Doorstep", "Data safe"],
  },
];

const criteria = {
  car: [
    ["Car make", ["Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Toyota", "Honda", "Kia"]],
    ["Manufacturing year", ["2026", "2025", "2024", "2023", "2022", "2021", "2020 or older"]],
  ],
  ac: [
    ["AC type", ["Split AC", "Window AC", "Cassette AC", "Central AC"]],
    ["Capacity", ["1 ton", "1.2 ton", "1.5 ton", "2 ton", "Not sure"]],
  ],
  appliance: [
    ["Appliance", ["Refrigerator", "Washing machine", "Geyser", "Microwave", "Television"]],
    ["Brand", ["LG", "Samsung", "Whirlpool", "Godrej", "Bosch", "Other"]],
  ],
  cleaning: [
    ["Home size", ["1 BHK", "2 BHK", "3 BHK", "4+ BHK", "Villa"]],
    ["Cleaning type", ["Deep clean", "Move-in", "Regular", "After renovation"]],
  ],
  movers: [
    ["Move type", ["Within city", "Intercity", "Office relocation"]],
    ["Home size", ["1 BHK", "2 BHK", "3 BHK", "4+ BHK"]],
  ],
};
const defaultCriteria = [
  ["Property type", ["Apartment", "Independent house", "Office", "Shop"]],
  ["When needed", ["Emergency", "Today", "This week", "Flexible"]],
];

export default function SearchProviders() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [service, setService] = useState(searchParams.get("service") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [rating, setRating] = useState("0");
  const [mode, setMode] = useState("");
  const [availability, setAvailability] = useState("");
  const [price, setPrice] = useState("2000");
  const [sort, setSort] = useState("recommended");
  const [detailOne, setDetailOne] = useState("");
  const [detailTwo, setDetailTwo] = useState("");
  const activeCriteria = criteria[service] || defaultCriteria;

  const results = useMemo(() => {
    const serviceName = services.find((item) => item.id === service)?.name.toLowerCase();
    return extendedProviders
      .filter((item) => {
        const text = `${item.name} ${item.category} ${item.area}`.toLowerCase();
        return (
          (!query || text.includes(query.toLowerCase())) &&
          (!city || item.city === city) &&
          (!serviceName || text.includes(serviceName.split(" ")[0])) &&
          item.rating >= Number(rating) &&
          item.price <= Number(price)
        );
      })
      .sort((a, b) =>
        sort === "rating"
          ? b.rating - a.rating
          : sort === "price"
            ? a.price - b.price
            : b.reviews - a.reviews,
      );
  }, [city, price, query, rating, service, sort]);

  function clear() {
    setQuery("");
    setService("");
    setCity("");
    setRating("0");
    setMode("");
    setAvailability("");
    setPrice("2000");
    setDetailOne("");
    setDetailTwo("");
  }

  return (
    <div className="min-h-screen bg-[#f5f4ed] text-[#17231c]">
      <header className="border-b border-black/10 bg-[#173c2b] text-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-black text-white">
            <FaArrowLeft /> findmy<span className="text-[#d9f99d]">need</span>
          </Link>
          <Link
            to="/customer"
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-bold text-white"
          >
            My dashboard
          </Link>
        </div>
      </header>
      <section className="bg-[#173c2b] pb-14 text-white">
        <div className="mx-auto max-w-7xl px-5 pt-8 lg:px-8">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#d9f99d]">
            Local marketplace
          </p>
          <h1 className="mt-3 text-5xl font-black tracking-[-.04em] text-white">
            Find the right professional
          </h1>
          <p className="mt-3 text-white/55">
            Compare verified providers by service, location, rating, price and availability.
          </p>
          <label className="mt-8 flex max-w-3xl items-center gap-3 rounded-2xl bg-white px-5 text-[#17231c]">
            <FaMagnifyingGlass className="text-[#246c49]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search professional, service or area"
              className="w-full bg-transparent py-5 outline-none"
            />
          </label>
        </div>
      </section>
      <main className="mx-auto grid max-w-7xl gap-7 px-5 py-10 lg:grid-cols-[290px_1fr] lg:px-8">
        <aside className="h-fit rounded-[28px] bg-white p-6 shadow-sm lg:sticky lg:top-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <FaSliders /> Filters
            </h2>
            <button onClick={clear} className="text-xs font-black text-[#e85d3f]">
              Clear all
            </button>
          </div>
          <div className="mt-6 space-y-5">
            <Filter label="Service">
              <select
                value={service}
                onChange={(event) => setService(event.target.value)}
                className="filter-input"
              >
                <option value="">All services</option>
                {services.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Filter>
            <Filter label="Location">
              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="filter-input"
              >
                <option value="">All cities</option>
                {cities.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Filter>
            <Filter label={activeCriteria[0][0]}>
              <select
                value={detailOne}
                onChange={(event) => setDetailOne(event.target.value)}
                className="filter-input"
              >
                <option value="">Any</option>
                {activeCriteria[0][1].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Filter>
            <Filter label={activeCriteria[1][0]}>
              <select
                value={detailTwo}
                onChange={(event) => setDetailTwo(event.target.value)}
                className="filter-input"
              >
                <option value="">Any</option>
                {activeCriteria[1][1].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Filter>
            <Filter label="Minimum rating">
              <select
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                className="filter-input"
              >
                <option value="0">Any rating</option>
                <option value="4">4.0+ stars</option>
                <option value="4.5">4.5+ stars</option>
                <option value="4.8">4.8+ stars</option>
              </select>
            </Filter>
            <Filter label="Service mode">
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value)}
                className="filter-input"
              >
                <option value="">Any mode</option>
                <option>At home</option>
                <option>At workshop</option>
                <option>Pickup & drop</option>
              </select>
            </Filter>
            <Filter label="Availability">
              <select
                value={availability}
                onChange={(event) => setAvailability(event.target.value)}
                className="filter-input"
              >
                <option value="">Any time</option>
                <option>Available today</option>
                <option>Available tomorrow</option>
                <option>Open weekends</option>
              </select>
            </Filter>
            <Filter label={`Maximum visit price · ₹${price}`}>
              <input
                type="range"
                min="299"
                max="2000"
                step="100"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="w-full accent-[#246c49]"
              />
            </Filter>
          </div>
        </aside>
        <section>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold text-black/45">
                {results.length} verified professionals
              </p>
              <h2 className="mt-1 text-3xl font-black">Recommended for you</h2>
            </div>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-xl border border-black/10 bg-white px-4 py-3 font-bold"
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Top rated</option>
              <option value="price">Lowest price</option>
            </select>
          </div>
          <div className="mt-6 space-y-4">
            {results.map((item) => (
              <article
                key={item.id}
                className="grid gap-5 rounded-[28px] bg-white p-6 shadow-sm md:grid-cols-[auto_1fr_auto] md:items-center"
              >
                <span className="grid h-20 w-20 place-items-center rounded-2xl bg-[#d9f99d] text-2xl font-black">
                  {item.initials}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-black">{item.name}</h3>
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                      <FaCheck className="mr-1 inline" /> Verified
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-black/50">
                    {item.category} · <FaLocationDot className="inline text-[#e85d3f]" />{" "}
                    {item.area}, {item.city}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#f3f2e9] px-3 py-1 text-xs font-bold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="border-t border-black/10 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                  <p className="text-sm font-black text-[#e85d3f]">
                    <FaStar className="mr-1 inline" /> {item.rating}{" "}
                    <span className="font-medium text-black/40">({item.reviews})</span>
                  </p>
                  <p className="mt-3 text-xs text-black/40">Visit price from</p>
                  <p className="text-xl font-black">₹{item.price}</p>
                  <Link
                    to={`/providers/${item.id}`}
                    className="mt-4 block rounded-xl bg-[#173c2b] px-5 py-3 text-center text-sm font-black text-white"
                  >
                    View profile
                  </Link>
                </div>
              </article>
            ))}
            {!results.length && (
              <div className="rounded-[28px] bg-white p-12 text-center">
                <FaFilter className="mx-auto text-4xl text-black/20" />
                <h3 className="mt-5 text-xl font-black">No exact matches</h3>
                <p className="mt-2 text-black/45">Clear a filter or try another location.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Filter({ label, children }) {
  return (
    <label className="block text-sm font-black">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}
