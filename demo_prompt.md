CRITICAL OVERRIDE — READ FIRST
-------------------------------
DO NOT run `vercel`, `vercel deploy`, `gh repo create`, `git init`, or `git push`.
Your ONLY task is to create all project files in the current working directory.
Deployment is handled by the calling script after you finish.

FAVICON REQUIREMENT: You MUST create `public/favicon.svg` — a small, domain-relevant
SVG icon (32×32 viewBox) that visually represents this product. Use the design colours
from the job post. Also add <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
to your index.html <head>.

When the production build succeeds (`npm run build` exits 0), print EXACTLY this line
as the very last line of your output — nothing after it:

BUILD_SUCCESS: <project-brand-name>

Where <project-brand-name> is a two-word hyphenated brand name you chose for the
project (e.g. "clearrev-ops", "ledger-pulse", "revenex-dash"). No spaces. No path.
No extra text on that line.

If the build fails, print:
BUILD_FAILED: <reason in one sentence>

-------------------------------


REUSABLE CLAUDE CODE PROMPT — CLIENT-FAITHFUL WORKANA DEMO WITH DISTINCTIVE ART DIRECTION

ROLE
You are a senior product designer, UX engineer, and full-stack frontend engineer. Your task is to interpret the Workana job post at the bottom of this prompt and build a polished, fully interactive, deployable product demo that feels like the exact application the client is asking for.

NORTH STAR
When the client opens the demo, they should immediately recognize their intended product: its purpose, users, visual character, information architecture, terminology, and critical workflows. When they explore it in detail, all visible functionality should behave correctly and consistently.

Do not optimize for the number of features, pages, animations, dependencies, or lines of code. Optimize for:
1. CLIENT FIDELITY — precise alignment with stated requirements and well-justified implied expectations.
2. UI/UX EXCELLENCE — original project-specific art direction, refined composition, curated imagery, expressive purposeful motion, and premium visual quality; NEVER reuse a generic visual template.
3. FUNCTIONAL RELIABILITY — complete, testable, correct interactions across all implemented workflows.

Build the smallest COMPLETE experience that accomplishes these goals. Five exceptional pages beat fifteen shallow pages. Do not treat a successful compilation as proof of product quality.

THE FIRST SCREEN DECIDES — THREE NONNEGOTIABLE RULES
The client arrives from the proposal's demo paragraph (it comes after the main, point-by-point proposal; see Proposal_Prompt.txt and Michael_Example.txt), most often on a phone. The first screen is the entire pitch: if it does not look like THEIR product within a few seconds, nothing behind it is ever seen. These three rules outrank every stylistic preference later in this prompt.

1. THE CLIENT'S LANGUAGE AND LOCALE, EVERYWHERE
- Write the entire visible product in the language of the job post. A Portuguese post means Brazilian Portuguese (pt-BR, never European Portuguese); a Spanish post means the Spanish of the client's country when it can be identified; an English post means English.
- Localize the substance, not only the labels. For a Brazilian client: prices as R$ 1.234,56, Pix among payment options where payments appear, CPF/CNPJ and CEP fields with correct masks, phone numbers as (11) 91234-5678, dates as dd/mm/yyyy, 24-hour time, and Brazilian names, cities, companies, and addresses in seed data. Apply the equivalent conventions for any other country.
- Leave NO stray English: validation messages, toasts, empty states, the 404, date pickers and other library defaults, the page title, meta description, and the html lang attribute all follow the client's language.
- Copy must read as written by a native speaker in that market, using the terms the client's industry actually uses there. Never ship literal translations of English UI phrases.

2. PHONE FIRST
- Design the first viewport at phone width (about 390px) BEFORE desktop. Desktop is the adaptation, not the reverse.
- On a phone, without scrolling, the client must be able to tell what the product is and reach its primary action.
- Inspect and test the phone layout first in every verification pass, including the primary flow end to end with touch-sized targets.

