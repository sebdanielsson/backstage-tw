# Adding Tailwind CSS v4 & shadcn to Backstage

## Prerequisites

- A Backstage project (created via `npx @backstage/create-app`)

## Tailwind v4

### 1. Install Tailwind dependencies

```sh
yarn workspace app add tailwindcss @tailwindcss/postcss postcss postcss-loader
```

### 2. Create PostCSS config

Create `./packages/app/postcss.config.mjs`:

```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

### 3. Create the Tailwind CSS entry file

Create `./packages/app/src/index.css`:

```css
@import "tailwindcss";
```

### 4. Import the CSS in your app entry point

In `./packages/app/src/index.tsx`, add the import:

```typescript
import './index.css';
```

### 5. Patch `@backstage/cli` to add `postcss-loader`

The Backstage CLI bundler (rspack) does not include `postcss-loader` in its CSS
pipeline, so PostCSS plugins like `@tailwindcss/postcss` are never executed. A
`yarn patch` is needed to inject `postcss-loader` into the build chain.

> **Note:** This step is a workaround until the Backstage CLI natively supports
> custom PostCSS configuration. See
> [backstage/backstage#30306](https://github.com/backstage/backstage/issues/30306)
> for tracking.

#### 5a. Start the patch

```sh
yarn patch @backstage/cli
```

Yarn will print a temporary directory path, e.g.:

```
You can now edit the following folder: /tmp/xfs-XXXXXXXX/user
```

#### 5b. Edit the bundler transforms

Open the file at
`<temp-dir>/dist/modules/build/lib/bundler/transforms.cjs.js` and find the
`.css` rule (search for `test: /\.css$/i`). Add `postcss-loader` after
`css-loader`:

```diff
         {
           loader: require.resolve("css-loader"),
           options: {
             sourceMap: true
           }
+        },
+        {
+          loader: require.resolve("postcss-loader"),
+          options: {
+            sourceMap: true
+          }
         }
       ]
