# NurseReady

A responsive nursing study workspace for fourth-year students in the Philippines.

## Included

- 13 subject areas, 17 reference-linked starter topics, a visible list of missing topics, and 17 original practice questions with option-by-option rationales.
- Subject → unit → topic organization, full-text search, quick/detailed notes, source dates, printing, bookmarks, highlights, annotations, and completion tracking.
- Mixed or topic practice, timed mode (60 seconds per item), score history, latest-answer mistake review, and interval-scheduled flashcards.
- Study planner, daily goals, dark mode, export and deletion.
- PDF/DOCX/TXT/image import, preserved originals, editable working copies, separate manual summaries, metadata, review warnings, duplicate detection, and manual conflict flags.

## Stack and source map

React 19 + TypeScript + Vinext/Vite; Cloudflare-compatible Worker. Radix/Shadcn primitives provide the accessible interaction components. Lucide supplies icons.

- `app/page.tsx`: dashboard and study views / client behavior.
- `app/globals.css`: responsive navy/teal design, dark theme, print rules.
- `lib/content.ts`: starter notes, references, topic inventory, original question bank.
- `lib/study.ts`: data model, local date helper, limited conflict heuristics.
- `app/api/study/route.ts`: private study state API.
- `app/api/files/route.ts`: private original file API.
- `lib/server.ts`: runtime bindings and identity boundary.
- `db/schema.ts` and `drizzle/`: database schema and migrations.
- `tests/storage-smoke.mjs`: isolated storage/auth-boundary integration check using the built Worker.

## Development setup

Use Node 22.13 or newer (Node 24 recommended) and pnpm. Keep `pnpm-lock.yaml`.

```sh
pnpm install --frozen-lockfile
pnpm build
```

The Worker needs a D1 binding named `DB` and an R2 binding named `BUCKET`. The hosting manifest declares these logical names; Sites provisions production storage. A standalone deployment must provision equivalent resources and configure its own identity gateway.

A clean extracted copy defaults to the portable execution profile. There is no need to create a profile file. With the Sites plugin installed, its `configure-execution-profile.mjs` helper can select the managed profile when needed.

