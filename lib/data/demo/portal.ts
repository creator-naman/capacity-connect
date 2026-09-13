import type {
  Announcement,
  Achievement,
  Questionnaire,
  TrainerProfile,
  CompetencyRequirement,
  TraineeProfile,
} from "@/lib/types/domain";

/** DEMO announcements published by administrators. */
export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-014",
    title: "New course live: Climate Data Analysis with Python",
    body: "CLI-220 covers quality control, climatology, anomalies, and trend testing using IMD gridded datasets in reproducible notebooks. Enrollment is open to all trainee accounts.",
    publishedAt: "2026-08-29T09:30:00",
    audience: "all",
  },
  {
    id: "ann-013",
    title: "Monsoon 2026 cohort: enrollment closing",
    body: "Enrollment for the Monsoon 2026 cohort of NOW-102 closes at the end of this month. Complete pending modules before the cohort review.",
    publishedAt: "2026-08-21T14:00:00",
    audience: "trainee",
  },
  {
    id: "ann-011",
    title: "Scheduled maintenance of the radar product archive",
    body: "The Doppler radar product archive will be read-only over the coming weekend while storage is migrated. Download any case-pack material you need in advance.",
    publishedAt: "2026-08-12T11:15:00",
    audience: "all",
  },
];

/** DEMO achievements recognisable on the trainee dashboard. */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach-001",
    title: "First certificate earned",
    description: "Completed Satellite Meteorology & Image Interpretation with a passed assessment.",
    icon: "award",
    earnedAt: "2026-08-18T16:20:00",
  },
  {
    id: "ach-002",
    title: "Consistent learner",
    description: "Completed modules on five consecutive days during the monsoon cohort.",
    icon: "flame",
    earnedAt: "2026-08-27T10:05:00",
  },
];

/** DEMO questionnaires assigned to trainees by trainers, with deadlines. */
export const QUESTIONNAIRES: Questionnaire[] = [
  {
    id: "qre-201",
    title: "Training needs survey — Q3",
    description:
      "Help the training division plan the next quarter's catalog. Your responses guide which subjects get new courses.",
    trainerName: "Training Division",
    deadline: "2026-09-30",
    questions: [
      { id: "q1", prompt: "Which subject area should the division prioritise next quarter?", type: "choice", options: ["Aviation meteorology", "Flood forecasting", "Urban nowcasting", "Machine learning for weather"] },
      { id: "q2", prompt: "How would you rate the current course pacing?", type: "rating" },
      { id: "q3", prompt: "What is the single biggest gap in your current toolkit?", type: "text" },
    ],
  },
  {
    id: "qre-202",
    title: "NOW-102 cohort mid-course check-in",
    description:
      "A short mid-course questionnaire for the Monsoon 2026 cohort of Nowcasting & Very Short-Range Forecasting.",
    trainerName: "Dr. Rajesh Iyer",
    deadline: "2026-09-18",
    questions: [
      { id: "q1", prompt: "Are the recorded lectures clear at the current pace?", type: "rating" },
      { id: "q2", prompt: "Which case lab would you like more time on?", type: "text" },
    ],
  },
];

