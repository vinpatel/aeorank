---
title: ai.txt (not in 0.1.1)
description: aeorank-cli@0.1.1 neither generates nor scores ai.txt.
---

:::caution[Not in the published CLI]
`npx aeorank-cli@0.1.1` writes **8 files** and scores **12 dimensions**. It does **not** generate `ai.txt` and does **not** score `/ai.txt`. Do not list this file as product output.
:::

`ai.txt` is an emerging licensing convention some sites publish next to `robots.txt`. AEOrank’s published CLI does not write it and does not include a content-licensing dimension.

If you maintain an `ai.txt` yourself, treat it as your own policy file. Merge carefully; AEOrank will not emit this file on scan.

The 8 files the CLI does write: [llms.txt](/files/llms-txt/).