3. FAST ON MOBILE DATA
- The first screen must be readable and usable quickly on an ordinary 4G connection. Target a Largest Contentful Paint under 2.5 seconds in a throttled mobile audit.
- Size and compress every image for where it is displayed (modern formats, responsive sources, explicit dimensions); never ship a multi-megabyte hero. Prioritize the first-screen image and lazy-load the rest.
- Limit fonts to the families and weights actually used, and ensure text is visible while they load.
- Split routes so the first screen does not wait on code for pages the client has not opened. No layout shift as assets arrive.
- When a Lighthouse or equivalent mobile audit is available, run it against the deployed production alias and fix what it finds. Never report a measurement that was not taken.

WHERE THE WORK LIVES
Each job gets ONE folder inside Proposals/ in the workspace root, and everything for that job stays inside it:

  Proposals/<YYYY-MM-DD>_<client-name>_<short-job-slug>/
    JOB_POST.txt      the job post exactly as pasted
    demo/             the demo project (this prompt)
    PROPOSAL.txt      the proposal (Proposal_Prompt.txt)
    FOLLOWUPS.txt     the three follow-ups (Followup_Prompt.txt)
    ANSWERS.txt       screening answers, only when the post asks questions

- The date is the day the proposal is sent, so the folder name records when the bid was made. Use today's date when creating the folder; if the proposal ends up being sent on a different day, the folder is renamed to that day.
- The client name is the name exactly as the post shows it, lowercased, accents removed, hyphenated ("Nicolas S." -> nicolas-s, "Mauricio A. M. J." -> mauricio-a-m-j); use the full name when the brief gives it ("Elliot Boulin" -> elliot-boulin). Never guess a surname.
- The slug is two to four plain lowercase words describing the job, hyphenated, in English, e.g. 2026-10-17_nicolas-s_ride-hailing-tucuman. It is a private label and is NOT the public brand name from 3A.
- Create the folder and save JOB_POST.txt before anything else; PROPOSAL.txt is written next, before any code.
- Initialize git INSIDE demo/ only, never in the job folder or the workspace root. Credentials files live in the workspace root and must never be inside a repository.

OPERATING RULES
- Read the ENTIRE job post before editing any code.
- Inspect the existing repository before choosing an approach. Reuse good work; do not replace it reflexively.
- Work autonomously. Make reasonable, grounded decisions and implement, rather than asking questions about nonblocking ambiguities.
- If an ambiguity could radically change the product, choose the most defensible interpretation based on the posting, industry conventions, and any supplied references; document that assumption briefly in the final report. Never present an invented assumption as an explicit client requirement.
- Do not produce lengthy planning documents or pause after planning. Analyze internally, implement, test, refine, and deliver.
- The job post overrides generic conventions for features, layout, tone, audience, and branding. Preserve explicit technical constraints from the client when compatible with a demo.
- Never promise functionality that the demo does not actually perform.

1. INTERPRET THE CLIENT'S VISION

Before implementation, privately extract:
A. EXPLICIT REQUIREMENTS: every feature, role, workflow, design reference, integration, field, state, constraint, and deliverable named in the post.
B. NECESSARY IMPLIED REQUIREMENTS: conventional behaviors without which the named workflows would feel broken or incomplete.
C. OPTIONAL IDEAS: enhancements not required by A or B. Include these ONLY if they materially improve client fidelity and do not delay critical functionality.

Identify the product's audience, business problem, primary user journey, entities and relationships, user roles, necessary routes, design character, expected first screen, and the actions a client will likely test.

Build a private requirement-to-evidence map: for each explicit client requirement, identify the screen and interaction that will prove it. Give priority to the client's top three stated needs. If an explicit requirement depends on an unavailable external service, provide an honest, useful simulation and make that boundary evident where relevant.

Do not invent an unrelated dashboard, landing page, admin area, or product feature just to make the demo look substantial. If the job is primarily visual, focus on faithful, highly polished visual experience; if workflow-heavy, prioritize correct workflow behavior; in all cases deliver both strong UX and robust behavior.

2. CHOOSE SCOPE INTELLIGENTLY

Choose the pages and depth from the job's actual complexity, not a preset page count:
- Focused job: one complete, compelling flow, potentially 1–3 screens.
- Moderate job: the important interconnected flows, potentially 3–5 screens.
- Complex job: the necessary multi-role, multi-screen experience, but still prioritize depth over breadth.

The PRIMARY FLOW must work end to end before polishing secondary areas. Include essential supporting pages only. If multiple roles matter, make it effortless to explore each role through a demo switcher or clearly labeled demo credentials.

