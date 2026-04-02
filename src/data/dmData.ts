import type { ConvGroup } from './topicData'

export const DM_CONVERSATIONS: Record<number, ConvGroup[]> = {

  // Alice Johnson (unread)
  1: [
    {
      dateLabel: 'Mon, August 26',
      convs: [
        {
          id: 'dm1_c1',
          authorName: 'Alice Johnson',
          timestamp: '9:45 AM',
          body: "Have you had a chance to look at Zendesk ticket #48821 that I flagged last week?\n\nThe customer is escalating and our SLA window closes tomorrow EOD. We need to give them something concrete.",
        },
        {
          id: 'dm1_c2',
          authorName: 'Alice Johnson',
          timestamp: '2:10 PM',
          body: "Separate issue worth flagging: the onboarding drop-off spike this week looks concentrated in the EU region specifically.\n\nI checked the Mixpanel funnel by geography and EU completions dropped 28% in 5 days while everywhere else held flat. Might be worth ruling out a regional infra issue before we assume it's a UX problem.",
        },
        {
          id: 'dm1_c3',
          authorName: 'You',
          timestamp: '3:30 PM',
          body: "Checked the error logs for EU-West-1. There's a noticeable uptick in 503s from the identity verification service between 9am and 11am CET.\n\nLooks like a capacity issue during peak hours rather than anything in the product flow. I'll share the log link so you can include it in the incident note.",
          reactions: [{ emoji: '👍', count: 1, owner: 'others' }],
          replyCount: 2,
        },
      ],
    },
    {
      dateLabel: 'Yesterday',
      convs: [
        {
          id: 'dm1_c4',
          authorName: 'You',
          timestamp: '10:05 AM',
          body: "Rate limiting fix from last week is now live in production, build #5102.\n\nExponential backoff is working as expected in the monitoring data, no more 429 loops showing up. Zendesk ticket #48821 can be closed on your end.",
          replyCount: 1,
        },
        {
          id: 'dm1_c5',
          authorName: 'You',
          timestamp: '1:45 PM',
          body: "One thing worth raising in the 2pm design review: the current export design assumes synchronous generation, but for datasets over 10k rows that's going to be a problem.\n\nWe'll need either a job queue with a download link or pagination on the export endpoint. I'll bring both options written up so we can decide in the room.",
          replyCount: 3,
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
          body: "Morning! The design team incorporated your async export feedback from yesterday, they're now going with the job queue approach. They've got a draft of the loading state and download-ready notification in Figma if you want to take a look before it goes to eng.\n\nAlso the customer on ticket #48821 confirmed the rate limiting fix resolved their issue. Closing it out now.",
          hasNewReply: true,
        },
      ],
    },
  ],

  // Bob Smith
  2: [
    {
      dateLabel: 'Wed, August 21',
      convs: [
        {
          id: 'dm2_c1',
          authorName: 'Bob Smith',
          timestamp: '10:15 AM',
          body: "Hey, quick one. I'm putting together the Q3 board deck and need the key product metrics by Monday morning.\n\nSpecifically: MAU, DAU, 30-day retention rate, and trial-to-paid conversion if you can get it.",
        },
        {
          id: 'dm2_c2',
          authorName: 'Bob Smith',
          timestamp: '3:05 PM',
          body: "One more thing while I have you: do we have any data on feature adoption for the new dashboard?\n\nI'd like to show the board that users are actually engaging with it, not just logging in. Even a rough weekly active users breakdown for that feature would do it.",
        },
      ],
    },
    {
      dateLabel: 'Fri, August 23',
      convs: [
        {
          id: 'dm2_c3',
          authorName: 'You',
          timestamp: '4:30 PM',
          body: "Metrics doc is ready and shared in Notion. Highlights:\n\n- MAU is up 12% QoQ\n- 30-day retention at 68% overall (organic acquisition running 14 points above paid)\n- Trial-to-paid conversion at 23%, slightly below last quarter but absolute numbers are higher\n- Dashboard feature adoption at 41% of MAUs in first 30 days\n\nLet me know if you need any numbers reframed for the board context.",
          reactions: [{ emoji: '🙏', count: 1, owner: 'others' }, { emoji: '💯', count: 1, owner: 'others' }],
          replyCount: 1,
        },
      ],
    },
    {
      dateLabel: 'Mon, August 26',
      convs: [
        {
          id: 'dm2_c4',
          authorName: 'Bob Smith',
          timestamp: '9:00 AM',
          body: "Board presentation went well. The retention segmentation landed really well and a couple of board members asked follow-up questions specifically about the paid acquisition underperformance.\n\nWe're now running a proper attribution review in Q4 as a result. Good data drives good decisions.",
        },
      ],
    },
  ],

  // Carol White
  3: [
    {
      dateLabel: 'Thu, August 29',
      convs: [
        {
          id: 'dm3_c1',
          authorName: 'Carol White',
          timestamp: '4:10 PM',
          body: "The demo you gave at the All Hands was genuinely impressive. Several stakeholders came up to me after and asked for a deeper session.\n\nWould you be up for a follow-up in October with a broader audience?",
          reactions: [{ emoji: '🚀', count: 1, owner: 'yours' }],
        },
        {
          id: 'dm3_c2',
          authorName: 'You',
          timestamp: '4:32 PM',
          body: "Absolutely up for it. I was thinking a live walkthrough with a real use case might land better than a polished deck with that audience. More credibility and easier to pivot if questions come up mid-session.\n\nShould I coordinate directly with you or go through your EA?",
          replyCount: 1,
        },
        {
          id: 'dm3_c3',
          authorName: 'Carol White',
          timestamp: '4:50 PM',
          body: "It's primarily the Growth and RevOps leads, so something around analytics and reporting workflow would resonate most.\n\nI'm thinking second or third week of October, 45-minute slot. I'll send you a few calendar options early next week with that context included.",
        },
      ],
    },
  ],
}
