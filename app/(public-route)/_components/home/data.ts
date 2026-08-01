
export interface HomeCategory {
  code: string;
  name: string;
  count: number;
}

export interface HomeService {
  serial: string;
  category: string;
  title: string;
  description: string;
  durationMins: number;
  price: number;
  technician: string;
  rating: number;
  reviews: number;
  area: string;
}

export interface HomePro {
  name: string;
  initials: string;
  skill: string;
  area: string;
  bio: string;
  rating: number;
  reviews: number;
  experienceYrs: number;
  hourlyRate: number;
  verified: boolean;
}

export const bdt = (amount: number) => `\u09F3${amount.toLocaleString("en-IN")}`;



export const categories: HomeCategory[] = [
  { code: "PL", name: "Plumbing", count: 48 },
  { code: "EL", name: "Electrical", count: 39 },
  { code: "AC", name: "AC & Cooling", count: 27 },
  { code: "CL", name: "Cleaning", count: 22 },
  { code: "CR", name: "Carpentry", count: 18 },
  { code: "PT", name: "Painting", count: 15 },
  { code: "AP", name: "Appliance Repair", count: 31 },
  { code: "PC", name: "Pest Control", count: 12 },
];

export const tickerItems = [
  "Plumbing",
  "Electrical",
  "AC & Cooling",
  "Cleaning",
  "Carpentry",
  "Painting",
  "Appliance Repair",
  "Pest Control",
  "Gas Stove Repair",
  "Water Heater",
];

export const services: HomeService[] = [
  {
    serial: "FIN-1042",
    category: "AC & Cooling",
    title: "AC deep clean & gas refill",
    description:
      "Full strip-down clean, coil wash and refrigerant top-up. Unit running cool again the same day.",
    durationMins: 90,
    price: 450,
    technician: "Rafiq Uddin",
    rating: 4.9,
    reviews: 214,
    area: "Mirpur 10",
  },
  {
    serial: "FIN-1077",
    category: "Plumbing",
    title: "Leaking pipe repair",
    description:
      "Locate and fix the leak, replace worn fittings and reseal joints. Mess cleaned up before we leave.",
    durationMins: 60,
    price: 350,
    technician: "Karim Hossain",
    rating: 4.8,
    reviews: 156,
    area: "Dhanmondi",
  },
  {
    serial: "FIN-1093",
    category: "Electrical",
    title: "Complete wiring check",
    description:
      "Full-home circuit audit, trip-source hunting and safe switchboard work where it counts.",
    durationMins: 120,
    price: 600,
    technician: "Jahir Ahmed",
    rating: 4.7,
    reviews: 98,
    area: "Uttara",
  },
  {
    serial: "FIN-1101",
    category: "Plumbing",
    title: "Bathroom fitting & tap install",
    description:
      "Basin, mixer and tap installation with proper sealing. No more wobbly fittings or drip-drip-drip.",
    durationMins: 45,
    price: 250,
    technician: "Sabbir Khan",
    rating: 4.6,
    reviews: 87,
    area: "Banani",
  },
  {
    serial: "FIN-1116",
    category: "Appliance Repair",
    title: "Gas stove repair",
    description:
      "Flame, burner and regulator faults fixed, then safety-checked before we leave so you cook without worry.",
    durationMins: 45,
    price: 300,
    technician: "Fahim Hasan",
    rating: 4.8,
    reviews: 131,
    area: "Gulshan",
  },
  {
    serial: "FIN-1120",
    category: "Cleaning",
    title: "Deep home cleaning",
    description:
      "Kitchen grease, bathroom grime and floor-to-ceiling dust. Two-person crew, and you don't lift a finger.",
    durationMins: 90,
    price: 500,
    technician: "Mitu Akter",
    rating: 4.9,
    reviews: 172,
    area: "Mohammadpur",
  },
];

export const pros: HomePro[] = [
  {
    name: "Rafiq Uddin",
    initials: "RU",
    skill: "AC & refrigeration",
    area: "Mirpur 10",
    bio: "Certified in split-unit installation and gas refill. Eight years keeping Dhaka's summers cool.",
    rating: 4.9,
    reviews: 214,
    experienceYrs: 8,
    hourlyRate: 450,
    verified: true,
  },
  {
    name: "Jahir Ahmed",
    initials: "JA",
    skill: "Electrical safety",
    area: "Uttara",
    bio: "Licensed electrician. Short-circuit hunting, rewiring and three-phase work done to code.",
    rating: 4.7,
    reviews: 98,
    experienceYrs: 12,
    hourlyRate: 600,
    verified: true,
  },
  {
    name: "Mitu Akter",
    initials: "MA",
    skill: "Deep cleaning",
    area: "Mohammadpur",
    bio: "Leads a two-person crew. Move-in, post-renovation and monthly deep cleans across the city.",
    rating: 4.9,
    reviews: 172,
    experienceYrs: 5,
    hourlyRate: 500,
    verified: true,
  },
];
