# CICS Facility Photo Guide

The approved source photographs are stored in
`client/public/assets/images/facilities/`, organized by floor. Preserve the
folder structure and exact source filenames; do not flatten or duplicate them.

## Asset structure

```text
client/public/assets/images/facilities/
├── 1st Floor/
├── 2nd Floor/
├── 3rd Floor/
├── 4th Floor/
├── 5th Floor/
└── Building/
```

## Corrected facility mappings

The canonical mapping is maintained in `server/domain/facilityMedia.js`.
The four previously missing or incorrectly assigned records are now explicitly
mapped to their matching source photographs:

- `CICS-2F-MT` — All Gender Restroom.jpeg
- `CICS-2F-ACC` — Accreditation Room.jpeg
- `CICS-4F-TECH` — Technicians’ Room.jpeg
- `CICS-4F-ITL` — Information Technology Laboratory.HEIC (original source)

All other mapped facilities continue to use their exact floor-folder photographs.
The two building exterior photographs remain in `Building/`; `Wider.jpeg` is
the preferred homepage hero and `Closer.jpeg` is its fallback.

## Legacy root images

The four generic root-level photos (`cics-building.jpg`, `cics-classroom.jpg`,
`cics-lab.jpg`, and `cics-smart-room.jpg`) are no longer used. The logo remains
at `client/public/assets/images/facicuse-logo.jpg`. Category fallbacks now point
to real photographs already included in the floor-based asset folders.

## Image behavior

- Facility photos retain lazy loading and asynchronous decoding.
- The homepage hero uses high fetch priority and a real building-photo fallback.
- Meaningful alt text is retained.
- The IT Laboratory original is HEIC; browser decoding must be verified in the
  target browsers before considering that image fully browser-compatible.
