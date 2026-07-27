# Reisen Support

Public support and privacy pages for **Reisen**, provided by **StratusLens LLC**.

This repository intentionally contains only static HTML and CSS. It has no
analytics, cookies, forms, runtime dependencies, application source code, or
credentials.

## Public routes

- `/` — overview
- `/support/` — customer support and account help
- `/privacy/` — privacy policy

## Verify locally

```bash
npm test
python3 -m http.server 4173 --directory public
```

Then open `http://localhost:4173`.

## Deploy on Render

The included `render.yaml` defines a Render Static Site.

1. In Render, select **New +** → **Blueprint**.
2. Connect the GitHub repository containing this project.
3. Confirm the service name and create the Blueprint.
4. After deployment, verify `/support/` and `/privacy/` both load over HTTPS.
5. Use those exact URLs in App Store Connect.

No environment variables or build step are required.

