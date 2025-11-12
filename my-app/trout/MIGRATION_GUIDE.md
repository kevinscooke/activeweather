# Migration Guide: Moving Estimating_Apex to activeflyfishing.com/trout/

This guide walks you through integrating this app into your activeflyfishing repo and hosting it at `/trout/` on Netlify.

## Step 1: Update Next.js Configuration for Base Path

The `next.config.js` has been updated to use `basePath: '/trout'`. This tells Next.js that all routes should be prefixed with `/trout/`.

## Step 2: Move the Repository

### Option A: Copy as Subdirectory (Recommended)

1. **Navigate to your activeflyfishing repo:**
   ```bash
   cd /path/to/activeflyfishing
   ```

2. **Copy this entire Estimating_Apex folder into the repo:**
   ```bash
   cp -r /Users/kevincooke/Documents/projects/Estimating_Apex ./trout
   ```

3. **Or if you prefer a different name:**
   ```bash
   cp -r /Users/kevincooke/Documents/projects/Estimating_Apex ./apps/trout
   ```

### Option B: Git Subtree (If you want to preserve history)

```bash
cd /path/to/activeflyfishing
git subtree add --prefix=trout /Users/kevincooke/Documents/projects/Estimating_Apex main --squash
```

## Step 3: Update Netlify Configuration

You'll need to update your Netlify configuration to handle the routing. Create or update `netlify.toml` in your activeflyfishing repo root:

```toml
[build]
  # Build command for the main site (adjust as needed)
  command = "npm run build"
  publish = ".next"

# For the /trout/ app
[[redirects]]
  from = "/trout/*"
  to = "/trout/index.html"
  status = 200

# Handle Next.js routes
[[redirects]]
  from = "/trout/_next/*"
  to = "/trout/_next/:splat"
  status = 200

# API routes if you add them later
[[redirects]]
  from = "/trout/api/*"
  to = "/trout/api/:splat"
  status = 200
```

**OR** if you're using a monorepo structure, you might need:

```toml
[build]
  base = "trout"
  command = "cd trout && npm install && npm run build"
  publish = "trout/.next"
```

## Step 4: Update Package.json Scripts (if needed)

If you're using a monorepo, you might want to add scripts to the root `package.json`:

```json
{
  "scripts": {
    "build:trout": "cd trout && npm run build",
    "dev:trout": "cd trout && npm run dev"
  }
}
```

## Step 5: Environment Variables

Make sure your `.env` file in the `trout/` directory has the correct Supabase credentials. The environment variables will need to be set in Netlify as well:

1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 6: Test Locally

1. **Navigate to the trout directory:**
   ```bash
   cd trout
   npm install
   npm run dev
   ```

2. **Access at:** `http://localhost:3000/trout/`

## Step 7: Build and Deploy

1. **Build the app:**
   ```bash
   cd trout
   npm run build
   ```

2. **Test the production build:**
   ```bash
   npm start
   ```

3. **Deploy to Netlify:**
   - Push your changes to GitHub
   - Netlify should auto-deploy if connected
   - Or trigger a manual deploy from Netlify dashboard

## Step 8: Verify Routes Work

After deployment, test these URLs:
- `https://activeflyfishing.com/trout/` - Home page
- `https://activeflyfishing.com/trout/dashboard` - Dashboard
- `https://activeflyfishing.com/trout/checklist` - Checklist

## Important Notes

1. **Next.js automatically handles basePath** - All `Link` components and `router.push()` calls will automatically use `/trout/` prefix
2. **Static assets** - Next.js will automatically prefix static assets with `/trout/_next/`
3. **API Routes** - If you add API routes later, they'll be at `/trout/api/...`
4. **Environment Variables** - Make sure both local `.env` and Netlify env vars are set correctly

## Troubleshooting

- **404 on routes:** Check Netlify redirects configuration
- **Assets not loading:** Verify `basePath` is set correctly in `next.config.js`
- **Build fails:** Check that all dependencies are in `package.json` and `node_modules` is in `.gitignore`

