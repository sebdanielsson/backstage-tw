# Upstream Fix: Add `postcss-loader` to Backstage CLI Bundler

## Summary

The Backstage CLI's bundler (rspack/webpack) does not include `postcss-loader` in
its CSS rule pipeline. This means `postcss.config.mjs` files in user projects are
never read, and PostCSS plugins (e.g. `@tailwindcss/postcss` for Tailwind CSS v4)
have no effect. This document provides step-by-step instructions for submitting
an upstream fix to the `backstage/backstage` repository.

### Related Issues

- [backstage/backstage#30306](https://github.com/backstage/backstage/issues/30306) — "Allow adding custom loaders to bundler"
- [backstage/backstage#7102](https://github.com/backstage/backstage/issues/7102) — "Provide an API to extend Webpack config"
- [backstage/backstage#12893](https://github.com/backstage/backstage/issues/12893) — "Support custom configuration for Webpack"

---

## Prerequisites

- Git with commit signing configured (`git config --global user.name` / `user.email`)
- Node.js 22 or 24
- Yarn (the repo uses Yarn Berry / Yarn 4)
- A GitHub account with a fork of `backstage/backstage`

---

## Step-by-Step Instructions

### Step 1: Fork and clone the repository

Fork via GitHub UI, then clone to your local machine.

### Step 2: Install dependencies and verify setup

```sh
yarn install
yarn tsc
```

### Step 3: Create a feature branch

```sh
git checkout -b feat/cli-postcss-loader
```

### Step 4: Edit the transforms file

Open this file:

```plaintext
packages/cli/src/modules/build/lib/bundler/transforms.ts
```

Locate the CSS rule (around line 140). The current code looks like this:

```typescript
    {
      test: /\.css$/i,
      use: [
        isDev
          ? {
              loader: require.resolve('style-loader'),
              options: {
                insert: insertBeforeJssStyles,
              },
            }
          : CssExtractPlugin.loader,
        {
          loader: require.resolve('css-loader'),
          options: {
            sourceMap: true,
          },
        },
      ],
    },
```

**Add `postcss-loader` after `css-loader`** so that PostCSS plugins are executed
before CSS is handed to `css-loader`. The loaders run in reverse array order
(bottom-to-top), so `postcss-loader` must come AFTER `css-loader` in the array:

```typescript
    {
      test: /\.css$/i,
      use: [
        isDev
          ? {
              loader: require.resolve('style-loader'),
              options: {
                insert: insertBeforeJssStyles,
              },
            }
          : CssExtractPlugin.loader,
        {
          loader: require.resolve('css-loader'),
          options: {
            sourceMap: true,
          },
        },
        {
          loader: require.resolve('postcss-loader'),
          options: {
            sourceMap: true,
          },
        },
      ],
    },
```

### Step 5: Add `postcss-loader` as a dependency

Open this file:

```plaintext
packages/cli/package.json
```

Add `postcss-loader` to the `dependencies` object (alphabetically, near the
existing `postcss` entry):

```json
    "postcss": "^8.1.0",
    "postcss-loader": "^8.1.1",
```

Note: `postcss` is already a dependency. `postcss-loader` has `postcss` and
`webpack` as peer dependencies. `webpack` is already an optional peer dep of the
CLI package.

### Step 6: Run `yarn install` to update the lockfile

```sh
yarn install
```

### Step 7: Build and verify

```sh
# Build the CLI package
yarn workspace @backstage/cli build

# Run CLI tests
yarn workspace @backstage/cli test
```

Note: There is no existing `transforms.test.ts` file in the bundler directory.
The `transforms.ts` module has no unit tests currently. Consider adding a minimal
test if time permits (see Optional section below).

### Step 8: Create a changeset

```sh
yarn changeset
```

When prompted:

1. **Select package**: `@backstage/cli`
2. **Semver bump**: `patch` (the CLI is at 0.x, and this is a backwards-compatible addition)
3. **Summary**: Write a clear description, for example:

```markdown
---
'@backstage/cli': patch
---

Added `postcss-loader` to the CSS bundler pipeline, enabling support for
PostCSS plugins such as `@tailwindcss/postcss`. Projects can now use a standard
`postcss.config.mjs` in their app package to configure PostCSS processing.
```

### Step 9: Commit with DCO sign-off

All commits must include a `Signed-off-by` line:

```sh
git add -A
git commit -s -m "feat(cli): add postcss-loader to CSS bundler pipeline

Added postcss-loader after css-loader in the bundler transforms so that
PostCSS config files (postcss.config.mjs) are automatically picked up.
This enables tools like Tailwind CSS v4 to work out of the box.

Signed-off-by: Your Name <your.email@example.com>"
```

### Step 10: Push and create a Pull Request

```sh
git push origin feat/cli-postcss-loader
```

Create a PR on GitHub from your fork to `backstage/backstage` `master` branch.

Use this PR description template:

```markdown
## Hey, I just made a Pull Request!

Adds `postcss-loader` to the Backstage CLI's CSS bundler pipeline (both rspack
and webpack paths), enabling PostCSS plugins to work natively.

### Problem

The CLI's bundler configures CSS with only `style-loader`/`MiniCssExtractPlugin`
→ `css-loader`. There is no `postcss-loader`, which means `postcss.config.mjs`
files in user projects are silently ignored. This prevents tools like Tailwind
CSS v4 (which relies on `@tailwindcss/postcss`) from working.

### Solution

Add `postcss-loader` after `css-loader` in the `use` array of the `.css` rule
in `packages/cli/src/modules/build/lib/bundler/transforms.ts`. The loader
automatically picks up `postcss.config.mjs` from the project root.

`postcss-loader` is added as a direct dependency of `@backstage/cli`. The
existing `postcss` dependency satisfies its peer requirement.

### Files Changed

| File | Change |
|------|--------|
| `packages/cli/src/modules/build/lib/bundler/transforms.ts` | Added `postcss-loader` to CSS rule |
| `packages/cli/package.json` | Added `postcss-loader` dependency |
| `.changeset/<generated>.md` | Changeset |

#### :heavy_check_mark: Checklist

- [x] A changeset describing the change and affected packages.
- [ ] Added or updated documentation
- [x] Tests for new functionality and regression tests for bug fixes
- [ ] Screenshots attached (for UI changes)
- [x] All your commits have a `Signed-off-by` line in the message.
```

---

## Files to Modify (Summary)

| # | File | Action |
|---|------|--------|
| 1 | `packages/cli/src/modules/build/lib/bundler/transforms.ts` | Add `postcss-loader` entry after `css-loader` in the CSS rule's `use` array |
| 2 | `packages/cli/package.json` | Add `"postcss-loader": "^8.1.1"` to `dependencies` |
| 3 | `.changeset/<random-name>.md` | Generated by `yarn changeset` |

---

## The Exact Diff

This is the complete diff for the source change (excluding changeset and lockfile):

```diff
diff --git a/packages/cli/src/modules/build/lib/bundler/transforms.ts b/packages/cli/src/modules/build/lib/bundler/transforms.ts
--- a/packages/cli/src/modules/build/lib/bundler/transforms.ts
+++ b/packages/cli/src/modules/build/lib/bundler/transforms.ts
@@ -XXX,6 +XXX,12 @@ export const transforms = (options: TransformOptions): Transforms => {
           options: {
             sourceMap: true,
           },
+        },
+        {
+          loader: require.resolve('postcss-loader'),
+          options: {
+            sourceMap: true,
+          },
         },
       ],
     },
diff --git a/packages/cli/package.json b/packages/cli/package.json
--- a/packages/cli/package.json
+++ b/packages/cli/package.json
@@ -XXX,6 +XXX,7 @@
     "postcss": "^8.1.0",
+    "postcss-loader": "^8.1.1",
     "postcss-import": "^16.1.0",
```

---

## Optional: Add a Unit Test

There is currently no `transforms.test.ts`. If you want to add one:

Create `packages/cli/src/modules/build/lib/bundler/transforms.test.ts`:

```typescript
import { transforms } from './transforms';

describe('transforms', () => {
  it('should include postcss-loader in the CSS rule', () => {
    const { loaders } = transforms({ isDev: true });
    const cssRule = loaders.find(
      (l: any) => l.test instanceof RegExp && l.test.test('.css'),
    );
    expect(cssRule).toBeDefined();
    const uses = cssRule!.use as Array<any>;
    const postcssLoader = uses.find(
      (u: any) =>
        typeof u === 'object' && u.loader?.includes('postcss-loader'),
    );
    expect(postcssLoader).toBeDefined();
    expect(postcssLoader.options).toEqual({ sourceMap: true });
  });

  it('should include postcss-loader in production mode', () => {
    const { loaders } = transforms({ isDev: false });
    const cssRule = loaders.find(
      (l: any) => l.test instanceof RegExp && l.test.test('.css'),
    );
    const uses = cssRule!.use as Array<any>;
    const postcssLoader = uses.find(
      (u: any) =>
        typeof u === 'object' && u.loader?.includes('postcss-loader'),
    );
    expect(postcssLoader).toBeDefined();
  });
});
```

---

## Notes for AI Agents

- The base branch is `master` (not `main`).
- The repository uses **Yarn Berry (v4)** with workspaces.
- Changesets are required for all published package changes. Run `yarn changeset`.
- All commits **must** have `Signed-off-by` (DCO). Use `git commit -s`.
- The CLI package is at version `0.x`, so use `patch` for non-breaking additions.
- `postcss-loader` must be added as a **direct dependency** (not devDependency)
  of `@backstage/cli` because it's `require.resolve()`'d at runtime.
- `postcss` is already a dependency; no need to add it.
- The `experiments.css` option is set to `false` in `config.ts` (line ~313) for
  rspack, which means rspack's native CSS handling is disabled in favor of
  `style-loader`/`css-loader`. This is why adding `postcss-loader` to the
  existing loader chain is the correct approach.
- Read Backstage's [AI Use Policy](https://github.com/backstage/backstage/blob/master/CONTRIBUTING.md#ai-use-policy-and-guidelines) before submitting.
