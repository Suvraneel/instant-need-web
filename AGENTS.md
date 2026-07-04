# Regression Prevention Workflow

This is one of four sibling repos: `instant-need` (backend),
`instant-need-shared` (types/API client), `instant-need-web` (this one),
`instant-need-mobile`. There's no shared CI across them, so a change here
can break mobile (or vice versa) without anything catching it automatically.

**Pre-commit regression checklist**
- [ ] Checked `instant-need-shared` for whether a changed/added type or
      field should be synced there too (this repo hand-duplicates shared
      types and has already drifted once)
- [ ] Checked every page/screen that renders a shared component
      (`ProductCard`, `FeaturedCategories`, `Badge` variants, etc.) before
      changing its shared styling or behavior
- [ ] Reused an existing component/util (`src/components/ui/`,
      `src/lib/utils.ts`) instead of writing a new one
- [ ] Diff touches only the files this task needs
- [ ] Added/updated a `vitest` test if the change touches business logic
      (not just styling)
- [ ] Ran `npx tsc --noEmit`
- [ ] For any UI change: ran `npm run dev` and actually looked at the real
      page in a browser — a clean typecheck does not catch cropped images,
      faded colors, or missing badges

**Before changing existing code**
- This repo hand-duplicates types from `instant-need-shared`
  (`src/lib/types/`) instead of importing them — they've already drifted at
  least once (missing `availabilityStatus`, `primaryThumbnailUrl`). Before
  changing a type here, check whether `instant-need-shared/src/types/`
  has (or should have) the same field, and keep them in sync.
- Shared components used on multiple pages (`ProductCard`,
  `FeaturedCategories`) — check every page that renders them before
  changing shared styling/variants. Reusable `Badge`/`ui/` component
  variants (e.g. `destructive` = 10% opacity, meant for subtle status
  pills) are used in more places than the one you're looking at; override
  per-instance with `className` rather than changing the shared variant.

**Reuse over rewrite**
- Check `src/components/ui/` and `src/lib/utils.ts` for an existing
  component/helper before writing a new one.

**Scope discipline**
- Keep diffs to the files the task needs. Flag unrelated issues separately
  instead of folding them in.

**Tests**
- `vitest` is configured (`npm test`) but this repo has few/no component
  tests yet — don't assume "no test failures" means "verified."

**Verify before declaring done**
- `npx tsc --noEmit` after any change.
- For any UI change, actually run it: `npm run dev` and check the real
  page in a browser (the Chrome extension/preview tooling), not just a
  type-check. Cropped images, faded colors, and missing badges are
  invisible to `tsc`.
- Local dev needs `.env.local` to have `IMAGE_HOSTNAME` matching whatever
  host actually serves images in production (e.g. the CloudFront domain),
  or `next/image` will reject every remote image locally with an
  unrelated-looking crash — don't mistake that for a real bug before
  checking `.env.local` against `.env.example`.
