# CICS Facility Photo Guide

The client-supplied CICS photo archive was inspected and optimized into WebP assets.

## Install the photo pack

Extract `facicuse-cics-facility-photos-optimized.zip` and copy every `.webp` file into:

`client/public/assets/images/facilities/`

The pack contains 40 optimized WebP images (about 4.3 MB total), including:
- 35 direct matches to the current canonical 37-facility catalog
- 3 retained but deliberately unassigned photos
- 2 CICS building exterior photos

## Mapping

The canonical mapping is maintained in `server/domain/facilityMedia.js` under `FACILITY_IMAGE_BY_CODE`. The API resolves these mappings for public and authenticated facility DTOs, while preserving custom non-placeholder facility image URLs.

Mapped facility photos:
- First Floor: Organizations Office; Rooms 101–106; Utility Room
- Second Floor: Female Toilet; Rooms 201–202; Computer Engineering Faculty; CICS Student Services; Consultation Room; CICS Faculty Room; Dean's Office
- Third Floor: Female and Male Toilets; Computer Laboratories 1–6
- Fourth Floor: Room 401; Physics Laboratory; SMART Classroom; Electronics Distance Learning; Information Technology Laboratory
- Fifth Floor: Rooms 501–506

## Deliberately unassigned

The archive also includes:
- All Gender Restroom (2nd Floor)
- Accreditation Room (2nd Floor)
- Technicians' Room (4th Floor)

These are not exact matches to the current canonical catalog names/codes, so they are not assigned to a different facility.

No exact photograph was supplied for:
- `CICS-2F-MT` — Male Toilet (2nd Floor)
- `CICS-4F-TECH` — Tech Laboratory

Keep the existing generic fallback for these two facilities until their correct photos are confirmed.

## Homepage

The supplied wider exterior photo is used as the preferred hero image:
`/assets/images/facilities/cics-building-wider.webp`

The existing `cics-building.jpg` remains the fallback until the photo pack is copied into the repository.

## Performance and accessibility

- Facility photos use lazy loading and async decoding.
- The homepage hero uses high fetch priority.
- Images include descriptive alt text.
- Existing image fallback behavior is preserved.
