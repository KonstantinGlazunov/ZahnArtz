# Praxis Zahnklar Landing Page

Responsive one-page landing page for a modern private dental practice in Germany with German and Russian language versions.

## Structure

- `index.html` - semantic page structure, SEO tags, Open Graph tags, JSON-LD
- `css/styles.css` - full responsive styling
- `js/i18n.js` - DE/RU translation dictionary
- `js/main.js` - mobile navigation, sticky header, FAQ accordion, active nav, form validation and language switching
- `assets/img/` - local WebP images used by the page

## Preview

Open `index.html` directly in a browser or run a local static server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Notes

The contact form performs client-side validation and prepares a `mailto:` message. No backend is included. Replace the placeholder Berlin address, phone number and e-mail with the real practice data before publishing.
