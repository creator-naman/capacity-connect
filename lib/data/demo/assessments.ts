import type { Assessment } from "@/lib/types/domain";

/**
 * DEMO subject-wise MCQ assessments, one per course. Questions are written
 * to be technically sound and plausible for IMD training contexts; answer
 * keys are deterministic for the demo.
 */
export const ASSESSMENTS: Assessment[] = [
  {
    id: "quiz-sat-110",
    courseId: "sat-110",
    title: "Satellite Meteorology — Subject Assessment",
    subject: "Satellite imagery interpretation",
    passMark: 60,
    timeLimitMinutes: 15,
    questions: [
      {
        id: "sat-q1",
        prompt:
          "INSAT-3DR is a geostationary satellite. What is the primary operational advantage of a geostationary orbit for forecasting?",
        options: [
          "It provides higher spatial resolution than any polar-orbiting satellite",
          "It images the same area continuously, capturing rapid cloud development",
          "It measures rainfall directly with radar",
          "It orbits over the poles twice a day",
        ],
        answerIndex: 1,
        explanation:
          "A geostationary satellite co-rotates with Earth, so it stares at the same disc continuously — ideal for tracking rapidly evolving systems like thunderstorms.",
      },
      {
        id: "sat-q2",
        prompt:
          "In an infrared (thermal IR) satellite image, which clouds appear brightest?",
        options: [
          "Low stratus clouds, because they are closest to the sensor",
          "Thick low clouds, because they reflect more sunlight",
          "Deep convective clouds with very cold cloud tops",
          "Fog over land during the afternoon",
        ],
        answerIndex: 2,
        explanation:
          "IR images map brightness to temperature: the coldest tops — usually deep convection — appear brightest. Visible imagery, by contrast, depends on reflectance and sun angle.",
      },
      {
        id: "sat-q3",
        prompt:
          "The water vapour (WV) channel primarily responds to moisture in which layer?",
        options: [
          "The surface boundary layer",
          "The middle-to-upper troposphere (roughly 300–600 hPa)",
          "Only cloud liquid water",
          "The stratosphere",
        ],
        answerIndex: 1,
        explanation:
          "The 6.2 µm water vapour channel senses mid-to-upper tropospheric humidity, making dry intrusions and upper-level circulation visible even where no cloud exists.",
      },
      {
        id: "sat-q4",
        prompt:
          "A western disturbance approaching north India in January typically shows up as —",
        options: [
          "A clear-sky heat low over Rajasthan",
          "An organised cloud band moving east across northwest India",
          "A cluster of intense thunderstorms over the peninsula",
          "A persistent fog bank over the Bay of Bengal",
        ],
        answerIndex: 1,
        explanation:
          "Western disturbances appear as eastward-moving cloud bands embedded in the subtropical westerlies, bringing winter rain and snow to northwest India.",
      },
      {
        id: "sat-q5",
        prompt:
          "Cloud-top temperature from IR imagery indicates a storm top near -90 °C. What does this suggest?",
        options: [
          "A shallow low-level cloud with no convection",
          "An intense storm with deep penetration into the troposphere",
          "The sensor requires calibration",
          "Cirrus over a warm surface",
        ],
        answerIndex: 1,
        explanation:
          "Tropopause temperatures over India are near -80 to -90 °C; tops that cold imply very deep, often severe convection.",
      },
    ],
  },
  {
    id: "quiz-now-102",
    courseId: "now-102",
    title: "Nowcasting — Subject Assessment",
    subject: "Very short-range forecasting",
    passMark: 60,
    timeLimitMinutes: 15,
    questions: [
      {
        id: "now-q1",
        prompt: "The nowcasting window is conventionally defined as —",
        options: [
          "0 to 2 hours",
          "0 to 6 hours",
          "6 to 12 hours",
          "12 to 24 hours",
        ],
        answerIndex: 1,
        explanation:
          "Nowcasting covers the 0–6 hour range, where extrapolation of observations beats numerical guidance thanks to model spin-up.",
      },
      {
        id: "now-q2",
        prompt:
          "A line of echoes on radar shows a bowing shape with a strong rear-inflow jet. The most likely hazard at the leading edge is —",
        options: [
          "Gentle drizzle",
          "Damaging straight-line winds",
          "Clear-sky radiation cooling",
          "A slow-moving warm front",
        ],
        answerIndex: 1,
        explanation:
          "Bow echoes are classically associated with damaging straight-line wind gusts at the leading edge.",
      },
      {
        id: "now-q3",
        prompt:
          "Linear extrapolation of radar echoes performs worst when —",
        options: [
          "Echoes are steady and slow-moving",
          "Convection is initiating or decaying rapidly",
          "The echo field is uniform stratiform rain",
          "The radar is close to the target area",
        ],
        answerIndex: 1,
        explanation:
          "Extrapolation assumes persistence; rapid growth or decay — typical of convective initiation — breaks that assumption.",
      },
      {
        id: "now-q4",
        prompt:
          "Why does numerical weather prediction have limited skill in the first two hours of a forecast?",
        options: [
          "Models run at the wrong latitudes",
          "Spin-up: the assimilation cycle has not yet balanced the initial state",
          "Computers are too slow to start",
          "Radar data cannot be used by models",
        ],
        answerIndex: 1,
        explanation:
          "Spin-up is the settling period in which newly assimilated observations adjust toward a balanced model state; extrapolation of current observations usually wins in this window.",
      },
      {
        id: "now-q5",
        prompt:
          "An AWS network shows a sharp dew-point rise and wind shift across Delhi at 14:00 IST under strong heating. This pattern suggests —",
        options: [
          "Outflow boundary that may trigger fresh convection",
          "Immediate cyclone landfall",
          "Stable stratiform drizzle",
          "A dust storm from the west",
        ],
        answerIndex: 0,
        explanation:
          "A wind shift with moisture increase marks an outflow boundary — a classic trigger for new convection when collocated with instability and heating.",
      },
    ],
  },
  {
    id: "quiz-nwp-101",
    courseId: "nwp-101",
    title: "NWP Fundamentals — Subject Assessment",
    subject: "Numerical weather prediction",
    passMark: 60,
    timeLimitMinutes: 20,
    questions: [
      {
        id: "nwp-q1",
        prompt:
          "Data assimilation in NWP is best described as —",
        options: [
          "Downloading observations into the archive",
          "Blending observations with a background forecast to estimate the initial state",
          "Averaging all models to a consensus",
          "Correcting the forecast after verification",
        ],
        answerIndex: 1,
        explanation:
          "Assimilation optimally combines a short-range background forecast with observations, weighted by their respective errors, to produce the analysis.",
      },
      {
        id: "nwp-q2",
        prompt:
          "The predictability limit of deterministic weather forecasts is roughly —",
          options: ["about 2 days", "about 2 weeks", "about 2 months", "about 2 seasons"],
        answerIndex: 1,
        explanation:
          "Chaos theory and error doubling place the practical deterministic limit near two weeks; beyond that, ensembles and statistics take over.",
      },
      {
        id: "nwp-q3",
        prompt:
          "Model output statistics (MOS) improve surface forecasts mainly by —",
        options: [
          "Increasing model resolution",
          "Statistically correcting systematic model bias using historical relationships",
          "Running the model twice",
          "Removing observations with errors",
        ],
        answerIndex: 1,
        explanation:
          "MOS learns systematic relationships between model output and observed station variables, correcting bias without touching the model itself.",
      },
      {
        id: "nwp-q4",
        prompt:
          "An ensemble forecast adds value over a single deterministic run because it —",
        options: [
          "Guarantees a more accurate single number",
          "Samples initial-condition and model uncertainty, estimating forecast confidence",
          "Removes the need for verification",
          "Runs faster",
        ],
        answerIndex: 1,
        explanation:
          "Ensembles estimate the probability distribution of outcomes; spread is a proxy for predictability and underpins probabilistic products like strike cones.",
      },
      {
        id: "nwp-q5",
        prompt:
          "For verifying a deterministic 24-h rainfall forecast at a station, which pair is standard?",
        options: [
          "Correlation and variance",
          "Bias and threat score from a contingency table",
          "RMSE of geopotential height only",
          "Anomaly correlation of temperature",
        ],
        answerIndex: 1,
        explanation:
          "Categorical rainfall verification uses a contingency table — bias and threat score (or CSI) summarise frequency and accuracy of rain/no-rain calls.",
      },
    ],
  },
  {
    id: "quiz-mon-105",
    courseId: "mon-105",
    title: "Monsoon Dynamics — Subject Assessment",
    subject: "Indian monsoon",
    passMark: 60,
    timeLimitMinutes: 15,
    questions: [
      {
        id: "mon-q1",
        prompt:
          "The operational criterion for monsoon onset over Kerala includes —",
        options: [
          "14 stations recording 2.5 mm or more rain for two consecutive days after 10 May, plus wind and OLR conditions",
          "First thunderstorm of April over Bengaluru",
          "Snowmelt peak in the Himalaya",
          "SOI turning positive for a month",
        ],
        answerIndex: 0,
        explanation:
          "Onset over Kerala is declared using rainfall at a defined station set together with broadscale wind and outgoing-longwave-radiation criteria.",
      },
      {
        id: "mon-q2",
        prompt:
          "During a 'break' phase of the monsoon, the monsoon trough typically —",
        options: [
          "Shifts southward toward its normal position",
          "Shifts northward to the Himalayan foothills",
          "Disappears entirely",
          "Moves over the Arabian Sea",
        ],
        answerIndex: 1,
        explanation:
          "In break phases the trough migrates to the foothills; the plains dry while the Himalayan foothills and northeast may see enhanced rain.",
      },
      {
        id: "mon-q3",
        prompt:
          "Monsoon depressions forming over the Bay of Bengal most often move —",
        options: [
          "West-northwest across central India",
          "Southeast into the equatorial Indian Ocean",
          "North into Tibet",
          "East toward the Philippines",
        ],
        answerIndex: 0,
        explanation:
          "Depressions follow the monsoon flow, typically tracking west-northwestward across central India and delivering widespread rain.",
      },
      {
        id: "mon-q4",
        prompt:
          "Heavy rain in a monsoon depression is usually strongest —",
        options: [
          "Symmetrically around the centre",
          "In the southwest quadrant of the system",
          "Only at the exact centre",
          "1000 km ahead of the system",
        ],
        answerIndex: 1,
        explanation:
          "The southwest quadrant combines low-level convergence and moist onshore flow, concentrating the heaviest rain there.",
      },
      {
        id: "mon-q5",
        prompt:
          "The Madden-Julian Oscillation influences the Indian monsoon primarily by —",
        options: [
          "Modulating active and break spells on the 30–60 day scale",
          "Setting the seasonal rainfall total deterministically",
          "Causing western disturbances",
          "Controlling cyclone names",
        ],
        answerIndex: 0,
        explanation:
          "MJO phases modulate convection on the intraseasonal scale, biasing the monsoon toward active or break conditions as favourable phases pass.",
      },
    ],
  },
  {
    id: "quiz-cli-220",
    courseId: "cli-220",
    title: "Climate Data Analysis — Subject Assessment",
    subject: "Climate statistics and Python workflows",
    passMark: 60,
    timeLimitMinutes: 20,
    questions: [
      {
        id: "cli-q1",
        prompt:
          "A 'normal' in climatological practice is typically computed over —",
        options: [
          "Any 10 years of data",
          "A 30-year reference period, updated by WMO convention",
          "The full record length regardless of gaps",
          "A single representative year",
        ],
        answerIndex: 1,
        explanation:
          "Climatological normals follow WMO convention: 30-year periods, currently 1991–2020, refreshed each decade.",
      },
      {
        id: "cli-q2",
        prompt:
          "Before computing trends on a station rainfall series, which check matters most?",
        options: [
          "Station metadata and homogeneity — relocations or instrument changes create false trends",
          "Whether rainfall values are integers",
          "Deleting all zero-rain days",
          "Converting to fahrenheit",
        ],
        answerIndex: 0,
        explanation:
          "Inhomogeneities from station moves or instrument changes imprint artificial jumps that dominate real trends if not corrected.",
      },
      {
        id: "cli-q3",
        prompt:
          "The Mann-Kendall test is used to —",
        options: [
          "Measure rainfall intensity",
          "Assess monotonic trend significance in a time series",
          "Interpolate missing station data",
          "Classify cloud types",
        ],
        answerIndex: 1,
        explanation:
          "Mann-Kendall is a non-parametric rank-based test for monotonic trend, robust to non-normal data typical of rainfall.",
      },
      {
        id: "cli-q4",
        prompt:
          "The Standardised Precipitation Index (SPI) expresses rainfall as —",
        options: [
          "Millimetres above normal",
          "Standard deviations from the climatological probability distribution for the timescale",
          "Percent of annual total",
          "Rain days per month",
        ],
        answerIndex: 1,
        explanation:
          "SPI fits a distribution to precipitation for an accumulation period and converts to standard deviations, making wet/dry anomalies comparable across climates.",
      },
      {
        id: "cli-q5",
        prompt:
          "In pandas, which practice best supports reproducible climate analysis?",
        options: [
          "Editing raw CSVs by hand before loading",
          "Recording data versions and processing steps in a notebook with fixed random seeds where used",
          "Hard-coding absolute local file paths",
          "Copying results into spreadsheets manually",
        ],
        answerIndex: 1,
        explanation:
          "Reproducibility comes from documented data provenance and scripted, versioned processing — the notebook workflow taught in this course.",
      },
    ],
  },
  {
    id: "quiz-cyc-301",
    courseId: "cyc-301",
    title: "Cyclone Analysis — Subject Assessment",
    subject: "Tropical cyclones over the North Indian Ocean",
    passMark: 70,
    timeLimitMinutes: 20,
    questions: [
      {
        id: "cyc-q1",
        prompt:
          "The Dvorak technique estimates tropical cyclone intensity primarily from —",
        options: [
          "Surface pressure reports from ships",
          "Satellite cloud-pattern analysis and enhancement curves",
          "Buoy wave heights",
          "Lightning counts",
        ],
        answerIndex: 1,
        explanation:
          "Dvorak relates organised satellite cloud patterns — eye, banding, central dense overcast — to intensity via empirically derived curves.",
      },
      {
        id: "cyc-q2",
        prompt:
          "The IMD four-stage warning scheme for cyclones proceeds —",
        options: [
          "Pre-cyclone watch → Cyclone alert (yellow) → Cyclone warning (orange) → Landfall outlook (red)",
          "Watch → Warning → Post-landfall → Debrief",
          "Blue → Green → Yellow → Black",
          "Advisory → Bulletin → Notice → Memo",
        ],
        answerIndex: 0,
        explanation:
          "The operational chain runs from a pre-cyclone watch several days out through colour-coded alert and warning stages to the landfall outlook.",
      },
      {
        id: "cyc-q3",
        prompt:
          "The 'cone of uncertainty' in a cyclone track forecast represents —",
        options: [
          "The region of hurricane-force winds",
          "The historical average forecast error envelope around the track",
          "The storm surge flooding zone",
          "The area of rainfall",
        ],
        answerIndex: 1,
        explanation:
          "The cone encloses the historical mean track error for the forecast period — it describes forecast uncertainty, not wind extent.",
      },
      {
        id: "cyc-q4",
        prompt:
          "Which observation most directly improves intensity analysis of a cyclone away from land?",
        options: [
          "Microwave satellite imagery revealing the inner core",
          "Road traffic reports",
          "Coastal tide gauges only",
          "Surface synoptic observations from 1500 km inland",
        ],
        answerIndex: 0,
        explanation:
          "Microwave sensors see through upper cloud decks to the low-level eye and banding structure, the key to intensity away from aircraft Reconnaissance.",
      },
      {
        id: "cyc-q5",
        prompt:
          "Rapid intensification before landfall is most dangerous because —",
        options: [
          "It shortens lead time for warnings relative to the realised intensity",
          "It always changes the track",
          "It reduces rainfall",
          "It weakens storm surge",
        ],
        answerIndex: 0,
        explanation:
          "When intensity jumps faster than warnings can be re-issued and acted on, preparedness decisions made for a weaker storm prove inadequate.",
      },
    ],
  },
  {
    id: "quiz-rad-201",
    courseId: "rad-201",
    title: "Doppler Radar — Subject Assessment",
    subject: "Radar meteorology",
    passMark: 60,
    timeLimitMinutes: 15,
    questions: [
      {
        id: "rad-q1",
        prompt:
          "The radar reflectivity factor Z is expressed in dBZ because —",
        options: [
          "Radar power returns span many orders of magnitude",
          "dBZ is a unit of rain rate",
          "It simplifies antenna calibration",
          "Decibels measure distance",
        ],
        answerIndex: 0,
        explanation:
          "Returned power varies over many orders of magnitude between drizzle and hail, so the logarithmic dBZ scale keeps products readable.",
      },
      {
        id: "rad-q2",
        prompt:
          "Range folding (ambiguous velocity) occurs when —",
        options: [
          "The transmitted pulse returns after the next pulse has been sent",
          "The antenna rotates too slowly",
          "Rain attenuates the beam completely",
          "The radar is pointed too high",
        ],
        answerIndex: 0,
        explanation:
          "Echoes beyond the unambiguous range return after the following pulse, appearing at wrong ranges — the PRF sets this limit.",
      },
      {
        id: "rad-q3",
        prompt:
          "The 'bright band' in reflectivity is caused by —",
        options: [
          "Melting snowflakes just below the 0 °C level",
          "Hail growth aloft",
          "Sea clutter",
          "Sunrise interference",
        ],
        answerIndex: 0,
        explanation:
          "Melting snowflakes are large, low-fall-speed dielectric targets, producing an enhanced reflectivity ring near the melting level.",
      },
      {
        id: "rad-q4",
        prompt:
          "Which dual-pol variable best helps distinguish hail from heavy rain?",
        options: [
          "Differential reflectivity (ZDR) combined with correlation coefficient patterns",
          "Spectrum width alone",
          "Antenna temperature",
          "Pulse repetition frequency",
        ],
        answerIndex: 0,
        explanation:
          "Hail tumbles, depressing ZDR, with characteristic rho-HV signatures — the dual-pol combination separates hail cores from rain.",
      },
      {
        id: "rad-q5",
        prompt:
          "Anomalous propagation (anaprop) is most likely when —",
        options: [
          "A strong superadiabatic lapse rate dominates",
          "A temperature inversion ducts the beam toward the ground",
          "A cyclone is nearby",
          "The beam is in free space above the boundary layer",
        ],
        answerIndex: 1,
        explanation:
          "Inversions and sharp moisture gradients refract the beam earthward; ground echoes then appear where no precipitation exists.",
      },
    ],
  },
];

export function getAssessment(assessmentId: string): Assessment | undefined {
  return ASSESSMENTS.find((assessment) => assessment.id === assessmentId);
}

export function getAssessmentForCourse(courseId: string): Assessment | undefined {
  return ASSESSMENTS.find((assessment) => assessment.courseId === courseId);
}
