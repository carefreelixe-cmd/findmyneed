export const locations = ["Bengaluru", "Delhi", "Mumbai", "Hyderabad", "Pune", "Chennai"];

export const professionals = [
  {
    id: "urban-fix",
    name: "UrbanFix Home Services",
    category: "Electrician",
    city: "Bengaluru",
    area: "HSR Layout",
    rating: 4.9,
    reviews: 428,
    jobs: 1860,
    price: 299,
    initials: "UF",
    badges: ["Background verified", "Same-day"],
  },
  {
    id: "cool-care",
    name: "CoolCare AC Experts",
    category: "AC service & repair",
    city: "Bengaluru",
    area: "Indiranagar",
    rating: 4.8,
    reviews: 316,
    jobs: 1245,
    price: 599,
    initials: "CC",
    badges: ["AC specialist", "90-day warranty"],
  },
  {
    id: "spark-pro",
    name: "SparkPro Electricals",
    category: "Electrician",
    city: "Delhi",
    area: "Saket",
    rating: 4.9,
    reviews: 289,
    jobs: 980,
    price: 349,
    initials: "SP",
    badges: ["Licensed", "Emergency service"],
  },
  {
    id: "auto-trust",
    name: "AutoTrust Garage",
    category: "Car repair",
    city: "Mumbai",
    area: "Andheri East",
    rating: 4.8,
    reviews: 512,
    jobs: 2310,
    price: 699,
    initials: "AT",
    badges: ["Multi-brand", "Pickup & drop"],
  },
  {
    id: "fresh-space",
    name: "FreshSpace Cleaning Co.",
    category: "Home cleaning",
    city: "Hyderabad",
    area: "Gachibowli",
    rating: 4.7,
    reviews: 224,
    jobs: 875,
    price: 499,
    initials: "FS",
    badges: ["Eco products", "Insured team"],
  },
  {
    id: "pipe-doctor",
    name: "The Pipe Doctor",
    category: "Plumber",
    city: "Pune",
    area: "Baner",
    rating: 4.9,
    reviews: 197,
    jobs: 760,
    price: 349,
    initials: "PD",
    badges: ["Leak specialist", "Emergency service"],
  },
];

export const testimonials = [
  {
    quote:
      "The AC technician arrived on time, explained the issue clearly and showed the final price before starting. The whole booking felt effortless.",
    name: "Ananya R.",
    detail: "AC repair · Bengaluru",
  },
  {
    quote:
      "I found a verified electrician in minutes. Updates were clear, payment was secure and the work came with a warranty.",
    name: "Vikram S.",
    detail: "Electrical repair · Delhi",
  },
  {
    quote:
      "The garage picked up my car, shared progress and returned it the same evening. There were no surprise charges.",
    name: "Meera K.",
    detail: "Car service · Mumbai",
  },
];

export const serviceMenu = [
  { id: "electrician", label: "Electrical", items: ["Power faults", "Wiring", "Fans & lights"] },
  { id: "plumber", label: "Plumbing", items: ["Leaks", "Blocked drains", "Fixtures"] },
  { id: "ac", label: "AC services", items: ["AC service", "Not cooling", "Installation"] },
  { id: "appliance", label: "Appliances", items: ["Washing machine", "Refrigerator", "Geyser"] },
  { id: "cleaning", label: "Cleaning", items: ["Deep cleaning", "Kitchen", "Move-in"] },
  { id: "car", label: "Car care", items: ["Periodic service", "Brakes", "Diagnostics"] },
  { id: "painter", label: "Painting", items: ["Interior", "Exterior", "Waterproofing"] },
];
