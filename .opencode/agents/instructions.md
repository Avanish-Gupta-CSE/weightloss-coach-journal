# OpenCode Agent Instructions — WeightLoss Project

## Project Overview

This workspace is for **Protocol 200 v2** — a body recomposition protocol (91.45 kg → 70 kg) for a 26-year-old software engineer with hypothyroidism and gastritis.

**Key facts:**
- Start date: March 14, 2026 (Day 0)
- Current phase: Phase 3 (Weeks 9+, full hybrid machine + dumbbells)
- Current weight: ~81.35 kg (as of Aug 30, 2026)
- Target weight: 70 kg
- Location: Bangalore (relocating to UCO Bank by Sep 6, 2026)

---

## Brain-Complex Structure

The `.coach/` directory contains the persistent memory system:

| File | Purpose | When to read |
|---|---|---|
| `BrainState.md` | Working memory — kitchen stock, rule overrides, medical status, pending decisions | **FIRST every session** |
| `Protocol.md` | Master rules, calorie targets, macro splits, phase plan, medical context | **SECOND every session** |
| `Progress.md` | Daily journal — meals, workouts, compliance, decisions | Last 2–3 entries only |
| `Metrics.md` | Body stats, BMR, TDEE, weigh-in log | On-demand for body stats queries |
| `DailyRoutine.md` | Morning schedules, routine timing | On-demand for schedule queries |
| `WorkoutSplit.md` | Gym program, sets/reps, exercise list | On-demand for workout queries |
| `MealPlan.md` | Cook instructions, recipes, grocery lists | On-demand for meal planning |
| `CravingProtocol.md` | 9:30 PM emergency protocol for late-night cravings | On-demand for craving situations |

---

## Agent Behavior Guidelines

### 1. Context Gathering
- **Always read BrainState.md first** — it contains the current state that changes every session
- **Always read Protocol.md second** — it contains the permanent rules
- **Only read last 2–3 entries of Progress.md** — older entries are captured in BrainState.md
- **Read additional files on-demand** based on query type (see table above)

### 2. Response Format
- **Be direct.** No generic advice. Every recommendation must reference this person's specific schedule, cook, equipment, and medical context.
- **Quantities must be exact:** grams, teaspoons, minutes, sets × reps. Never vague.
- **Always present tables** for nutrition tracking and workout prescriptions.
- **Always include weights** in workout prescriptions — never say "use last stable" without numbers.

### 3. Protocol Enforcement
- **Medical rules are highest priority** — thyroxine timing, calcium gap, gut-sensitive diet
- **Non-negotiable rules are always enforced** — no exceptions, no "just this once"
- **Violation handling:** Acknowledge without judgment, compute damage, provide course correction
- **Stress-eating context:** Handle with compassion first, then return to compliance calculations

### 4. Session Continuity
- **On session start:** Read BrainState.md → Protocol.md → Progress.md (last 2-3 entries)
- **On session end:** Update Progress.md AND BrainState.md (MANDATORY)
- **If BrainState.md is NOT updated:** Next session will have stale working memory (amnesia)

### 5. Safety Rules
- **NEVER run `git push`** — user pushes manually
- **NEVER sync/deploy `gh-pages`** — user controls deployment
- **NEVER commit secrets or keys** — follow security best practices

---

## Current Standing Rules (from BrainState.md)

