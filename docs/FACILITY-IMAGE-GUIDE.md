# CICS Facility Photo Guide

The approved source photographs already exist in the repository under
`client/public/assets/images/facilities/`, organized into floor-specific folders.
Keep the existing folder names, filenames, capitalization, spaces, and extensions intact.

## Existing asset structure

```text
client/public/assets/images/facilities/
├── 1st Floor/
├── 2nd Floor/
├── 3rd Floor/
├── 4th Floor/
├── 5th Floor/
└── Building/
```

The facility registry in `server/domain/facilityMedia.js` points directly to these
existing files. Do not flatten the folders or copy duplicate images into the root
of `facilities/`.

## Mapping

The canonical mapping is maintained in `FACILITY_IMAGE_BY_CODE`. The API resolves
these mappings for public and authenticated facility DTOs, while preserving custom
non-placeholder facility image URLs.

Mapped facilities:
- First Floor: CICS Organizations Office; Rooms 101–106; Utility Room
- Second Floor: Female Toilet; Rooms 201–202; Computer Engineering Faculty;
  CICS Student Services; Consultation Room; CICS Faculty Room; Dean's Office
- Third Floor: Female and Male Toilets; Computer Laboratories 1–6
- Fourth Floor: Room 401; Physics Laboratory; SMART Classroom;
  Electronics Distance Learning; Information Technology Laboratory (HEIC source)
- Fifth Floor: Rooms 501–506

## Deliberately unassigned

The following photos are not assigned to another facility because their names
do not match a confirmed canonical facility:
- Accreditation Room (2nd Floor)
- All Gender Restroom (2nd Floor)
- Technicians' Room (4th Floor)

No exact photograph was supplied for:
- `CICS-2F-MT` — Male Toilet (2nd Floor)
- `CICS-4F-TECH` — Tech Laboratory

These facilities retain their category fallback.

## Building hero

The existing wider exterior image is used as the homepage hero:
`/assets/images/facilities/Building/Wider.jpeg`

The existing `/assets/images/cics-building.jpg` remains the fallback.

## Optional WebP optimization pack

An optimized WebP copy pack was prepared separately. It is not required for the
current floor-based JPEG mapping and must not be copied flat into the root folder.
If the project later adopts those optimized files, place them in the matching
floor folders and update the registry and hero path together.

## Performance and accessibility

- Facility photos use lazy loading and async decoding where rendered in cards.
- The homepage hero uses high fetch priority.
- Images include descriptive alt text.
- Existing image fallback behavior is preserved.
