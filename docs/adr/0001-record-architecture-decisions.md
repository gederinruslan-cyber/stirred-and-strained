# 0001 — Record architecture decisions

- **Status:** accepted
- **Date:** 2026-10-31
- **Feature:** M0-00

## Context
Work is done feature by feature, often by agent sessions without memory of earlier ones.
Decisions need to survive sessions and be easy to find.

## Decision
Decisions with a real alternative are recorded as short ADRs in `docs/adr/` using
`template.md`. Superseded ADRs stay and point to their replacement.

## Consequences
A session reads the related ADRs before planning. No ADR for choices without an alternative.
