export interface SpeakingAppearance {
  title: string;
  event: string;
  date: Date;
  location: string;
  format: 'Conference Talk' | 'Workshop' | 'Panel' | 'Podcast';
  topics: string[];
  summary: string;
  slidesUrl?: string;
  recordingUrl?: string;
  eventUrl?: string;
}

export interface SpeakingTopicProposal {
  title: string;
  audience: string;
  description: string;
  tags: string[];
}

/**
 * Add confirmed talks, workshops, and appearances here.
 * Left empty intentionally for Phase 1 so no unverified events are listed.
 */
export const speakingAppearances: SpeakingAppearance[] = [];

export const speakingTopicProposals: SpeakingTopicProposal[] = [
  {
    title: 'Modern PHP Evolution: Practical Features from 8.0 to 8.6',
    audience: 'PHP & Backend Engineers',
    description:
      'A pragmatic walkthrough of type-system improvements, property hooks, cleaner composition, and migration patterns for production codebases.',
    tags: ['PHP', 'Language Design', 'Clean Code'],
  },
  {
    title: 'Designing Maintainable WordPress & WooCommerce Extensions',
    audience: 'WordPress Developers & Engineering Teams',
    description:
      'Applying dependency boundaries, automated testing, and predictable hook architectures in long-lived WordPress plugins.',
    tags: ['WordPress', 'WooCommerce', 'Architecture'],
  },
  {
    title: 'Reliable API Integrations: Webhooks, Retries, and Idempotency',
    audience: 'Full-Stack & Backend Developers',
    description:
      'Defensive patterns for handling third-party webhooks, duplicate deliveries, signature verification, and failure recovery.',
    tags: ['APIs', 'Reliability', 'Laravel'],
  },
];
