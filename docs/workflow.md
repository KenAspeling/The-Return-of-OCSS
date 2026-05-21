# AI-Assisted Build Workflow

How OCSS was built, conversationally, from empty repo to themed multi-tenant app. Use this as a template for similar AI-driven builds.

## Phases, in order

### 1. Pick the stack and ship a vertical slice
Empty repo → Next.js + TypeScript + Drizzle + SQLite + a single "quick entry" page that did one real thing end-to-end. No auth, no polish, no abstractions.

**Output:** clickable demo of the core verb of the product.

### 2. Cut expensive dependencies fast
The moment cost (or risk) became a concern with a dependency, it got removed. Because the AI parser was isolated behind a clean interface, removing it touched exactly one file — not the schema, actions, or UI.

**Output:** dependency surface shrunk to what's actually needed.

### 3. Build the rest as vertical slices, not layers
Timer → entries → projects → invoices. Each one was DB → server action → page → component, completed in sequence. Not "build all the queries first."

**Output:** functional app. Ugly, but every feature works end-to-end.

### 4. Pause and polish in one dedicated pass
After it worked, the design language was defined as CSS variables — *all of them* — then components were rewritten against those variables. Geist fonts, glow background, OKLCH colors, gradient borders, micro-animations. One focused session, not sprinkled through the build.

**Output:** design system, not just styled components.

### 5. Install a process framework only once there's something to wrap
BMAD-METHOD went in *after* the app worked. Trying to spec-drive an empty project produces fiction; spec-driving a real codebase produces useful documentation.

**Output:** agents/workflows wrapping a real product, not a phantom.

### 6. Add auth as a refactor, not a feature
Because every query already used a single `DEFAULT_USER_ID` constant, switching to real sessions was a mechanical find-replace plus a middleware file. The schema only grew by two columns and one table.

**Output:** multi-tenant app — same code shape, scoped data.

### 7. Themes and accents were free
Light mode didn't require touching components — only the variable definitions. Accents added two new CSS vars (`--accent-hue`, `--accent-chroma`) and the existing tokens regenerated themselves.

**Output:** runtime-switchable themes and accent palettes with zero per-component work.

## The reusable principles

| # | Rule | Why it mattered |
|---|---|---|
| 1 | **Working > complete** | The "ugly but functional" version unlocks every later decision. You can't theme an app that doesn't exist. |
| 2 | **Isolate volatile deps behind one file** | AI provider, auth library, storage backend — each lives in exactly one module, so swapping costs ~10 lines. |
| 3 | **Vertical slices, not horizontal layers** | One feature DB→UI per cycle means each cycle is shippable and reviewable. |
| 4 | **Tokens before components, components before pages** | Themes/accents cost almost nothing because variables were already the source of truth. |
| 5 | **One polish session, not continuous polish** | Mixing function + form work multiplies cognitive load. Get the shape right, then style the whole thing. |
| 6 | **Adopt process frameworks late** | Methodologies (BMAD, ADRs, RFCs) are wrapping paper. The thing inside has to exist first. |
| 7 | **Refactor-shaped features** | Auth, multi-tenancy, theming all *look* like features but are really refactors. Build the single-tenant / single-theme version first so the refactor target is concrete. |
| 8 | **Reversible defaults** | Local SQLite, throwaway dev data, small commits — every step was undoable, so pivots stayed cheap. |
| 9 | **Match abstraction to the second use** | Don't extract a helper or class until two places need it. No premature services or interfaces. |
| 10 | **Conversational pacing beats big plans** | Each turn was 10–100 lines of diff. Never stuck reviewing a 2000-line PR. |

## A checklist for the next build

- [ ] Pick the smallest end-to-end thing the product does
- [ ] Build it with zero abstractions, no auth, sample data
- [ ] Show it working in the browser before adding feature #2
- [ ] Add features one at a time, each as a vertical slice
- [ ] When a dependency starts feeling expensive or risky, isolate it
- [ ] When all the core verbs work, *stop* and do one design pass
- [ ] Define tokens (color, radius, font, spacing) before touching components
- [ ] Only after the app exists, layer on: auth, themes, process framework, deployment
- [ ] Each of those is a refactor against working code, not a feature on top of nothing
- [ ] Keep PRs small enough that a human can read every line

## Anti-patterns observed

- **Spec-driving an empty repo.** Spec what doesn't exist, you get fiction.
- **Building auth first.** You don't know the data model yet.
- **Theming as you build.** You're styling things you'll throw away.
- **Adding abstractions on the first use.** You don't know the shape yet.
- **Mixing function and visual work.** One produces real progress, the other produces yak shaving.
