# Web

## Requirement: Every screen uses the Bar Napkin design system in light and dark
- **Scenario: readable in both themes.** Every text colour pair meets WCAG AA in light and dark:
  4.5:1 for body text, 3:1 for large handwritten accents.
- **Scenario: no accessibility violations.** The pages have no WCAG 2.2 A/AA violations in light
  and dark, at desktop width and at 360 px, and never scroll sideways at 360 px.

## Requirement: The theme follows the visitor
- **Scenario: OS preference.** With no saved choice, the page uses the OS colour scheme.
- **Scenario: chosen theme.** Pressing the header theme button switches at once; the choice is
  remembered for a year and the next page renders in it from the server.
- **Scenario: without JavaScript.** The header and footer theme controls and the zero-proof switch
  are forms that save the choice and return to the same page; a return path that is not a local
  path returns to the home page.

## Requirement: The app shell
- **Scenario: header and footer.** Every page has a skip link (first on Tab), the wordmark,
  Recipes, My Bar, the zero-proof switch, search ("Find a drink…"), the theme button, Sign in and
  Start my bar; the footer has The app, Behind the bar, The small print, the responsible-drinking
  line and the theme control.
