---
title: ai.txt
description: Machine-readable AI content licensing directives — declare how AI engines can train on, summarize, and cite your content.
---

The `ai.txt` file is a machine-readable declaration of how AI systems are permitted to use your content for training, inference, summarization, and attribution.

## What it is

A plain-text manifest at your site root that AI crawlers and inference systems can fetch to understand your licensing terms. It complements `robots.txt` (which controls *access*) by specifying *usage rights* once the content has been read.

## Why it matters

`robots.txt` answers "can you crawl this?" `ai.txt` answers "what can you do with what you crawled?" As AI training and inference become regulated, having an explicit, parseable licensing statement at a known location reduces ambiguity for crawler operators and gives you a defensible record of your stated terms.

## Directives

| Directive | Values | Purpose |
|-----------|--------|---------|
| `User-Agent` | `*` or specific bot | Which AI systems the rules apply to |
| `Allow-AI-Training` | `Yes` / `No` | May this content be used to train models? |
| `Allow-AI-Inference` | `Yes` / `No` | May this content be retrieved at inference time? |
| `Allow-AI-Summarization` | `Yes` / `No` | May this content be summarized in AI answers? |
| `Allow-AI-Attribution` | `Required` / `Optional` | Must AI systems cite the source? |
| `License` | SPDX identifier | The content license (e.g., `CC-BY-4.0`) |
| `Attribution` | Free text | How you want to be credited |
| `Contact` | URL or text | Where to direct licensing questions |

## Example output

```
# ai.txt - AI Content Licensing
#
# Site: Example
# URL: https://example.com

User-Agent: *
Allow-AI-Training: Yes
Allow-AI-Inference: Yes
Allow-AI-Summarization: Yes
Allow-AI-Attribution: Required

# Content License
License: CC-BY-4.0
Attribution: Example (https://example.com)
Contact: See https://example.com for contact information
```

## How to deploy

Place `ai.txt` at the root of your site, alongside `robots.txt`:

```
https://your-site.com/ai.txt
```

If your site already has an `ai.txt`, AEOrank's generated file is a recommended template — review and merge with your existing terms before replacing.

:::caution
`ai.txt` is an emerging convention, not a binding standard. Compliant crawlers respect it; non-compliant ones will not. Treat it as a clear public statement of your terms, not a technical access control.
:::
