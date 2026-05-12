# Kiro Configuration for Protocol 200 Weight Loss Coaching

This directory contains Kiro-specific configuration for the Protocol 200 weight loss coaching system.

## Structure

```
.kiro/
├── steering/
│   └── protocol-200-coach.md    # Main coaching steering file (manual inclusion)
└── README.md                     # This file
```

## How to Use

### Activating the Coach

The Protocol 200 Coach steering file is configured for **manual inclusion**. To activate it in a Kiro session:

1. Type `#protocol-200-coach` in the chat to include the steering file
2. Or reference it using Kiro's context inclusion mechanism

### Keywords

The coach responds to queries about:
- `coach` - General coaching queries
- `weight` - Weight tracking and progress
- `gym` - Workout and exercise guidance
- `meal` - Meal planning and nutrition
- `protein` - Protein intake and macros
- `workout` - Exercise routines
- `diet` - Dietary guidance
- `craving` - Craving management
- `thyroxine` - Medication timing and interactions

### Brain Files

The coach relies on files in the `.coach/` directory:

**Always Read First:**
- `.coach/BrainState.md` - Current state, kitchen stock, active rules
- `.coach/Protocol.md` - Master rules and targets

**Read on Demand:**
- `.coach/Progress.md` - Daily log (read last 2-3 entries only)
- `.coach/Metrics.md` - Body stats and weigh-in log
- `.coach/DailyRoutine.md` - Time-blocked schedules
- `.coach/WorkoutSplit.md` - Gym program
- `.coach/MealPlan.md` - Cook instructions and recipes
- `.coach/CravingProtocol.md` - Emergency craving protocol

### Session Workflow

**On Session Start:**
1. Kiro reads BrainState.md and Protocol.md
2. Reads recent Progress.md entries
3. Reads additional files based on query type

**During Session:**
- Provides coaching based on current state
- References exact quantities, schedules, and medical context
- Enforces non-negotiable rules

**On Session End:**
- Appends session summary to Progress.md
- Updates BrainState.md with new state
- Updates Metrics.md if weigh-in occurred

## Differences from GitHub Copilot Setup

The `.kiro` setup mirrors the `.github` agent configuration but is adapted for Kiro's:
- Steering file system (vs GitHub Copilot's agent system)
- Manual inclusion model (vs automatic agent activation)
- Context management approach

## Current Protocol State

- **Start Date:** March 14, 2026 (Day 0)
- **Current Day:** Day 55 (May 8, 2026)
- **Starting Weight:** 91.45 kg
- **Current Weight:** 85.85 kg (unofficial, May 6)
- **Target Weight:** 70 kg
- **Phase:** Phase 2 (Weeks 5-8, machines + free weights)
- **Gym Sessions:** 30 completed

## Medical Context

- **Hypothyroidism:** Takes Levothyroxine 50 mcg daily at 6:00 AM
- **Gut sensitivity:** Recovering from gastritis, requires gut-friendly diet
- **Thyroxine rule:** No calcium at breakfast (blocks absorption)

## Non-Negotiable Rules

1. Thyroxine first at 6:00 AM (30-min gap before food)
2. No Swiggy/Zomato after 7:30 PM
3. No maida (refined flour)
4. No deep-fried food
5. No sugar-loaded sweets
6. Max 1 tsp oil per dish, zero butter/cream/ghee
7. Walking pad minimum 30 min/day
8. Sleep by 11:30 PM, wake by 6:00 AM
9. Weekly Monday morning weigh-in
10. Every meal must have protein
11. Exam prep is sacred

## Support

For questions about the coaching system, refer to:
- `.coach/Protocol.md` for master rules
- `.coach/BrainState.md` for current state
- `.github/copilot-instructions.md` for original agent design
