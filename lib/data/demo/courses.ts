import type { Course } from "@/lib/types/domain";

/**
 * DEMO course catalog. Content mirrors the kind of training the IMD
 * training division actually runs; identifiers, dates and names are
 * fictional. In a live deployment this data comes from PostgreSQL via
 * the data access layer.
 */
export const COURSES: Course[] = [
  {
    id: "nwp-101",
    code: "NWP-101",
    title: "Numerical Weather Prediction Fundamentals",
    description:
      "A grounding in how forecast models work: from primitive equations to operational guidance. Covers model dynamics, data assimilation, post-processing, and how to interpret — and distrust — model output.",
    category: "Modelling",
    level: "advanced",
    hours: 12,
    trainerId: "trh-0201",
    trainerName: "Dr. Rajesh Iyer",
    outcomes: [
      "Explain the building blocks of a global spectral model",
      "Describe how observations are assimilated into initial conditions",
      "Apply statistical downscaling to station-level guidance",
      "Evaluate model skill using standard verification scores",
    ],
    modules: [
      {
        id: "nwp-101-m1",
        title: "Introduction to Numerical Weather Prediction",
        summary:
          "History and motivation for NWP; the suite of operational models used for Indian region forecasting.",
        minutes: 55,
        resources: [
          { id: "nwp-101-m1-r1", title: "Lecture: From Richardson to modern NWP", kind: "recorded-lecture", minutes: 42, format: "MP4", ref: "lectures/nwp101-m1.mp4" },
          { id: "nwp-101-m1-r2", title: "Slide deck: Operational model landscape", kind: "presentation", format: "PPTX", ref: "decks/nwp101-m1.pptx" },
        ],
      },
      {
        id: "nwp-101-m2",
        title: "Model Dynamics & Numerics",
        summary:
          "Primitive equations, discretisation, grid structures, and why numerical stability constrains forecasts.",
        minutes: 75,
        resources: [
          { id: "nwp-101-m2-r1", title: "Lecture: Governing equations and discretisation", kind: "recorded-lecture", minutes: 58, format: "MP4", ref: "lectures/nwp101-m2.mp4" },
          { id: "nwp-101-m2-r2", title: "Reading: Grid-point vs spectral methods", kind: "study-material", format: "PDF", ref: "readings/nwp101-m2.pdf" },
        ],
      },
      {
        id: "nwp-101-m3",
        title: "Data Assimilation",
        summary:
          "How observations constrain the model's initial state: optimal interpolation, 4D-Var, and hybrid ensembles.",
        minutes: 80,
        resources: [
          { id: "nwp-101-m3-r1", title: "Lecture: Assimilation concepts", kind: "recorded-lecture", minutes: 61, format: "MP4", ref: "lectures/nwp101-m3.mp4" },
          { id: "nwp-101-m3-r2", title: "Slide deck: Observation operators", kind: "presentation", format: "PPTX", ref: "decks/nwp101-m3.pptx" },
          { id: "nwp-101-m3-r3", title: "Dataset: Sample observation spread", kind: "dataset", format: "CSV", ref: "data/nwp101-m3-obs.csv" },
        ],
      },
      {
        id: "nwp-101-m4",
        title: "Post-processing & Downscaling",
        summary:
          "Model output statistics, bias correction, and translating gridded fields into station guidance.",
        minutes: 60,
        resources: [
          { id: "nwp-101-m4-r1", title: "Lecture: MOS and bias correction", kind: "recorded-lecture", minutes: 47, format: "MP4", ref: "lectures/nwp101-m4.mp4" },
          { id: "nwp-101-m4-r2", title: "Worksheet: Downscaling exercise", kind: "study-material", format: "PDF", ref: "readings/nwp101-m4-worksheet.pdf" },
        ],
      },
      {
        id: "nwp-101-m5",
        title: "Verification of Model Guidance",
        summary:
          "Contingency tables, equitable scores, and verifying precipitation forecasts across Indian regimes.",
        minutes: 65,
        resources: [
          { id: "nwp-101-m5-r1", title: "Lecture: Verification methods", kind: "recorded-lecture", minutes: 52, format: "MP4", ref: "lectures/nwp101-m5.mp4" },
          { id: "nwp-101-m5-r2", title: "Reference: Score formula sheet", kind: "reference", format: "PDF", ref: "readings/nwp101-m5-scores.pdf" },
        ],
      },
    ],
    addedAt: "2026-07-14",
    tags: ["models", "dynamics", "assimilation", "verification"],
  },
  {
    id: "now-102",
    code: "NOW-102",
    title: "Nowcasting & Very Short-Range Forecasting",
    description:
      "Zero-to-six-hour forecasting using radar, satellite, and station observations. Built around the Nowcast workflow used during the monsoon season at RMCs.",
    category: "Forecasting",
    level: "intermediate",
    hours: 8,
    trainerId: "trh-0201",
    trainerName: "Dr. Rajesh Iyer",
    outcomes: [
      "Interpret radar reflectivity scans for convective initiation",
      "Blend satellite and radar trends into a nowcast",
      "Issue very short-range warnings with confidence bounds",
    ],
    modules: [
      {
        id: "now-102-m1",
        title: "The Nowcasting Problem",
        summary: "Why the first six hours are the hardest: spin-up, latency, and the observation gap.",
        minutes: 40,
        resources: [
          { id: "now-102-m1-r1", title: "Lecture: The first six hours", kind: "recorded-lecture", minutes: 34, format: "MP4", ref: "lectures/now102-m1.mp4" },
        ],
      },
      {
        id: "now-102-m2",
        title: "Radar-Based Nowcasting",
        summary: "Reflectivity patterns, echo tracking, and extrapolation limits during convection.",
        minutes: 55,
        resources: [
          { id: "now-102-m2-r1", title: "Lecture: Reading the radar scan", kind: "recorded-lecture", minutes: 44, format: "MP4", ref: "lectures/now102-m2.mp4" },
          { id: "now-102-m2-r2", title: "Slide deck: Echo classification", kind: "presentation", format: "PPTX", ref: "decks/now102-m2.pptx" },
        ],
      },
      {
        id: "now-102-m3",
        title: "Satellite & Station Blending",
        summary: "Combining INSAT-3DR imagery with AWS observations for initiation signals.",
        minutes: 50,
        resources: [
          { id: "now-102-m3-r1", title: "Lecture: Blending observations", kind: "recorded-lecture", minutes: 39, format: "MP4", ref: "lectures/now102-m3.mp4" },
          { id: "now-102-m3-r2", title: "Reading: Convective initiation signatures", kind: "study-material", format: "PDF", ref: "readings/now102-m3.pdf" },
        ],
      },
      {
        id: "now-102-m4",
        title: "Issuing the Nowcast",
        summary: "Format, thresholds, and communication practice for very short-range warnings.",
        minutes: 45,
        resources: [
          { id: "now-102-m4-r1", title: "Lecture: Nowcast products", kind: "recorded-lecture", minutes: 31, format: "MP4", ref: "lectures/now102-m4.mp4" },
          { id: "now-102-m4-r2", title: "Reference: Warning threshold table", kind: "reference", format: "PDF", ref: "readings/now102-m4-thresholds.pdf" },
        ],
      },
      {
        id: "now-102-m5",
        title: "Case Lab: Monsoon Convection",
        summary: "Guided case study reconstructing a real Delhi nowcast event.",
        minutes: 60,
        resources: [
          { id: "now-102-m5-r1", title: "Case pack: 12 July convective event", kind: "study-material", format: "PDF", ref: "readings/now102-m5-case.pdf" },
          { id: "now-102-m5-r2", title: "Dataset: Radar loop excerpts", kind: "dataset", format: "ZIP", ref: "data/now102-m5-radar.zip" },
        ],
      },
    ],
    addedAt: "2026-08-02",
    tags: ["nowcasting", "radar", "convection", "warnings"],
  },
  {
    id: "sat-110",
    code: "SAT-110",
    title: "Satellite Meteorology & Image Interpretation",
    description:
      "Foundations of satellite meteorology for operational forecasters: channels of INSAT-3DR/3DS, cloud pattern recognition, and retrieving qualitative insights from imagery.",
    category: "Observation Systems",
    level: "beginner",
    hours: 6,
    trainerId: "trh-0203",
    trainerName: "Dr. Soumen Chatterjee",
    outcomes: [
      "Identify visible, IR, and water-vapour channel signatures",
      "Recognise organised convection and western disturbance cloud patterns",
      "Estimate cloud-top temperature and infer stage of development",
    ],
    modules: [
      {
        id: "sat-110-m1",
        title: "Satellites & Orbits",
        summary: "Geostationary vs polar orbits and what the INSAT series sees over the Indian Ocean region.",
        minutes: 35,
        resources: [
          { id: "sat-110-m1-r1", title: "Lecture: The geostationary view", kind: "recorded-lecture", minutes: 28, format: "MP4", ref: "lectures/sat110-m1.mp4" },
        ],
      },
      {
        id: "sat-110-m2",
        title: "Channels & Colour Schemes",
        summary: "VIS, IR, WV and composite products; when each channel earns its place.",
        minutes: 45,
        resources: [
          { id: "sat-110-m2-r1", title: "Lecture: Choosing channels", kind: "recorded-lecture", minutes: 37, format: "MP4", ref: "lectures/sat110-m2.mp4" },
          { id: "sat-110-m2-r2", title: "Slide deck: Channel cheat-sheet", kind: "presentation", format: "PPTX", ref: "decks/sat110-m2.pptx" },
        ],
      },
      {
        id: "sat-110-m3",
        title: "Cloud Pattern Recognition",
        summary: "Systems over India: monsoon depressions, thunderstorm clusters, western disturbances.",
        minutes: 55,
        resources: [
          { id: "sat-110-m3-r1", title: "Lecture: Patterns over the subcontinent", kind: "recorded-lecture", minutes: 46, format: "MP4", ref: "lectures/sat110-m3.mp4" },
          { id: "sat-110-m3-r2", title: "Atlas: Pattern reference images", kind: "reference", format: "PDF", ref: "readings/sat110-m3-atlas.pdf" },
        ],
      },
      {
        id: "sat-110-m4",
        title: "From Image to Insight",
        summary: "A worked interpretation workflow from raw scene to forecast comment.",
        minutes: 40,
        resources: [
          { id: "sat-110-m4-r1", title: "Worksheet: Interpretation drills", kind: "study-material", format: "PDF", ref: "readings/sat110-m4.pdf" },
        ],
      },
    ],
    addedAt: "2026-06-20",
    tags: ["satellite", "imagery", "convection", "beginner"],
  },
  {
    id: "mon-105",
    code: "MON-105",
    title: "Indian Monsoon Dynamics",
    description:
      "The physics and variability of the monsoon: onset, active-break cycles, depressions, and the role of ocean-atmosphere coupling, framed for operational forecasting.",
    category: "Forecasting",
    level: "intermediate",
    hours: 10,
    trainerId: "trh-0204",
    trainerName: "Prof. Arvind Deshpande",
    outcomes: [
      "Explain onset and withdrawal criteria used operationally",
      "Diagnose active-break phases using rainfall and circulation indices",
      "Describe the monsoon depression life cycle",
    ],
    modules: [
      {
        id: "mon-105-m1",
        title: "Monsoon Circulation Basics",
        summary: "Seasonal reversal, heat lows, and the TI index framing of the large-scale monsoon.",
        minutes: 50,
        resources: [
          { id: "mon-105-m1-r1", title: "Lecture: The seasonal reversal", kind: "recorded-lecture", minutes: 41, format: "MP4", ref: "lectures/mon105-m1.mp4" },
        ],
      },
      {
        id: "mon-105-m2",
        title: "Onset & Advance",
        summary: "Onset criteria, the Kerala trigger, and the progressive advance chart.",
        minutes: 55,
        resources: [
          { id: "mon-105-m2-r1", title: "Lecture: Onset operations", kind: "recorded-lecture", minutes: 44, format: "MP4", ref: "lectures/mon105-m2.mp4" },
          { id: "mon-105-m2-r2", title: "Slide deck: Onset announcement criteria", kind: "presentation", format: "PPTX", ref: "decks/mon105-m2.pptx" },
        ],
      },
      {
        id: "mon-105-m3",
        title: "Active-Break Cycles",
        summary: "Intraseasonal variability, the monsoon trough position, and forecast implications.",
        minutes: 60,
        resources: [
          { id: "mon-105-m3-r1", title: "Lecture: Spells and breaks", kind: "recorded-lecture", minutes: 49, format: "MP4", ref: "lectures/mon105-m3.mp4" },
          { id: "mon-105-m3-r2", title: "Dataset: Daily trough position series", kind: "dataset", format: "CSV", ref: "data/mon105-m3-trough.csv" },
        ],
      },
      {
        id: "mon-105-m4",
        title: "Monsoon Depressions",
        summary: "Genesis regions, climatology, structure, and heavy-rain asymmetry.",
        minutes: 55,
        resources: [
          { id: "mon-105-m4-r1", title: "Lecture: Depression life cycle", kind: "recorded-lecture", minutes: 47, format: "MP4", ref: "lectures/mon105-m4.mp4" },
          { id: "mon-105-m4-r2", title: "Reading: Rain asymmetry case notes", kind: "study-material", format: "PDF", ref: "readings/mon105-m4.pdf" },
        ],
      },
    ],
    addedAt: "2026-05-30",
    tags: ["monsoon", "dynamics", "intraseasonal"],
  },
  {
    id: "cyc-301",
    code: "CYC-301",
    title: "Tropical Cyclone Analysis & Warning Systems",
    description:
      "Advanced cycle: cyclone structure and intensity analysis over the North Indian Ocean, Dvorak technique, ensble guidance, and the impact-based warning chain end to end.",
    category: "Forecasting",
    level: "advanced",
    hours: 14,
    trainerId: "trh-0202",
    trainerName: "Dr. Meenakshi Nair",
    outcomes: [
      "Apply Dvorak intensity analysis to North Indian Ocean systems",
      "Interpret track and intensity guidance ensembles",
      "Construct impact-based warnings for coastal districts",
    ],
    modules: [
      {
        id: "cyc-301-m1",
        title: "Climatology of the North Indian Ocean",
        summary: "Basins, seasons, and why this basin is the deadliest per system.",
        minutes: 50,
        resources: [
          { id: "cyc-301-m1-r1", title: "Lecture: The NIO basin", kind: "recorded-lecture", minutes: 43, format: "MP4", ref: "lectures/cyc301-m1.mp4" },
        ],
      },
      {
        id: "cyc-301-m2",
        title: "Structure & Intensity Analysis",
        summary: "Microwave imagery, eye patterns, and Dvorak constraints in practice.",
        minutes: 85,
        resources: [
          { id: "cyc-301-m2-r1", title: "Lecture: Dvorak technique clinic", kind: "recorded-lecture", minutes: 66, format: "MP4", ref: "lectures/cyc301-m2.mp4" },
          { id: "cyc-301-m2-r2", title: "Slide deck: Microwave signatures", kind: "presentation", format: "PPTX", ref: "decks/cyc301-m2.pptx" },
        ],
      },
      {
        id: "cyc-301-m3",
        title: "Track & Intensity Guidance",
        summary: "Multi-model consensus, ensemble spread, and error cones.",
        minutes: 70,
        resources: [
          { id: "cyc-301-m3-r1", title: "Lecture: Guidance and consensus", kind: "recorded-lecture", minutes: 55, format: "MP4", ref: "lectures/cyc301-m3.mp4" },
          { id: "cyc-301-m3-r2", title: "Worksheet: Cone construction drill", kind: "study-material", format: "PDF", ref: "readings/cyc301-m3.pdf" },
        ],
      },
      {
        id: "cyc-301-m4",
        title: "Impact-Based Warning Chain",
        summary: "From 4-stage warnings to district-level action, with evacuation case reviews.",
        minutes: 75,
        resources: [
          { id: "cyc-301-m4-r1", title: "Lecture: Four-stage warning scheme", kind: "recorded-lecture", minutes: 58, format: "MP4", ref: "lectures/cyc301-m4.mp4" },
          { id: "cyc-301-m4-r2", title: "Case pack: Coastal evacuation reviews", kind: "study-material", format: "PDF", ref: "readings/cyc301-m4-cases.pdf" },
        ],
      },
    ],
    addedAt: "2026-04-18",
    tags: ["cyclone", "dvorka", "warnings", "advanced"],
  },
  {
    id: "cli-220",
    code: "CLI-220",
    title: "Climate Data Analysis with Python",
    description:
      "Hands-on analysis of station and gridded climate datasets: quality control, climatology and anomaly computation, trend tests, and reproducible notebooks.",
    category: "Climate",
    level: "intermediate",
    hours: 9,
    trainerId: "trh-0205",
    trainerName: "Dr. Lena Fernandes",
    outcomes: [
      "Load and QC station rainfall series in pandas",
      "Compute climatologies, anomalies, and standardized indices",
      "Apply Mann-Kendall trend testing with correct significance framing",
    ],
    modules: [
      {
        id: "cli-220-m1",
        title: "Datasets & Tooling",
        summary: " IMD gridded rainfall, IMDAA reanalysis, and setting up a reproducible environment.",
        minutes: 45,
        resources: [
          { id: "cli-220-m1-r1", title: "Lecture: The data landscape", kind: "recorded-lecture", minutes: 36, format: "MP4", ref: "lectures/cli220-m1.mp4" },
          { id: "cli-220-m1-r2", title: "Notebook: Environment setup", kind: "study-material", format: "IPYNB", ref: "notebooks/cli220-m1.ipynb" },
        ],
      },
      {
        id: "cli-220-m2",
        title: "Quality Control & Homogenisation",
        summary: "Outlier screening, inhomogeneity breaks, and honest metadata.",
        minutes: 60,
        resources: [
          { id: "cli-220-m2-r1", title: "Lecture: Trust but verify", kind: "recorded-lecture", minutes: 48, format: "MP4", ref: "lectures/cli220-m2.mp4" },
        ],
      },
      {
        id: "cli-220-m3",
        title: "Climatology & Anomalies",
        summary: "Normals, standardised precipitation index, and anomaly maps that stand up to review.",
        minutes: 65,
        resources: [
          { id: "cli-220-m3-r1", title: "Lecture: Normals and anomalies", kind: "recorded-lecture", minutes: 51, format: "MP4", ref: "lectures/cli220-m3.mp4" },
          { id: "cli-220-m3-r2", title: "Notebook: SPI computation", kind: "study-material", format: "IPYNB", ref: "notebooks/cli220-m3.ipynb" },
        ],
      },
      {
        id: "cli-220-m4",
        title: "Trends & Significance",
        summary: "Mann-Kendall, Sen's slope, autocorrelation caveats, and reporting results.",
        minutes: 55,
        resources: [
          { id: "cli-220-m4-r1", title: "Lecture: Trend testing clinic", kind: "recorded-lecture", minutes: 44, format: "MP4", ref: "lectures/cli220-m4.mp4" },
          { id: "cli-220-m4-r2", title: "Reference: Reporting checklist", kind: "reference", format: "PDF", ref: "readings/cli220-m4.pdf" },
        ],
      },
    ],
    addedAt: "2026-08-28",
    tags: ["python", "climate", "analysis", "new"],
  },
  {
    id: "rad-201",
    code: "RAD-201",
    title: "Doppler Radar Meteorology",
    description:
      "How the S-band and X-band Doppler network works: reflectivity, velocity, dual-pol products, and their operational interpretation, including data quality pitfalls.",
    category: "Observation Systems",
    level: "intermediate",
    hours: 9,
    trainerId: "trh-0215",
    trainerName: "Vikram Rao",
    outcomes: [
      "Explain the principle of Doppler velocity measurement",
      "Interpret base products and dual-pol hydrometeor classes",
      "Recognise artefacts: anomalous propagation, range folding, attenuation",
    ],
    modules: [
      {
        id: "rad-201-m1",
        title: "Radar Principles",
        summary: "The radar equation, reflectivity factor, and why dBZ is logarithmic.",
        minutes: 50,
        resources: [
          { id: "rad-201-m1-r1", title: "Lecture: The radar equation", kind: "recorded-lecture", minutes: 41, format: "MP4", ref: "lectures/rad201-m1.mp4" },
        ],
      },
      {
        id: "rad-201-m2",
        title: "Velocity & Dual-Polarisation",
        summary: "Doppler velocity, spectrum width, ZDR, KDP, and hydrometeor classification.",
        minutes: 70,
        resources: [
          { id: "rad-201-m2-r1", title: "Lecture: Dual-pol products", kind: "recorded-lecture", minutes: 57, format: "MP4", ref: "lectures/rad201-m2.mp4" },
          { id: "rad-201-m2-r2", title: "Slide deck: Hydrometeor classes", kind: "presentation", format: "PPTX", ref: "decks/rad201-m2.pptx" },
        ],
      },
      {
        id: "rad-201-m3",
        title: "Data Quality & Artefacts",
        summary: "Anaprop, bright band, folding, and blocking by the Western Ghats.",
        minutes: 55,
        resources: [
          { id: "rad-201-m3-r1", title: "Lecture: When radar lies", kind: "recorded-lecture", minutes: 43, format: "MP4", ref: "lectures/rad201-m3.mp4" },
          { id: "rad-201-m3-r2", title: "Atlas: Artefact gallery", kind: "reference", format: "PDF", ref: "readings/rad201-m3-atlas.pdf" },
        ],
      },
      {
        id: "rad-201-m4",
        title: "Operational Interpretation",
        summary: "Product workflows at an RMC: from scan to nowcast comment.",
        minutes: 50,
        resources: [
          { id: "rad-201-m4-r1", title: "Worksheet: Scan interpretation drills", kind: "study-material", format: "PDF", ref: "readings/rad201-m4.pdf" },
        ],
      },
    ],
    addedAt: "2026-03-22",
    tags: ["radar", "dual-pol", "observations"],
  },
  {
    id: "agr-115",
    code: "AGR-115",
    title: "Agrometeorology for Field Advisory Services",
    description:
      "Translating weather forecasts into farm-level advisories: crop water needs, heat and frost stress, and the district advisory workflow used with state agriculture departments.",
    category: "Applications",
    level: "beginner",
    hours: 5,
    trainerId: "trh-0206",
    trainerName: "Sunita Kulkarni",
    outcomes: [
      "Relate evapotranspiration and soil moisture to irrigation advice",
      "Draft a district agromet advisory bulletin",
      "Communicate uncertainty in farmer-facing language",
    ],
    modules: [
      {
        id: "agr-115-m1",
        title: "Weather & Crops",
        summary: "Critical growth stages and the weather sensitivities that drive advisories.",
        minutes: 35,
        resources: [
          { id: "agr-115-m1-r1", title: "Lecture: Crop weather calendars", kind: "recorded-lecture", minutes: 27, format: "MP4", ref: "lectures/agr115-m1.mp4" },
        ],
      },
      {
        id: "agr-115-m2",
        title: "Water Balance Basics",
        summary: "Reference evapotranspiration, effective rainfall, and simple water-budget advice.",
        minutes: 45,
        resources: [
          { id: "agr-115-m2-r1", title: "Lecture: The water budget", kind: "recorded-lecture", minutes: 35, format: "MP4", ref: "lectures/agr115-m2.mp4" },
          { id: "agr-115-m2-r2", title: "Worksheet: Advisory calculation", kind: "study-material", format: "PDF", ref: "readings/agr115-m2.pdf" },
        ],
      },
      {
        id: "agr-115-m3",
        title: "Writing the Bulletin",
        summary: "Structure, plain language, and review workflow of the weekly agromet bulletin.",
        minutes: 40,
        resources: [
          { id: "agr-115-m3-r1", title: "Lecture: Bulletin clinic", kind: "recorded-lecture", minutes: 29, format: "MP4", ref: "lectures/agr115-m3.mp4" },
          { id: "agr-115-m3-r2", title: "Reference: Bulletin template", kind: "reference", format: "PDF", ref: "readings/agr115-m3-template.pdf" },
        ],
      },
    ],
    addedAt: "2026-02-11",
    tags: ["agriculture", "advisories", "beginner"],
  },
];

export const COURSE_CATEGORIES = [
  "Forecasting",
  "Modelling",
  "Observation Systems",
  "Climate",
  "Applications",
] as const;

export function getCourse(courseId: string): Course | undefined {
  return COURSES.find((course) => course.id === courseId);
}
