Product Requirements Document (PRD)

Project: Minimalist Interactive Diet & Macronutrient Planner
Version: 0.9 (initial draft)
Prepared for: Juan Gomez / Web-dev team
Last updated: 21 May 2025

⸻

1 . Goal & Vision

Build a web application that lets anyone turn basic personal and dietary data into an evidence-based daily calorie and macronutrient plan in seconds. The site must:
	•	Feel effortless: ultra-clean UI, plain-language prompts, mobile-first.
	•	Be trustworthy: calculations trace back to peer-reviewed formulas and Dietary Guidelines.
	•	Be flexible: support mainstream and niche diet styles, allergies, and manual overrides with all components updating coherently.
	•	Guide, not just calculate: surface context-aware tips (e.g., “consider B12 if vegan”) so users leave knowing why the numbers matter.  ￼

⸻

2 . Success Metrics

KPI	Target at public launch	Notes
First-time completion rate	≥ 80 %	% of visitors who reach results screen
Calculation accuracy	±3 % vs. unit-test baselines	Unit tests built from doc’s worked examples  ￼
Mobile Lighthouse score	≥ 90 Performance / 100 Accessibility	Chrome audit
Avg. time-to-result	≤ 7 s P95	From “Start” click to results rendered


⸻

3 . User Personas
	•	General health seeker – wants a quick, credible daily target.
	•	Macro tweaker – fitness-savvy user needing granular control & advanced overrides.
	•	Diet-specific follower – keto, vegan, paleo, etc.; expects macros & guidance to adapt instantly.
	•	Professional (coach / RD) – may run multiple profiles and export numbers.

⸻

4 . Core Functional Requirements

#	Feature	Description	Interaction Dependencies
F1	Data Capture Wizard	Collects age, sex, height, weight, body-fat %, activity level, goals, diet style, allergies. Inline validation & unit toggles.	Powers F2-F6
F2	Metabolic Engine	Implements Mifflin-St Jeor (default), Katch-McArdle, Cunningham, or user-supplied RMR; calculates TDEE via PAL and TEF logic.  ￼	Exposed by API; feeds F3
F3	Macro Allocator	Converts calories to gram & % targets based on diet preset or custom sliders. Enforces AMDR / safe minimums; auto-adjusts remaining macros when one is edited.  ￼	Calls F4 tips
F4	Contextual Guidance Engine	Rule-set surfaces diet-specific micronutrient flags (e.g., B12 for vegans, electrolytes for keto).  ￼	Consumes F1 & F3 outputs
F5	Results Dashboard	Minimalist card layout showing calories, macro table, optional micronutrient notes, and export buttons (PDF, CSV, copy link). Updates live on any input change.	
F6	Profile & Storage (optional v2)	Auth + secure cloud storage of multiple profiles; allows progress tracking. Not MVP-critical but architect for plug-in.	
F7	Accessibility Layer	WCAG 2.1 AA contrast, keyboard nav, ARIA labels; ensure chart/table alternatives via text.	
F8	Internationalization	Metric/imperial toggle, language files (EN launch, ES planned).	
F9	Analytics & Error Telemetry	Client-side events to measure funnel drop-off; server logs validation failures.	


⸻

5 . User Flow (happy path MVP)
	1.	Landing → “Start Planning”
	2.	Wizard Step 1 – Basics (age, sex, height, weight)
	3.	Step 2 – Body-fat? (optional) → “Skip” allowed
	4.	Step 3 – Activity & Goal (radio buttons, deficit/surplus slider)
	5.	Step 4 – Diet Style & Allergies (pill selectors, chips)
	6.	Step 5 – Review & Calculate → spinner overlay → Results Dashboard
	7.	(Advanced toggle) opens side drawer to override equations, TEF, custom macros; dashboard re-renders instantly.

⸻

6 . Non-functional Requirements
	•	Performance: ≤ 150 ms p95 backend compute; edge-cached static assets; lazy-load heavy tips.
	•	Tech Stack:
	•	Front-end — React + TypeScript, Vite, TailwindCSS; state via Zustand.
	•	Back-end — Python FastAPI micro-service exposing /calculate endpoint; packaged formulas as pure functions with unit tests from doc’s worked examples.
	•	Hosting — Vercel (front) + AWS Lambda/API Gateway (calc) or unified Next.js if SSR chosen.
	•	Security & Privacy: No PHI; all inputs transient unless user signs in. HTTPS, Content-Security-Policy, OWASP top-10 tested.
	•	Scalability: Stateless compute; cold-start ≤ 500 ms; Target 100 concurrent requests at 2× traffic estimate.
	•	Compliance: GDPR / CCPA consent banner for cookies & analytics.

⸻

7 . Interaction Logic Map
	•	Changing diet style triggers Macro Allocator presets & Guidance Engine rules.
	•	Editing protein grams recalculates carbs/fats to maintain calorie constancy; TEF recalculated if user toggled “dynamic TEF”.
	•	Providing custom RMR bypasses formula choice and propagates through to TDEE & macro math.
	•	Allergy list filters example foods inside guidance tooltips.
	•	Goal slider (deficit/surplus) simultaneously:
	•	Adjusts calorie target,
	•	Re-runs Macro Allocator with proportional macro split,
	•	Updates text explaining expected weekly weight change.

This guarantees coherent cross-feature behavior.  ￼

⸻

8 . Data Model (simplified)

UserInput {
  age: int
  sex: enum('male','female','other')
  weightKg: float
  heightCm: float
  bodyFatPct?: float
  rmrManual?: float
  activityLevel: enum|float
  tefPct?: float
  goal: enum('loss','maintain','gain')
  deficitSurplusKcal?: int
  dietStyle: enum('balanced','vegan','keto','lowCarb','paleo',…)
  allergies: string[]
  customMacros?: { proteinG?: float, fatG?: float, carbG?: float }
}

All calculations occur server-side; no PII persisted unless profile saved.

⸻

9 . Testing Plan
	•	Unit tests – validate formula outputs against doc’s numerical examples.
	•	Integration tests – wizard → dashboard, ensuring state propagation.
	•	E2E (Playwright) – mobile and desktop critical paths.
	•	Accessibility audits – Lighthouse & axe-core CI gate.
	•	Fuzz tests – random invalid inputs, expect graceful error messages.

⸻

10 . Open Questions
	1.	Should the MVP include account storage (F6) or launch calculator-only?
	2.	Do we embed recipe/meal-plan APIs in v1 or defer to future “food log” module?
	3.	Where will brand/style guidelines originate (existing corporate palette vs. new)?
	4.	Acceptable latency budget for free-tier hosting vs. paid?

⸻

11 . Next Steps
	•	Stakeholder review of PRD → capture feedback & freeze scope.
	•	UI wireframes (low-fi) – due 28 May.
	•	Architectural spike on formula library & TEF variability – due 4 Jun.
	•	Alpha sprint schedule and resourcing once above decisions finalized.

⸻

This PRD distills every calculation rule, user option, and constraint from the uploaded specification into actionable product requirements while emphasizing a seamless minimalist experience and result integrity.