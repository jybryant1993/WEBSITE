# Layman's Ledger website

Marketing site for Layman's Ledger, a bookkeeping service for small businesses that explains the books in plain English.

Plain HTML, CSS and JavaScript. No build step: open `index.html` or serve the folder with any static host (GitHub Pages, Netlify, Cloudflare Pages).

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Pages

| File | What's on it |
|------|--------------|
| `index.html` | Hero with the animated sample report, jargon translator, services summary, how it works, local and remote, closing call to action |
| `services.html` | Each service in detail, pricing approach, FAQ |
| `about.html` | The story behind the name, how we talk about money, founder bio |
| `contact.html` | "Book a free call" form and what happens next |

## Before launch: replace the placeholders

Search the project for `[Your` and `555` to find them all.

- **City and state:** `[Your City]`, `[Your State]` (every page, including the footer)
- **Email:** `hello@laymansledger.com` (footer, contact page, and the fallback message in `assets/js/main.js`)
- **Phone:** `(555) 555-0123` / `+15555550123`
- **Founder:** `[Your Name]`, bio paragraphs and photo on `about.html`. The photo placeholder has a comment with the `<img>` tag to drop in.
- **Domain:** `https://www.laymansledger.com/` in the structured data on `index.html`
- **Software you support:** QuickBooks Online and Xero, Gusto for payroll (home and services pages). Edit if yours differ.
- **Promises to check:** reports "by the 10th", "reply within one business day", flat monthly pricing. Keep only what you'll stand behind.

## Connect the contact form

1. Create a free form at [formspree.io](https://formspree.io).
2. In `contact.html`, replace `YOUR_FORM_ID` in the form's `action` with your form ID.

Until then the form validates, but on submit it tells visitors to email you instead, so no messages are lost silently.

## Turn on testimonials

`index.html` has a testimonials section with the `hidden` attribute. When you have real quotes (with the client's permission), replace the placeholder text and remove `hidden`.

## Design notes

- **Direction:** the plain-English monthly report. White paper, navy ink (`#182338`), an editor's blue pencil (`#3B7DD8`) for marks, graphite handwriting (`#6B6055`) for notes, and a sticky-note yellow (`#FFE88A`) for the things you mustn't forget.
- **Type:** Bricolage Grotesque for everything, with tabular figures for money. Kalam for handwritten notes only.
- **Motion:** GSAP 3 (self-hosted in `assets/vendor/`). The one big moment is the hero report: numbers count up, the profit gets circled, notes write themselves in, and a sticky note lands. Elsewhere motion stays quiet: a scroll-drawn line through "How it works", a highlighter sweep on the About page, pencil strike-throughs in the jargon translator, smooth FAQ, and soft page cross-fades.
- **Accessibility:** all content is visible without JavaScript; `prefers-reduced-motion` turns animation off; visible focus rings; 44px+ touch targets; text contrast at least 4.5:1.

Design tokens live at the top of `assets/css/styles.css`.
