# all-the-cloudflare-ai-models

Cloudflare's AI catalog in a static JSON array. Updated daily!

See the official Cloudflare AI catalog: https://developers.cloudflare.com/ai/models/

## Install

```sh
npm install zeke/all-the-cloudflare-ai-models
```

This installs from the public GitHub repository. (The package isn't published to the npm registry.)

## Usage

```js
import models from 'all-the-cloudflare-ai-models' with { type: 'json' }
const hosted = models.filter(model => model.route === 'workers-ai')
console.log(hosted[0].model)
```

Or download [index.json](https://raw.githubusercontent.com/zeke/all-the-cloudflare-ai-models/main/index.json) directly. [sources.json](sources.json) records the upstream revision and file hashes.

## Coverage

The initial snapshot has **262 catalog entries**: 73 hosted on Workers AI and 189 offered through AI Gateway's catalog.

Gateway entries span 28 catalog provider/author IDs, including OpenAI (32 entries), Google (24), Alibaba (15), xAI (15), Anthropic (14), Recraft (14), MiniMax (9), and Black Forest Labs (8). Other catalog IDs include AssemblyAI, Bria, ByteDance, DeepSeek, ElevenLabs, Fireworks, Inworld, Krea, Lightricks, Meta, Moonshot AI, PixVerse, Pruna, Reflection AI, Runway, Thinking Machines, Topaz, TypeSafe, Unbiased, and Vidu.

Tasks include text generation, embeddings, images, speech, video, music, translation, and classification. Coverage follows [Cloudflare's official catalog](https://developers.cloudflare.com/ai/models/), including published deprecation notices. It doesn't enumerate every model from every provider supported by Gateway pass-through routes.

Each entry keeps its exact Cloudflare `model` ID, `route`, provider metadata, task, description, and documentation link. Entries and routes can refer to the same underlying model; these counts don't infer unique underlying models. Use `model` for API calls; `id` is the route-qualified dataset key.

## Updates

[CHANGELOG.md](CHANGELOG.md) records additions, removals, metadata and routing changes, and counts. GitHub Actions checks daily at 09:23 UTC. No changes means no commit or changelog entry. Maintenance details and the data format are in [AGENTS.md](AGENTS.md).

Code: MIT. Cloudflare catalog content: CC BY 4.0. See [NOTICE](NOTICE).
