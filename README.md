# Text-to-SQL Center of Excellence: website

A static, single-page site for the Text-to-SQL CoE: the nine techniques, the "which one should I use?" chooser, the evaluation approach, and links to benchmarks, sample warehouses, tools and papers.

No build step, no dependencies. Plain HTML, CSS and JavaScript.

```
index.html          page layout and section scaffolding
assets/data.js      ALL content (techniques, use cases, datasets, resources…), edit this to update the site
assets/app.js       rendering and interactions (drawer, chooser wizard, filters, demo)
assets/styles.css   styles, light and dark theme
```

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publish on GitHub Pages

Pages is set to **Deploy from a branch** (`main`, `/ (root)`), so every push to `main` republishes the site within a minute or two.

## Updating content

Everything you'd normally edit is in `assets/data.js`:

- `techniques`: name, what/shines/falls short, badge, repo folder
- `wizard` / `wizardDefault`: the four-question decision flow
- `useCases`: the lookup table
- `datasets`: benchmarks and sample warehouses (`cat`: `benchmark`, `warehouse`, `conversational`)
- `resources`: tools, platforms and papers, tagged with technique IDs (`T1`…`T9`, or `eval`)

Deep links: `#t-T4` opens the T4 detail panel directly.