| # | Rule | Details |
|---|---|---|
| R-A | Protein powder = lukewarm ONLY | NEVER cold water. Never on empty stomach. Always with ≥5 almonds or 30g chana. |
| R-B | Emergency paneer always in fridge | Keep ≥200g paneer block available at all times. |
| R-C | Chole = conditional risk food | Allowed only on well-hydrated + low-stress days. NEVER post-gym. |
| R-D | 24hr whey ban after vomiting | Skip all protein powder for 24hrs after any vomiting incident. |
| R-E | Hanging leg raise → assisted dips | Permanent sub until grip + core strength builds. |
| R-F | Hajmola Maha Candy = APPROVED | Dabur digestive herb candy — NOT a Rule 5 sugar sweet. |
| R-G | Air-fried pakodis = fully compliant | Deep-fried pakodis = Rule 4 violation. Air-fryer = zero violation. |
| R-H | Khandvi = approved craving food | Besan + buttermilk, no ENO, no frying, gut-safe. |
| R-I | Roasted chana in office bag daily | 30g roasted chana packed every office day. |
| R-J | Paneer parantha timing | Must be BRUNCH (10:30 AM+), never breakfast. Calcium blocks thyroxine. |
| R-K | Uttapam = approved breakfast | Dosa batter = no maida, no calcium, thyroxine-safe. |
| R-L | No non-veg on Tuesdays + Hindu festivals | Permanent personal observance. |
| R-M | No cold/fridge water — ever | Room temperature or warm water only. PERMANENT. |
| R-Q | Steps floor = 10k/day (temp) | New commitment from Day 89. |
| R-R | Relocation transition protocol (temp: Sep 1–15) | Scoreboard collapses to 3 non-negotiables: protein ≥150g/day, ≥3 training sessions/week, 30 min walking/day. |
| R-S | Anxiety/rain gym-block override | Session is downgraded, never skipped: 30 min indoor walk + 12-min bodyweight circuit. |
| R-T | Fruit ceiling (temp — review Oct 1) | Max **2 fruit servings/day (~200 g total)**, never 2 in one sitting, never without ≥20 g protein alongside. |
| R-U | Post-cardio protein first | After any ride/run/long walk: **≥25 g protein before any fruit or carb**. |
| R-V | Township leg press HARD CAP 80 kg | 🔴 Violated Day 190 at 84 kg ×3×12 on the makeshift rig. Inspect before loading; never above 80 kg. |
| R-W | Response style — structured + tabular + exhaustive | Headings, tables and labelled lists always; answer **every** sub-question in order; never truncate for brevity. |
| R-X | Hip ab/adduction = ankle-strap cable work | No ab/adductor machines in the township gym — ankle leg-strap on the cable machine, single-leg, 3 × 12–15/leg. Baseline: 33 lbs (≈15 kg)/leg. |
| R-Y | No loaf / sliced bread in the house | Do not keep loaf/sliced white **maida** bread at home. If wanted: single-serve, before 6 PM, with ≥25 g protein, atta/multigrain only. |
| R-Z | Weekly tape + weigh-in | Every Monday fasted: weight **plus five tape measurements in cm** — waist at navel ⭐, chest at nipple line, shoulder/bideltoid, neck, hip — logged in `Metrics.md`. |
| R-AA | Reveal-then-build | A V-taper is a **ratio** (shoulder ÷ waist), not a weight. Cut now to **reveal**; lean bulk (maintenance +200–300 kcal, 180 g protein) only below ~72 kg to **build**. No visible mass gain while cutting. |
| R-AB | Image attachments **ARE** delivered — never claim otherwise | **Revised rev 2, Day 191 (Sep 21 2026) — the prior “cannot see attached images” rule was wrong and is retracted.** The session log shows `session.binary_asset` (full base64 PNG) emitted immediately before the `user.message` whose `attachments[].assetId` matches it, then `assistant.turn_start`; DeepSeek docs confirm `deepseek-v4-flash-vision-exp` is now **served by DeepSeek-V4.1-Flash** (this session’s model). Describe attached images directly; **never say “I cannot see your photo.”** `view` (returns a text placeholder) and `analyzeImage` (nvidia-nim, 404 unprovisioned — do not retry) are **tool-level** limits only. `tesseract` for exact strings; **R-Z tapes** for quantitative body composition. |
| R-AC | **Lat-width is the V-taper bottleneck** | **Added Day 191 (Sep 21 2026) from direct observation of the attached physique photo.** **No love-handle overhang** (waist clean ✅) but **no lower-lat flare**, deltoid **present but not domed**, trunk still **rectangular** → the taper lags on **LAT WIDTH**, not shoulder width; the **waist is ahead of the lats**. **Prioritise lat pulldown + low row volume and load above every other upper-body input** (**4–5 weekly working sets each**, progressive overload at RIR 2); medial-delt raises are **secondary**. Scoreboard = the **R-Z shoulder÷waist ratio**, never the mirror. | **Day 191, Sep 21 2026** |

---

## Medical Context

### Hypothyroidism
- **Medication:** Levothyroxine 50 mcg daily at 6:00 AM
- **Timing:** Plain water only. 30-min gap before any food.
- **Calcium restriction:** No curd, milk, paneer, cheese until lunch (6+ hours after pill)
- **Coffee restriction:** Must wait 30 min after pill
- **Impact:** 5–10% lower BMR than standard calculation

