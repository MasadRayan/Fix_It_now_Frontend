
export interface HomeCategory {
  code: string;
  name: string;
  count: number;
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

