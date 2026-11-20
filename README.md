# Smart Campus Room Finder (Assignment #04)

A small React + TypeScript + Tailwind app. A student enters the number of attendees and the
equipment they need, sees only the matching rooms, picks one and checks whether it is free
for a time slot. All data is fictional; there is no login and no database.

## Features
| ID | Behaviour |
|---|---|
| F1 | Show only rooms with `capacity >= attendees` (exact capacity is accepted). |
| F2 | Show only rooms that have ALL selected equipment items. |
| F3 | A blocked room is shown with a "Blocked" badge but can never be reported as available. |
| F4 | If no room matches, an empty-state message is shown and the check button is disabled. |
| F5 | Changing the selected room (or any input) clears the old result; the next check uses the newly selected room. |

The original rules AC1-AC5 are unchanged: reject start >= end and past times (AC1), maximum 120 minutes (AC2),
blocked room (AC3), overlaps rejected but touching endpoints allowed (AC4), Available/Unavailable answer without
changing booking data (AC5).

## Run
```
npm install
npm run dev          # open the printed local URL
npm run test         # vitest run
npm run typecheck
npm run lint
npm run build
node scripts/dup_report.mjs src      # duplication report used in the report
```

## Structure
```
src/data.ts                     room catalog (6 rooms, equipment, blocked flag, own bookings)
src/types.ts                    Room, Booking, AvailabilityDecision
src/lib/availability.ts         AC1-AC5 rules (unchanged), checkAvailability / validateInterval / canBook
src/lib/availabilityRequest.ts  parses the HH:MM form input and calls the rules
src/lib/filter.ts               F1, F2, F4: filterRooms, parseAttendees, emptyStateMessage
src/lib/state.ts                reducer for the screen: filters, selection, F5 rule
src/lib/time.ts                 HH:MM <-> minutes
src/components/                 presentation only: Panel, Field, FilterPanel, RoomList,
                                AvailabilityForm, ResultPanel, BookingsPanel, CurrentTimeBar
src/App.tsx                     wires the reducer to the components
```

## Requirement -> test mapping (75 tests)
| Requirement | Tests |
|---|---|
| AC1 invalid / past time | T02, T03, T04, T05, T22, T23, T24, T32, T33, T34, P01 |
| AC2 120 vs 121 minutes | T06, T07, T25, T26, I06 |
| AC3 blocked room | T13, T27, T28 |
| AC4 overlap vs touching | T01, T08-T12, T14, T16, T17, T21, T29, T30, I05, I07 |
| AC5 no mutation, Available/Unavailable | T15, T19, T20, T21, T31, I08, S11 |
| F1 capacity (exact / insufficient) | F1-01 .. F1-05, I05 |
| F2 equipment (ALL items) | F2-01 .. F2-06, I05 |
| F3 blocked never available | I01, I02, S10 |
| F4 empty state | F4-01, F4-02, S07 |
| F5 room switching refreshes the result | S02, S03, S04, S05, S06, S09, I03 |
| Integration (filters -> selected room -> rules) | I01 .. I08 |
| UI behaviour (reducer, no DOM needed) | S01 .. S12 |
| Refactoring parity | P01 |
| Catalog integrity | D01 .. D06 |

## Git history (commit references)
```
0259b58 initial: Bolt Version 10 export (Practice #07 prototype), 18 tests
4ce6f00 feat(data+filter): equipment field, 6-room catalog, pure filter module, F1/F2/F4 tests
ce58305 feat(ui): requirements panel (attendees + equipment), filtered room list, empty state, ...
d23fcb4 refactor: split App into reducer + components, dedupe form/panel/validation, add tests
b2e650c refactor(state): single rule that clears the result on any input change; duplication script
```
(The hashes stay valid if this repository, including `.git`, is pushed unchanged.)

## Known limitations
* No DOM/component tests: that would need extra dev dependencies. UI behaviour is covered at reducer level and by manual screenshots.
* The visual layout on phones is checked manually only.
* `canBook` still lives in `availability.ts` (kept so the 17 original tests stay unchanged).
