// scheduleData.js
// Pure content — no layout/position info here. Edit times, venues, and
// descriptions freely; DesktopConstellation.jsx controls where things sit
// on the star map, MobileTimeline.jsx just reads this list top to bottom.
//
// Structure: "node" = a single standalone moment (ceremony/lunch/close).
// "cluster" = a track made of back-to-back 1-hour "slots", each slot
// holding exactly 2 events that run in parallel.

export const scheduleTimeline = [
  {
    type: "node",
    id: "inaugural",
    time: "9:00 AM",
    title: "Inaugural Ceremony",
    venue: "CSE Seminar Hall",
    desc: "Symposium opens with the lighting of the lamp and welcome address.",
  },
  {
    type: "cluster",
    id: "tech-track",
    label: "TECH TRACK",
    slots: [
      {
        id: "tech-slot-1",
        time: "10:30 – 11:30 AM",
        events: [
          {
            id: "innosphere",
            title: "InnoSphere",
            venue: "Seminar Hall",
            desc: "Paper presentation — pitch your idea in 5 + 2 minutes before the judges.",
          },
          {
            id: "techtrinity",
            title: "Tech Trinity",
            venue: "Project Lab",
            desc: "Three-round gauntlet: quiz, live debugging, then a coding challenge.",
          },
        ],
      },
      {
        id: "tech-slot-2",
        time: "11:30 AM – 12:30 PM",
        events: [
          {
            id: "visionforge",
            title: "VisionForge",
            venue: "Foreign Language Lab",
            desc: "AI image generation, then a themed website build — no templates allowed.",
          },
          {
            id: "datalens",
            title: "DataLens",
            venue: "Cloud Lab",
            desc: "Two-round data analysis challenge — answer questions, then find your own insights.",
          },
        ],
      },
    ],
  },
  {
    type: "node",
    id: "lunch",
    time: "12:30 PM – 1:30 PM",
    title: "Lunch Break",
    venue: null,
    desc: "Refuel before the non-tech track begins.",
  },
  {
    type: "cluster",
    id: "nontech-track",
    label: "NON-TECH TRACK",
    slots: [
      {
        id: "nontech-slot-1",
        time: "1:30 – 2:30 PM",
        events: [
          {
            id: "mindwar",
            title: "MindWar",
            venue: "Targaryenz Classroom",
            desc: "Debate battle — topics and sides assigned at the venue, 10 minutes to win the room.",
          },
          
          {
            id: "zonein",
            title: "ZoneIn",
            venue: "Valiriyanz Classroom",
            desc: "Free Fire MAX squad battle across multiple rounds for leaderboard points.",
          },
        ],
      },
      {
        id: "nontech-slot-2",
        time: "2:30 – 3:30 PM",
        events: [
          {
            id: "bidpro",
            title: "BidPro",
            venue: "Asgardianz Classroom",
            desc: "IPL-style auction — build the strongest squad on a virtual budget.",
          },
          {
            id: "questexe",
            title: "Quest.exe",
            venue: "Seminar Hall",
            desc: "Campus-wide treasure hunt — follow the clues, beat the other teams to the finish.",
          },
        ],
      },
    ],
  },
  {
    type: "node",
    id: "valedictory",
    time: "4:00 PM",
    title: "Valedictory & Prize Distribution",
    venue: "Main Auditorium",
    desc: "Closing ceremony, results, and prizes for the day's champions.",
  },
];
