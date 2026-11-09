import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { defaultServiceOptions, serviceOptions } from "../data/serviceOptions";

export default function ServiceFinder({ services }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const service = services.find((item) => item._id === id) || location.state?.service;
  const config = serviceOptions[id] || defaultServiceOptions;
  const [details, setDetails] = useState({});
  const [need, setNeed] = useState("");

  const fields = useMemo(
    () =>
      config.fields.map((field) => ({
        ...field,
        options: field.dependsOn
          ? field.optionsByParent?.[details[field.dependsOn]] || []
          : field.options,
      })),
    [config, details],
  );

  function updateField(field, value) {
    const next = { ...details, [field.name]: value };
    config.fields
      .filter((candidate) => candidate.dependsOn === field.name)
      .forEach((candidate) => {
        next[candidate.name] = "";
      });
    setDetails(next);
  }

  function submit(event) {
    event.preventDefault();
    navigate(`/book/${id}`, {
      state: { service, serviceRequest: { ...details, need } },
    });
  }

  return (
    <main>
      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 lg:grid-cols-[.85fr_1.15fr] lg:px-8 lg:py-20">
          <div className="self-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-bold text-lime"
            >
              <ArrowLeft size={16} /> All services
            </Link>
            <p className="mt-10 text-xs font-black uppercase tracking-[.2em] text-lime">
              {config.eyebrow}
            </p>
            <h1 className="mt-4 font-display text-6xl leading-none">{config.title}</h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-white/60">{config.description}</p>
            <div className="mt-9 space-y-4 text-sm font-bold text-white/75">
              <p className="flex items-center gap-3">
                <ShieldCheck className="text-lime" /> Verified professionals
              </p>
              <p className="flex items-center gap-3">
                <CheckCircle2 className="text-lime" /> Details saved with your booking
              </p>
              <p className="flex items-center gap-3">
                <CheckCircle2 className="text-lime" /> Clear pricing before payment
              </p>
            </div>
          </div>
          <form
            onSubmit={submit}
            className="rounded-[2rem] bg-white p-7 text-ink shadow-2xl sm:p-9"
          >
            <div className="flex items-center gap-4 border-b border-ink/10 pb-6">
              <span className="text-4xl">{service?.icon || "🔧"}</span>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-leaf">
                  Service request
                </p>
                <h2 className="mt-1 text-2xl font-extrabold">
                  {service?.name || "Professional service"}
                </h2>
              </div>
            </div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              {fields.map((field) => (
                <label key={field.name} className="block text-sm font-bold">
                  {field.label}
                  <select
                    required
                    disabled={field.dependsOn && !details[field.dependsOn]}
                    value={details[field.name] || ""}
                    onChange={(event) => updateField(field, event.target.value)}
                    className="mt-2 w-full rounded-xl border border-ink/15 bg-white p-4 disabled:bg-ink/5 disabled:opacity-60"
                  >
                    <option value="">{field.placeholder}</option>
                    {field.options.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <label className="mt-5 block text-sm font-bold">
              What do you need?
              <select
                required
                value={need}
                onChange={(event) => setNeed(event.target.value)}
                className="mt-2 w-full rounded-xl border border-ink/15 bg-white p-4"
              >
                <option value="">Select service or issue</option>
                {config.needs.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <button className="mt-7 w-full rounded-xl bg-coral p-4 font-extrabold text-white">
              Continue to booking
            </button>
            <p className="mt-4 text-center text-xs text-ink/45">
              You can add photos and extra information in the booking notes.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