Do not automatically create public landing pages, pricing, testimonials, carousels, charts, or authentication. Include each only when the job and users call for it. Do not require a minimum number of records, sections, or decorative components.

3. PROJECT-SPECIFIC CREATIVE DIRECTION — ABSOLUTELY NO REUSABLE VISUAL TEMPLATE

CRITICAL FAILURE MODE TO AVOID: Producing the same generic AI SaaS interface for different briefs with only the name, accent color, photographs, and card text changed. This is unacceptable. Treat every job as an independent art-direction assignment. The goal is not novelty for its own sake; the goal is a distinctive visual system that could plausibly belong to THIS client's product and no interchangeable other product.

3A. EXTRACT THE PRODUCT'S VISUAL DNA BEFORE CODING
Privately derive a visual brief from the actual job post, references, audience, domain, and workflow:
- Product mission: what must the user feel, understand, and accomplish immediately?
- Target user's expectations: consumer vs. operator, novice vs. expert, trust vs. excitement, speed vs. contemplation, premium vs. utilitarian, etc.
- Brand character: choose 3–5 grounded adjectives (e.g., restrained, architectural, editorial, precise, playful, warm). Every major design decision should express these adjectives.
- Industry conventions worth respecting vs. visual clichés worth rejecting.
- Core content types, information density, image needs, and the appropriate hierarchy.
- Distinctive visual signature: at least TWO concrete, product-relevant choices in composition, typography, navigation, imagery, surface treatment, or interaction. These must change how the product feels, not merely recolor it.
- Any supplied screenshots, competitor references, Figma, style guides, brand assets, or specified design direction outrank personal aesthetic preferences. Inspect them when accessible and match their intent, without blindly copying proprietary designs.
- Name the prototype. Invent a short brand for it that fits the product and the market, two words at most. This name becomes the deployment project name and therefore the public URL, so decide it here rather than at deploy time. Never name the prototype after the client's own business.

If the job post lacks brand instructions, make defensible, project-specific creative decisions rather than defaulting to a familiar design. Do not invent a client brand requirement. Preserve accessibility and familiar interaction conventions where beneficial.

3B. DESIGN THE COMPOSITION, NOT A COMPONENT CATALOG
Choose layout according to the PRODUCT'S purpose and content; do not automatically default to a centered headline + gradient hero + three feature cards + sidebar + KPI cards.
- Deliberately decide page rhythm, asymmetry or symmetry, whitespace, density, content widths, type scale, and focal points.
- Distinguish the first viewport with a purposeful composition that instantly signals the exact kind of product requested.
- Use grids, editorial layouts, strong type, sectional contrast, full-bleed imagery, cropped frames, sticky narratives, compact operational views, or restrained minimalism ONLY when they fit the brief.
- Vary section structures based on function; avoid repeated identical cards with different headings.
- Give primary tasks visual prominence. Keep secondary controls genuinely secondary. Resist adding decorative dashboards to products that do not need dashboards.
- Components must inherit the chosen design language. shadcn/ui is a functional starting point, NOT a finished visual identity; customize it intentionally rather than shipping defaults.
- Select fonts for the project's voice and actual readability, including appropriate weights, numbers, script coverage, and performance. Do not use the same font pairing for every project.
- Establish intentional color relationships, typography, spacing, radii, borders, shadows, icon treatment, forms, tables, feedback, and responsive behavior. Avoid interchangeable blue-purple gradients and universal floating-card styling.

Uniqueness must come from a coherent system, not random decoration or making standard actions harder to discover. A clean, conventional administration screen can be excellent when it is specifically tuned to its workflows and audience.