/** DEMO trainer roster used across trainer monitoring and competency mapping. */
export const TRAINERS: TrainerProfile[] = [
  {
    id: "trh-0201",
    name: "Dr. Rajesh Iyer",
    title: "Senior Scientist, Numerical Weather Prediction",
    specialisation: "Numerical weather prediction",
    yearsExperience: 16,
    expertise: ["NWP model interpretation", "Data assimilation", "Nowcasting", "Model verification"],
    coursesTaught: ["nwp-101", "now-102"],
    bio: "Leads the model guidance desk at the national centre and has conducted NWP induction training for eleven batches of scientists.",
  },
  {
    id: "trh-0202",
    name: "Dr. Meenakshi Nair",
    title: "Head, Cyclone Warning Division",
    specialisation: "Tropical cyclone analysis",
    yearsExperience: 21,
    expertise: ["Dvorak technique", "Cyclone warning systems", "Impact-based forecasting", "Microwave imagery"],
    coursesTaught: ["cyc-301"],
    bio: "Two decades of operational cyclone warning duty across both coasts, with a focus on impact-based service delivery.",
  },
  {
    id: "trh-0203",
    name: "Dr. Soumen Chatterjee",
    title: "Scientist-F, Satellite Meteorology",
    specialisation: "Satellite meteorology",
    yearsExperience: 18,
    expertise: ["Satellite imagery interpretation", "INSAT products", "Convective initiation", "Retrieval methods"],
    coursesTaught: ["sat-110"],
    bio: "Works on INSAT product development and trains forecasters on imagery-first diagnosis.",
  },
  {
    id: "trh-0204",
    name: "Prof. Arvind Deshpande",
    title: "Visiting Professor, Monsoon Studies",
    specialisation: "Monsoon meteorology",
    yearsExperience: 24,
    expertise: ["Monsoon dynamics", "Intraseasonal variability", "Monsoon depressions", "Seasonal prediction"],
    coursesTaught: ["mon-105"],
    bio: "Researcher and educator on monsoon variability with long collaboration with operational forecasting wings.",
  },
  {
    id: "trh-0205",
    name: "Dr. Lena Fernandes",
    title: "Scientist-C, Climate Services",
    specialisation: "Climate data analysis",
    yearsExperience: 9,
    expertise: ["Python for climate data", "Trend analysis", "Climate statistics", "Gridded datasets"],
    coursesTaught: ["cli-220"],
    bio: "Builds reproducible analysis workflows for climate services and teaches the division's Python curriculum.",
  },
  {
    id: "trh-0206",
    name: "Sunita Kulkarni",
    title: "Meteorologist-A, Agromet Advisory Services",
    specialisation: "Agrometeorology",
    yearsExperience: 7,
    expertise: ["Agromet advisories", "Crop weather calendars", "Evapotranspiration", "Farmer communication"],
    coursesTaught: ["agr-115"],
    bio: "Coordinates district-level agromet advisory drafting and farmer outreach programmes.",
  },
];

/** DEMO competency requirements a subject-matter desk might raise. */
export const COMPETENCIES: CompetencyRequirement[] = [
  {
    id: "cmp-01",
    subject: "Numerical Weather Prediction — data assimilation module",
    skills: ["Data assimilation", "NWP model interpretation"],
    minYearsExperience: 8,
  },
  {
    id: "cmp-02",
    subject: "Nowcasting — convective initiation module",
    skills: ["Nowcasting", "Convective initiation", "Satellite imagery interpretation"],
    minYearsExperience: 5,
  },
  {
    id: "cmp-03",
    subject: "Cyclone intensity analysis refresher",
    skills: ["Dvorak technique", "Microwave imagery", "Cyclone warning systems"],
    minYearsExperience: 10,
  },
  {
    id: "cmp-04",
    subject: "Climate statistics for new recruits",
    skills: ["Climate statistics", "Python for climate data"],
    minYearsExperience: 4,
  },
  {
    id: "cmp-05",
    subject: "Agromet bulletin writing workshop",
    skills: ["Agromet advisories", "Farmer communication"],
    minYearsExperience: 3,
  },
];

/** DEMO profile seed for the signed-in trainee (Ananya Verma). */
export const TRAINEE_PROFILE: TraineeProfile = {
  name: "Ananya Verma",
  email: "ananya.verma@imd.demo",
  phone: "+91 98xxx xx402",
  designation: "Scientist-B, Regional Meteorological Centre",
  region: "New Delhi",
  joinedOn: "2025-11-03",
  qualifications: [
    {
      id: "qlf-1",
      degree: "M.Tech, Atmospheric Science",
      institution: "IIT Delhi",
      year: 2025,
    },
    {
      id: "qlf-2",
      degree: "B.Sc. (Hons) Physics",
      institution: "University of Delhi",
      year: 2023,
    },
  ],
  experience: [
    {
      id: "exp-1",
      role: "Scientist-B",
      organisation: "India Meteorological Department",
      period: "Nov 2025 — present",
      summary: "Rotational duty at the RMC New Delhi forecasting desk; synoptic and nowcast support.",
    },
    {
      id: "exp-2",
      role: "Research Intern",
      organisation: "IITM Pune",
      period: "May 2024 — Jul 2024",
      summary: "Monsoon depression tracking using gridded rainfall datasets.",
    },
  ],
  skills: ["Synoptic analysis", "Python", "Radar interpretation", "Data visualisation"],
  interests: ["Nowcasting", "Monsoon dynamics", "Machine learning applications"],
};