After the first build, initialize local D1 once per pending migration:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_chilly_saracen.sql
pnpm dev
```

Use the local address printed by the development command. The portable starter's built-in local sign-in mock is for local development only. The managed preview intentionally does not provide hosted sign-in. Do not expose the development server publicly.

In managed Sites environments use the supervised preview and normal Sites build/publish workflow. Source archives omit the live project identity. Register a new Site before deploying a separate copy; do not overwrite an unrelated Site.

## Production identity and privacy

Private hosted Sites require sign-in. APIs require the trusted `oai-authenticated-user-id` header injected by the platform. Every record and object is scoped by that identity. A standalone public Worker must NOT trust arbitrary incoming identity headers: place it behind a trusted authenticating gateway that strips user-supplied identity headers and sets its own, or implement verified server-side authentication before public deployment.

Study data is stored in D1 as a per-user JSON record. Original bytes live in R2. Theme preference is localStorage only. Extraction executes client-side; extracted and edited text is saved to D1. No OpenAI, OCR, or other document-processing API is called. Do not upload identifiable patient records.

The app debounces saves, serializes outgoing writes from one tab, warns before leaving with pending writes, and exposes retryable errors. Concurrent edits from different tabs/devices use last-write-wins; coordinate edits in one tab. Study records are limited to 1.5 MB serialized text, with an explicit save error if exceeded. Original uploads are limited to 15 MB each.

Export downloads a JSON copy of notes and all study state; original file bytes must be downloaded separately from each note. Deletion removes the account's study row and originals. There is no recycle bin. Planner times are local-device times and do not trigger background notifications.

## Import behavior and limits

- TXT: full text; flags replacement characters that may indicate an encoding issue.
- PDF: browser PDF.js reads every page and adds a page marker; unreadable/error pages are recorded. Reading order, tables, diagrams and scans need checking against the original. No OCR is available.
- DOCX: Mammoth raw-text extraction. Embedded images, header/footer content, text boxes, pagination and table formatting are not reliably represented and are explicitly flagged. The original remains downloadable.
- Images: original preserved; manual transcription required.
- SHA-256 detects duplicate originals, and exact text detects duplicate pasted notes. Duplicates remain separate and are flagged, not discarded.
- Students choose subject/unit/topic, correct working text, add summaries/tags, and flag conflicts. No automatic clinical verification is claimed. Pattern checks cover only a few known misconceptions. Older sources are flagged for review, not automatically called wrong.

The bundled PDF.js worker corresponds to the installed package. If upgrading PDF.js, refresh it:

```sh
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs
```

## Clinical content scope

All content is educational. It is not a complete syllabus, PNLE blueprint mapping, clinical protocol, patient-specific recommendation, or independently faculty-certified reviewer. Clinical and medication summaries should be checked against current authoritative guidance, local practice and clinical supervision. No medication dose algorithms are supplied. Reference dates and check date are stored with topics. Foreign textbook principles are identified where Philippine legal/role adaptation is necessary.

The PRC official nursing page links the enhanced Tables of Specifications (Resolution No. 10, s. 2025). This app has not claimed or calculated full alignment with it. The content inventory identifies missing notes rather than marking those topics complete. Completion is a student checklist; accuracy is the percentage of correct submitted answers. Neither predicts competence or licensure outcomes.

Add notes in `lib/content.ts` using a new stable ID, correct subject index, unit, quick review, applicable clinical sections and checked sources. Add original questions linked to the same topic ID. Keep option-level rationales and references accessible. Remove an inventory gap only when its material is actually covered. Obtain nursing-faculty review before treating the collection as a comprehensive reviewer.

## Checks

```sh
pnpm exec tsc --noEmit
pnpm build
node tests/storage-smoke.mjs
```

The integration check uses a disposable isolated Miniflare database and bucket, not production user data. It tests identity rejection, persistence, per-user isolation, upload/download, and delete behavior. Browser preview checks cover navigation, search and practice UI; hosted authentication is not reproduced by the managed preview.

## Personal notes review

Choose **Review my notes → Paste or upload notes → Save & start reviewing**.
Existing student notes also appear automatically. The reader offers full detailed
text, section navigation, text search, larger text, bookmarks, selected passages,
a separate editable summary, and hide-and-recall with saved responses. Reviewed
sections and the last section are stored in the existing private study record.
Section completion is self-reported, not a mastery score. Editing a section's
text changes its progress key so older completion does not certify new material.
Sections preserve every character and original order; no AI-generated explanations,
clinical verification, or OCR is added. Original uploaded files stay downloadable.
Print outputs the full working notes, or the summary when its tab is selected.

## Review hub and quiz learning modes

The Review Hub groups starter topics by subject and shows notes read, unique
questions attempted, latest-answer performance, and topics to revisit. Each row
links directly to study notes and practice. Results describe this starter bank,
not overall clinical competence or PNLE readiness.

Practice offers Tutor mode (check each answer to see rationales, locking that
choice for the attempt) and Exam mode (rationales after submission; optional
timer). Filters select all, not-attempted, or latest-incorrect questions. Session
fill only draws from the chosen filter and never repeats an item within a session.

UX research references: Nurseslabs nursing test-bank organization and its
practice/challenge distinction (https://nurseslabs.com/nursing-test-bank/), and
SimpleNursing's quiz selection and topic feedback
(https://simplenursing.com/nursing-school-quiz-builder/), consulted 2026-09-29.
These inform interaction patterns only; no proprietary question bank or notes
were copied, and NurseReady is not affiliated with those providers.

## No-sign-up online study spaces

Visitors automatically receive a private study space. D1 stores study data and a SHA-256 hash of a 256-bit recovery token; R2 stores originals. An HttpOnly SameSite cookie remembers the token for up to a year and is renewed when opening the app. Settings lets students download/copy their private recovery code and restore the same space on another device. Never share this code: it grants full access. Losing both the code and browser cookie means losing access; server storage is not a guarantee of recoverability. Export study data and download originals for backups.

Existing signed-in online data is retained when the visitor first creates a recovery code while still signed in. Local laptop notes are separate from online notes. No local data is automatically transferred. Public access must be enabled through the Sites access policy; changing app code alone does not remove the hosting gate.

Apply all migrations, including 0001_real_nuke.sql, on local installations before running this version. pnpm start now supports anonymous saved spaces without development-only sign-in. Changes from a stale tab/device return HTTP 409; the UI preserves unsaved edits and asks the student to export before reloading.
