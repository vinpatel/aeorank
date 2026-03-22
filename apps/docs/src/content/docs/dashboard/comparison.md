---
title: Scan Comparison
description: Compare any two scans side by side to see exactly what changed.
---

The comparison view shows a dimension-by-dimension diff between any two scans of the same site.

## Using the comparison view

On any site detail page with 2 or more completed scans, a **Compare Scans** section appears at the bottom. Use the **From** and **To** dropdowns to pick any two scans.

The table shows:

- **Overall score** change with point delta
- **Each dimension** with before/after scores and change indicator
- Color coding: green for improvements, red for regressions

## Tips

- Compare your most recent scan against the one before your last deploy to measure impact
- Use the comparison alongside the **Dimension Trends** chart for a complete picture
- For CLI users, the [`compare` command](/cli/compare/) provides the same diff in the terminal
