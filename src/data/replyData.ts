export interface ReplyData {
  id: string
  authorName: string
  timestamp: string
  body: string
}

/**
 * Static reply data keyed by conversation id.
 * Only conversations with replyCount > 0 need entries here.
 */
export const REPLIES: Record<string, ReplyData[]> = {
  // ── Topic 1: CI/CD pipeline ──
  t1_c1: [
    { id: 'r_t1c1_1', authorName: 'Sara Okonkwo', timestamp: '9:22 AM', body: "Seeing the same thing on my branch. Looks like it started after the 8:50 AM merge to main." },
    { id: 'r_t1c1_2', authorName: 'Tom Braun', timestamp: '9:35 AM', body: "Checking the dependency diff now. Will report back shortly." },
    { id: 'r_t1c1_3', authorName: 'Liam Chen', timestamp: '9:41 AM', body: "Thanks Tom. I'll hold off on re-triggering until we know what changed." },
  ],
  t1_c2: [
    { id: 'r_t1c2_1', authorName: 'Liam Chen', timestamp: '11:15 AM', body: "Nice catch. That explains the resolution failures too." },
    { id: 'r_t1c2_2', authorName: 'Sara Okonkwo', timestamp: '11:28 AM', body: "Confirmed — pinning to 14.x fixed it on my branch as well." },
  ],
  t1_c3: [
    { id: 'r_t1c3_1', authorName: 'Liam Chen', timestamp: '10:12 AM', body: "Great work. The npmrc guard is a smart preventive measure." },
    { id: 'r_t1c3_2', authorName: 'Sara Okonkwo', timestamp: '10:20 AM', body: "Agreed. Should we add similar guards for other critical packages?" },
    { id: 'r_t1c3_3', authorName: 'Tom Braun', timestamp: '10:35 AM', body: "I'll create a list of packages that should have major-version pinning. Will share in the next standup." },
    { id: 'r_t1c3_4', authorName: 'Liam Chen', timestamp: '10:42 AM', body: "Perfect. Let's also add it to the onboarding doc so new devs know about the policy." },
  ],
  t1_c4: [
    { id: 'r_t1c4_1', authorName: 'Sara Okonkwo', timestamp: '12:05 PM', body: "Looking at the health check config now. The timeout was never updated when we bumped memory." },
    { id: 'r_t1c4_2', authorName: 'Tom Braun', timestamp: '12:18 PM', body: "Makes sense. The container takes longer to start with the higher memory allocation." },
  ],
  t1_c5: [
    { id: 'r_t1c5_1', authorName: 'Liam Chen', timestamp: '2:30 PM', body: "PR approved and merged. Staging deploy is green now." },
  ],

  // ── Topic 3: Ongoing onboarding issues ──
  t3_c1: [
    { id: 'r_t3c1_1', authorName: 'Jake Walter', timestamp: '9:30 AM', body: "As complaints requirements become more strict, we had to introduce additional steps in our onboarding flow.\nThese steps are creating lots of friction. As we were on tight schedule, we didn't have time to tweak it. The quality for sure went down." },
    { id: 'r_t3c1_2', authorName: 'Jake Walter', timestamp: '9:32 AM', body: "We need to review the whole flow, identify the biggest issues and then try to improve current state." },
    { id: 'r_t3c1_3', authorName: 'Katerina Kelepouri', timestamp: '9:45 AM', body: "Understand. It was tight deadline.\nKeep me in the loop once you're done with the review." },
  ],
  t3_c2: [
    { id: 'r_t3c2_1', authorName: 'Jake Walter', timestamp: '10:30 AM', body: "41% drop-off is worse than I expected. The liveness check was always clunky but I didn't realize it had gotten this bad." },
    { id: 'r_t3c2_2', authorName: 'Alice Curtis', timestamp: '10:45 AM', body: "I've seen the session recordings. Users are literally giving up after the third failed attempt. The error copy doesn't help at all." },
    { id: 'r_t3c2_3', authorName: 'Greg Bothman', timestamp: '11:00 AM', body: "Agreed. I'll start scoping the SDK upgrade path today. Should have a timeline by EOD." },
  ],
  t3_c3: [
    { id: 'r_t3c3_1', authorName: 'Jake Walter', timestamp: '11:25 AM', body: "Makes sense to ship the SDK upgrade first. Quick win with measurable impact." },
    { id: 'r_t3c3_2', authorName: 'Alice Curtis', timestamp: '11:40 AM', body: "I'll start on the UX designs in parallel so we're ready to go right after." },
  ],
  t3_c4: [
    { id: 'r_t3c4_1', authorName: 'Greg Bothman', timestamp: '2:00 PM', body: "Option A is cleaner. Agree on the accessibility point too." },
    { id: 'r_t3c4_2', authorName: 'Jake Walter', timestamp: '2:10 PM', body: "Option A for sure. The animation in B might actually add confusion for users who are already struggling." },
    { id: 'r_t3c4_3', authorName: 'Alice Curtis', timestamp: '2:20 PM', body: "Going with A then. I'll finalize the assets today." },
    { id: 'r_t3c4_4', authorName: 'Katerina Kelepouri', timestamp: '2:45 PM', body: "Looks great. Simple and clear — exactly what we need here." },
  ],
  t3_c5: [
    { id: 'r_t3c5_1', authorName: 'Greg Bothman', timestamp: '3:15 PM', body: "Good catch. That redirect back to the start is probably responsible for a chunk of the drop-off on its own." },
    { id: 'r_t3c5_2', authorName: 'Alice Curtis', timestamp: '3:25 PM', body: "Adding it to the spec now. Should be a small change on the frontend." },
  ],
  t3_c6: [
    { id: 'r_t3c6_1', authorName: 'Jake Walter', timestamp: '4:20 PM', body: "Spec looks solid. Let's make sure QA has the older Android devices covered in the test matrix." },
    { id: 'r_t3c6_2', authorName: 'Greg Bothman', timestamp: '4:30 PM', body: "Will flag Raj on the SDK PR as soon as it's up. Should be ready for review tomorrow morning." },
  ],

  // ── DM conversations ──
  dm1_c3: [
    { id: 'r_dm1c3_1', authorName: 'Alice Johnson', timestamp: '3:45 PM', body: "That explains the pattern we were seeing in the support tickets. All the complaints were coming from EU-based customers during morning hours." },
    { id: 'r_dm1c3_2', authorName: 'You', timestamp: '4:02 PM', body: "Exactly. I've filed an infra ticket to scale the verification service in EU-West-1 during peak hours." },
  ],
  dm1_c4: [
    { id: 'r_dm1c4_1', authorName: 'Alice Johnson', timestamp: '10:20 AM', body: "Perfect, closing it out now. The customer already confirmed on their end." },
  ],
  dm1_c5: [
    { id: 'r_dm1c5_1', authorName: 'Alice Johnson', timestamp: '2:15 PM', body: "Good call raising this. The job queue approach makes more sense for our scale." },
    { id: 'r_dm1c5_2', authorName: 'You', timestamp: '2:22 PM', body: "Yeah, and it gives us a path to add progress indicators later without reworking the architecture." },
    { id: 'r_dm1c5_3', authorName: 'Alice Johnson', timestamp: '2:35 PM', body: "Design team is already on board. They'll have mocks ready by Thursday." },
  ],
  dm2_c3: [
    { id: 'r_dm2c3_1', authorName: 'Bob Smith', timestamp: '5:00 PM', body: "This is exactly what I needed. The retention segmentation by acquisition channel is particularly strong for the board narrative." },
  ],
  dm3_c2: [
    { id: 'r_dm3c2_1', authorName: 'Carol White', timestamp: '4:40 PM', body: "Go through me directly, easier to coordinate. I'll loop in my EA once we have a date locked." },
  ],
}
