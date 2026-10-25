# Package conventions

Keep the package a static JSON array with no runtime dependencies. Source both
Cloudflare documentation collections at one immutable revision. Preserve canonical
model IDs and route distinctions. Never replace a successful snapshot after a
failed or partial fetch. Removals exceeding 10% of a route require source review and an intentional
baseline update. Every actual update must include a dated CHANGELOG.md summary
with added/removed/changed entries and counts; no-op checks must leave all files untouched. Keep README field documentation and tests in sync with the data.

Run npm test after changes. Run npm run update twice when changing the updater to
check live coverage and no-op behavior. Do not put credentials in this repository.
Delivery is through this public GitHub repository. Do not add npm publishing,
credentials, or OIDC publishing permissions without a new explicit request.

## Maintainer reference

Each entry has these fields:

| Field | Meaning |
| --- | --- |
| `id` | Unique `route:model` key |
| `model` | Exact Cloudflare model ID, such as `@cf/meta/llama-3.1-8b-instruct` or `anthropic/claude-haiku-4.5` |
| `route` | `workers-ai` or `ai-gateway` |
| `provider` | `workers-ai` for hosted models; the catalog's `provider_id` for gateway models |
| `name`, `description`, `task` | Model metadata from the docs |
| `providers`, `provider_details` | Catalog routing metadata, preserved verbatim, or `null` |
| `request_formats` | Catalog request formats, or `null` |
| `planned_deprecation_date` | Published deprecation date, or `null` |
| `documentation` | Official model page |
| `source` | Original JSON file path |

Use `model` when calling Cloudflare. `id` is a package key. Catalog IDs and vendor API IDs can differ, so don't strip the author prefix or rewrite punctuation. Provider metadata can describe multiple routes to the same model. Those stay attached to that catalog entry. Hosted and gateway entries remain separate even when their names match.

Coverage follows Cloudflare's published catalog. AI Gateway also supports provider pass-through routes, custom providers, and user-defined dynamic routes. Those don't form a finite public model list. This package doesn't import every model from every supported provider or claim that every provider model is in Cloudflare's catalog. It also retains entries with published deprecation dates while they remain in the official source. A catalog entry isn't a live availability check; account access, region, provider credentials, and model retirement still apply.

## Updates

GitHub Actions checks daily at 09:23 UTC and on manual dispatch. Run it locally with Node.js 22 or later:

```sh
npm ci
npm run update
npm test
```

The updater reads a complete, non-truncated Git tree, fetches every JSON file at that exact revision, and checks its Git blob hash. It writes nothing until all fetches and validation succeed. It fails on empty collections, malformed records, duplicate route keys, missing core providers, or removals exceeding 10% of either route in one update. Large removals need source review and an intentional baseline update. Smaller retirements from a fully verified source revision are recorded in the changelog. Failure leaves the committed snapshot available and fails the workflow visibly.

Output is sorted by `id` with stable JSON formatting. Unchanged checks don't generate timestamps. Each actual update adds a dated [changelog entry](CHANGELOG.md) listing added and removed entry IDs, changed metadata (including provider routing details), source revisions, and before/after counts. Changes to an entry's model ID or route appear as a removal and an addition. Counts distinguish catalog entries, hosted/gateway routes, and distinct exact Cloudflare model IDs; they don't infer unique underlying models across aliases. The workflow commits changed catalog data and its changelog together to `main`. An unchanged model list produces no commit or version change. Git commits identify snapshots; the updater doesn't change the package version or create release tags. Concurrent updater runs are serialized, and a conflicting push fails visibly.

## Delivery status

Delivery is GitHub-only. The repository is public. The package is not published to the npm registry, so `npm install all-the-cloudflare-ai-models` by name won't work. Use the GitHub dependency or clone instructions above.

The package has `private: true` to prevent accidental npm publication. There are no npm publish steps, registry credentials, or OIDC publishing permissions in the workflows.

## Prior art

Reference conventions: replicate/all-the-public-replicate-models, words/an-array-of-english-words, nice-registry/all-the-package-repos, and zeke/cfai. Keep the package a small, directly importable JSON dataset.

## Changelog and filesystem behavior

The update date is UTC and is captured only for actual changes. Diff entries are sorted by route-qualified ID; metadata field names are sorted. Provider detail changes include before/after values. Long values are abbreviated with a source-diff link. Route or canonical model ID changes are represented as removals plus additions, without guessing whether they refer to one underlying model.

The updater stages index.json, sources.json, and CHANGELOG.md before replacing them. Reported staging/rename failures restore the original files. A process kill during replacement can leave a dirty local checkout; GitHub delivery remains one atomic Git commit, and failed jobs never reach the commit step. Inspect and restore local files after interruption before rerunning. Tests cover staged-write failure, a failure after two replacements, complete and partial network failure, hashes, and byte-identical no-op runs.

The changelog baseline describes the initial snapshot, not a simulated scheduled change. Keep no-op checks free of log entries. Git commits identify delivered snapshots; don't bump package versions in the scheduled updater. Use a full commit SHA when reproducibility matters. npm shorthand can resolve through SSH before falling back to HTTPS; verify public installation with credentials disabled.
