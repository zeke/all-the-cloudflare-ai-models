# all-the-cloudflare-ai-models

Cloudflare's AI model catalog, in a static JSON array. Includes models hosted on Workers AI and third-party models offered through Cloudflare AI Gateway's catalog, including OpenAI, Anthropic, and Google.

Reading the installed JSON needs no runtime dependencies, API keys, or network requests. This repository is private, and the package is not published to npm. GitHub access is required to install or download it.

## Install from GitHub

With access to this private repository and working GitHub Git authentication (npm may resolve GitHub dependencies through SSH, even from an HTTPS URL):

```sh
npm install 'git+https://github.com/zeke/all-the-cloudflare-ai-models.git#main'
```

The lockfile records the resolved commit. For a fixed snapshot, replace `main` with a full commit SHA. Keep GitHub credentials in your credential manager, never in the dependency URL or lockfile.

If you use an authenticated GitHub CLI session, you can also clone the repository and install it from a local path:

```sh
gh repo clone zeke/all-the-cloudflare-ai-models
cd your-app
npm install /absolute/path/to/all-the-cloudflare-ai-models
```

The installed package name and imports are the same with either method:

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

## Read the JSON directly

Browse [index.json](https://github.com/zeke/all-the-cloudflare-ai-models/blob/main/index.json) and [sources.json](https://github.com/zeke/all-the-cloudflare-ai-models/blob/main/sources.json) while signed in to GitHub with repository access. Anonymous raw URLs won't work for this private repository.

Download either file using an authenticated GitHub CLI session:

```sh
gh api 'repos/zeke/all-the-cloudflare-ai-models/contents/index.json?ref=main' \
  -H 'Accept: application/vnd.github.raw' > models.json
gh api 'repos/zeke/all-the-cloudflare-ai-models/contents/sources.json?ref=main' \
  -H 'Accept: application/vnd.github.raw' > sources.json
```

For a fixed snapshot, replace `ref=main` with `ref=` followed by a full commit SHA. A clone also gives you both JSON files directly.

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

Output is sorted by `id` with stable JSON formatting. There are no generated timestamps. The workflow commits changed catalog data to `main`. An unchanged model list produces no commit or version change. Git commits identify snapshots; the updater doesn't change the package version or create release tags. Concurrent updater runs are serialized, and a conflicting push fails visibly.

## Delivery status

Delivery is GitHub-only. The repository remains private. The package is not published to the npm registry, so `npm install all-the-cloudflare-ai-models` by name won't work. Use the GitHub dependency or clone instructions above.

The package has `private: true` to prevent accidental npm publication. There are no npm publish steps, registry credentials, or OIDC publishing permissions in the workflows.

## Prior art

Inspired by [all-the-public-replicate-models](https://github.com/replicate/all-the-public-replicate-models), [an-array-of-english-words](https://github.com/words/an-array-of-english-words), [all-the-package-repos](https://github.com/nice-registry/all-the-package-repos), and Zeke's [cfai catalog research](https://github.com/zeke/cfai). This package follows the small JSON-package approach, with a daily updater and a CommonJS-compatible JSON entry point.

## License

Code: MIT. Catalog descriptions and provider metadata are adapted from Cloudflare's documentation under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Cloudflare is the source, not an endorser of this package. Normalization and route fields are this package's changes. See `NOTICE` and `LICENSE-DATA`.
