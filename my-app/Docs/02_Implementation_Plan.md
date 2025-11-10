# SEO & Content Implementation Plan

## Action Items for Product Owner

**Quick wins (this week):**
1. Review and approve homepage hero copy replacement (see Phase 1)
2. Review and approve Ararat River page content template (see Phase 1)
3. Provide access point details for 3-5 key NC rivers (parking, trailheads, wading entry)
4. Review and approve FAQ content for homepage

**Content creation (Weeks 1-2):**
5. Draft seasonal hatch calendars for Smokies, Pisgah, Nantahala regions
6. Review methodology for Fishability Index scoring (see Phase 3)
7. Approve monetization approach (featured listings, affiliate blocks, pro tier)

**Business decisions:**
8. Decide on alerts MVP scope (email only vs. SMS/push)
9. Approve directory structure for fly shops/guides
10. Set pricing for featured listings and pro tier (if applicable)

---

## Phase 1 – Foundation (Weeks 1–3)

### Immediate SEO & UX Fixes ✅ Ready to Implement

**1.1 Fix data reliability on river pages** ✅
- [x] **AI Task**: Update error handling to show last known reading + timestamp
- [x] **AI Task**: Add fallback UI with link to official USGS station
- [x] **AI Task**: Surface nearby alternative gauges when primary is unavailable
- [x] **AI Task**: Add "Data sources" footnote with USGS/NWS attribution

**1.2 Homepage hero copy replacement**
- [x] **AI Task**: Replace current hero with SEO-optimized copy:
  - Title: "Real-Time Trout Conditions for North Carolina"
  - Subtitle: "Live flows, water temps, wind, and 7–90 day trends—plus access notes and seasonal hatches for every major trout stream."
  - CTA buttons: "View NC Rivers · Set Flow/Temp Alerts · Learn How to Read Gauges"
- [x] **AI Task**: Update metadata to focus on general NC keywords (not specific rivers)
- **SEO Strategy Note**: Homepage targets general NC fly fishing keywords. Individual river pages will have specific river names in their metadata and content.

**1.3 Programmatic river pages structure** ✅ (Partial)
- [ ] **AI Task**: Create page template with tabs: Overview · Access & Maps · Seasonal/Hatch · Regulations · Safety · History
- [x] **AI Task**: Implement H1 pattern: "{River Name} Flow & Fly Fishing Conditions ({City}, NC)"
- [x] **AI Task**: Add at-a-glance metrics section (Stage, Wind, Precip, Humidity) - Note: Flow (cfs) and Water Temp will be added in Phase 2.1
- [x] **AI Task**: Build internal linking system (state hub, related rivers, explainers)
- [ ] **AI Task**: Implement dynamic metadata generation with specific river names (see 1.8)

**1.4 Ararat River page content template**
- [ ] **AI Task**: Create full template with:
  - Overview (100–140 words)
  - Access & Maps section (2–3 entry points)
  - Seasonal & Hatches calendar
  - Regulations links
  - Safety notes
  - Data sources attribution
- [ ] **Owner Task**: Provide access point details for Ararat River
- [ ] **Owner Review**: Review and approve template before replicating

**1.5 FAQ page with structured data**
- [ ] **AI Task**: Create `/faq/` page with:
  - "What is a safe flow for wading?"
  - "Why does water temperature matter for trout?"
  - "Where does your data come from?" (with USGS/NWS links)
- [ ] **AI Task**: Add FAQPage JSON-LD schema
- [ ] **AI Task**: Link FAQ from homepage and all river pages

**1.6 State hub (NC) page**
- [ ] **AI Task**: Create "Fly Fishing North Carolina" hub page
- [ ] **AI Task**: Add intro copy (120–160 words) with USGS attribution
- [ ] **AI Task**: Build river grid with filters (wild/stocked/tailwater)
- [ ] **AI Task**: Link to all NC river pages

**1.7 Structured data implementation**
- [ ] **AI Task**: Add Organization schema (site-wide)
- [ ] **AI Task**: Add BreadcrumbList schema (per state/river)
- [ ] **AI Task**: Add Dataset schema for each river's USGS data
- [ ] **AI Task**: Include JSON-LD snippets in page templates