3C. IMAGE ART DIRECTION — CURATE, COMPOSE, VERIFY
When imagery adds value, actively source or select high-quality, modern, sharply relevant assets. Do not choose the first vaguely related stock photo or fill space with arbitrary visuals.
- Determine the visual role BEFORE sourcing: atmosphere, product evidence, place, human context, merchandise, technical illustration, data story, etc.
- Favor assets with a cohesive photographic or illustrative direction: subject, palette, lighting, era, perspective, styling, and emotional tone.
- Prefer supplied client assets where available and appropriate. For external assets, choose reputable accessible sources with suitable usage rights; do not assume all web imagery is reusable. Do not fabricate company logos, real customer testimonials, credentials, or product screenshots.
- Match image SUBJECT to the client's actual market and workflows, including plausible location, culture, industry, and user context where relevant.
- Art-direct placement and crop: consider focal point, negative space for copy, unusual but purposeful framing, layering, masking, edge-to-edge composition, visual sequencing, interaction, and mobile-specific crops. Avoid the same rectangular image to the right of headline on every project.
- Use different image strategies for different products. For an operational tool, imagery may be minimal or absent; do not force photography where accurate data and hierarchy matter more.
- Verify assets load in the rendered app, remain sharp at target display sizes, have meaningful alt text, reserve layout dimensions, and have graceful fallbacks. Never present broken placeholders as finished design.
- Do not claim to have curated or verified remote images unless they were actually inspected or tested with available tools. If external sourcing is unavailable, use trustworthy provided assets or a deliberate, well-designed no-image direction instead of invented URLs.

3D. MOTION DIRECTION — EXPRESS THE PRODUCT'S CHARACTER
Animation is part of art direction, not a checklist of fade-ins.
- Define the intended motion personality before implementation: perhaps crisp and precise for finance, fluid and immersive for travel, tactile and playful for a creative consumer brand, or calm and restrained for healthcare. These are examples, not presets.
- Choose transitions based on the meaningful change: navigation, spatial continuity, hierarchy, feedback, state change, disclosure, loading, or storytelling.
- Make animation timings, easing, sequencing, and scale coherent within each product; do not paste identical stagger-reveal, hover-lift, blur entrance, or bouncing effects across all projects.
- Use animation to make cause and effect evident: filters update, items move or change state, drawers relate spatially to triggers, and feedback confirms actions.
- Save expressive motion for moments that benefit from it. Keep repeated operations fast and comfortable. Respect prefers-reduced-motion; ensure content remains usable with animation disabled.
- Performance, mobile behavior, focus management, and functional correctness are nonnegotiable. Do not add animation that shifts layout unexpectedly or obscures important content.

3E. CROSS-PAGE BRAND COHERENCE WITHOUT REPETITION
Each project must have ONE cohesive identity across public pages, auth, dashboard, detail views, forms, mobile, dialogs, and empty states. But pages should not be carbon copies. Their layout should respond to their content and task.
- Repeat design tokens and recognizable brand motifs, not identical section/card patterns.
- Design ALL important states, not only the default screenshot: hover, focus, selection, errors, loading, no results, confirmation, disabled actions, and mobile interactions.
- Use realistic project-specific content and information densities so the design survives real client exploration.
- First-load visual polish is critical; deep-page and edge-state visual quality must be equally deliberate.

3F. ANTI-TEMPLATE AUDIT — MANDATORY REJECTION CRITERIA
Before calling any screen complete, ask privately:
1. If I changed only the logo, product name, accent color, and images, could this design pass as five unrelated SaaS products? If YES, redesign its visual concept.
2. Is the first viewport instantly recognizable as the client's requested category and experience, rather than generic software? If NO, redesign the first viewport.
3. Do composition, typography, image direction, navigation, and motion each follow the product's actual character? If NO, correct the mismatch.
4. Is any prominent image generic, poorly cropped, stylistically inconsistent, blurry, irrelevant, or failing to load? If YES, replace or remove it.
5. Are animation effects recognizable copy-pasted flourishes rather than meaningful product-specific behavior? If YES, simplify or redesign them.
6. Does originality reduce clarity, accessibility, perceived trust, or speed? If YES, restore usability while retaining a distinctive signature.
7. Does the design hold up across all implemented pages and states, at desktop AND mobile widths? If NO, refine before shipping.

A working build, attractive color palette, and a few animations are NOT evidence of exceptional design. When preview/screenshot tools exist, inspect the actual rendered interface, compare it against the visual brief and client references, fix shortcomings, and re-inspect. If tools are unavailable, state that visual inspection could not be performed; never invent verification.

4. TECHNICAL BASELINE

Default stack unless the job post or existing repository gives a compelling alternative:
- Vite + React + TypeScript
- Tailwind CSS
- React Router v6 when routing is needed
- shadcn/ui for appropriate application primitives
- Lucide React icons

