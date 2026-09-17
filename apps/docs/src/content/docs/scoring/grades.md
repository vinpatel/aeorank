---
title: Grades
description: Letter grades for technical readiness — not citation outcomes.
---

AEOrank maps the 0–100 score to a letter. Grades describe **crawler access and extractability**, not whether ChatGPT will cite you. There is no citation guarantee.

## Grade scale

| Grade | Score | Meaning |
|-------|-------|---------|
| **A+** | 95–100 | Crawler-ready |
| **A** | 85–94 | Highly extractable |
| **B** | 70–84 | Technically ready |
| **C** | 55–69 | Partial readiness |
| **D** | 40–54 | Weak signals |
| **F** | 0–39 | Blocked or unreadable |

We do **not** label grades “highly cited,” “consistently visible,” or “sometimes cited.” Those are mention-monitoring outcomes. AEOrank does not track mentions.

## What to do with a low grade

1. Unblock GPTBot / ClaudeBot / PerplexityBot / Google-Extended in `robots.txt` if they are disallowed.
2. Deploy the 8 files `aeorank-cli@0.1.1` writes.
3. Rescan. Score movement is technical readiness, not a citation timeline.

The GitHub Action can fail a PR when a gated crawler is **blocked**. `aeorank-cli@0.1.1` itself does not ship `--fail-on-crawler-block`.