**1.8 Metadata & social cards** ✅
- [x] **AI Task**: Generate unique `<title>` per river page: "{River Name} Flow, Water Temp & Fishing Conditions ({City}, NC)"
- [x] **AI Task**: Create unique meta descriptions per page with specific river name and location
- [x] **AI Task**: Add OpenGraph/Twitter cards with river name + state + "flow/temperature"
- **SEO Strategy Note**: Individual river pages must include specific river names in titles, descriptions, and content. Homepage focuses on general NC keywords.

**1.9 Internal linking system**
- [ ] **AI Task**: Link every river page to:
  - State hub
  - Related rivers (3–5 nearby)
  - "How to read flows" explainer
  - Shop/guide directory (when ready)

**1.10 Sitemaps & robots** ✅
- [x] **AI Task**: Auto-generate XML sitemap for `/states/` and `/rivers/`
- [x] **AI Task**: Update robots.txt to reference sitemap

**1.11 Evergreen explainers**
- [ ] **AI Task**: Create "How to read USGS flow & stage for trout"
- [ ] **AI Task**: Create "Water temperature and trout stress thresholds"
- [ ] **AI Task**: Create "Safety: rising water, hydropeaking tailwaters, thunderstorms"
- [ ] **AI Task**: Link explainers from every river page

---

## Phase 2 – Depth & Utility (Weeks 4–7)

### Enhanced Features & Content

**2.1 Water temperature integration**
- [ ] **AI Task**: Add water temperature to data pipeline (USGS parameter 00010)
- [ ] **AI Task**: Display water temp on all river pages
- [ ] **AI Task**: Add temperature trend charts (7/30/90-day)
- [ ] **AI Task**: Show thresholds (low/optimal/high) with visual indicators

**2.2 Historical trend charts**
- [ ] **AI Task**: Build 7-day sparkline chart
- [ ] **AI Task**: Build 30/90-day line charts with median overlay
- [ ] **AI Task**: Add textual interpretation ("This week is 20% below median...")
- [ ] **AI Task**: Cache daily min/mean/max for chart data

**2.3 Hatch & seasonal guides**
- [ ] **Owner Task**: Draft hatch calendars for Smokies, Pisgah, Nantahala regions
- [ ] **AI Task**: Create region-specific pages with calendar-style summaries
- [ ] **AI Task**: Add "3 go-to flies per month" recommendations
- [ ] **AI Task**: Link seasonal guides from relevant river pages

**2.4 Access & Maps enhancement**
- [ ] **Owner Task**: Provide access notes for 10–20 key NC rivers (parking, trail, wading entry)
- [ ] **AI Task**: Add "Access & Maps" section to all river pages
- [ ] **AI Task**: Create static map images for OG cards
- [ ] **AI Task**: Link to official regs and land ownership info

**2.5 Alerts MVP**
- [ ] **Owner Decision**: Approve alerts scope (email only vs. SMS/push)
- [ ] **AI Task**: Build email alert system for user-selected thresholds (flow/temp)
- [ ] **AI Task**: Create alert management UI (set/edit/delete thresholds)
- [ ] **AI Task**: Add "Set Flow/Temp Alerts" CTA to homepage and river pages

**2.6 Directory MVP**
- [ ] **Owner Decision**: Approve directory structure and monetization approach
- [ ] **AI Task**: Create fly shops & guides directory
- [ ] **AI Task**: Build basic listing system (free + paid featured spots)
- [ ] **AI Task**: Link directory from river pages
- [ ] **AI Task**: Add "Jesse Brown's" as featured example

**2.7 Data pipeline improvements**
- [ ] **AI Task**: Implement cache for USGS readings (every 10–15 min)
- [ ] **AI Task**: Roll up daily min/mean/max for charts
- [ ] **AI Task**: Add graceful degradation when data is stale
- [ ] **AI Task**: Ensure server-rendered critical metrics (no "loading..." above fold)

---

## Phase 3 – Differentiators (Weeks 8–12)

### Advanced Features & Content Marketing

**3.1 Fishability Index**
- [ ] **Owner Review**: Approve scoring methodology (0–100 score blending flow deviation, temp band, precip, wind)
- [ ] **AI Task**: Build Fishability Index calculation engine
- [ ] **AI Task**: Display index on all river pages with "Go / Caution / Don't Go" labels
- [ ] **AI Task**: Add explanation of scoring factors

