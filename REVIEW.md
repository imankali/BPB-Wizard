# Integration review and remaining panel work

## Wizard fixes

- Stable and development panel sources point to imankali/BPB-Worker-Panel.
- New Workers subdomains include `.workers.dev`, matching existing account behavior.
- Pages name checks no longer query Workers; only HTTP 404 means a name is free.
- Web deployments validate deployment type, accessible account and SECRET before creating resources.
- SECRET must be at least 32 characters. Configure a cryptographically random value using Cloudflare secrets; never commit it. Changing it invalidates existing private installation links.
- CLI secret strings use crypto/rand with rejection sampling through crypto/rand.Int; entropy failure stops execution rather than using insecure randomness.
- DoH failover is explicitly disabled for initial web installation.

## Required changes in the separate panel repository

Reviewed panel main commit: 89a7769f3e2054d060ba5f55f87ef75af2aa6a82.

These are NOT fixed by the Wizard PR:

1. `src/settings/settings.ts`: change `_repo_` to the imankali panel repository. Also review `_wizard_repo_` and documentation links. Otherwise the in-panel upgrade replaces the custom panel with upstream code. Publish a new worker.js release after fixing this; do not use in-panel upgrade beforehand.
2. `src/settings/main.ts`: check `res.ok` before accepting downloaded upgrade source. A failed HTTP download must never be deployed as JavaScript.
3. `src/auth/auth.ts`: replace plaintext password storage with a versioned, salted password hash and migration on successful legacy login. Validate server-side password types and length. Rotate the JWT signing secret after password changes to invalidate old sessions. Test migration and session revocation before release.
4. Keep package-lock.json synchronized and restore npm ci after the lockfile repair, rather than relying permanently on npm install in release builds.

No panel branch was changed by this Wizard session. No Cloudflare deployment or production mutation was performed.

## Validation

- Web regression tests: `node --test web/tests/api.test.mjs` (Node 22.13+; stripping TypeScript is experimental in Node 22).
- TypeScript: `npx tsc --noEmit`.
- Shell syntax: `bash -n install.sh`.
- Go regression tests added; run `go test ./...`. Go is not installed in the local sandbox, so CI must verify these.
- The panel's 16 tests, type check and build passed locally during the preceding review. This is not end-to-end Cloudflare testing or a complete security audit.
