# Adding Tailwind CSS v4 to Backstage

## Prerequisites

- A Backstage project (created via `npx @backstage/create-app`)

## Steps

### 1. Install dependencies

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
