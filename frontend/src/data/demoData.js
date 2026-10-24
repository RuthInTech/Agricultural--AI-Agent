// 1. Demo Locations specified in hackathon guidelines
export const demoLocations = [
  { id: "SITE-A", name: "Site A" },
  { id: "SITE-B", name: "Site B" },
  { id: "SITE-C", name: "Site C" }
];

// 2. Three short demo guidance notes for Maize (incorporating official guideline references)
export const guidanceNotes = [
  {
    id: "GUIDE-001",
    title: "Yellowing leaves",
    crop: "Maize",
    content: "Yellow leaves can have multiple possible causes. Record the affected leaves, crop growth stage, distribution of symptoms, soil condition, and recent field conditions. Do not conclude the cause from leaf colour alone."
  },
  {
    id: "GUIDE-002",
    title: "Ragged holes and leaf chewing",
    crop: "Maize",
    content: "Holes or chewed areas on leaves often indicate pest activity such as Fall Armyworm larvae in the whorl. Record the percentage of affected plants, presence of frass, and recent weather patterns. Avoid assuming chemical treatment is necessary without checking infestation levels."
  },
  {
    id: "GUIDE-003",
    title: "Midday leaf rolling and wilt",
    crop: "Maize",
    content: "Leaves rolling inward during midday indicate moisture stress or drought conditions. Record whether leaves recover overnight, soil moisture levels, and the current growth stage (especially around tasseling). Distinguish temporary heat stress from permanent water deficit."
  }
];

// 3. Two fictitious case histories tied to demo locations (matching CASE-001 requirements)
export const caseHistories = [
  {
    case_id: "CASE-001",
    location_id: "SITE-A",
    farmer_name: "Abebe Tadesse",
    crop: "Maize",
    growth_stage: "Vegetative (V8)",
    recorded_facts: "Farmer reported yellow lower leaves following heavy rain. No insect frass observed.",
    previous_follow_ups: [
      {
        date: "2026-10-10",
        task: "Monitor if yellowing spreads from lower leaves upward.",
        status: "Completed"
      }
    ]
  },
  {
    case_id: "CASE-002",
    location_id: "SITE-B",
    farmer_name: "Tigist Bekele",
    crop: "Maize",
    growth_stage: "Early Whorl",
    recorded_facts: "Observed scattered ragged holes in central leaves during dry spell inspection.",
    previous_follow_ups: [
      {
        date: "2026-10-18",
        task: "Inspect 20 random plant whorls for larvae.",
        status: "Pending"
      }
    ]
  }
];