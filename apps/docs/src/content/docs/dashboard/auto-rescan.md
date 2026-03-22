---
title: Auto-Rescan
description: Schedule automatic rescans to track your AEO score over time.
---

Set up automatic rescans so your AEO score stays up to date without manual effort.

## Setting a schedule

On any site detail page, use the **Auto-rescan** toggle in the top right to choose a frequency:

- **Off** — no automatic rescans (default)
- **Daily** — rescan every 24 hours
- **Weekly** — rescan every 7 days
- **Monthly** — rescan every 30 days

The schedule takes effect immediately. Your next rescan will be scheduled from the time you enable it.

## How it works

A cron job runs daily at 6:00 AM UTC and checks for sites with a `next_rescan_at` in the past. For each due site, it enqueues a scan via the same async pipeline used for manual scans.

After each rescan completes, the next rescan time is automatically updated based on your chosen schedule.

## Viewing history

All rescans appear in your **Score History** chart and **Dimension Trends** chart on the site detail page. Use the **Compare Scans** section to see exactly what changed between any two scans.
