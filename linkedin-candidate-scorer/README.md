# LinkedIn Candidate Scorer

A Chrome extension (Manifest V3) that overlays a real-time scoring dashboard directly onto LinkedIn profile pages, turning passive browsing into data-driven candidate evaluation.

## Overview

This extension parses LinkedIn profile data in real time and evaluates candidates across 10 weighted scoring dimensions. A floating dashboard overlays directly on the profile page, giving recruiters instant, objective candidate assessments without leaving LinkedIn.

## How It Works

1. **Profile Detection** — The extension detects when you're viewing a LinkedIn profile page.
2. **DOM Parsing** — Extracts candidate data from the profile: experience, education, skills, endorsements, recommendations, and more.
3. **Multi-Dimensional Scoring** — Evaluates the candidate across 10 configurable weighted dimensions.
4. **Dashboard Overlay** — Displays scores, breakdowns, and insights in a non-intrusive overlay on the profile.
5. **Comparison Panel** — A floating panel lets you compare multiple candidates side by side.

## Files

| File | Description |
|---|---|
| `linkedin-candidate-scorer.skill` | Skill configuration and scoring rules |
| `overlay.css` | Styles for the scoring dashboard overlay |
| `overlay.js` | Dashboard overlay rendering and interaction logic |
| `parser.js` | LinkedIn DOM parser for extracting profile data |
| `scoring.js` | Multi-dimensional scoring engine with weighted dimensions |
| `ui-components.js` | Reusable UI components for the extension interface |

## Key Features

- Manifest V3 Chrome extension architecture
- Real-time LinkedIn DOM parsing and data extraction
- 10 configurable weighted scoring dimensions
- Visual score dashboard overlaid on profile pages
- Floating comparison panel for multi-candidate evaluation
- Non-intrusive UI that integrates seamlessly with LinkedIn

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked" and select this folder
4. Navigate to any LinkedIn profile to see the scorer in action

## Tech Stack

- **AI**: Claude 4 (Anthropic)
- **Extension**: Chrome Manifest V3
- **Frontend**: JavaScript, CSS
- **Parsing**: Custom LinkedIn DOM parser

## Part of Claude-TA

This project is part of the [Claude-TA](https://github.com/100rabs/Claude-TA) toolkit — an AI-powered talent acquisition suite built with Claude 4.
