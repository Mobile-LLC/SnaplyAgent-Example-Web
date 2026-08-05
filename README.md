# Snaply Agent — web example

A complete, runnable integration of the [Snaply Agent](https://snaplyagent.com) web SDK. Clone it,
drop in your key, run it.

The whole integration is in [`src/main.js`](src/main.js) — about fifteen lines. Everything else is a
pretend checkout, there so the SDK has something realistic to capture.

## Run it

```bash
npm install
npm run dev
```

Then open the printed URL.

Before it will connect you need two things:

1. **Your key.** In `src/main.js`, replace:

   ```js
   const SnaplyKey = "snap_live_REPLACE_WITH_YOUR_KEY";
   ```

   Get it from the Snaply console → **Products → your product → API key**.

2. **Your domain on the allowed list.** Add the origin you are serving from — for local development
   that is `localhost` — to the product's allowed domains, or registration is refused with
   `origin_mismatch`. This is what makes the key safe to ship publicly.

The page should then say *"Connected — this browser is now visible in the console."* Request a
screenshot from the console; the consent prompt appears in the page, and nothing is captured until
it is allowed.

## Adding the SDK to your own app

```bash
npm install @snaplyagent/sdk
```

```js
import { Snaply } from "@snaplyagent/sdk";

Snaply.on({ onAllowed: () => {}, onDenied: () => {} });
await Snaply.init({ key: "snap_live_…" });
```

Ships as ESM and CJS with TypeScript types. No build configuration needed beyond a bundler that
resolves bare imports — this example uses Vite, but any will do.

## Redaction — read this before you ship

The SDK paints a box over sensitive regions **in the browser, before the image is encoded**, so the
real pixels never leave the machine. It is not a server-side blur, and no version of the frame
contains the original content.

**Redacted automatically, with no code:**

```
input[type=password]
input[autocomplete*=cc-]      /* cc-number, cc-csc, cc-exp, … */
```

**Everything else is captured as-is.** Mark anything a support agent should not read:

```html
<input snaply-redact />                     <!-- default "REDACTED" label -->
<div snaply-redact="HIDDEN">…</div>         <!-- custom label -->
<div snaply-redact data-snaply-redact-color="#333">…</div>
```

To restyle every box at once, pass `redaction` to `init`:

```js
Snaply.init({ key, redaction: { color: "#333", label: "" } });   // label: "" = plain box
```

### One cross-platform difference worth knowing

The **Android** SDK auto-redacts **password fields only** — not card fields. If you ship both, the
same card input that is covered for free on web must be marked explicitly on Android with
`snaplyRedact()`. Do not assume parity here.

## What the SDK does and does not capture

- Captures **your page only** — it rasterises the DOM, so it cannot see other tabs, other windows,
  or anything outside the browser. No screen-share permission is requested and no browser picker
  appears.
- Captures **only after the user allows it**. Consent is the product, not a setting.
- While a live session runs, an on-screen indicator stays up, and the SDK stops sending the moment
  it can no longer prove that indicator is attached.

## Identifying your users

```js
// Known at load:
await Snaply.init({ key, user: { id: "usr_20481", name: "Maya Kowalski" } });

// Or later, when they sign in:
await Snaply.identify({ id: "usr_20481", name: "Maya Kowalski", phone: "+14155550142" });

// On sign-out:
await Snaply.reset();
```

Without it the browser stays anonymous, and support finds it by the support code the person reads
out — `Snaply.showSupportCode()`.

## Errors worth handling

`Snaply.init` rejects with a `SnaplyError` carrying a `code`:

| `code` | Meaning |
|---|---|
| `invalid_key` | The key is wrong, or still the placeholder above |
| `origin_mismatch` | This page's domain is not on the product's allowed list |
| `quota_exceeded` | The workspace is out of screenshots for the cycle |

## Docs

Full documentation: <https://snaplyagent.com/docs>
