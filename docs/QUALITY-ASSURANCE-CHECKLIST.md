# Quality Assurance Checklist — Photo Upgrade

## Implemented in this branch
- [x] Inspected the supplied CICS facility photo archive.
- [x] Converted source JPEG/HEIC photos to optimized WebP.
- [x] Created canonical facility-code image mapping for 35 exact matches.
- [x] Kept 3 unmatched photos unassigned rather than mislabeling them.
- [x] Added image mapping to the facility API DTO.
- [x] Added photos to standalone public homepage facility cards.
- [x] Updated React landing hero to use the supplied building photo with fallback.
- [x] Updated standalone landing hero to use supplied building photo with fallback.
- [x] Added lazy loading and async decoding to facility images.
- [x] Restored data-section-link attributes on Facilities navigation links.

## Required before merge/deployment
- [ ] Copy all WebP files from the optimized photo pack into `client/public/assets/images/facilities/`.
- [ ] Confirm all 35 mapped image paths load in the browser.
- [ ] Confirm the hero image loads and falls back correctly.
- [ ] Verify the two unmatched canonical facilities retain fallback imagery.
- [ ] Run `npm run lint`, `npm test`, and `npm run build`.
- [ ] Check desktop and mobile homepage, facility directory, and detail pages.

## Data integrity
- [x] No production database records changed.
- [x] No fictional reservations/users/maintenance records inserted.
- [x] No authentication or role permissions changed.
- [x] No production deployment triggered.
