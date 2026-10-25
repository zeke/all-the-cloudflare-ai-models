# all-the-cloudflare-ai-models

Cloudflare's AI model catalog, in a static JSON array. Includes models hosted on Workers AI and third-party models offered through Cloudflare AI Gateway's catalog, including OpenAI, Anthropic, and Google.

No runtime dependencies, API keys, or network requests. Install it and read the JSON.

## Install

```sh
npm install all-the-cloudflare-ai-models
```

```js
const models = require('all-the-cloudflare-ai-models')
console.log(models.filter(model => model.route === 'workers-ai'))
```

With modern Node.js ESM:

```js
import models from 'all-the-cloudflare-ai-models' with { type: 'json' }
console.log(models.find(model => model.model === 'anthropic/claude-haiku-4.5'))
```

You can also import `all-the-cloudflare-ai-models/index.json` and `all-the-cloudflare-ai-models/sources.json`.

## What's included

The source is [Cloudflare's official unified catalog](https://developers.cloudflare.com/ai/models/), built from the `catalog-models` and `workers-ai-models` collections in [cloudflare/cloudflare-docs](https://github.com/cloudflare/cloudflare-docs). The initial snapshot contains 262 entries: 73 hosted models and 189 gateway catalog models. See `sources.json` for the source commit, per-file Git hashes, and counts.

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

The updater reads a complete, non-truncated Git tree, fetches every JSON file at that exact revision, and checks its Git blob hash. It writes nothing until all fetches and validation succeed. It fails on empty collections, malformed records, duplicate route keys, missing core providers, or any model removal. Removals need a reviewed edit to the baseline and source checks before running the updater again. Failure leaves the committed snapshot available and fails the workflow visibly.

Output is sorted by `id` with stable JSON formatting. There are no generated timestamps. An unchanged model list produces no commit, version bump, or new release. Changed data gets a patch version. Major versions are reserved for breaking format changes; optional format additions use minor versions.

Data and version are pushed before publishing. If publishing fails, the next run retries that committed version. Registry errors fail the release; only an explicit 404 is treated as unpublished. An already published version must have identical packaged files (npm verifies the downloaded tarball integrity). Concurrent runs are serialized, and a conflicting push stops before publishing.

## npm publishing setup

`update.yml` uses npm trusted publishing with GitHub OIDC. It stores no npm token. Before the first automatic release, the package owner must:

1. Authenticate to npm and bootstrap the first publication if npm requires an existing package.
2. Approve a trusted publisher with owner `zeke`, repository `all-the-cloudflare-ai-models`, workflow `update.yml`, and permission to publish directly. No environment is configured.
3. Dispatch **Update and publish** and verify its registry installation step.

Creating that trust relationship grants persistent publishing access and requires the owner's approval. Follow [npm's trusted publishing documentation](https://docs.npmjs.com/trusted-publishers/). A failed authentication step doesn't count as a published package.

## Prior art

Inspired by [all-the-public-replicate-models](https://github.com/replicate/all-the-public-replicate-models), [an-array-of-english-words](https://github.com/words/an-array-of-english-words), [all-the-package-repos](https://github.com/nice-registry/all-the-package-repos), and Zeke's [cfai catalog research](https://github.com/zeke/cfai). This package follows the small JSON-package approach, with a daily updater and a CommonJS-compatible JSON entry point.

## License

Code: MIT. Catalog descriptions and provider metadata are adapted from Cloudflare's documentation under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Cloudflare is the source, not an endorser of this package. Normalization and route fields are this package's changes. See `NOTICE` and `LICENSE-DATA`.
