import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type {
  CareerStats3Yr,
  FranchiseCode,
  PlayerRole,
} from "../types";

function loadLocalEnvFile(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadLocalEnvFile();

type CompactPlayerTuple = readonly [
  fullName: string,
  shortName: string,
  role: PlayerRole,
  credits: number,
  isOverseas: boolean,
  isUncapped: boolean,
  selectionPct: number,
];

interface StadiumSeedItem {
  slug: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  soil_type: string;
  straight_boundary_m: number;
  square_boundary_m: number;
  pace_wicket_pct: number;
  spin_wicket_pct: number;
  chase_win_pct: number;
  avg_first_innings_score: number;
}

interface FranchiseSeedItem {
  code: FranchiseCode;
  name: string;
  city: string;
  primary_hex: string;
  secondary_hex: string;
  stadium_slug: string;
}

const STADIUMS_SEED: readonly StadiumSeedItem[] = [
  {
    slug: "chepauk",
    name: "M. A. Chidambaram Stadium",
    city: "Chennai",
    latitude: 13.0628,
    longitude: 80.2793,
    soil_type: "Black & Red Clay • Grip & Turn",
    straight_boundary_m: 76,
    square_boundary_m: 70,
    pace_wicket_pct: 44,
    spin_wicket_pct: 56,
    chase_win_pct: 46,
    avg_first_innings_score: 172,
  },
  {
    slug: "wankhede",
    name: "Wankhede Stadium",
    city: "Mumbai",
    latitude: 18.9389,
    longitude: 72.8258,
    soil_type: "Red Soil • High Carry & Swing",
    straight_boundary_m: 72,
    square_boundary_m: 64,
    pace_wicket_pct: 68,
    spin_wicket_pct: 32,
    chase_win_pct: 67,
    avg_first_innings_score: 196,
  },
  {
    slug: "chinnaswamy",
    name: "M. Chinnaswamy Stadium",
    city: "Bengaluru",
    latitude: 12.9788,
    longitude: 77.5996,
    soil_type: "Two-Paced Subsurface • High Altitude",
    straight_boundary_m: 68,
    square_boundary_m: 59,
    pace_wicket_pct: 64,
    spin_wicket_pct: 36,
    chase_win_pct: 71,
    avg_first_innings_score: 208,
  },
  {
    slug: "eden-gardens",
    name: "Eden Gardens",
    city: "Kolkata",
    latitude: 22.5646,
    longitude: 88.3433,
    soil_type: "Black Cotton Soil • Fast Outfield",
    straight_boundary_m: 71,
    square_boundary_m: 66,
    pace_wicket_pct: 61,
    spin_wicket_pct: 39,
    chase_win_pct: 62,
    avg_first_innings_score: 191,
  },
  {
    slug: "sawai-mansingh",
    name: "Sawai Mansingh Stadium",
    city: "Jaipur",
    latitude: 26.894,
    longitude: 75.8032,
    soil_type: "Alluvial Loam • Deep Boundaries",
    straight_boundary_m: 78,
    square_boundary_m: 73,
    pace_wicket_pct: 52,
    spin_wicket_pct: 48,
    chase_win_pct: 58,
    avg_first_innings_score: 179,
  },
  {
    slug: "narendra-modi",
    name: "Narendra Modi Stadium",
    city: "Ahmedabad",
    latitude: 23.0917,
    longitude: 72.5975,
    soil_type: "Hybrid Red & Black Soil",
    straight_boundary_m: 75,
    square_boundary_m: 68,
    pace_wicket_pct: 59,
    spin_wicket_pct: 41,
    chase_win_pct: 55,
    avg_first_innings_score: 188,
  },
  {
    slug: "ekana",
    name: "BRSABV Ekana Cricket Stadium",
    city: "Lucknow",
    latitude: 26.8114,
    longitude: 81.0169,
    soil_type: "Slow Black Clay • Low Bounce",
    straight_boundary_m: 76,
    square_boundary_m: 71,
    pace_wicket_pct: 47,
    spin_wicket_pct: 53,
    chase_win_pct: 44,
    avg_first_innings_score: 168,
  },
  {
    slug: "arun-jaitley",
    name: "Arun Jaitley Stadium",
    city: "Delhi",
    latitude: 28.6379,
    longitude: 77.2432,
    soil_type: "Dry Loam • Compact Square",
    straight_boundary_m: 68,
    square_boundary_m: 62,
    pace_wicket_pct: 56,
    spin_wicket_pct: 44,
    chase_win_pct: 60,
    avg_first_innings_score: 199,
  },
  {
    slug: "mullanpur",
    name: "Maharaja Yadavindra Singh Stadium",
    city: "Mohali",
    latitude: 30.7782,
    longitude: 76.7369,
    soil_type: "Firm Northern Clay • Seam Bounce",
    straight_boundary_m: 74,
    square_boundary_m: 67,
    pace_wicket_pct: 66,
    spin_wicket_pct: 34,
    chase_win_pct: 54,
    avg_first_innings_score: 184,
  },
  {
    slug: "uppal",
    name: "Rajiv Gandhi International Stadium",
    city: "Hyderabad",
    latitude: 17.4065,
    longitude: 78.5505,
    soil_type: "Hard Flat Deck • High Scoring",
    straight_boundary_m: 73,
    square_boundary_m: 66,
    pace_wicket_pct: 58,
    spin_wicket_pct: 42,
    chase_win_pct: 57,
    avg_first_innings_score: 204,
  },
];

const FRANCHISES_SEED: readonly FranchiseSeedItem[] = [
  {
    code: "CSK",
    name: "Chennai Super Kings",
    city: "Chennai",
    primary_hex: "#d9a74a",
    secondary_hex: "#1d428a",
    stadium_slug: "chepauk",
  },
  {
    code: "MI",
    name: "Mumbai Indians",
    city: "Mumbai",
    primary_hex: "#3b6ea5",
    secondary_hex: "#c8b273",
    stadium_slug: "wankhede",
  },
  {
    code: "RCB",
    name: "Royal Challengers Bengaluru",
    city: "Bengaluru",
    primary_hex: "#b84242",
    secondary_hex: "#c8b273",
    stadium_slug: "chinnaswamy",
  },
  {
    code: "KKR",
    name: "Kolkata Knight Riders",
    city: "Kolkata",
    primary_hex: "#6d4c9c",
    secondary_hex: "#d4af37",
    stadium_slug: "eden-gardens",
  },
  {
    code: "RR",
    name: "Rajasthan Royals",
    city: "Jaipur",
    primary_hex: "#b85486",
    secondary_hex: "#254aa5",
    stadium_slug: "sawai-mansingh",
  },
  {
    code: "GT",
    name: "Gujarat Titans",
    city: "Ahmedabad",
    primary_hex: "#4a6b82",
    secondary_hex: "#c8b273",
    stadium_slug: "narendra-modi",
  },
  {
    code: "LSG",
    name: "Lucknow Super Giants",
    city: "Lucknow",
    primary_hex: "#3b6fb6",
    secondary_hex: "#d97736",
    stadium_slug: "ekana",
  },
  {
    code: "DC",
    name: "Delhi Capitals",
    city: "Delhi",
    primary_hex: "#3b5998",
    secondary_hex: "#c94a4a",
    stadium_slug: "arun-jaitley",
  },
  {
    code: "PBKS",
    name: "Punjab Kings",
    city: "Mohali",
    primary_hex: "#c2464c",
    secondary_hex: "#d4be81",
    stadium_slug: "mullanpur",
  },
  {
    code: "SRH",
    name: "Sunrisers Hyderabad",
    city: "Hyderabad",
    primary_hex: "#cf6a38",
    secondary_hex: "#222b30",
    stadium_slug: "uppal",
  },
];

const SQUADS_BY_FRANCHISE: Record<
  FranchiseCode,
  readonly CompactPlayerTuple[]
> = {
  CSK: [
    ["Ruturaj Gaikwad", "R. Gaikwad", "BAT", 9.5, false, false, 78.4],
    ["MS Dhoni", "MS Dhoni", "WK", 8.5, false, false, 64.2],
    ["Ravindra Jadeja", "R. Jadeja", "ALL", 9.5, false, false, 81.0],
    ["Shivam Dube", "S. Dube", "ALL", 9.0, false, false, 72.5],
    ["Matheesha Pathirana", "M. Pathirana", "BOWL", 9.0, true, false, 76.8],
    ["Devon Conway", "D. Conway", "WK", 8.5, true, false, 52.1],
    ["Rachin Ravindra", "R. Ravindra", "ALL", 8.5, true, false, 58.3],
    ["Ravichandran Ashwin", "R. Ashwin", "ALL", 8.5, false, false, 49.0],
    ["Noor Ahmad", "N. Ahmad", "BOWL", 8.5, true, false, 55.4],
    ["Khaleel Ahmed", "K. Ahmed", "BOWL", 8.0, false, false, 42.1],
    ["Rahul Tripathi", "R. Tripathi", "BAT", 8.0, false, false, 31.5],
    ["Vijay Shankar", "V. Shankar", "ALL", 7.5, false, false, 18.2],
    ["Sam Curran", "S. Curran", "ALL", 8.5, true, false, 46.7],
    ["Deepak Hooda", "D. Hooda", "ALL", 7.5, false, false, 15.4],
    ["Anshul Kamboj", "A. Kamboj", "BOWL", 7.0, false, true, 12.8],
    ["Mukesh Choudhary", "M. Choudhary", "BOWL", 7.5, false, false, 19.3],
    ["Shaik Rasheed", "S. Rasheed", "BAT", 6.5, false, true, 8.4],
    ["Gurjapneet Singh", "G. Singh", "BOWL", 6.5, false, true, 7.2],
    ["Nathan Ellis", "N. Ellis", "BOWL", 8.0, true, false, 24.6],
    ["Jamie Overton", "J. Overton", "ALL", 7.5, true, false, 14.1],
    ["Kamlesh Nagarkoti", "K. Nagarkoti", "BOWL", 6.5, false, false, 6.5],
    ["Ramakrishna Ghosh", "R. Ghosh", "ALL", 6.0, false, true, 5.1],
    ["Shreyas Gopal", "S. Gopal", "BOWL", 7.0, false, false, 11.2],
    ["Vansh Bedi", "V. Bedi", "WK", 6.0, false, true, 4.8],
    ["Andre Siddarth", "A. Siddarth", "BAT", 6.0, false, true, 4.5],
  ],
  MI: [
    ["Hardik Pandya", "H. Pandya", "ALL", 9.5, false, false, 84.2],
    ["Suryakumar Yadav", "S. Yadav", "BAT", 10.0, false, false, 86.5],
    ["Jasprit Bumrah", "J. Bumrah", "BOWL", 10.0, false, false, 89.1],
    ["Rohit Sharma", "R. Sharma", "BAT", 9.5, false, false, 79.4],
    ["Tilak Varma", "T. Varma", "BAT", 9.0, false, false, 71.2],
    ["Trent Boult", "T. Boult", "BOWL", 9.0, true, false, 74.0],
    ["Ryan Rickelton", "R. Rickelton", "WK", 8.5, true, false, 53.6],
    ["Deepak Chahar", "D. Chahar", "BOWL", 8.0, false, false, 44.8],
    ["Will Jacks", "W. Jacks", "ALL", 8.5, true, false, 51.2],
    ["Mitchell Santner", "M. Santner", "ALL", 8.0, true, false, 38.9],
    ["Naman Dhir", "N. Dhir", "ALL", 7.5, false, true, 22.4],
    ["Allah Ghazanfar", "A. Ghazanfar", "BOWL", 7.5, true, true, 19.8],
    ["Robin Minz", "R. Minz", "WK", 6.5, false, true, 9.5],
    ["Karn Sharma", "K. Sharma", "BOWL", 7.0, false, false, 14.2],
    ["Reece Topley", "R. Topley", "BOWL", 8.0, true, false, 21.0],
    ["Corbin Bosch", "C. Bosch", "ALL", 7.5, true, false, 12.3],
    ["Raj Angad Bawa", "R. Bawa", "ALL", 6.5, false, true, 7.8],
    ["Satyanarayana Raju", "S. Raju", "BOWL", 6.0, false, true, 5.4],
    ["Krishnan Shrijith", "K. Shrijith", "WK", 6.0, false, true, 5.0],
    ["Ashwani Kumar", "A. Kumar", "BOWL", 6.0, false, true, 4.9],
    ["Bevon Jacobs", "B. Jacobs", "BAT", 6.5, true, true, 6.8],
    ["Arjun Tendulkar", "A. Tendulkar", "BOWL", 6.5, false, true, 11.4],
    ["Vignesh Puthur", "V. Puthur", "BOWL", 6.0, false, true, 4.2],
    ["Lizaad Williams", "L. Williams", "BOWL", 7.0, true, false, 8.9],
    ["Suryaansh Shedge", "S. Shedge", "ALL", 6.0, false, true, 4.6],
  ],
  RCB: [
    ["Virat Kohli", "V. Kohli", "BAT", 10.5, false, false, 91.2],
    ["Rajat Patidar", "R. Patidar", "BAT", 9.0, false, false, 68.5],
    ["Phil Salt", "P. Salt", "WK", 9.5, true, false, 79.8],
    ["Josh Hazlewood", "J. Hazlewood", "BOWL", 9.0, true, false, 72.1],
    ["Liam Livingstone", "L. Livingstone", "ALL", 9.0, true, false, 66.4],
    ["Jitesh Sharma", "J. Sharma", "WK", 8.0, false, false, 41.2],
    ["Bhuvneshwar Kumar", "B. Kumar", "BOWL", 8.5, false, false, 54.6],
    ["Yash Dayal", "Y. Dayal", "BOWL", 8.0, false, false, 43.8],
    ["Krunal Pandya", "K. Pandya", "ALL", 8.0, false, false, 47.5],
    ["Tim David", "T. David", "BAT", 8.5, true, false, 49.2],
    ["Suyash Sharma", "S. Sharma", "BOWL", 7.5, false, true, 26.4],
    ["Rasikh Dar", "R. Dar", "BOWL", 7.5, false, true, 21.8],
    ["Jacob Bethell", "J. Bethell", "ALL", 7.5, true, true, 18.9],
    ["Devdutt Padikkal", "D. Padikkal", "BAT", 7.5, false, false, 22.1],
    ["Nuwan Thushara", "N. Thushara", "BOWL", 8.0, true, false, 24.5],
    ["Romario Shepherd", "R. Shepherd", "ALL", 7.5, true, false, 19.4],
    ["Swapnil Singh", "S. Singh", "ALL", 7.0, false, false, 15.2],
    ["Manoj Bhandage", "M. Bhandage", "ALL", 6.5, false, true, 6.9],
    ["Swastik Chikara", "S. Chikara", "BAT", 6.0, false, true, 5.8],
    ["Lungi Ngidi", "L. Ngidi", "BOWL", 7.5, true, false, 14.7],
    ["Abhinandan Singh", "A. Singh", "BOWL", 6.0, false, true, 4.4],
    ["Mohit Rathee", "M. Rathee", "ALL", 6.0, false, true, 4.1],
    ["Kanishk Chouhan", "K. Chouhan", "ALL", 6.0, false, true, 4.0],
    ["wanindu Hasaranga", "W. Hasaranga", "ALL", 8.5, true, false, 34.0],
    ["Avinash Singh", "Av. Singh", "BOWL", 6.0, false, true, 4.3],
  ],
  KKR: [
    ["Sunil Narine", "S. Narine", "ALL", 10.0, true, false, 87.6],
    ["Andre Russell", "A. Russell", "ALL", 9.5, true, false, 83.4],
    ["Varun Chakaravarthy", "V. Chakaravarthy", "BOWL", 9.0, false, false, 74.2],
    ["Rinku Singh", "R. Singh", "BAT", 9.0, false, false, 69.8],
    ["Quinton de Kock", "Q. de Kock", "WK", 9.0, true, false, 67.5],
    ["Venkatesh Iyer", "V. Iyer", "ALL", 9.0, false, false, 64.1],
    ["Harshit Rana", "H. Rana", "BOWL", 8.5, false, false, 58.9],
    ["Ajinkya Rahane", "A. Rahane", "BAT", 8.0, false, false, 42.3],
    ["Anrich Nortje", "A. Nortje", "BOWL", 8.5, true, false, 48.7],
    ["Ramandeep Singh", "Rm. Singh", "ALL", 7.5, false, true, 29.4],
    ["Rahmanullah Gurbaz", "R. Gurbaz", "WK", 8.0, true, false, 33.2],
    ["Angkrish Raghuvanshi", "A. Raghuvanshi", "BAT", 7.5, false, true, 24.8],
    ["Vaibhav Arora", "V. Arora", "BOWL", 7.5, false, false, 27.6],
    ["Spencer Johnson", "S. Johnson", "BOWL", 8.0, true, false, 25.1],
    ["Moeen Ali", "M. Ali", "ALL", 8.0, true, false, 28.4],
    ["Rovman Powell", "R. Powell", "BAT", 8.0, true, false, 22.9],
    ["Manish Pandey", "M. Pandey", "BAT", 7.5, false, false, 14.5],
    ["Anukul Roy", "A. Roy", "ALL", 7.0, false, false, 11.8],
    ["Mayank Markande", "M. Markande", "BOWL", 7.0, false, false, 13.6],
    ["Umran Malik", "U. Malik", "BOWL", 7.5, false, false, 16.2],
    ["Luvnith Sisodia", "L. Sisodia", "WK", 6.0, false, true, 4.7],
    ["Chetan Sakariya", "C. Sakariya", "BOWL", 7.0, false, false, 9.8],
    ["Sakib Hussain", "S. Hussain", "BOWL", 6.0, false, true, 4.3],
    ["Harshit Rathod", "H. Rathod", "BOWL", 6.0, false, true, 4.1],
    ["Aryaman Varma", "A. Varma", "BAT", 6.0, false, true, 4.0],
  ],
  RR: [
    ["Yashasvi Jaiswal", "Y. Jaiswal", "BAT", 9.5, false, false, 82.9],
    ["Sanju Samson", "S. Samson", "WK", 9.5, false, false, 81.4],
    ["Riyan Parag", "R. Parag", "ALL", 9.0, false, false, 73.6],
    ["Jofra Archer", "J. Archer", "BOWL", 9.0, true, false, 71.2],
    ["Wanindu Hasaranga", "W. Hasaranga", "ALL", 8.5, true, false, 59.8],
    ["Sandeep Sharma", "S. Sharma", "BOWL", 8.0, false, false, 52.4],
    ["Dhruv Jurel", "D. Jurel", "WK", 8.0, false, false, 44.1],
    ["Shimron Hetmyer", "S. Hetmyer", "BAT", 8.5, true, false, 47.9],
    ["Maheesh Theekshana", "M. Theekshana", "BOWL", 8.0, true, false, 41.6],
    ["Nitish Rana", "N. Rana", "ALL", 8.0, false, false, 38.2],
    ["Tushar Deshpande", "T. Deshpande", "BOWL", 8.0, false, false, 36.5],
    ["Fazalhaq Farooqi", "F. Farooqi", "BOWL", 8.0, true, false, 29.1],
    ["Akash Madhwal", "A. Madhwal", "BOWL", 7.5, false, false, 22.7],
    ["Shubham Dubey", "S. Dubey", "BAT", 7.0, false, true, 13.4],
    ["Yudhvir Singh", "Y. Singh", "BOWL", 6.5, false, true, 8.2],
    ["Kumar Kartikeya", "K. Kartikeya", "BOWL", 7.0, false, true, 11.9],
    ["Kwena Maphaka", "K. Maphaka", "BOWL", 7.0, true, true, 14.6],
    ["Kunal Rathore", "K. Rathore", "WK", 6.0, false, true, 4.8],
    ["Vaibhav Suryavanshi", "V. Suryavanshi", "BAT", 6.5, false, true, 16.5],
    ["Ashok Sharma", "As. Sharma", "BOWL", 6.0, false, true, 4.2],
    ["Tanush Kotian", "T. Kotian", "ALL", 7.0, false, true, 10.4],
    ["Navdeep Saini", "N. Saini", "BOWL", 7.0, false, false, 9.1],
    ["Abid Mushtaq", "A. Mushtaq", "ALL", 6.0, false, true, 4.3],
    ["Donovan Ferreira", "D. Ferreira", "WK", 7.0, true, false, 8.7],
    ["kartik Tyagi", "K. Tyagi", "BOWL", 6.5, false, false, 7.5],
  ],
  GT: [
    ["Shubman Gill", "S. Gill", "BAT", 10.0, false, false, 85.7],
    ["Rashid Khan", "R. Khan", "BOWL", 9.5, true, false, 84.9],
    ["Jos Buttler", "J. Buttler", "WK", 9.5, true, false, 82.1],
    ["Sai Sudharsan", "S. Sudharsan", "BAT", 9.0, false, false, 74.5],
    ["Mohammed Siraj", "M. Siraj", "BOWL", 8.5, false, false, 63.8],
    ["Kagiso Rabada", "K. Rabada", "BOWL", 9.0, true, false, 69.2],
    ["Prasidh Krishna", "P. Krishna", "BOWL", 8.0, false, false, 45.4],
    ["Rahul Tewatia", "R. Tewatia", "ALL", 8.0, false, false, 41.9],
    ["Washington Sundar", "W. Sundar", "ALL", 8.0, false, false, 39.6],
    ["Shahrukh Khan", "Sr. Khan", "BAT", 7.5, false, false, 28.3],
    ["Sherfane Rutherford", "S. Rutherford", "BAT", 8.0, true, false, 26.7],
    ["Sai Kishore", "R. Sai Kishore", "BOWL", 7.5, false, false, 31.2],
    ["Glenn Phillips", "G. Phillips", "ALL", 8.5, true, false, 37.8],
    ["Gerald Coetzee", "G. Coetzee", "BOWL", 8.0, true, false, 33.5],
    ["Mahipal Lomror", "M. Lomror", "ALL", 7.0, false, false, 15.6],
    ["Anuj Rawat", "A. Rawat", "WK", 7.0, false, false, 12.4],
    ["Arshad Khan", "Ar. Khan", "ALL", 6.5, false, true, 9.8],
    ["Ishant Sharma", "I. Sharma", "BOWL", 7.5, false, false, 18.1],
    ["Jayant Yadav", "J. Yadav", "ALL", 7.0, false, false, 8.9],
    ["Kumar Kushagra", "K. Kushagra", "WK", 6.5, false, true, 6.4],
    ["Manav Suthar", "M. Suthar", "BOWL", 6.5, false, true, 7.1],
    ["Nishant Sindhu", "N. Sindhu", "ALL", 6.5, false, true, 6.8],
    ["Gurnoor Brar", "G. Brar", "BOWL", 6.0, false, true, 4.5],
    ["Karim Janat", "K. Janat", "ALL", 7.0, true, false, 9.2],
    ["Kulwant Khejroliya", "K. Khejroliya", "BOWL", 6.5, false, false, 5.7],
  ],
  LSG: [
    ["Rishabh Pant", "R. Pant", "WK", 9.5, false, false, 83.6],
    ["Nicholas Pooran", "N. Pooran", "WK", 9.5, true, false, 81.9],
    ["Mayank Yadav", "M. Yadav", "BOWL", 8.5, false, false, 66.2],
    ["Mitchell Marsh", "M. Marsh", "ALL", 8.5, true, false, 58.4],
    ["David Miller", "D. Miller", "BAT", 8.5, true, false, 54.7],
    ["Aiden Markram", "A. Markram", "ALL", 8.5, true, false, 51.3],
    ["Ravi Bishnoi", "R. Bishnoi", "BOWL", 8.5, false, false, 56.8],
    ["Avesh Khan", "Av. Khan", "BOWL", 8.0, false, false, 44.2],
    ["Abdul Samad", "A. Samad", "BAT", 7.5, false, false, 29.5],
    ["Ayush Badoni", "A. Badoni", "BAT", 7.5, false, true, 32.1],
    ["Mohsin Khan", "Mo. Khan", "BOWL", 8.0, false, false, 37.4],
    ["Shahbaz Ahmed", "Sh. Ahmed", "ALL", 7.5, false, false, 24.6],
    ["Akash Deep", "A. Deep", "BOWL", 7.5, false, false, 26.9],
    ["Shamar Joseph", "S. Joseph", "BOWL", 7.5, true, false, 19.3],
    ["Matthew Breetzke", "M. Breetzke", "WK", 7.0, true, false, 12.8],
    ["M. Siddharth", "M. Siddharth", "BOWL", 6.5, false, true, 8.4],
    ["Arshin Kulkarni", "A. Kulkarni", "ALL", 6.5, false, true, 7.9],
    ["Rajvardhan Hangargekar", "R. Hangargekar", "ALL", 6.5, false, true, 7.2],
    ["Yuvraj Chaudhary", "Y. Chaudhary", "ALL", 6.0, false, true, 4.6],
    ["Prince Yadav", "P. Yadav", "BOWL", 6.0, false, true, 4.4],
    ["Akash Singh", "Ak. Singh", "BOWL", 6.5, false, true, 5.9],
    ["Digvesh Singh", "D. Singh", "BOWL", 6.0, false, true, 4.2],
    ["Himmat Singh", "H. Singh", "BAT", 6.5, false, true, 5.5],
    ["Aryan Juyal", "A. Juyal", "WK", 6.0, false, true, 4.3],
    ["Kyle Mayers", "K. Mayers", "ALL", 8.0, true, false, 21.4],
  ],
  DC: [
    ["KL Rahul", "KL Rahul", "WK", 9.5, false, false, 84.1],
    ["Axar Patel", "A. Patel", "ALL", 9.0, false, false, 77.8],
    ["Kuldeep Yadav", "K. Yadav", "BOWL", 9.0, false, false, 75.4],
    ["Mitchell Starc", "M. Starc", "BOWL", 9.0, true, false, 72.9],
    ["Tristan Stubbs", "T. Stubbs", "BAT", 8.5, true, false, 64.5],
    ["Jake Fraser-McGurk", "J. Fraser-McGurk", "BAT", 8.5, true, false, 61.2],
    ["Faf du Plessis", "F. du Plessis", "BAT", 8.5, true, false, 55.8],
    ["T. Natarajan", "T. Natarajan", "BOWL", 8.5, false, false, 53.1],
    ["Abishek Porel", "A. Porel", "WK", 8.0, false, true, 42.6],
    ["Mukesh Kumar", "M. Kumar", "BOWL", 8.0, false, false, 39.4],
    ["Harry Brook", "H. Brook", "BAT", 8.0, true, false, 34.8],
    ["Ashutosh Sharma", "Ash. Sharma", "BAT", 7.5, false, true, 31.9],
    ["Sameer Rizvi", "S. Rizvi", "BAT", 7.0, false, true, 16.4],
    ["Mohit Sharma", "Mo. Sharma", "BOWL", 7.5, false, false, 27.3],
    ["Dushmantha Chameera", "D. Chameera", "BOWL", 7.5, true, false, 18.2],
    ["Karun Nair", "K. Nair", "BAT", 7.0, false, false, 14.9],
    ["Vipraj Nigam", "V. Nigam", "ALL", 6.0, false, true, 5.2],
    ["Darshan Nalkande", "D. Nalkande", "ALL", 6.5, false, false, 7.4],
    ["Donovan Ferreira", "Do. Ferreira", "WK", 7.0, true, false, 9.1],
    ["Ajay Mandal", "A. Mandal", "ALL", 6.0, false, true, 4.5],
    ["Manvanth Kumar", "Ma. Kumar", "ALL", 6.0, false, true, 4.3],
    ["Tripurana Vijay", "T. Vijay", "ALL", 6.0, false, true, 4.1],
    ["Madhav Tiwari", "M. Tiwari", "ALL", 6.0, false, true, 4.0],
    ["Lalit Yadav", "L. Yadav", "ALL", 6.5, false, false, 8.6],
    ["Pravin Dubey", "P. Dubey", "BOWL", 6.5, false, false, 6.2],
  ],
  PBKS: [
    ["Shreyas Iyer", "S. Iyer", "BAT", 9.5, false, false, 81.2],
    ["Arshdeep Singh", "A. Singh", "BOWL", 9.0, false, false, 78.6],
    ["Yuzvendra Chahal", "Y. Chahal", "BOWL", 9.0, false, false, 76.4],
    ["Glenn Maxwell", "G. Maxwell", "ALL", 9.0, true, false, 68.9],
    ["Marcus Stoinis", "M. Stoinis", "ALL", 8.5, true, false, 62.3],
    ["Shashank Singh", "Sh. Singh", "ALL", 8.0, false, true, 49.5],
    ["Prabhsimran Singh", "P. Singh", "WK", 8.0, false, true, 46.8],
    ["Marco Jansen", "M. Jansen", "ALL", 8.5, true, false, 51.4],
    ["Lockie Ferguson", "L. Ferguson", "BOWL", 8.0, true, false, 38.7],
    ["Nehal Wadhera", "N. Wadhera", "BAT", 7.5, false, true, 29.2],
    ["Josh Inglis", "J. Inglis", "WK", 8.0, true, false, 34.1],
    ["Harpreet Brar", "H. Brar", "ALL", 7.5, false, false, 26.8],
    ["Azmatullah Omarzai", "A. Omarzai", "ALL", 7.5, true, false, 23.5],
    ["Yash Thakur", "Y. Thakur", "BOWL", 7.5, false, false, 21.9],
    ["Vijaykumar Vyshak", "V. Vyshak", "BOWL", 7.0, false, false, 15.4],
    ["Kuldeep Sen", "K. Sen", "BOWL", 7.0, false, false, 13.8],
    ["Priyansh Arya", "P. Arya", "BAT", 6.5, false, true, 11.2],
    ["Aaron Hardie", "A. Hardie", "ALL", 7.5, true, false, 14.6],
    ["Xavier Bartlett", "X. Bartlett", "BOWL", 7.0, true, false, 12.1],
    ["Suryansh Shedge", "Su. Shedge", "ALL", 6.0, false, true, 4.9],
    ["Musheer Khan", "M. Khan", "ALL", 6.5, false, true, 9.4],
    ["Harnoor Pannu", "H. Pannu", "BAT", 6.0, false, true, 4.5],
    ["Pyla Avinash", "P. Avinash", "BAT", 6.0, false, true, 4.2],
    ["Praveen Dubey", "Pr. Dubey", "BOWL", 6.5, false, false, 5.8],
    ["Vishnu Vinod", "V. Vinod", "WK", 6.5, false, false, 7.1],
  ],
  SRH: [
    ["Travis Head", "T. Head", "BAT", 10.0, true, false, 86.4],
    ["Abhishek Sharma", "A. Sharma", "ALL", 9.5, false, false, 83.2],
    ["Heinrich Klaasen", "H. Klaasen", "WK", 9.5, true, false, 84.7],
    ["Pat Cummins", "P. Cummins", "BOWL", 9.0, true, false, 77.5],
    ["Ishan Kishan", "I. Kishan", "WK", 9.0, false, false, 71.8],
    ["Mohammed Shami", "M. Shami", "BOWL", 9.0, false, false, 73.1],
    ["Nitish Kumar Reddy", "N. Reddy", "ALL", 8.5, false, false, 64.9],
    ["Harshal Patel", "H. Patel", "BOWL", 8.5, false, false, 59.4],
    ["Rahul Chahar", "R. Chahar", "BOWL", 8.0, false, false, 38.6],
    ["Adam Zampa", "A. Zampa", "BOWL", 8.0, true, false, 41.2],
    ["Abhinav Manohar", "A. Manohar", "BAT", 7.5, false, false, 24.3],
    ["Simarjeet Singh", "S. Singh", "BOWL", 7.5, false, false, 22.8],
    ["Jaydev Unadkat", "J. Unadkat", "BOWL", 7.5, false, false, 21.5],
    ["Kamindu Mendis", "K. Mendis", "ALL", 7.5, true, false, 26.1],
    ["Brydon Carse", "B. Carse", "ALL", 7.5, true, false, 18.7],
    ["Wiaan Mulder", "W. Mulder", "ALL", 7.5, true, false, 17.4],
    ["Zeeshan Ansari", "Z. Ansari", "BOWL", 6.0, false, true, 5.3],
    ["Atharva Taide", "A. Taide", "BAT", 7.0, false, false, 13.9],
    ["Sachin Baby", "S. Baby", "BAT", 6.5, false, false, 8.4],
    ["Aniket Verma", "A. Verma", "BAT", 6.0, false, true, 4.6],
    ["Eshan Malinga", "E. Malinga", "BOWL", 6.5, true, true, 7.8],
    ["Sanvir Singh", "Sa. Singh", "ALL", 6.5, false, true, 6.9],
    ["Upendra Yadav", "U. Yadav", "WK", 6.5, false, false, 6.1],
    ["Mayank Agarwal", "M. Agarwal", "BAT", 7.5, false, false, 19.2],
    ["Umran Malik", "Um. Malik", "BOWL", 7.5, false, false, 15.8],
  ],
};

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildDeterministicFormPoints(
  credits: number,
  index: number
): number[] {
  const base = Math.round(credits * 6.2);
  return [
    base + ((index * 7) % 24) - 6,
    base + ((index * 13) % 28) - 8,
    base + ((index * 19) % 30) - 5,
    base + ((index * 11) % 26) - 4,
  ];
}

function buildDeterministic3YrCareer(
  role: PlayerRole,
  credits: number
): CareerStats3Yr {
  const isBowler = role === "BOWL" || role === "ALL";
  const baseRuns = role === "BOWL" ? 45 : Math.round(credits * 42);
  const baseWickets = isBowler ? Math.round(credits * 1.8) : 0;

  return {
    "2024": {
      matches: 14,
      runs: baseRuns,
      batting_avg: role === "BOWL" ? 12.4 : 34.5,
      strike_rate: role === "BOWL" ? 118.0 : 148.6,
      wickets: baseWickets,
      economy: isBowler ? 8.15 : 0,
      fantasy_points_avg: Math.round(credits * 6.4),
    },
    "2025": {
      matches: 14,
      runs: Math.round(baseRuns * 1.06),
      batting_avg: role === "BOWL" ? 13.1 : 36.8,
      strike_rate: role === "BOWL" ? 122.5 : 153.2,
      wickets: baseWickets + (isBowler ? 2 : 0),
      economy: isBowler ? 7.95 : 0,
      fantasy_points_avg: Math.round(credits * 6.8),
    },
    "2026": {
      matches: 10,
      runs: Math.round(baseRuns * 0.78),
      batting_avg: role === "BOWL" ? 14.0 : 38.2,
      strike_rate: role === "BOWL" ? 125.0 : 156.4,
      wickets: Math.max(0, baseWickets - 2),
      economy: isBowler ? 7.82 : 0,
      fantasy_points_avg: Math.round(credits * 7.1),
    },
  };
}

async function runSeed(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  const totalPlayersCount = Object.values(SQUADS_BY_FRANCHISE).reduce(
    (acc, list) => acc + list.length,
    0
  );

  console.log(
    `⚡ Prepared ${STADIUMS_SEED.length} stadiums, ${FRANCHISES_SEED.length} franchises, and ${totalPlayersCount} IPL squad players.`
  );

  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    supabaseUrl.includes("placeholder-project.supabase.co") ||
    serviceRoleKey.includes("placeholder-service-role-key")
  ) {
    console.log(
      "ℹ️ Placeholder Supabase credentials detected. Seed payload validated cleanly in dry-run mode."
    );
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: upsertedStadiums, error: stadiumErr } = await supabase
    .from("stadiums")
    .upsert(
      STADIUMS_SEED.map((s) => ({ ...s })),
      { onConflict: "slug" }
    )
    .select("id, slug");

  if (stadiumErr) {
    throw new Error(`Stadiums upsert failed: ${stadiumErr.message}`);
  }

  const stadiumIdBySlug = new Map<string, string>();
  for (const row of upsertedStadiums ?? []) {
    stadiumIdBySlug.set(String(row.slug), String(row.id));
  }

  const franchisePayload = FRANCHISES_SEED.map((f) => ({
    code: f.code,
    name: f.name,
    city: f.city,
    primary_hex: f.primary_hex,
    secondary_hex: f.secondary_hex,
    logo_url: `/avatars/player-silhouette.svg`,
    home_stadium_id: stadiumIdBySlug.get(f.stadium_slug) ?? null,
  }));

  const { data: upsertedFranchises, error: franchiseErr } = await supabase
    .from("franchises")
    .upsert(franchisePayload, { onConflict: "code" })
    .select("id, code");

  if (franchiseErr) {
    throw new Error(`Franchises upsert failed: ${franchiseErr.message}`);
  }

  const franchiseIdByCode = new Map<FranchiseCode, string>();
  for (const row of upsertedFranchises ?? []) {
    franchiseIdByCode.set(row.code as FranchiseCode, String(row.id));
  }

  const allPlayerRows: Array<Record<string, unknown>> = [];

  for (const franchise of FRANCHISES_SEED) {
    const franchiseId = franchiseIdByCode.get(franchise.code);
    if (!franchiseId) continue;

    const squad = SQUADS_BY_FRANCHISE[franchise.code];
    squad.forEach((tuple, idx) => {
      const [
        fullName,
        shortName,
        role,
        credits,
        isOverseas,
        isUncapped,
        selectionPct,
      ] = tuple;

      const externalId = `${franchise.code.toLowerCase()}-${toSlug(fullName)}`;
      const formPoints = buildDeterministicFormPoints(credits, idx);
      const seasonTotal = formPoints.reduce((sum, val) => sum + val, 0);

      allPlayerRows.push({
        external_api_id: externalId,
        full_name: fullName,
        short_name: shortName,
        franchise_id: franchiseId,
        role,
        credits,
        batting_style: role === "BOWL" ? "Right-hand bat" : "Top-order striker",
        bowling_style:
          role === "BOWL" || role === "ALL"
            ? "Right-arm seam / spin"
            : null,
        avatar_url: "/avatars/player-silhouette.svg",
        is_overseas: isOverseas,
        is_uncapped_debutant: isUncapped,
        selection_pct: selectionPct,
        recent_form_points: formPoints,
        career_stats_3yr: buildDeterministic3YrCareer(role, credits),
        season_total_points: seasonTotal,
        is_active_squad: true,
      });
    });
  }

  const { error: playerErr } = await supabase
    .from("players")
    .upsert(allPlayerRows, { onConflict: "external_api_id" });

  if (playerErr) {
    throw new Error(`Players upsert failed: ${playerErr.message}`);
  }

  console.log(
    `✅ Successfully seeded ${upsertedStadiums?.length ?? 0} stadiums, ${upsertedFranchises?.length ?? 0} franchises, and ${allPlayerRows.length} squad players into Supabase Mumbai!`
  );
}

runSeed().catch((err) => {
  console.error("❌ Seed script failed:", err);
  process.exit(1);
});