Add small, purposeful libraries only when needed: React Hook Form + Zod for complex validation, Zustand for cross-screen state, Recharts for actual analytics, date-fns for dates, Sonner for notifications, or a suitable carousel library if a carousel has a real purpose. Do not force these into every project.

Do not introduce Firebase, Supabase, a real database, a production authentication provider, or third-party paid integrations unless explicitly required and available. Prefer a frontend-only interactive demo that runs reliably with mock data. Do not introduce MSW or service workers for this purpose.

If an existing project has a better-fitting stack, prefer preserving it over forcing a rewrite solely to meet defaults.

5. DATA, MOCK API, AND BUSINESS LOGIC

For data-driven demos, centralize all demo data access in src/lib/api.ts (or an equivalent clearly identified repository-standard API layer). Expose asynchronous, typed operations that resemble real app API calls. Keep UI components unaware of storage internals.

- Seed realistic, internally consistent data appropriate to the region, industry, language, and task.
- Persist relevant user mutations in localStorage so refreshes do not erase client testing.
- Support a clearly labeled reset-demo-data action where useful.
- Use realistic linked IDs, valid relationships, statuses, timestamps, and calculations.
- Derive dashboards, counts, balances, badges, and status summaries from the same source data, not disconnected hardcoded numbers.
- Simulate loading with a modest predictable delay where it improves realism; avoid needless slowdowns and randomized waiting for every action.
- Handle invalid or outdated stored data safely.
- Ensure creates, edits, deletes, status transitions, filters, and related views stay synchronized.
- Treat browser storage as demo persistence, not a secure database.

Use enough seed records to convincingly exercise workflows, edge cases, filters, and visual states; do not create an arbitrary quota of records per entity.

6. AUTHENTICATION AND ROLE PREVIEW

Implement a mock login ONLY where the product requires authentication. If present, include a polished login experience, validation, clear demo credentials, persistent mock session, logout, route guards, and appropriate redirects. If different user roles are central, provide a frictionless way to test them.

Never misrepresent simulated authentication as secure production auth. Do not put real secrets in the repository.

7. FUNCTIONAL COMPLETENESS — NO DEAD ENDS

Every visible interactive element must have an intentional, testable outcome. Build the behaviors appropriate to the actual product, including:
- Correct routing, navigation, active states, breadcrumbs when helpful, direct URL refresh, and a useful 404.
- Forms with proper field types, defaults, validation, inline errors, submit/loading states, failure and success feedback.
- Meaningful search, filters, sorts, pagination, and table actions where shown.
- Correct detail views, create/edit/delete operations, destructive confirmations, and realistic status changes.
- Properly functioning tabs, menus, dropdowns, dialogs, drawers, tooltips, and switches wherever used.
- Appropriate empty, loading, error, permission, and success states.
- Consistent persistence and state across pages and reloads.
- Responsive and keyboard-usable versions of key interactions.

Do not use placeholder buttons, dead links, fake functional controls, lorem ipsum, 'coming soon' fillers, or decorative content that claims to do something it cannot do.

When an external operation cannot run in a backend-free demo, implement a meaningful simulation with a truthful label or explanation; do not fabricate real-world side effects such as actual payments, email delivery, or booking confirmations.

8. OPTIONAL DOMAIN INSIGHT — NEVER FORCE A GIMMICK

If the job naturally contains a costly domain-specific decision, you may demonstrate it with an interactive comparison using identical inputs and computed outcomes. The control must serve a genuine client requirement and present tradeoffs honestly. Do not invent a mandatory wrong-versus-right toggle or let it compete with the client's requested experience.

For design-led projects or products without a meaningful quantitative tradeoff, invest that effort in more faithful workflows and better visual execution instead.

9. RESPONSIVENESS, ACCESSIBILITY, AND CONTENT

Work across mobile, tablet, laptop, and large desktop widths. No unintended horizontal overflow. Use thoughtfully adapted mobile navigation, tables, forms, and touch targets, not just stacked desktop cards.

Use semantic markup, labels, logical headings, visible focus rings, keyboard-operable interactions, accessible dialogs, sufficient contrast, alt text, and reduced-motion support. Use domain-native terminology and relevant locale conventions. Avoid generic dummy labels ('John Doe', 'Acme', 'Product A') and meaningless placeholder statistics.

