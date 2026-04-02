export interface ConversationData {
  id: string
  authorName: string
  timestamp: string
  body: string
  replyCount?: number
  hasNewReply?: boolean
  isResolved?: boolean
  resolvedBy?: string
  resolutionMessage?: string
}

export interface ConvGroup {
  dateLabel: string
  convs: ConversationData[]
}

export const TOPIC_CONVERSATIONS: Record<string, ConvGroup[]> = {

  // ── Topic 1: CI/CD pipeline stuck during build stage ──────────────────────
  '1': [
    {
      dateLabel: 'Mon, September 2',
      convs: [
        {
          id: 't1_c1',
          authorName: 'Liam Chen',
          timestamp: '9:14 AM',
          body: "Hey everyone — our CI/CD pipeline has been failing at the build stage since this morning. The error is thrown during the Docker image build step. Logs show it can't resolve some dependencies. Anyone else seeing this? Build #4821 is the latest failure.",
          replyCount: 3,
        },
        {
          id: 't1_c2',
          authorName: 'Sara Okonkwo',
          timestamp: '9:31 AM',
          body: "Confirmed — hit the same wall trying to push a hotfix 40 minutes ago. Error reads `npm ERR! code ERESOLVE` followed by a peer dependency conflict chain. Did someone update package.json recently without bumping the lock file?",
          replyCount: 2,
        },
        {
          id: 't1_c3',
          authorName: 'Tom Braun',
          timestamp: '11:08 AM',
          body: "Looking at the git log — `@testing-library/react` was bumped to 15.x in the last merge but `react-scripts` on our current version doesn't support it yet. It pulls in conflicting peer deps. I'm pinning it back to 14.x now.",
          replyCount: 1,
        },
      ],
    },
    {
      dateLabel: 'Tue, September 3',
      convs: [
        {
          id: 't1_c4',
          authorName: 'Tom Braun',
          timestamp: '10:05 AM',
          body: "The pin to 14.x fixed the dependency conflict — build #4826 passed. Pipeline is green again. I've added a `.npmrc` rule to block major version bumps on that package without a manual override.",
          replyCount: 4,
          isResolved: true,
          resolvedBy: 'Tom Braun',
          resolutionMessage: 'Pinned @testing-library/react to 14.x — builds passing. npmrc guard added.',
        },
        {
          id: 't1_c5',
          authorName: 'Liam Chen',
          timestamp: '11:42 AM',
          body: "Tom's fix unblocked the base build, but I'm hitting a second failure now on the staging deploy step. Health check times out after 30s. Might be unrelated — could be the memory limits we adjusted last week. @devops can you check the health check config on staging?",
          replyCount: 2,
        },
        {
          id: 't1_c6',
          authorName: 'Sara Okonkwo',
          timestamp: '2:17 PM',
          body: "Found it — memory limit was bumped to 512 MB but the health check timeout wasn't updated to account for the longer startup time. Bumping the timeout to 60s should fix it. PR up.",
          replyCount: 1,
        },
      ],
    },
  ],

  // ── Topic 2: Launch checklist for v2 of the mobile app (private) ──────────
  '2': [
    {
      dateLabel: 'Wed, August 28',
      convs: [
        {
          id: 't2_c1',
          authorName: 'Nina Park',
          timestamp: '10:00 AM',
          body: "I've drafted the v2 launch checklist. Items that need to be cleared before we go live:\n\n1. QA sign-off on all P0 and P1 bugs\n2. App Store build submitted and in review\n3. Feature flags set to 10% rollout on day one\n4. Support team briefed on known edge cases and workarounds\n5. Analytics events verified end-to-end in the production mirror\n6. Marketing assets live on the landing page\n\nLet's use this topic to surface blockers. Assign yourselves to items you own.",
          replyCount: 6,
        },
        {
          id: 't2_c2',
          authorName: 'Carlos Mendez',
          timestamp: '10:45 AM',
          body: "On App Store timing — Apple review is typically 7 days but can stretch to 10 if they flag anything. If we're targeting the 15th as the public launch date, the build needs to be submitted by the 5th at the absolute latest. Looking at our current P0 backlog, that timeline feels very tight.",
          replyCount: 3,
        },
      ],
    },
    {
      dateLabel: 'Thu, August 29',
      convs: [
        {
          id: 't2_c3',
          authorName: 'Nina Park',
          timestamp: '9:22 AM',
          body: "QA flagged two P0s this morning that block submission:\n\n🔴 P0-1: Face ID fallback crashes on iOS 16.1 — affects roughly 12% of our installed base\n🔴 P0-2: Push notifications not arriving in the EU region — suspect it's the Frankfurt SNS endpoint config\n\nNeither is a maybe. Both need to be fixed before we submit. @raj on P0-1, @backend-team on P0-2.",
          replyCount: 5,
        },
        {
          id: 't2_c4',
          authorName: 'Raj Patel',
          timestamp: '1:14 PM',
          body: "P0-1 fix is up — it was a missing null check in the biometrics handler when device auth returns nil instead of a typed error. Subtle and nasty. PR #892 is ready for review, should be mergeable today.",
          replyCount: 2,
        },
        {
          id: 't2_c5',
          authorName: 'Carlos Mendez',
          timestamp: '4:30 PM',
          body: "P0-2 is still open. I'm pushing the submission date to the 10th and the public launch to the 17th to give us a proper buffer. Marketing has been updated. Let's not rush the EU fix — a notification failure on launch day in that region would be a much bigger problem than a delayed launch.",
          replyCount: 1,
        },
      ],
    },
    {
      dateLabel: 'Fri, August 30',
      convs: [
        {
          id: 't2_c6',
          authorName: 'Nina Park',
          timestamp: '11:00 AM',
          body: "P0-2 cleared overnight — it was a misconfigured SNS topic ARN for EU-West-1. Notifications are flowing correctly in the staging environment. Both P0s are now resolved. Submitting the build to App Store this afternoon.",
          replyCount: 4,
        },
        {
          id: 't2_c7',
          authorName: 'Carlos Mendez',
          timestamp: '3:45 PM',
          body: "Build submitted to App Store at 3:30pm. Confirmation email received. We're in the review queue. I'll track status and flag here if anything comes back from Apple. Barring a rejection, we're on track for the 17th.",
          replyCount: 2,
        },
      ],
    },
  ],

  // ── Topic 3: Ongoing onboarding issues ────────────────────────────────────
  '3': [
    {
      dateLabel: 'Mon, August 18',
      convs: [
        {
          id: 't3_c1',
          authorName: 'Jake Walter',
          timestamp: '9:08 AM',
          body: "@greg we wrapped up the Finance Weekly and the onboarding numbers are alarming — drop-off rate is up 34% in the past two weeks. CS is also fielding significantly more onboarding-related tickets than usual. Do you have data on where exactly users are falling off in the flow?",
        },
      ],
    },
    {
      dateLabel: 'Today',
      convs: [
        {
          id: 't3_c2',
          authorName: 'Greg Bothman',
          timestamp: '10:22 AM',
          body: "I dug into the funnel data. The biggest drop-off by far is at the liveness check step — 41% of users who reach it don't complete it. Session recordings show three patterns: confusion about face positioning, degraded performance on older Android hardware, and error messages that are far too technical for non-developers.",
          replyCount: 3,
          isResolved: true,
          resolvedBy: 'Greg Bothman',
          resolutionMessage: 'Root cause: liveness check UX. SDK upgrade + UX rework underway.',
        },
        {
          id: 't3_c3',
          authorName: 'Greg Bothman',
          timestamp: '11:15 AM',
          body: "@alice I compared our app against the latest SDK (3.4.2 vs our current 3.1.0) — the improvement is substantial. Better face detection in low light, real-time positioning feedback that actually works, and cleaner error states. I want to ship the SDK upgrade as a quick win before we tackle the full UX rewrite.",
          replyCount: 2,
        },
        {
          id: 't3_c4',
          authorName: 'Alice Curtis',
          timestamp: '1:45 PM',
          body: "SDK upgrade makes sense. On the guidance screen: I've got two directions in Figma. Option A is a 3-step static illustration sequence, Option B is a short looping animation. I'm leaning toward A — simpler to ship and no autoplay accessibility concerns. Thoughts from anyone?",
          replyCount: 4,
        },
        {
          id: 't3_c5',
          authorName: 'Jake Walter',
          timestamp: '3:00 PM',
          body: "Strong preference for A — ship it. One addition I'd suggest: a 'Try again' shortcut directly on the error screen rather than routing users back to the start of the flow. If we can recover even 15% of the people who hit an error, it's worth it.",
        },
        {
          id: 't3_c6',
          authorName: 'Alice Curtis',
          timestamp: '4:10 PM',
          body: "@raj once the SDK upgrade is merged, can we do a joint review before this goes to QA? I want to make sure the new illustrations align with the updated SDK feedback states and we're not designing against the old error messages.",
          replyCount: 2,
          isResolved: true,
          resolvedBy: 'Alice Curtis',
          resolutionMessage: 'Spec updated: SDK 3.4.2 + illustration option A + retry shortcut. Going to QA next sprint.',
        },
      ],
    },
  ],

  // ── Topic 4: Remote work policy clarifications (private, resolved) ─────────
  '4': [
    {
      dateLabel: 'Tue, July 16',
      convs: [
        {
          id: 't4_c1',
          authorName: 'Emma Walsh',
          timestamp: '11:00 AM',
          body: "Following the questions raised during the All Hands last week, here's the official clarification on the remote work policy:\n\n• Up to 3 days remote per week for all employees\n• Core hours are 10am–3pm in your local timezone regardless of location\n• International remote work requires manager approval, capped at 30 days per calendar year\n• Home office equipment is reimbursable up to £500 per year\n\nThe full updated policy is in the HR portal.",
          replyCount: 4,
        },
        {
          id: 't4_c2',
          authorName: 'Daniel Kim',
          timestamp: '2:30 PM',
          body: "Thanks Emma, this is helpful. One follow-up — does the 3-day limit apply during summer as well? A few of us on the team were hoping for a bit more flexibility in July and August, especially with kids out of school.",
          replyCount: 2,
        },
      ],
    },
    {
      dateLabel: 'Wed, July 17',
      convs: [
        {
          id: 't4_c3',
          authorName: 'Emma Walsh',
          timestamp: '9:45 AM',
          body: "Confirmed with leadership: July and August are extended to 4 days remote per week. This applies for the current year and will be reviewed as part of the Q4 policy refresh. I've updated the HR portal document to reflect this. Let me know if you have any other questions.",
          replyCount: 1,
          isResolved: true,
          resolvedBy: 'Emma Walsh',
          resolutionMessage: 'Summer flexibility confirmed: 4 days remote in July and August. HR portal updated.',
        },
      ],
    },
  ],

  // ── Topic 5: Usability test results for the dashboard redesign (resolved) ──
  '5': [
    {
      dateLabel: 'Thu, August 8',
      convs: [
        {
          id: 't5_c1',
          authorName: 'Priya Sharma',
          timestamp: '3:00 PM',
          body: "We completed 8 usability sessions on the dashboard redesign this week. Summary of findings:\n\n✅ Date range filtering — intuitive for all 8 participants\n✅ Card layout — all 8 preferred it over the previous table view\n⚠️ Export button — 6 out of 8 users couldn't find it (currently hidden in the overflow menu)\n⚠️ Chart legend — font too small at 100% zoom; 4 participants zoomed in to read labels\n⚠️ Notification badge — 3 participants mistook it for a clickable action button\n\nFull report with session recordings linked in Notion.",
          replyCount: 5,
        },
        {
          id: 't5_c2',
          authorName: 'Tom Braun',
          timestamp: '4:15 PM',
          body: "The export discoverability issue is a fast fix — I can move it to the primary toolbar this sprint without any design changes. I'll raise a Jira ticket today. For the legend font, what's the target size — 12px or should we go to 13?",
          replyCount: 2,
        },
      ],
    },
    {
      dateLabel: 'Fri, August 9',
      convs: [
        {
          id: 't5_c3',
          authorName: 'Priya Sharma',
          timestamp: '10:30 AM',
          body: "12px is fine for legend text — the issue was more about the line height being too tight rather than the size itself. Updated the Figma spec. On the notification badge: I'm repositioning it to the top-right corner of the card header to match the standard pattern we use everywhere else.",
          replyCount: 3,
        },
        {
          id: 't5_c4',
          authorName: 'Priya Sharma',
          timestamp: '2:00 PM',
          body: "Design changes are finalized and handed off. Summary:\n\n1. Export button moved to primary toolbar\n2. Legend: 12px font, 1.4 line-height\n3. Notification badge repositioned to card top-right\n4. Tooltip added to date range picker for first-time users\n\nFour Jira tickets raised, targeting next sprint for all changes.",
          replyCount: 1,
          isResolved: true,
          resolvedBy: 'Priya Sharma',
          resolutionMessage: 'All findings actioned. Design specs updated and handed off to engineering.',
        },
      ],
    },
  ],

  // ── Topic 6: Show your pet! ────────────────────────────────────────────────
  '6': [
    {
      dateLabel: 'Fri, August 23',
      convs: [
        {
          id: 't6_c1',
          authorName: 'Maya Rodriguez',
          timestamp: '9:05 AM',
          body: "It's Friday and I have decided we are doing this. Introducing Mochi — 4-year-old shiba inu who has fully committed to the bit that he is a cat. Sits in boxes, knocks things off tables, ignores commands selectively. Somehow still the best.",
          replyCount: 12,
        },
        {
          id: 't6_c2',
          authorName: 'Jake Walter',
          timestamp: '9:32 AM',
          body: "Mochi is a legend and I won't hear otherwise. Here's Pretzel — retired racing greyhound who operates exclusively at two speeds: full sprint across the garden or completely unconscious on the sofa. No in between. We tried walking pace once. He looked offended.",
          replyCount: 8,
        },
        {
          id: 't6_c3',
          authorName: 'Nina Park',
          timestamp: '10:11 AM',
          body: "This thread has genuinely made my morning. Meet Biscuit — she's 14, completely deaf, and somehow still alerts us to the postman before we hear anything. Senior dogs are undefeated and I will die on this hill.",
          replyCount: 6,
        },
        {
          id: 't6_c4',
          authorName: 'Alice Curtis',
          timestamp: '11:45 AM',
          body: "Biscuit! I'm not crying at my desk, you're crying. Here's Noodle — a rescue tabby who decided my laptop keyboard is her preferred napping spot. She joined a client call last Thursday uninvited. The client said 'can she stay?' She stayed.",
          replyCount: 9,
        },
      ],
    },
    {
      dateLabel: 'Mon, August 26',
      convs: [
        {
          id: 't6_c5',
          authorName: 'Tom Braun',
          timestamp: '9:00 AM',
          body: "Coming back to this after the weekend and it's genuinely the highlight of my Mondays. Here's Kafka — yes named after the framework, yes intentionally, he sits beside my monitor during standups and evaluates the quality of my pull request descriptions. Usually unimpressed.",
          replyCount: 7,
        },
        {
          id: 't6_c6',
          authorName: 'Carlos Mendez',
          timestamp: '10:30 AM',
          body: "Kafka is a perfect name for a cat. Non-negotiable. Here's Dumpling — corgi, 3 years old, has appointed herself personally responsible for the structural integrity of the house and patrols accordingly at 3am. Every night. Without fail.",
          replyCount: 5,
        },
        {
          id: 't6_c7',
          authorName: 'Raj Patel',
          timestamp: '1:15 PM',
          body: "Late to the thread but I couldn't let it close without contributing. This is Theorem — 2-year-old golden retriever, named by my daughter during her maths phase. He is extremely enthusiastic about everything and has zero concept of personal space. I work from home.",
          replyCount: 4,
        },
        {
          id: 't6_c8',
          authorName: 'Liam Chen',
          timestamp: '3:00 PM',
          body: "Theorem is an incredible name and I respect the maths phase completely. Final entry: this is Sudo — yes the command, yes my partner drew the line at `rm -rf`, yes he has root access to the sofa. He's a rescue border collie and he's faster than any build pipeline I've ever run.",
          replyCount: 6,
        },
      ],
    },
  ],

  // ── Topic 7: Updates on the new office layout ─────────────────────────────
  '7': [
    {
      dateLabel: 'Mon, September 9',
      convs: [
        {
          id: 't7_c1',
          authorName: 'Jen Cole',
          timestamp: '10:00 AM',
          body: "The new office layout goes live this Monday the 16th. Key changes:\n\n🏢 Floor 2: Open collaboration zone replacing the old cubicle bank — 120 hot desks with monitors\n🏢 Floor 3: Two new bookable focus rooms, max 4 people, bookable via the office app\n🏢 Zone C: 24 standing desks on a first-come basis\n☕ Kitchen: Expanded with a second coffee station and additional fridge space\n\nFull floor plan linked in the facilities channel.",
          replyCount: 5,
        },
        {
          id: 't7_c2',
          authorName: 'Carlos Mendez',
          timestamp: '11:30 AM',
          body: "Thanks for the heads up. Any news on parking? The construction on the adjacent building has eaten into our usual lot and several people on my team have been struggling to find a spot before 9am.",
          replyCount: 3,
        },
        {
          id: 't7_c3',
          authorName: 'Daniel Kim',
          timestamp: '2:15 PM',
          body: "Seconding the parking question. Also curious about the focus rooms — will there be a minimum booking duration or can you grab one for a 20-minute call?",
          replyCount: 1,
        },
      ],
    },
    {
      dateLabel: 'Tue, September 10',
      convs: [
        {
          id: 't7_c4',
          authorName: 'Jen Cole',
          timestamp: '9:15 AM',
          body: "Parking: we've secured 40 additional spots in the Meridian garage two blocks east — company-covered from day one. Shuttle runs every 20 minutes between 8–10am and 4–7pm. Full schedule in the facilities FAQ sent to all-staff this morning.\n\nFocus rooms: no minimum duration, book from 15 minutes up to 3 hours. If a room shows as booked but is visibly empty after 10 minutes, you're free to use it.",
          replyCount: 2,
        },
      ],
    },
  ],

  // ── Topic 8: Quick fix needed for staging deployment issue ────────────────
  '8': [
    {
      dateLabel: 'Today',
      convs: [
        {
          id: 't8_c1',
          authorName: 'Liam Chen',
          timestamp: '2:03 PM',
          body: "Staging is down — the deployment from 20 minutes ago didn't come up healthy. Health checks failing across all three instances. We have a client demo at 4pm. Anyone available right now?",
        },
        {
          id: 't8_c2',
          authorName: 'Sara Okonkwo',
          timestamp: '2:06 PM',
          body: "On it. Pulling the deployment logs now.",
          replyCount: 1,
        },
        {
          id: 't8_c3',
          authorName: 'Sara Okonkwo',
          timestamp: '2:19 PM',
          body: "Found it — the new env variable `FEATURE_FLAG_NEW_AUTH` wasn't set in the staging environment config. Service was crashing on startup trying to read it as a required value. I've added it and redeployed. Health checks are green across all instances.",
          replyCount: 2,
          isResolved: true,
          resolvedBy: 'Sara Okonkwo',
          resolutionMessage: 'Missing env var added. Staging back online. Adding pre-deploy env check to pipeline.',
        },
      ],
    },
  ],

  // ── Topic 9: Feedback on mobile onboarding flow ───────────────────────────
  '9': [
    {
      dateLabel: 'Wed, September 4',
      convs: [
        {
          id: 't9_c1',
          authorName: 'Alice Curtis',
          timestamp: '11:00 AM',
          body: "I ran an informal review of the mobile onboarding flow with 3 first-time users yesterday. Main friction points:\n\n1. The 'Allow notifications' prompt fires too early — users haven't seen any value yet and reflexively dismiss it\n2. The progress indicator disappears on steps 3 and 4 — looks like a design regression from last sprint\n3. The 'You're all set' screen has no clear next action — all 3 users paused and weren't sure whether to tap, swipe, or wait\n\nHappy to share session recordings if useful.",
          replyCount: 3,
        },
        {
          id: 't9_c2',
          authorName: 'Raj Patel',
          timestamp: '12:30 PM',
          body: "Completely agree on the notifications timing. Best practice is to delay it until after the first 'aha moment' — for us that's completing their first task. I can reconfigure the trigger point; it's a small change on our end.",
          replyCount: 2,
        },
        {
          id: 't9_c3',
          authorName: 'Jake Walter',
          timestamp: '2:00 PM',
          body: "The progress indicator regression is a quick fix — I can see exactly where it got dropped in the last PR. I'll patch it today. The 'You're all set' dead end is the more important problem though, agreed with Alice.",
          replyCount: 1,
        },
      ],
    },
    {
      dateLabel: 'Thu, September 5',
      convs: [
        {
          id: 't9_c4',
          authorName: 'Alice Curtis',
          timestamp: '10:00 AM',
          body: "Updated mockups in Figma: (1) notifications prompt now triggers after first completed task, (2) progress bar visible on all 6 steps, (3) 'You're all set' screen has a primary 'Go to dashboard' CTA and a secondary 'Take a tour' option. Link in thread.",
          replyCount: 4,
        },
        {
          id: 't9_c5',
          authorName: 'Jake Walter',
          timestamp: '11:45 AM',
          body: "Mockups look really clean. One thing I found in testing: on sub-5.5\" Android devices, the 'Next' button gets pushed off screen when the keyboard is open. We should either fix the layout to account for keyboard height or use a floating button that stays accessible.",
          replyCount: 2,
        },
        {
          id: 't9_c6',
          authorName: 'Raj Patel',
          timestamp: '2:30 PM',
          body: "Keyboard overlap fix is in — using `adjustResize` with a scroll wrapper around the form so the button stays reachable regardless of keyboard state. PR up for review. @alice let me know if you prefer the floating button approach from a design perspective, happy to swap it.",
          replyCount: 1,
        },
      ],
    },
  ],
}
