---
title: ai.txt
description: aeorank-cli@0.1.2 scores /ai.txt inside content-licensing and does not generate the file.
---

`npx aeorank-cli@0.1.2` writes **8 files** and scores **36 dimensions**. It does **not** generate `ai.txt`.

The scanner fetches `/ai.txt`. The `content-licensing` dimension uses that body (plus CreativeWork `license` / `usageInfo` schema) when it scores the page. `generateAiTxt` exists in the repo and is **not** in `GENERATED_FILE_NAMES`.

If you maintain an `ai.txt` yourself, treat it as your own policy file. A scan will not emit one.

The 8 files the CLI does write: [llms.txt](/files/llms-txt/).
