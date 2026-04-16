# X-Ray Sourcing Pipeline

End-to-end sourcing automation that takes a job description and delivers a ranked candidate pipeline — no manual searching required.

## Overview

This tool automates the entire sourcing workflow: from parsing a job description to generating optimized search queries, scraping candidate profiles, scoring them against requirements, and presenting results in an interactive dashboard.

## How It Works

1. **JD Parsing** — Upload a job description and the tool extracts key requirements, skills, must-haves, and qualifications automatically.
2. **Search Generation** — Generates optimized Google X-Ray and Boolean search strings targeting LinkedIn and other professional platforms.
3. **Profile Scraping** — Scrapes candidate profiles from search results, deduplicating and normalizing the data.
4. **Candidate Scoring** — Each candidate is scored against JD requirements using a weighted scoring engine.
5. **Dashboard & Export** — Results are displayed in an interactive dashboard with filters, sorting, and one-click Excel export.

## Files

| File | Description |
|---|---|
| `SourcerApp.html` | Main sourcing application interface |
| `xray-sourcer.skill` | Skill configuration for the X-Ray sourcing pipeline |

## Key Features

- Automated JD parsing and requirement extraction
- Multi-query X-Ray search string generation
- Candidate profile scraping and deduplication
- Weighted scoring engine aligned to role requirements
- Interactive dashboard with filters, sorting, and visual analytics
- One-click Excel export for ATS integration

## Tech Stack

- **AI**: Claude 4 (Anthropic)
- **Frontend**: HTML, JavaScript
- **Search**: Google X-Ray, Boolean Logic
- **Export**: Excel/CSV

## Part of Claude-TA

This project is part of the [Claude-TA](https://github.com/100rabs/Claude-TA) toolkit — an AI-powered talent acquisition suite built with Claude 4.
