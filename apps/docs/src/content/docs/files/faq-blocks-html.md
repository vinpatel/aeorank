---
title: faq-blocks.html
description: Speakable FAQ schema markup that AI engines prefer to cite.
---

The `faq-blocks.html` file contains FAQ structured data with speakable markup — the format AI engines prefer when looking for questions to answer.

## What it is

HTML snippets with embedded JSON-LD that mark up FAQ content using the Schema.org `FAQPage` and `SpeakableSpecification` schemas.

## Why it matters

AI engines heavily favor structured FAQ content when generating responses. Sites with properly marked FAQ sections are more likely to be cited as sources for specific questions. The speakable specification tells AI models which text is suitable for voice and text-based answers.

## Example output

```html
<!-- FAQ Block: Getting Started -->
<div itemscope itemtype="https://schema.org/FAQPage">
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">How do I install Example CLI?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <p itemprop="text">Run <code>npm install -g example-cli</code> to install globally, or use <code>npx example-cli</code> for one-off usage.</p>
    </div>
  </div>
</div>
```

## How to deploy

Add the FAQ blocks to your site's FAQ page or relevant content pages. The markup can be placed:

1. **Inline** — embed directly in your FAQ page HTML
2. **As JSON-LD** — place in a `<script type="application/ld+json">` tag
3. **Combined** — use both for maximum coverage
