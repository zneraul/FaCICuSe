# Visual Upgrade Report — CICS Photos

The uploaded archive contained 40 source photos covering the CICS Building's five floors and two building exterior views. The photos were inspected and converted to WebP, resized to a maximum 1800×1200, quality 80. The optimized pack is approximately 4.3 MB.

The implementation adds canonical photo mappings for 35 facilities, uses the supplied building exterior as the preferred landing hero, and displays facility images in the standalone public homepage preview. The existing React directory and detail views already use the facility image URL from the API, so the API now resolves canonical photo mappings there as well.

Three photos were intentionally left unassigned because their names do not match the current canonical catalog. Two catalog facilities have no exact photo in the archive.

The optimized binary assets are supplied separately as `facicuse-cics-facility-photos-optimized.zip`; copy them into `client/public/assets/images/facilities/` before merging this branch. No production data or deployment was changed.