```

#### 5c. Commit the patch

```sh
yarn patch-commit -s <temp-dir>
```

This will:

- Store a `.patch` file in `.yarn/patches/`
- Update the root `package.json` to reference the patched `@backstage/cli`

#### 5d. Install

```sh
yarn install
```

### 6. Verify

#### 6a. Add a test element

Add this paragraph to `./packages/app/src/components/Root/Root.tsx` just above `<SidebarLogo />`:

```diff
export const Root = ({ children }: PropsWithChildren<{}>) => (
  <SidebarPage>
    <Sidebar>
+     <p className="text-green-400">Hello World</p>
      <SidebarLogo />
```

Start the dev server:

```sh
yarn start
```

You should see "Hello World" in green on the sidebar, confirming that Tailwind CSS is working!

## shadcn/ui

### 1. Install shadcn dependencies

```sh
yarn workspace app add class-variance-authority clsx tailwind-merge lucide-react tw-animate-css
```

### 2. Configure the path aliases in your `packages/app/tsconfig.json` file

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 3. Configure styles in `./packages/app/src/index.css`

```diff
@import "tailwindcss";
+@import "tw-animate-css";
 
+@custom-variant dark (&:is(.dark *));
+ 
+:root {
+  --background: oklch(1 0 0);
+  --foreground: oklch(0.145 0 0);
+  --card: oklch(1 0 0);
+  --card-foreground: oklch(0.145 0 0);
+  --popover: oklch(1 0 0);
+  --popover-foreground: oklch(0.145 0 0);
+  --primary: oklch(0.205 0 0);
+  --primary-foreground: oklch(0.985 0 0);
+  --secondary: oklch(0.97 0 0);
+  --secondary-foreground: oklch(0.205 0 0);
+  --muted: oklch(0.97 0 0);
+  --muted-foreground: oklch(0.556 0 0);
+  --accent: oklch(0.97 0 0);
+  --accent-foreground: oklch(0.205 0 0);
+  --destructive: oklch(0.577 0.245 27.325);
+  --destructive-foreground: oklch(0.577 0.245 27.325);
+  --border: oklch(0.922 0 0);
+  --input: oklch(0.922 0 0);
+  --ring: oklch(0.708 0 0);
+  --chart-1: oklch(0.646 0.222 41.116);
+  --chart-2: oklch(0.6 0.118 184.704);
+  --chart-3: oklch(0.398 0.07 227.392);
+  --chart-4: oklch(0.828 0.189 84.429);
+  --chart-5: oklch(0.769 0.188 70.08);
+  --radius: 0.625rem;
+  --sidebar: oklch(0.985 0 0);
+  --sidebar-foreground: oklch(0.145 0 0);
+  --sidebar-primary: oklch(0.205 0 0);
+  --sidebar-primary-foreground: oklch(0.985 0 0);
+  --sidebar-accent: oklch(0.97 0 0);
+  --sidebar-accent-foreground: oklch(0.205 0 0);
+  --sidebar-border: oklch(0.922 0 0);
+  --sidebar-ring: oklch(0.708 0 0);
+}
+ 
+.dark {
+  --background: oklch(0.145 0 0);
+  --foreground: oklch(0.985 0 0);
+  --card: oklch(0.145 0 0);
+  --card-foreground: oklch(0.985 0 0);
+  --popover: oklch(0.145 0 0);
+  --popover-foreground: oklch(0.985 0 0);
+  --primary: oklch(0.985 0 0);
+  --primary-foreground: oklch(0.205 0 0);
+  --secondary: oklch(0.269 0 0);
+  --secondary-foreground: oklch(0.985 0 0);
+  --muted: oklch(0.269 0 0);
+  --muted-foreground: oklch(0.708 0 0);
+  --accent: oklch(0.269 0 0);
+  --accent-foreground: oklch(0.985 0 0);
+  --destructive: oklch(0.396 0.141 25.723);
+  --destructive-foreground: oklch(0.637 0.237 25.331);
+  --border: oklch(0.269 0 0);
+  --input: oklch(0.269 0 0);
+  --ring: oklch(0.439 0 0);
+  --chart-1: oklch(0.488 0.243 264.376);
+  --chart-2: oklch(0.696 0.17 162.48);
+  --chart-3: oklch(0.769 0.188 70.08);
+  --chart-4: oklch(0.627 0.265 303.9);
+  --chart-5: oklch(0.645 0.246 16.439);
+  --sidebar: oklch(0.205 0 0);
+  --sidebar-foreground: oklch(0.985 0 0);
+  --sidebar-primary: oklch(0.488 0.243 264.376);
+  --sidebar-primary-foreground: oklch(0.985 0 0);
+  --sidebar-accent: oklch(0.269 0 0);
+  --sidebar-accent-foreground: oklch(0.985 0 0);
+  --sidebar-border: oklch(0.269 0 0);
+  --sidebar-ring: oklch(0.439 0 0);
+}
+ 
+@theme inline {
+  --color-background: var(--background);
+  --color-foreground: var(--foreground);
+  --color-card: var(--card);
+  --color-card-foreground: var(--card-foreground);
+  --color-popover: var(--popover);
+  --color-popover-foreground: var(--popover-foreground);
+  --color-primary: var(--primary);
+  --color-primary-foreground: var(--primary-foreground);
+  --color-secondary: var(--secondary);
+  --color-secondary-foreground: var(--secondary-foreground);
+  --color-muted: var(--muted);
+  --color-muted-foreground: var(--muted-foreground);
+  --color-accent: var(--accent);
+  --color-accent-foreground: var(--accent-foreground);
+  --color-destructive: var(--destructive);
+  --color-destructive-foreground: var(--destructive-foreground);
+  --color-border: var(--border);
+  --color-input: var(--input);
+  --color-ring: var(--ring);
+  --color-chart-1: var(--chart-1);
+  --color-chart-2: var(--chart-2);
+  --color-chart-3: var(--chart-3);
+  --color-chart-4: var(--chart-4);
+  --color-chart-5: var(--chart-5);
+  --radius-sm: calc(var(--radius) - 4px);
+  --radius-md: calc(var(--radius) - 2px);
+  --radius-lg: var(--radius);
+  --radius-xl: calc(var(--radius) + 4px);
+  --color-sidebar: var(--sidebar);
+  --color-sidebar-foreground: var(--sidebar-foreground);
+  --color-sidebar-primary: var(--sidebar-primary);
+  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
+  --color-sidebar-accent: var(--sidebar-accent);
+  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
+  --color-sidebar-border: var(--sidebar-border);
+  --color-sidebar-ring: var(--sidebar-ring);
+}
+ 
+@layer base {
+  * {
+    @apply border-border outline-ring/50;
+  }
+  body {
+    @apply bg-background text-foreground;
+  }
+}
```

### 4. Add `packages/app/src/lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 5. Add `packages/app/components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```