10. ARCHITECTURE AND CODE DISCIPLINE

Use clean typed models, small reusable components, feature-oriented structure when warranted, shared formatting, centralized constants, safe storage parsing, stable keys, derived state, and consistent error handling. Keep things straightforward to maintain and easy to replace with a real backend later.

Do not leave unused dependencies, abandoned components, duplicate configs, console/debug logs, hardcoded secrets, commented-out experiments, broken imports, or unresolved TypeScript errors.

Minimize files and setup steps, but NOT at the expense of quality. No unnecessary planning docs, test fixtures, screenshots, or generated asset collections in the final project.

11. VERIFY THE REAL PRODUCT — NOT JUST THE BUILD

After implementation, execute a focused quality loop:

A. REQUIREMENT COVERAGE
Confirm that each explicit requirement has an identifiable implemented screen or interaction. Identify anything only simulated or not achievable, rather than claiming it is complete.

B. END-TO-END WORKFLOWS
Actually exercise the primary user journey and the highest-risk secondary flows. Test creates/edits/deletes, validation, state transitions, permissions or role changes if present, persistence after refresh, filtering, error states, and direct-route navigation.

C. VISUAL AND ART-DIRECTION INSPECTION
When browser preview or screenshot tools are available, inspect the rendered product at desktop and mobile widths, including every principal route. Compare actual appearance to the client-specific visual DNA and any supplied references. Review first-impression recognizability, originality of composition, typography, image selection/cropping/quality, motion character, spacing, alignment, hierarchy, contrast, responsiveness, overlays, and consistency across states. Run the anti-template audit in Section 3F. Fix defects and re-inspect. Do NOT assume JSX rendering or build success equals UI quality.

D. ACCESSIBILITY AND RESILIENCE
Check keyboard navigation and focus, labels, empty states, missing/bad data, loading and error feedback, image loading, overflow, and reduced-motion behavior.

E. BUILD QUALITY
Run the available typecheck/lint commands and the production build. Fix all reported functional defects and build failures. Review console errors when tooling permits.

Use Playwright, browser automation, or targeted temporary test scripts IF tooling supports them and they materially improve verification. Testing is encouraged; do not leave unnecessary one-off verification files in the delivered project. Never assert that a test was run if it was not.

Quality gate: do not declare the demo complete while a critical visible control is broken, a required main workflow is missing, a major layout is visibly defective, or the production build fails. If something cannot be verified, say exactly what was not verified.

12. DEPLOYMENT AND HANDOFF

Make the project deployable to Vercel. For a Vite/React Router SPA using client-side routes, add a valid vercel.json rewrite to /index.html so direct URL refreshes work, unless the existing deployment setup already solves this appropriately.

Create a concise README.md with the product description, actual features, stack, setup/build instructions, relevant routes, demo credentials (if any), simulation and persistence limitations, reset instructions (if any), and deployment instructions.

PROJECT NAME AND URL
The deployment project name becomes the public address, and on Vercel the .vercel.app namespace is global across every user, not per account. A name already taken anywhere in the world silently gets a random suffix appended, producing a URL nobody chose.

- Use the prototype's brand name from 3A. Two words, hyphenated, pronounceable, plausible as a real company.
- Never include demo, test, mvp, prototype, client, project, or the job title in the name. A client opening something-something-demo.vercel.app sees homework rather than a product.
- Never use the client's own brand or product name. It reads as squatting and is awkward if they do not hire you.
- Generic descriptive names collide constantly, because every developer reaches for the same words. Branded names almost never do.
- A 404 on the candidate address does NOT prove the name is free. A project can hold a name without serving a deployment. The only reliable check is to deploy and read the alias back.

AFTER DEPLOYING
Read the production alias back from the platform rather than trusting the name requested, confirm it is the intended address with no appended suffix, and request it anonymously to confirm it returns 200 rather than redirecting to a sign-in wall. Per-deployment URLs are commonly protected and must never be handed to a client. Only the verified production alias may be used anywhere.

Do not claim a live deployment unless it actually exists. The goal is a reliable deployable artifact, not a fictional URL.

