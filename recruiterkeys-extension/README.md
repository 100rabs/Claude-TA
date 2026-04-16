# RecruiterKeys Communication Platform

A Chrome extension with a Raycast-style command palette that gives recruiters instant access to 50+ professionally crafted message templates — with smart insertion into any messaging platform.

## Overview

RecruiterKeys supercharges recruiter communication with a keyboard-shortcut-driven command palette. Trigger it anywhere, search for the right template, customize the tone and channel, and insert it directly into LinkedIn, WhatsApp, Gmail, or any text field — all without leaving the page.

## How It Works

1. **Activate** — Press the keyboard shortcut to open the Raycast-style command palette overlay.
2. **Search** — Fuzzy search across 50+ templates organized by recruitment stage.
3. **Customize** — Select tone mode (formal, friendly, casual, urgent, executive) and channel format (email, InMail, WhatsApp, SMS, Slack).
4. **Personalize** — Templates auto-fill with candidate and role details from your saved profiles.
5. **Insert** — One click inserts the formatted message directly into the active text field.

## Files

| File | Description |
|---|---|
| `manifest.json` | Chrome extension manifest (Manifest V3) |
| `service-worker.js` | Background service worker for extension lifecycle |
| `content.js` | Content script for page interaction and text insertion |
| `popup.html` | Extension popup interface |
| `popup.js` | Popup logic and event handling |
| `palette.js` | Command palette UI and fuzzy search engine |
| `palette.css` | Command palette styling |
| `message-templates.js` | 50+ message templates across 10 recruitment stages |
| `channel-formatter.js` | Message formatting for different channel types |
| `personalization.js` | Template personalization with candidate/role data |
| `settings.html` | Extension settings page |
| `settings.js` | Settings management and preferences |
| `storage.js` | Chrome storage API wrapper for persistent data |

## Key Features

- Raycast-style command palette with fuzzy search
- 50+ message templates across 10 recruitment stages
- 5 tone modes: formal, friendly, casual, urgent, executive
- 5 channel formats: email, LinkedIn InMail, WhatsApp, SMS, Slack
- Smart insertion into LinkedIn chat, WhatsApp Web, Gmail compose, and contentEditable fields
- Template personalization with saved candidate and role profiles
- Fully keyboard-driven workflow for maximum speed

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked" and select this folder
4. Use the keyboard shortcut to activate the command palette on any page

## Tech Stack

- **AI**: Claude 4 (Anthropic)
- **Extension**: Chrome Manifest V3
- **Frontend**: HTML, CSS, JavaScript
- **Storage**: Chrome Storage API

## Part of Claude-TA

This project is part of the [Claude-TA](https://github.com/100rabs/Claude-TA) toolkit — an AI-powered talent acquisition suite built with Claude 4.
