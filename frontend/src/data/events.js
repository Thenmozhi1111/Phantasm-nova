import { getEventTrackPositions } from '../utils/trackLayout';

// Real content sourced from __TECHNICAL_EVENTS.docx (events 1-4) and
// __NON_TECH.docx (events 5-8). `icon` selects a glyph from
// src/components/events/icons.jsx for the detail page hero + gate.
// `cta` is the short heading shown above the register button on the
// detail page (mirrors the "READY TO BEGIN THE QUEST?" style).
const CONTENT = [
  {
    icon: 'bulb',
    type: 'Presentation Challenge',
    title: 'INNOSPHERE',
    tagline: 'IDEA SHOWCASE',
    description:
      'InnoSphere is a platform for participants to showcase their knowledge, ideas, research, and innovative concepts. Choose any topic that excites you and present it with confidence before the judges.',
    team: 'Solo or 2–4',
    duration: '7 Mins / Team',
    cta: 'READY TO SHARE YOUR IDEA?',
    rules: [
      'Participation can be individual or in a team of 2–4 members.',
      'The presentation should contain 7–10 slides.',
      'Maximum presentation time is 5 minutes, plus 2 minutes for Q&A.',
      'Participants should complete their presentation within the given time limit.',
      'Judging is based on content, originality, presentation skills, clarity, and ability to answer questions.',
      "The decision of the judges will be final.",
    ],
  },
  {
    icon: 'bug',
    type: 'Technical Challenge',
    title: 'TECH TRINITY',
    tagline: 'CODE GAUNTLET',
    description:
      'A three-round individual gauntlet testing technical knowledge, debugging skill, and programming ability — a quiz, a set of broken programs to fix, and a final coding challenge.',
    team: 'Individual',
    duration: '~55 Mins',
    cta: 'READY TO PROVE YOURSELF?',
    rules: [
      'Round 1 — Quiz: Computer Science & technical questions, 15–20 minutes.',
      'Round 2 — Debugging: fix any 2 of 3 buggy programs (C, Python, Java), 20 minutes.',
      'Round 3 — Coding: solve the given problems in your preferred language.',
      'Participation is strictly individual.',
      'Each round must be completed within its specified time limit.',
      'Any form of unfair assistance will lead to disqualification.',
      "Advancing between rounds follows the event's qualification criteria.",
      'Bring your own laptop if possible.',
    ],
  },
  {
    icon: 'sparkles',
    type: 'AI Creative Challenge',
    title: 'VISIONFORGE',
    tagline: 'AI CREATION',
    description:
      'An AI-powered creative challenge where participants turn visual references and ideas into digital creations — reproducing a given image, then building a website around a theme revealed on the spot.',
    team: 'Individual',
    duration: '~60 Mins',
    cta: 'READY TO CREATE?',
    rules: [
      'Round 1 — Image Generation: recreate a provided reference using any AI image tool, 15 minutes.',
      'Evaluated on accuracy, similarity to the reference, creativity, and visual quality.',
      'Round 2 — Website Generation: a theme is announced at the venue, 30–45 minutes.',
      'Any AI tool may be used, but pre-existing templates are not allowed.',
      'Evaluated on design, creativity, relevance, functionality, and overall presentation.',
      'Participation is individual — bring your own laptop if possible.',
      'Final output must be submitted or shown within the given time.',
    ],
  },
  {
    icon: 'chart',
    type: 'Data Analysis Challenge',
    title: 'DATALENS',
    tagline: 'INSIGHT DIVE',
    description:
      'A two-round data analysis challenge testing how well teams can explore, understand, and interpret data — first answering set questions, then hunting for insights entirely on their own.',
    team: 'Exactly 2',
    duration: '50 Mins',
    cta: 'READY TO DIVE IN?',
    rules: [
      'Each team must have exactly 2 members.',
      'Round 1: analyze the given dataset and answer the provided questions, 20 minutes.',
      'Round 2: explore a new dataset independently for 30 minutes — no questions given upfront.',
      'Identify patterns, trends, relationships, and useful insights, noted using pen and paper.',
      'After the analysis period, a question paper is provided based on the dataset.',
      'Permitted tools: Microsoft Excel, Power BI, Python, Tableau.',
    ],
  },
  {
    icon: 'chest',
    type: 'Campus Treasure Hunt',
    title: 'QUEST.EXE',
    tagline: 'TREASURE HUNT',
    description:
      'Quest.exe is an exciting campus-wide treasure hunt where teams follow a series of clues and solve challenges to reach the final destination. Participants need observation, teamwork, logical thinking, and speed to complete the quest before the other teams.',
    team: '3–4 Members',
    duration: '2–3 Hours',
    cta: 'READY TO BEGIN THE QUEST?',
    rules: [
      'Each team must have 3–4 members.',
      'The event will be conducted within the campus.',
      'Solving one clue will lead the team to the next stage.',
      'Teams must complete the challenges in the given order.',
      'Teams must follow the instructions given by the event coordinators.',
      'Any unfair practice or outside assistance may lead to disqualification.',
      'The team that reaches the final destination first, following all the rules, will be declared the winner.',
    ],
  },
  {
    icon: 'target',
    type: 'Free Fire MAX Tournament',
    title: 'ZONEIN',
    tagline: 'BATTLE ROYALE',
    description:
      'ZoneIn is an intense Free Fire MAX team battle where squads compete across multiple rounds to earn points. Teams must combine strategy, coordination, quick decision-making, and survival skills to finish at the top of the leaderboard.',
    team: '4 Players',
    duration: 'Multi-Round',
    cta: 'READY TO DROP IN?',
    rules: [
      'Each team must consist of 4 players.',
      'The winning team qualifies to the next level.',
      'Points are accumulated throughout the tournament.',
      'Final ranking is determined by total points earned.',
      'Players must use only their registered team members.',
      'Cheating, hacking, or unauthorized tools result in immediate disqualification.',
      "In case of a tie, the organizers' designated tie-breaking criteria apply.",
    ],
  },
  {
    icon: 'gavel',
    type: 'IPL-Style Auction',
    title: 'BIDPRO',
    tagline: 'AUCTION ARENA',
    description:
      'BidPro brings the excitement of an IPL auction. Teams receive a virtual budget and compete to build their strongest squad by strategically bidding for players — success depends on smart budgeting, selection, and strategy.',
    team: '3–4 Members',
    duration: '~90 Mins',
    cta: 'READY TO PLACE YOUR BID?',
    rules: [
      'Each team must consist of 3–4 members.',
      'The list of available players and auction details are announced at the venue.',
      'Squads must meet the specified squad-composition requirements.',
      'Once a bid is finalized, it cannot be cancelled or changed.',
      'Teams must maintain their budget throughout the auction.',
      'Winners are judged on squad composition and overall strategic selection.',
    ],
  },
  {
    icon: 'megaphone',
    type: 'Debate Battle',
    title: 'MINDWAR',
    tagline: 'BATTLE OF WORDS',
    description:
      'MindWar is a battle of ideas where teams compete through arguments, counterarguments, and persuasive communication. Topics and sides are assigned randomly at the venue, challenging participants to think fast and defend their position.',
    team: '3–4 Members',
    duration: '10 Mins / Team',
    cta: 'READY TO TAKE THE FLOOR?',
    rules: [
      'Each team must consist of 3–4 members.',
      'The debate topic is announced randomly at the venue.',
      'Teams are also assigned their supporting or opposing position randomly.',
      'Each team gets a maximum of 10 minutes for the debate.',
      'Personal attacks, offensive language, or inappropriate content are not allowed.',
      'Judging is based on content, clarity, confidence, logical reasoning, teamwork, and rebuttal.',
    ],
  },
];

const positions = getEventTrackPositions();

export const events = CONTENT.map((content, i) => ({
  id: i + 1,
  code: String(i + 1).padStart(2, '0'),
  z: positions[i].z,
  side: positions[i].side,
  facingY: positions[i].facingY,
  ...content,
}));

export const journeyStops = ['GATE', ...events.map((e) => `EVENT ${e.code}`), 'FINALE'];