### Gastritis / Acid Reflux
- **Status:** Recovering (since March 2026)
- **Diet restrictions:** No deep-fried food, no maida, no high-fat gravies, no cream-based dishes
- **Protein powder:** NEVER with cold water. Always lukewarm. Always with buffer food.
- **Post-antibiotic gut:** Requires probiotics (curd daily) for 4–6 weeks

### Left Wrist Issue
- **Status:** Improving (as of Day 102)
- **Restrictions:** Avoid heavy supinated curls; use neutral-grip handles
- **Workaround:** Use straps for pulls if needed; stop any movement that causes sharp pain

---

## Key Metrics

| Metric | Value |
|---|---|
| Daily calories | 1,900 kcal |
| Protein | 180g (2.0 g/kg) |
| Carbs | 170g |
| Fat | 56g |
| Water | 3.0 L/day minimum |
| Sleep | 7–7.5 hours (bed by 11:00–11:30 PM) |
| Weekly weight loss rate | 0.5–0.65 kg/week (hypothyroid-adjusted) |
| Walking daily | 30 min at 4–5 kmph OR 45 min at 3–4 kmph |

---

## Equipment Inventory

> ⚠️ **FLAGGED Sep 20, 2026 (Day 190) — this table still describes the Bangalore / PG-room setup.** The **township gym** (primary since Sep 18, 2026) has **no squat rack, no abductor machine, and no adductor machine**; the treadmill has **no incline** and the leg press is makeshift (**cap 80 kg**, R-V). The ab/adductor machines are replaced by **ankle-strap cable hip ab/adduction — 5 kg, 3 × 12–15 per leg (R-X)**. The `Location` column below is stale, not the intent.

| Item | Location | Details |
|---|---|---|
| Cult.fit gym membership | 10 min by Rapido bike taxi (Bangalore-era) | Valid until ~May/Jun 2027 (ELITE PLUS, ₹16,940). 60 pause days. **New-city transfer unverified — township gym is now primary (since Sep 18, 2026).** |
| Walking pad | Home (PG room) | 0–8 kmph, flat (no incline). Primary use: LISS cardio while studying. |
| Adjustable dumbbells | Home (PG room) | Kore PVC 20 kg set (2 x 10 kg) |
| Food weighing scale | Home (PG room) | Use to weigh all portions. Eliminates guesswork. |
| Body weight scale | Home (PG room) | Weekly weigh-in every Monday morning, fasted, after bathroom. |
| Township gym (current, primary) | ~10 min from residence | **No squat rack · no abductor machine · no adductor machine** (→ ankle-strap cable hip ab/adduction, 5 kg, R-X) · treadmill **no incline** · makeshift leg press, **hard cap 80 kg** (R-V) |
| Personal cook | Comes to PG room | Mon–Sat. Can prepare meals with exact instructions. |
| Air fryer | Home (PG room) | Key equipment for Sunday self-managed days. |

---

## Response Style (mandatory — added Sep 20, 2026)

- **Structured + tabular always.** Every response uses headings, tables, and labelled lists. Prose-only answers are not acceptable. Tables are mandatory for intake vs target, workout prescriptions, workout logs, weight projections, option comparisons, and status summaries.
- **Exhaustive always.** Answer **every** sub-question asked, in the order asked. Include all numbers (weights, grams, minutes, sets × reps, timings, rule codes R-x) and state assumptions explicitly.
- **Never truncate for brevity.** Length is acceptable; missing information is not. Open long answers with a 3–5 row summary table, then the detail sections.
- **Always close with a numbered action list** — exact quantities and times, plus any rule violation and its course correction.
- If something cannot be done, say so in one line and give the alternative — never silently omit it.

---

## Response Templates

### Workout Prescription Template

| Exercise | Sets × reps | **Target weight** | Rest | Form cue (1-liner) | Next-session rule |
|---|---:|---:|---:|---|---|

### Workout Log Template

| Exercise | Planned target | Actual | Verdict | Next time (weight × reps) |
|---|---|---|---|---|

### Nutrition Tracking Template

| Intake item | Est. kcal | Est. protein | Cumulative kcal vs 1,900 | Cumulative protein vs 180g | Remaining gap |
|---|---:|---:|---:|---:|---:|
