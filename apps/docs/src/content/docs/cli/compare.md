---
title: compare
description: Diff two scan JSON files with aeorank-cli@0.1.2 compare.
---

`aeorank-cli@0.1.2` includes `compare`:

```bash
npx aeorank-cli@0.1.2 compare before.json after.json
```

Both files are scan JSON (`--format json`). The command prints the score delta and per-dimension changes. Canonical dimension count is `dimensions.length` (**36**). This does not promise a citation change.
