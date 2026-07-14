# Purani Rasoi — Shopify Theme

Online Store 2.0 theme for Purani Rasoi. Push to `main` auto-deploys to an unpublished theme on Shopify via GitHub Actions.

## Auto-deploy

```text
Edit → git push origin main → GitHub Actions → shopify theme push → Draft theme
```

Preview the draft in Shopify admin, then publish when ready.

### Required GitHub secrets

**Settings → Secrets and variables → Actions**

| Secret | Example / notes |
|--------|------------------|
| `SHOPIFY_FLAG_STORE` | `1mygn2-hi.myshopify.com` |
| `SHOPIFY_CLI_THEME_TOKEN` | Password from the [Theme Access](https://apps.shopify.com/theme-access) app |
| `SHOPIFY_THEME_ID` | Numeric ID of the **draft** theme (from the theme URL) |

### Get Theme Access password

1. Install **Theme Access** on the Purani Rasoi store.
2. Create a password for a collaborator email.
3. Store that password as `SHOPIFY_CLI_THEME_TOKEN`.

### Get theme ID

1. In Shopify admin: **Online Store → Themes**.
2. Open the draft theme (Customize), or click the theme menu.
3. From the URL: `.../themes/123456789012/...` → use `123456789012` as `SHOPIFY_THEME_ID`.

After secrets are set, re-run **Actions → Deploy Shopify theme**, or push a commit.

## Local development

```bash
npm install -g @shopify/cli @shopify/theme
shopify theme dev --store 1mygn2-hi.myshopify.com
```

Or zip and upload manually if you are not using CLI.

## Structure

| Path | Purpose |
|------|---------|
| `layout/` | `theme.liquid` |
| `sections/` | Homepage, header, footer, product, collection |
| `templates/` | JSON templates (OS 2.0) |
| `assets/` | CSS, JS, brand images |
| `config/` | Theme settings |
| `snippets/` | Reusable Liquid |

## Manual zip upload

Zip the **contents** of this repo (so `layout/` is at the zip root), then **Online Store → Themes → Upload**.
