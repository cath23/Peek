import type { ConvGroup } from './topicData'

export const DM_CONVERSATIONS: Record<number, ConvGroup[]> = {

  // ── Alice Johnson (unread) ─────────────────────────────────────────────────
  1: [
    {
      dateLabel: 'Yesterday',
      convs: [
        {
          id: 'dm1_c1',
          authorName: 'Alice Johnson',
          timestamp: '3:22 PM',
          body: "Hey, have you had a chance to look at Zendesk ticket #48821 that I flagged last week? The customer is escalating and our SLA window closes tomorrow EOD. We need to give them something concrete.",
        },
        {
          id: 'dm1_c2',
          authorName: 'You',
          timestamp: '3:45 PM',
          body: "Just pulled it up. The issue is in the rate limiting logic — when a user hits our API more than 5 times within 10 seconds from a mobile network, they get a 429, but the client-side retry handler doesn't back off at all. It just fires again immediately, gets another 429, and the user sees a permanent error state. I'm working on an exponential backoff fix now.",
          replyCount: 1,
        },
        {
          id: 'dm1_c3',
          authorName: 'Alice Johnson',
          timestamp: '3:48 PM',
          body: "That explains it perfectly — the customer was describing exactly that loop. Can you flag me when it's deployed to staging? I want to verify before we respond to them. I'll hold them off until tomorrow morning.",
        },
        {
          id: 'dm1_c4',
          authorName: 'You',
          timestamp: '5:10 PM',
          body: "Fix is in staging now — branch `fix/rate-limit-backoff`. Retry now waits 1s, 2s, 4s before surfacing an error to the user. Should cover the mobile network blip scenario entirely. Let me know what you find.",
          replyCount: 2,
        },
        {
          id: 'dm1_c5',
          authorName: 'Alice Johnson',
          timestamp: '5:34 PM',
          body: "Just tested it — the retry behaviour is exactly right. Responding to the customer now and flagging the staging fix for production deployment in tomorrow's release window. Thank you, that was fast.",
        },
      ],
    },
    {
      dateLabel: 'Today',
      convs: [
        {
          id: 'dm1_c6',
          authorName: 'Alice Johnson',
          timestamp: '9:10 AM',
          body: "Morning! Two things — (1) customer confirmed the staging fix resolves their issue, they're happy to wait for the production release. (2) Are you joining the design review at 2pm? Your input on the API constraints for the export feature would be really valuable — the design team doesn't have full visibility on what's feasible.",
          hasNewReply: true,
        },
      ],
    },
  ],

  // ── Bob Smith ──────────────────────────────────────────────────────────────
  2: [
    {
      dateLabel: 'Wed, August 28',
      convs: [
        {
          id: 'dm2_c1',
          authorName: 'Bob Smith',
          timestamp: '10:15 AM',
          body: "Hey — quick one. I'm putting together the Q3 board deck and need the key product metrics. Specifically: MAU, DAU, 30-day retention rate, and if you can get it, trial-to-paid conversion. Needs to be ready by Monday morning.",
        },
        {
          id: 'dm2_c2',
          authorName: 'You',
          timestamp: '10:40 AM',
          body: "I can pull all of those from the analytics dashboard. I'll also segment the retention rate by acquisition channel if that's useful — usually tells a clearer story for board-level conversations. Give me until end of day Friday.",
        },
        {
          id: 'dm2_c3',
          authorName: 'Bob Smith',
          timestamp: '10:43 AM',
          body: "Channel-segmented retention would be great, yes. No rush on the exact timing — Monday morning is fine. One more thing: do we have anything on feature adoption for the new dashboard? I'd like to show the board that users are engaging with it, not just logging in.",
        },
        {
          id: 'dm2_c4',
          authorName: 'You',
          timestamp: '11:00 AM',
          body: "We have the event data for dashboard interactions — I can put together a quick view showing weekly active users of the dashboard feature vs overall WAU. Should give a good sense of adoption without drowning them in numbers.",
        },
      ],
    },
    {
      dateLabel: 'Fri, August 30',
      convs: [
        {
          id: 'dm2_c5',
          authorName: 'You',
          timestamp: '4:30 PM',
          body: "Metrics doc is ready and shared with you in Notion. Highlights: MAU is up 12% QoQ, 30-day retention at 68% overall (organic acquisition performing 14 points above paid). Trial-to-paid conversion at 23%, slightly below last quarter but the absolute numbers are higher. Dashboard feature adoption at 41% of MAUs in first 30 days — strong for a new feature.",
          replyCount: 1,
        },
        {
          id: 'dm2_c6',
          authorName: 'Bob Smith',
          timestamp: '4:52 PM',
          body: "This is exactly what I needed — really appreciate you going the extra mile on the channel segmentation and the dashboard adoption cut. I'll incorporate it into the deck over the weekend. Have a good one.",
        },
      ],
    },
  ],

  // ── Carol White ────────────────────────────────────────────────────────────
  3: [
    {
      dateLabel: 'Thu, August 29',
      convs: [
        {
          id: 'dm3_c1',
          authorName: 'Carol White',
          timestamp: '4:10 PM',
          body: "Hey! Just wanted to reach out — the demo you gave at the All Hands was genuinely impressive. Several stakeholders came up to me after and asked for a deeper session. Would you be up for a follow-up in October with a broader audience?",
        },
        {
          id: 'dm3_c2',
          authorName: 'You',
          timestamp: '4:32 PM',
          body: "That's great to hear, thank you! Absolutely up for it. I was thinking a live walkthrough with a real use case rather than a polished deck might land better with that audience — more credibility and easier to pivot if they have questions. Should I coordinate directly with you or go through your EA?",
        },
        {
          id: 'dm3_c3',
          authorName: 'Carol White',
          timestamp: '4:38 PM',
          body: "Coordinate with me directly — it'll be faster. I'm thinking second or third week of October, 45-minute slot. I'll send you a few options early next week. Format idea sounds perfect — the stakeholders who were most interested are very hands-on, they'll appreciate seeing it work live rather than in slides.",
        },
        {
          id: 'dm3_c4',
          authorName: 'You',
          timestamp: '4:45 PM',
          body: "Sounds great. I'll prep a scenario that maps to their specific use case — if you can share which team area they're from before then, I can tailor the example accordingly. Looking forward to it.",
        },
        {
          id: 'dm3_c5',
          authorName: 'Carol White',
          timestamp: '4:50 PM',
          body: "Will do — it's primarily the Growth and RevOps leads, so something around analytics and reporting workflow would resonate most. I'll include that in the calendar invite. Thanks again — this kind of thing really helps with internal visibility for the team.",
        },
      ],
    },
  ],
}