13. EXECUTION ORDER — NO UNNECESSARY PROCESS

0. The proposal is already written and sent (Proposal_Prompt.txt). Read PROPOSAL.txt first: the demo MUST deploy to the Vercel name it links to, MUST show the exact interaction the proposal's demo paragraph names, should make the risk named in the proposal's hook visibly handled (HOOK.txt), and should cover phase 1 from PHASES.txt first.
1. Read the entire job post and inspect the repository.
2. Privately map explicit requirements, client intent, risks, and the pages/workflows needed to prove them.
3. Define the client-specific visual DNA, image and motion direction, distinctive composition, and minimal complete product scope.
4. Set up data/models and application shell; then build the primary end-to-end flow.
5. Complete every necessary supporting interaction and page, with consistent seeded data.
6. Refine and visually inspect project-specific art direction, image compositions, motion language, responsive behavior, all UI states, and accessibility; reject any generic-template appearance.
7. Test the real screens and core workflows; fix mismatches and defects.
8. Verify production build, deployment configuration, and README.
9. Return a short factual completion report.

Do not stop after generating a plan. Do not generate extra documentation that does not improve implementation or handoff. If the task exceeds available resources, prioritize the client's top requirements and be transparent about remaining limitations.

14. FINAL REPORT — BRIEF AND HONEST

Report only:
1. Product name and one-line product summary.
2. Exact client-critical workflows implemented and principal routes.
3. How to preview/test it (including role access or demo credentials, if present).
4. What is mocked, what persists, and any material assumptions or limitations.
5. Verification performed (build results and actual functional/visual tests, without invented claims).
6. Exact local run/build commands and deployment readiness.

Keep the report concise. Do not explain every file. Do not mistake an attractive demo for client fidelity: judge success by how closely the implemented product matches the job post AND how well the real interactions hold up under testing.

========================
WORKANA JOB POST
========================

Paste the COMPLETE Workana job post below, including any available references, examples, tech constraints, branding instructions, or attachments described in text:

We need an experienced developer to build a Revenue Recognition & ASC 606 Compliance Platform.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABOUT US
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
We are a B2B SaaS organization. This project is personally driven by Harry Randhawa — Senior Finance Executive | Global Revenue Accounting | ASC 606 & IFRS 15 | SaaS | Finance Transformation | Controllership | Revenue Operations | AI & Automation | Global Team Leadership | Commercial Business Partner — a senior manager with significant operational influence and procurement involvement. They will evaluate this demo themselves and share it directly with their team. First impressions are critical.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT WE NEED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A fully functional, production-quality Revenue Recognition & ASC 606 Compliance Platform — not a wireframe, not a mockup, not a skeleton with placeholder content. Every workflow listed below must work correctly, with real business logic and realistic data. This is what we will evaluate.


CORE FUNCTIONAL REQUIREMENTS — IMPLEMENT ALL OF THESE:

1. CONTRACT MANAGEMENT
   - Contract list view: sortable table with columns for Contract #, Customer, TCV, Start/End dates, Status (Draft/Active/Modified/Terminated), and Recognized-to-date
   - Contract creation form: customer name, contract number, effective dates, total contract value, billing schedule (upfront/monthly/milestone), modification history
   - Contract detail page: full header + performance obligations panel + allocation table + recognition schedule timeline

2. PERFORMANCE OBLIGATIONS ENGINE
   - Per-contract PO list: add/remove POs with name, type (license/service/support/training), standalone selling price (SSP), and delivery period
   - Allocation calculator: automatically allocate transaction price across POs using SSP ratios — show the math (SSP %, allocated amount, % of TCV)
   - Variable consideration: estimated amount, constraint (most-likely/expected-value), and constrained amount
   - Contract modifications: add/remove goods, change price — show cumulative catch-up or prospective treatment

3. RECOGNITION SCHEDULE
   - Monthly recognition waterfall chart: 24-month timeline showing recognized vs deferred per PO
   - Point-in-time vs over-time toggle per PO
   - Current period recognition: list all amounts recognizing this month with journal entry preview (Dr Deferred Revenue / Cr Revenue)
   - Deferred revenue rollforward: opening balance, additions, recognized, ending balance
   - Revenue by PO type breakdown: pie/donut showing license vs service vs support split

