---
name: UI first, backend later
description: User prefers to build UI layout/structure first without functionality, then document backend tasks separately for the team
type: feedback
---

When implementing new features, build the UI layout and structure first using placeholder/hardcoded data. Do not implement backend endpoints at the same time. Instead, create a task document describing what the backend team needs to implement.

**Why:** Team may be split — UI developer and backend developer work independently. Backend work is documented separately so the team can pick it up later.

**How to apply:** On feature requests that span frontend + backend: (1) create a task doc with backend requirements, (2) build the UI with mock/hardcoded data, no real API calls.
