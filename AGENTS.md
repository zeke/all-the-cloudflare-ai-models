# Package conventions

Keep the package a static JSON array with no runtime dependencies. Source both
Cloudflare documentation collections at one immutable revision. Preserve canonical
model IDs and route distinctions. Never replace a successful snapshot after a
failed or partial fetch. Model removals require source review and an intentional
baseline update. Keep README field documentation and tests in sync with the data.

Run npm test after changes. Run npm run update twice when changing the updater to
check live coverage and no-op behavior. Do not put credentials in this repository.
Persistent npm publishing permissions require the owner's explicit approval.