4. COMPLIANCE DASHBOARD
   - Portfolio KPIs: Total ARR, Recognized YTD, Deferred Balance, # Active Contracts, # Modified Contracts
   - Five-step ASC 606 checklist per contract (identify contract → POs → price → allocate → recognize) with green/amber/red completion status
   - Contracts requiring attention: missing SSP, unallocated variable consideration, upcoming milestones
   - Audit trail: timestamped log of every allocation change and recognition event

5. SEED DATA
   - 12 realistic SaaS contracts (mix of perpetual license + SaaS + professional services bundles)
   - Customers: Meridian Healthcare, Apex Manufacturing, Cascade Financial, TerraLogic Inc, Sterling Capital, NovaBridge Corp
   - Contracts range from $45,000 to $2.4M TCV, 1–3 year terms
   - 3 contracts in modified state showing catch-up adjustments
   - All numbers internally consistent: allocations sum to TCV, YTD recognition matches schedule


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUALITY STANDARD — NON-NEGOTIABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This demo will be evaluated by a B2B SaaS professional who uses tools like FloQast, Anaplan, Vena Solutions, Mosaic daily. The bar is: does this look and function like it could be a real competing product to those tools?

WHAT THIS MEANS IN PRACTICE:
1. BUSINESS LOGIC MUST BE CORRECT — calculations must actually work (allocations sum correctly, schedules amortize correctly, totals foot). Finance professionals will immediately catch arithmetic errors or inconsistent data.
2. DATA MUST BE INTERNALLY CONSISTENT — every number shown on a dashboard must come from the same seed data. No hardcoded KPI widgets that disagree with the underlying tables.
3. EVERY CONTROL MUST WORK — no dead buttons, placeholder modals, or "coming soon" sections. If a filter exists, it must filter. If a form exists, it must submit and update the UI.
4. REALISTIC DOMAIN CONTENT — use correct B2B SaaS terminology, realistic company names, realistic amounts and dates. No "Acme Corp", "John Doe", "$10,000" placeholder values.
5. PROFESSIONAL DEPTH — at least 4 fully built pages/views with meaningful content on each. Shallow pages with 2 cards and a chart are not acceptable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN REQUIREMENTS — CRITICAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Colour system and aesthetic: dark navy enterprise (#0A0F1E background, #111827 surfaces, #1E3A5F sidebar accent, #4F8EF7 primary blue, #34D399 success green). Typography: Inter. Data-dense operational dashboard — no hero sections.

THE DESIGN MUST:
- Use a DARK THEME (not white/light). The reference products (FloQast, Anaplan, Vena Solutions, Mosaic) increasingly use dark enterprise UIs. Ours must too.
- Have a fixed left sidebar navigation with product logo, nav items with icons, and a user profile at the bottom
- Use data tables extensively — this is an operational tool, not a marketing site. Tables should have hover states, sortable columns, row actions, and pagination.
- Show real charts built from the seed data: bar charts with real values, line charts with real trends, pie/donut charts with real breakdowns.
- Typography: use a professional sans-serif (Inter, Geist, or IBM Plex Sans). Numbers in a monospace font where precision matters.
- NO generic hero sections, NO testimonial carousels, NO feature marketing sections. This is an internal operational tool.
- Loading states, empty states, success toasts, and error states must all be designed — not afterthoughts.
- Mobile responsive — but optimized primarily for desktop/laptop (this is an enterprise ops tool).

FAVICON: Create a unique, domain-relevant SVG favicon in /public/favicon.svg. It should represent the product's purpose visually (a small icon that could belong to the product). Reference the design direction above for colours.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TARGET USER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Harry Randhawa and their finance/operations team. They are non-technical but highly numerate professionals who will probe every calculation and every workflow. They will not be impressed by a pretty landing page — they will be impressed by correct numbers and smooth workflows that reflect their actual daily work.

Looking for a production-quality solution. Quality over price.

TIMELINE: Demonstrate a working version immediately.


========================
BEGIN
========================

Read the whole job post, inspect the current project, make grounded product decisions, and build the client-faithful product demo now. Prioritize accurate requirements, premium visual design, and reliable functionality equally. Verify the working result before claiming completion.
