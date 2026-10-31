# Catalog changelog

Changes to catalog entries and routes. Distinct Cloudflare model IDs are counted exactly; aliases and routes can refer to the same underlying model, so these are not counts of unique underlying models. No-change checks add no entry.

## 2026-10-31: 5 added, 0 removed, 16 changed

Cloudflare [source diff](https://github.com/cloudflare/cloudflare-docs/compare/8e6c9edb78a17275b5b04cd38ded4cd98ea72699...3a8808ee6f0863c707ef4cfdef1e0874a7a7f9fa).

Catalog entries: 272 (+5); Workers AI: 73 (+0); AI Gateway: 199 (+5).
Distinct Cloudflare model IDs: 272 (+5).

### Added

- `"ai-gateway:minimax/h3-highspeed"` (Text-to-Video).
- `"ai-gateway:minimax/h3-lite"` (Text-to-Video).
- `"ai-gateway:particle/particle-1"` (Text Generation).
- `"ai-gateway:topaz/gigapixel-high-fidelity-3"` (Image-to-Image).
- `"ai-gateway:topaz/gigapixel-standard-2"` (Image-to-Image).

### Changed

- `"ai-gateway:anthropic/claude-sonnet-5.5"`
  - provider_details: `[{"id":"anthropic","pricing":{"input_tokens":2,"input_cached_tokens":0.2,"input_cache_creation_tokens":2.5,"output_tokens":10}}]` → `[{"id":"anthropic","pricing":{"input_tokens":2,"input_cached_tokens":0.1,"input_cache_creation_tokens":2.5,"output_tokens":10}}]`.
- `"ai-gateway:black-forest-labs/flux-3-video"`
  - provider_details: `[{"id":"black-forest-labs","pricing":{"hd":0.17,"fhd":0.29,"v2v_hd":0.41,"v2v_fhd":0.53,"hd_draft":0.06,"v2v_hd_draft":0.12}}]` → `[{"id":"black-forest-labs","pricing":{"hd":0.15,"fhd":0.24,"v2v_hd":0.21,"v2v_fhd":0.27,"hd_draft":0.06,"v2v_hd_draft":0.12}}]`.
- `"ai-gateway:google/gemini-omni-1.1-flash"`
  - provider_details: `null` → `[{"id":"google-ai-studio","pricing":{"input_audio_tokens":1.5,"input_image_tokens":1.5,"input_text_tokens":1.5,"input_video_tokens":1.5,"output_reasoning_tokens":10,"output_text_tokens":9,"output_video_tokens":17.5}}]`.
- `"ai-gateway:meta/muse-spark-open"`
  - description: `"Meta's most capable open-weight model, built for agentic coding. Show it a screenshot, chart, or photo alongside your request and it reasons over both to write working code, call tools, and carry multi-step tasks across a 1M-token context."` → `"Muse Spark Open is Meta's open-weights reasoning model for coding and agentic workflows. It supports native image understanding and function calling, and is served through Fireworks serverless inference."`.
- `"ai-gateway:minimax/m3"`
  - provider_details: `[{"id":"minimax","pricing":{"under_512k_per_1m_input_tokens":0.3,"under_512k_per_1m_input_cached_tokens":0.06,"under_512k_per_1m_output_tokens":1.2,"over_512k_per_1m_input_tokens":1.2,"over_512k_per_1m_input_cached_tokens":0.24,"over_512k_per_1m_output_tokens":4.8}}]` → `[{"id":"minimax","pricing":{"under_512k_per_1m_input_tokens":0.3,"under_512k_per_1m_output_tokens":1.2,"under_512k_per_1m_input_cached_tokens":0.06,"over_512k_per_1m_input_tokens":0.6,"over_512k_per_1m_output_tokens":2.4,"over_512k_per_1m_input_cached_tokens":0.12}}]`.
- `"ai-gateway:openai/gpt-4.1-nano"`
  - request_formats: `["responses","chat-completions"]` → `["chat-completions","responses"]`.
- `"ai-gateway:openai/gpt-5.6-luna"`
  - provider_details: `[{"id":"openai","pricing":{"input_tokens":0.2,"output_tokens":1.2,"input_cached_tokens":0.02,"input_cache_creation_tokens":0.25}}]` → `[{"id":"openai","pricing":{"long_context_threshold_tokens":272000,"short_context_input_tokens":0.2,"short_context_input_cached_tokens":0.02,"short_context_input_cache_creation_tokens":0.25,"short_context_output_tokens":1.2,"long_context_input_tokens":0.4,"long_context_input_cached_tokens":0.04,"long_context_input_cache_creation_tokens":0.5,"long_context_output_tokens":1.8}}]`.
- `"ai-gateway:openai/gpt-5.6-sol"`
  - provider_details: `[{"id":"openai","pricing":{"input_tokens":2,"output_tokens":10,"input_cached_tokens":0.25,"input_cache_creation_tokens":3.125}}]` → `[{"id":"openai","pricing":{"long_context_threshold_tokens":272000,"short_context_input_tokens":4,"short_context_input_cached_tokens":0.4,"short_context_input_cache_creation_tokens":5,"short_context_output_tokens":20,"long_context_input_tokens":8,"long_context_input_cached_tokens":0.8,"long_context_input_cache_creation_tokens":10,"long_context_output_tokens":30}}]`.
- `"ai-gateway:openai/gpt-5.6-terra"`
  - provider_details: `[{"id":"openai","pricing":{"input_tokens":2,"output_tokens":12,"input_cached_tokens":0.2,"input_cache_creation_tokens":2.5}}]` → `[{"id":"openai","pricing":{"long_context_threshold_tokens":272000,"short_context_input_tokens":2,"short_context_input_cached_tokens":0.2,"short_context_input_cache_creation_tokens":2.5,"short_context_output_tokens":12,"long_context_input_tokens":4,"long_context_input_cached_tokens":0.4,"long_context_input_cache_creation_tokens":5,"long_context_output_tokens":18}}]`.
- `"ai-gateway:recraft/recraftv4-1"`
  - provider_details: `[{"id":"recraft","pricing":{"output_image_count":0.04}}]` → `[{"id":"recraft","pricing":{"output_image_count":0.035}}]`.
- `"ai-gateway:recraft/recraftv4-1-pro"`
  - provider_details: `[{"id":"recraft","pricing":{"output_image_count":0.25}}]` → `[{"id":"recraft","pricing":{"output_image_count":0.21}}]`.
- `"ai-gateway:recraft/recraftv4-1-utility"`
  - provider_details: `[{"id":"recraft","pricing":{"output_image_count":0.04}}]` → `[{"id":"recraft","pricing":{"output_image_count":0.035}}]`.
- `"ai-gateway:recraft/recraftv4-1-utility-pro"`
  - provider_details: `[{"id":"recraft","pricing":{"output_image_count":0.25}}]` → `[{"id":"recraft","pricing":{"output_image_count":0.21}}]`.
- `"ai-gateway:reflection-ai/beam-1.0-501b-a23b"`
  - provider_details: `null` → `[{"id":"reflection-ai","pricing":{"input_tokens":0,"input_cached_tokens":0,"output_tokens":0}}]`.
- `"ai-gateway:typesafe/jev"`
  - description: `"Jev is TypeSafe's structured evaluation model. It evaluates one state against typed Noul, Choice, and Score questions and returns calibrated answers with probabilities and confidence."` → `"Jev 1.13 is TypeSafe's structured evaluation model. It evaluates one state against typed Noul, Choice, and Score questions and returns calibrated answers with probabilities and confidence. Image inputs are beta and dreamer-ready, not recommended for production."`.
- `"ai-gateway:xai/grok-imagine-video-1.5-preview"`
  - provider_details: `[{"id":"xai","pricing":{"default":0.08,"480p":0.08,"720p":0.14}}]` → `[{"id":"xai","pricing":{"480p":0.08,"720p":0.14,"default":0.08,"1080p":0.25}}]`.

## 2026-10-29: 2 added, 0 removed, 0 changed

Cloudflare [source diff](https://github.com/cloudflare/cloudflare-docs/compare/a9f802186dc5eb62a8ee898314def78541eb0649...8e6c9edb78a17275b5b04cd38ded4cd98ea72699).

Catalog entries: 267 (+2); Workers AI: 73 (+0); AI Gateway: 194 (+2).
Distinct Cloudflare model IDs: 267 (+2).

### Added

- `"ai-gateway:klingai/kling-v3-image"` (Text-to-Image).
- `"ai-gateway:openai/gpt-6.1-terra"` (Text Generation).

## 2026-10-28: 3 added, 0 removed, 0 changed

Cloudflare [source diff](https://github.com/cloudflare/cloudflare-docs/compare/ec32a21c71d1aa8747ef270e180ef0d31e5231f6...a9f802186dc5eb62a8ee898314def78541eb0649).

Catalog entries: 265 (+3); Workers AI: 73 (+0); AI Gateway: 192 (+3).
Distinct Cloudflare model IDs: 265 (+3).

### Added

- `"ai-gateway:klingai/kling-v4"` (Text-to-Video).
- `"ai-gateway:minimax/m3.1-flash"` (Text Generation).
- `"ai-gateway:openai/decisions"` (Text Generation).

## 2026-10-25: Initial GitHub snapshot

Catalog entries: 262; Workers AI: 73; AI Gateway: 189. Distinct Cloudflare model IDs: 262.

Source: [Cloudflare catalog at ec32a21](https://github.com/cloudflare/cloudflare-docs/tree/ec32a21c71d1aa8747ef270e180ef0d31e5231f6).
