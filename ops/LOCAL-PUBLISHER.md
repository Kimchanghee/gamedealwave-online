# Isolated local publisher rehearsal

Production publication is fail-closed. `publish.ps1` without `-DryRun` refuses before any build or external action. No scheduler is enabled.

Commands (from this repository):

```powershell
pwsh -NoProfile -File scripts/qa-staged.ps1 -Fixture
pwsh -NoProfile -File scripts/publish.ps1 -DryRun -Fixture
pwsh -NoProfile -File scripts/publish.ps1 -DryRun -Slug <existing-real-post>
node --test tests/publisher.test.mjs
```

Fixtures require explicit opt-in and are only copied into an OS temporary directory. The existing production Astro renderer, commerce/page gate and dist verifier execute there unchanged. Installed trusted dependency packages are reused through junctions; temporary node_modules/.astro, .vite, .cache and project .astro are separate. This is not an OS sandbox or forced read-only dependency environment. Protected-tree hashes verify observed non-mutation. Real source, public assets, dist, Astro caches and publish receipts are hash-checked before and after every success or failure; temporary files are removed in `finally`. This avoids relying on a cleanup rebuild, which can fail or overwrite the previously deployed build. No `.env`, deploy config or git metadata is staged. Child processes receive a minimal environment and Astro telemetry is disabled. The tool contains no deployment, API, account, live-fetch or IndexNow action.

The existing fixture category is already valid for this site and is preserved unchanged. The marked sample demonstrates pipeline structure, not a real SKU, topic-lane acceptance, factual verification or image rights. Its fake Amazon destination is never fetched, published or emitted as a live receipt. Existing negative fixtures and corrupted staged source/output must be rejected. The hard-disabled affiliate configuration remains unchanged and the positive run requires no tagged href. No artificial affiliate-ON test modifies site config.

Readiness: local rehearsal is separate from production readiness. Amazon Associates account approval, registered site eligibility, genuine issued tracking tag, exact real-product evidence, image rights and a trusted editorial approval remain unverified by this test. The existing source gate validates structural assertions, not the truth of those assertions. A real isolated rehearsal, explicitly authorized release, live verification, idempotent durable receipt/reconciliation and account-linked affiliate proof remain required before enabling production publishing. No successful local fixture test authorizes scheduling.

The former deployment instructions in POSTING-RULES section 6 are superseded by this fail-closed local-only wrapper. Do not infer publication from its name or from public guide availability.
