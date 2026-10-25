# all-the-cloudflare-ai-models

Cloudflare's AI catalog in a static JSON array. Updated daily!

See the official Cloudflare AI catalog: https://developers.cloudflare.com/ai/models/

## Install

Paste this into your favorite agent harness:

```
Here are all the Cloudflare AI models:

https://raw.githubusercontent.com/zeke/all-the-cloudflare-ai-models/refs/heads/main/index.json

Please analyze the newest models and tell me about them.
```

You can also install the JSON as a package from GitHub with `npm install zeke/all-the-cloudflare-ai-models`. It isn't published to the npm registry.

## Usage

Give your agent the URL above, then ask it questions. Some examples:

Search:

```
Find models that can transcribe audio. Include the exact model ID and documentation link for each.
```

List the newest models:

```
Here's the changelog for that catalog:

https://raw.githubusercontent.com/zeke/all-the-cloudflare-ai-models/refs/heads/main/CHANGELOG.md

What models were added in the last 30 days?
```

List all providers:

```
List every provider in the catalog with the number of models each one has, sorted by count.
```

List models from one provider:

```
List all the Anthropic models, with their names and descriptions.
```

Filter by task:

```
Which text-to-image models are available? Separate the ones hosted on Workers AI from the ones offered through AI Gateway.
```

List models by route:

```
Which text embedding models are hosted on Workers AI?
```

Summarize a category:

```
Summarize the video generation models: who makes them, and what inputs does each one take?
```
