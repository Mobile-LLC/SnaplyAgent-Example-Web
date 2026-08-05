// The entire Snaply integration. Everything else in this repo is a pretend checkout for it to
// capture.

import { Snaply } from "@snaplyagent/sdk";

/**
 * Replace with your own key from the Snaply console (Products → your product → API key).
 *
 * It is not a secret. It identifies the workspace, ships in your public JavaScript where anyone
 * can read it, and the server checks it against your product's allowed domains — so a copy lifted
 * from this page is useless anywhere else. Committing it is fine.
 */
const SnaplyKey = "snap_live_REPLACE_WITH_YOUR_KEY";

const status = document.getElementById("status");
const code = document.getElementById("code");
const say = (message) => (status.textContent = message);

// 1. Attach callbacks BEFORE init. A support request can arrive the moment the device registers,
//    and anything attached afterwards would miss it. All of them are optional.
Snaply.on({
  onRequestShown: () => say("Support asked to see your screen…"),
  onAllowed: () => say("Screenshot shared ✓"),
  onDenied: () => say("You declined the request."),
  onExpired: () => say("The request expired."),
  onError: (error) => say(`Snaply error: ${error.message}`),
  onLiveEnded: () => say("Live session ended."),
});

// 2. What the person reads out to an agent so support can find this browser.
document.getElementById("show-code").addEventListener("click", () => Snaply.showSupportCode());

// 3. Register. `user` is optional — without it this stays an anonymous device that support finds
//    by its support code. If they sign in later, call Snaply.identify({ id, name, phone }) then,
//    and Snaply.reset() on sign-out.
Snaply.init({
  key: SnaplyKey,
  user: { id: "usr_20481", name: "Maya Kowalski" },
})
  .then(() => {
    say("Connected — this browser is now visible in the console.");
    const supportCode = Snaply.supportCode();
    if (supportCode) code.textContent = `Support code: ${supportCode}`;
  })
  .catch((error) => {
    // Worth handling rather than swallowing: `origin_mismatch` means this page's domain is not on
    // the product's allowed list, and `invalid_key` means the key above is still the placeholder.
    say(`Could not connect: ${error.message}`);
  });
