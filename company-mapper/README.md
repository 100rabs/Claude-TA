# Talent Intelligence & Company Mapper

Strategic sourcing intelligence that analyzes any job description and maps out the ideal companies to recruit from — complete with scoring, rationale, and prioritization.

## Overview

This tool takes a JD and produces a recruiter-ready target company map with 12-20 ranked companies, each scored on Match and Poachability. It identifies where the best talent sits, why they'd be a good fit, and how likely they are to move.

## How It Works

1. **JD Analysis** — Parses the job description to extract role requirements, industry context, seniority level, and key skills.
2. **Company Identification** — Identifies 12-20 target companies across direct competitors, adjacent industries, and non-obvious talent pools.
3. **Dual-Axis Scoring** — Scores each company on Match (0-100) and Poachability (0-100) based on role alignment and talent mobility signals.
4. **Fit Tagging** — Tags each company with fit categories (direct competitor, adjacent industry, emerging player, etc.).
5. **Prioritization** — Delivers a ranked must-target list with sourcing rationale and recommended approach.

## Files

| File | Description |
|---|---|
| `Company Mapper` | Core company mapping logic and configuration |
| `Talent_Intelligence_Recruiter_Workspace.html` | Interactive recruiter workspace interface |
| `Talent_Intelligence_Recruiter_Workspace.jsx` | React component for the workspace UI |
| `company-mapper.skill` | Skill configuration for the company mapper |

## Key Features

- Dual-axis scoring: Match fit and Poachability assessment (0-100)
- Company fit tags for quick filtering (direct competitor, adjacent industry, etc.)
- Detailed sourcing rationale per company
- Cross-industry talent pool identification for non-obvious sourcing angles
- Prioritized must-target shortlist with actionable next steps
- Interactive workspace for recruiter collaboration

## Tech Stack

- **AI**: Claude 4 (Anthropic)
- **Frontend**: HTML, JavaScript, React (JSX)
- **Analysis**: NLP-powered JD parsing, company intelligence

## Part of Claude-TA

This project is part of the [Claude-TA](https://github.com/100rabs/Claude-TA) toolkit — an AI-powered talent acquisition suite built with Claude 4.
