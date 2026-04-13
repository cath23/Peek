import type { ConversationData } from './topicData'

export interface Huddle {
  id: string
  topicId: string
  members: string[]           // author names (matches ConversationData.authorName)
  state: 'active' | 'resolved'
  lastActivity: string        // display timestamp
  /** The opening message — same shape as a conversation */
  conversation: ConversationData
}

/**
 * Mock Huddle data keyed by topicId.
 * Each topic can have zero or more Huddles.
 */
export const TOPIC_HUDDLES: Record<string, Huddle[]> = {

  // Topic 1: CI/CD pipeline stuck during build stage
  '1': [
    {
      id: 'h1_1',
      topicId: '1',
      members: ['Tom Braun', 'Liam Chen'],
      state: 'resolved',
      lastActivity: 'Mon, Sep 2',
      conversation: {
        id: 'h1_1_c1',
        authorName: 'Tom Braun',
        timestamp: '9:40 AM',
        body: "Liam, before I post to the main thread I want to double-check something. The dep conflict looks like it's @testing-library/react 15.x but I'm also seeing a transitive resolution issue with jest-dom.\n\nCan you confirm which lockfile you're seeing the mismatch in? I don't want to pin the wrong package.",
        replyCount: 3,
        isResolved: true,
        resolvedBy: 'Tom Braun',
        resolutionMessage: 'Confirmed it was only @testing-library/react. Pinned to 14.x.',
      },
    },
  ],

  // Topic 2: Launch checklist for v2 of the mobile app
  '2': [
    {
      id: 'h2_1',
      topicId: '2',
      members: ['Nina Park', 'Carlos Mendez'],
      state: 'resolved',
      lastActivity: 'Thu, Aug 29',
      conversation: {
        id: 'h2_1_c1',
        authorName: 'Nina Park',
        timestamp: '9:30 AM',
        body: "Carlos, the EU push notification issue is more complex than I initially thought. The Frankfurt SNS endpoint is configured correctly but the topic ARN has a region mismatch.\n\nI want to align with you before escalating to the backend team. Can we walk through the AWS config together?",
        replyCount: 5,
      },
    },
    {
      id: 'h2_2',
      topicId: '2',
      members: ['Nina Park', 'Raj Patel'],
      state: 'active',
      lastActivity: 'Fri, Aug 30',
      conversation: {
        id: 'h2_2_c1',
        authorName: 'Raj Patel',
        timestamp: '10:15 AM',
        body: "Nina, quick flag before the build goes to App Store review. The Face ID fix I shipped works on iOS 16.1 but I haven't been able to test on 16.0.\n\nDo we have a 16.0 device in the office or should I spin up a simulator? Don't want to risk a rejection.",
        replyCount: 2,
      },
    },
  ],

  // Topic 3: Ongoing onboarding issues
  '3': [
    {
      id: 'h3_1',
      topicId: '3',
      members: ['Greg Bothman', 'AI'],
      state: 'active',
      lastActivity: 'Today',
      conversation: {
        id: 'h3_1_c1',
        authorName: 'Greg Bothman',
        timestamp: '10:00 AM',
        body: "I need to think through the liveness check alternatives before proposing anything to the team.\n\nThe current SDK (3.1.0) has known issues with low-light face detection and unclear error states. SDK 3.4.2 fixes most of this but I want to explore whether there are other options worth considering.\n\nWhat are the main approaches to liveness verification in mobile onboarding flows?",
        replyCount: 4,
      },
    },
    {
      id: 'h3_2',
      topicId: '3',
      members: ['Greg Bothman', 'Alice Curtis'],
      state: 'active',
      lastActivity: 'Today',
      conversation: {
        id: 'h3_2_c1',
        authorName: 'Greg Bothman',
        timestamp: '11:30 AM',
        body: "Alice, before we share the UX spec with the wider group I want to align on the guidance screen approach.\n\nYou mentioned Option A (static illustrations) and Option B (looping animation). I'm leaning A but want to hear your perspective on whether the animation could actually help users position their face correctly.",
        replyCount: 6,
      },
    },
  ],

  // Topic 9: Feedback on mobile onboarding flow
  '9': [
    {
      id: 'h9_1',
      topicId: '9',
      members: ['Alice Curtis', 'Jake Walter'],
      state: 'active',
      lastActivity: 'Wed, Sep 4',
      conversation: {
        id: 'h9_1_c1',
        authorName: 'Alice Curtis',
        timestamp: '11:30 AM',
        body: "Jake, I want to get your take on the 'You\'re all set' screen before I finalize the mockups. The current version is a dead end with no CTA.\n\nI'm considering two options:\n- Primary 'Go to dashboard' button with a secondary 'Take a tour'\n- Single 'Continue' that leads to a contextual onboarding overlay\n\nWhich feels more aligned with how users actually behave after onboarding?",
        replyCount: 3,
      },
    },
  ],
}
