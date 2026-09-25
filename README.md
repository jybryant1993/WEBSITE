# Layman's Ledger website

Marketing site for Layman's Ledger: bookkeeping and financial advisory for small businesses, explained in plain English.

Plain HTML, CSS and JavaScript. No build step: open `index.html` or serve the folder with any static host (GitHub Pages, Netlify, Cloudflare Pages).

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Pages

| File | What's on it |
|------|--------------|
| `index.html` | Hero with the animated sample report, jargon translator, bookkeeping and advisory summary, how it works, local and remote, closing call to action |
| `services.html` | Bookkeeping (monthly, cleanup, payroll, tax-time handoff) and advisory (fractional controller and CFO, systems and data cleanup, pricing and profitability, financing and loan prep) in detail, pricing approach, FAQ |
| `about.html` | The story behind the name, how we talk about money |
| `contact.html` | "Book a free call" form and what happens next |

## Before launch: check these

- **Domain:** `https://www.laymansledger.com/` in the structured data on `index.html`
- **Promises:** reports "by the 10th", "reply within one business day", flat monthly bookkeeping pricing, advisory quoted up front (fixed project price or monthly retainer), familiarity with Tennessee sales tax, SBA loan expertise (7(a), 504, Express, microloans). Keep only what you'll stand behind.
- **About page:** there's no founder bio or photo by choice. Add one later if you want a face on the site.

Contact details used throughout: info@laymansledger.com, Nashville, Tennessee. Software named on the site: QuickBooks Online, NetSuite, Sage Intacct, and Gusto for payroll.

## Connect the contact form

1. Create a free form at [formspree.io](https://formspree.io).
2. In `contact.html`, replace `YOUR_FORM_ID` in the form's `action` with your form ID.

Until then the form validates, but on submit it tells visitors to email info@laymansledger.com instead, so no messages are lost silently.

## Turn on testimonials

`index.html` has a testimonials section with the `hidden` attribute. When you have real quotes (with the client's permission), replace the placeholder text and remove `hidden`.

## Design notes

- **Direction:** the plain-English monthly report. White paper, charcoal ink (`#232323`), a gold pencil (`#B8892B`) for marks, graphite handwriting (`#6B6055`) for notes, and a gold tab (`#EBCB7C`) for the things you mustn't forget. Charcoal and gold (`#1C1C1C` / `#E6C77A`) go dark only in the closing panel and footer.
- **Type:** Newsreader (serif) for headings, Figtree for body text and UI, with tabular figures for money. Kalam for handwritten notes only.
- **Motion:** GSAP 3 (self-hosted in `assets/vendor/`). The one big moment is the hero report: numbers count up, the profit gets circled, notes write themselves in, and a sticky note lands. Elsewhere motion stays quiet: a scroll-drawn line through "How it works", a highlighter sweep on the About page, pencil strike-throughs in the jargon translator, smooth FAQ, and soft page cross-fades.
- **Accessibility:** all content is visible without JavaScript; `prefers-reduced-motion` turns animation off; visible focus rings; 44px+ touch targets; text contrast at least 4.5:1.

Design tokens live at the top of `assets/css/styles.css`.