**3.2 Wind layer integration**
- [ ] **AI Task**: Integrate wind data (especially for tailwaters & lakes)
- [ ] **AI Task**: Add wind to Fishability Index calculation
- [ ] **AI Task**: Display wind conditions on river pages

**3.3 Trip-builder feature**
- [ ] **AI Task**: Build "Trip-builder" tool (pick dates + tolerance)
- [ ] **AI Task**: Generate recommended rivers with short plan (flies, access, hazards)
- [ ] **AI Task**: Link trip-builder from homepage

**3.4 History & trend pages**
- [ ] **AI Task**: Create dedicated history pages per river
- [ ] **AI Task**: Add rolling 30/90-day charts with textual interpretation
- [ ] **AI Task**: Compare current conditions to historical medians

**3.5 Content marketing**
- [ ] **AI Task**: Create "State Conditions Roundup" template
- [ ] **AI Task**: Set up newsletter/blog infrastructure
- [ ] **Owner Task**: Monthly content creation (or delegate to AI with review)

**3.6 E-E-A-T enhancements**
- [ ] **AI Task**: Create "Data Sources" page with USGS/NWS attribution
- [ ] **AI Task**: Create "Methodology" page (how Fishability Index is scored)
- [ ] **AI Task**: Create "About" page with name and background
- [ ] **AI Task**: Add authority badges: "Powered by USGS gauge ####" with timestamps

**3.7 Performance optimization**
- [ ] **AI Task**: Ensure server-side rendering for critical metrics
- [ ] **AI Task**: Optimize chart rendering performance
- [ ] **AI Task**: Implement lazy loading for below-fold content

---

## Phase 4 – Monetization (Weeks 13+)

### Revenue Generation

**4.1 Featured listings**
- [ ] **Owner Decision**: Set pricing for featured listings
- [ ] **AI Task**: Build featured listing system (top/bottom modules on river pages)
- [ ] **AI Task**: Create admin interface for managing listings

**4.2 Affiliate blocks**
- [ ] **Owner Decision**: Approve affiliate partnerships
- [ ] **AI Task**: Create "Today's Picks" blocks (tippet, polarized lenses, rain shell)
- [ ] **AI Task**: Tie affiliate blocks to current conditions

**4.3 Pro tier**
- [ ] **Owner Decision**: Set pro tier pricing and features
- [ ] **AI Task**: Build pro tier features:
  - Fishability Index forecasts
  - Saved alerts
  - Historical data downloads
- [ ] **AI Task**: Create subscription/payment system

---

## Technical Checklist

### Data Pipeline
- [ ] Cache USGS readings (every 10–15 min)
- [ ] Roll up daily min/mean/max for charts
- [ ] Graceful degradation when data is stale
- [ ] Server-render critical metrics (no "loading..." above fold)

### Charts
- [ ] Sparkline for 24h
- [ ] Line charts for 7/30/90 days with median overlay
- [ ] Water temperature trend charts
- [ ] Flow threshold indicators

### Alerts
- [ ] Email alerts (MVP)
- [ ] SMS/push alerts (future)
- [ ] Saved thresholds per user

### SEO Infrastructure
- [ ] Auto-generate XML sitemap(s) for `/states/` and `/rivers/`
- [ ] Reference sitemap in robots.txt
- [ ] Unique metadata per page
- [ ] Structured data (Organization, BreadcrumbList, Dataset, FAQPage)

---

## Success Metrics

**Week 1-3:**
- Zero "Unavailable" states on key river pages
- All river pages have unique titles/descriptions
- FAQ page live with structured data
- State hub page with 10+ river links

**Week 4-7:**
- Water temperature on all pages
- Historical charts functional
- Alerts MVP live
- Directory MVP live

**Week 8-12:**
- Fishability Index live
- Trip-builder functional
- Content marketing started
- E-E-A-T pages published

---

## Notes

- All AI tasks can be implemented immediately upon approval
- Owner tasks require content/business decisions
- Review checkpoints after each phase
- Prioritize data reliability fixes first (Phase 1.1)
- Content templates can be replicated once approved (Phase 1.4)

