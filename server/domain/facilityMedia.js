/**
 * Centralized Facility Media Registry for FaCICuSe (CICS Building).
 * Client-supplied photos are mapped only when the filename and floor identify
 * the canonical facility. Unmatched photos remain unassigned.
 */

export const DEFAULT_FACILITY_MEDIA = Object.freeze({
  classroom: '/assets/images/cics-classroom.jpg',
  laboratory: '/assets/images/cics-lab.jpg',
  smartRoom: '/assets/images/cics-smart-room.jpg',
  building: '/assets/images/cics-building.jpg',
});

export const FACILITY_MEDIA_PRESETS = Object.freeze([
  Object.freeze({ id: 'classroom', label: 'CICS Classroom (Fallback)', value: DEFAULT_FACILITY_MEDIA.classroom }),
  Object.freeze({ id: 'laboratory', label: 'CICS Laboratory (Fallback)', value: DEFAULT_FACILITY_MEDIA.laboratory }),
  Object.freeze({ id: 'smartRoom', label: 'CICS SMART Room (Fallback)', value: DEFAULT_FACILITY_MEDIA.smartRoom }),
  Object.freeze({ id: 'building', label: 'CICS Building (Fallback)', value: DEFAULT_FACILITY_MEDIA.building }),
]);

const PHOTO = (name) => `/assets/images/facilities/${name}`;

/** Canonical facility code -> directly matched CICS photo from the supplied pack. */
export const FACILITY_IMAGE_BY_CODE = Object.freeze({
  'CICS-1F-ORG': PHOTO('organizations-office.webp'),
  'CICS-101': PHOTO('room-101.webp'),
  'CICS-102': PHOTO('room-102.webp'),
  'CICS-103': PHOTO('room-103.webp'),
  'CICS-104': PHOTO('room-104.webp'),
  'CICS-105': PHOTO('room-105.webp'),
  'CICS-106': PHOTO('room-106.webp'),
  'CICS-1F-UTIL': PHOTO('utility-room.webp'),

  'CICS-2F-FT': PHOTO('female-toilet-2f.webp'),
  'CICS-201': PHOTO('room-201.webp'),
  'CICS-202': PHOTO('room-202.webp'),
  'CICS-2F-CPE': PHOTO('computer-engineering-faculty.webp'),
  'CICS-2F-SAO': PHOTO('student-services.webp'),
  'CICS-2F-CONS': PHOTO('consultation-room.webp'),
  'CICS-2F-FAC': PHOTO('faculty-room.webp'),
  'CICS-2F-DEAN': PHOTO('deans-office.webp'),

  'CICS-3F-FT': PHOTO('female-toilet-3f.webp'),
  'CICS-LAB1': PHOTO('computer-lab-1.webp'),
  'CICS-LAB2': PHOTO('computer-lab-2.webp'),
  'CICS-LAB3': PHOTO('computer-lab-3.webp'),
  'CICS-LAB4': PHOTO('computer-lab-4.webp'),
  'CICS-LAB5': PHOTO('computer-lab-5.webp'),
  'CICS-LAB6': PHOTO('computer-lab-6.webp'),
  'CICS-3F-MT': PHOTO('male-toilet-3f.webp'),

  'CICS-401': PHOTO('room-401.webp'),
  'CICS-4F-PHYS': PHOTO('physics-laboratory.webp'),
  'CICS-4F-SMART': PHOTO('smart-classroom.webp'),
  'CICS-4F-EDL': PHOTO('electronics-distance-learning.webp'),
  'CICS-4F-ITL': PHOTO('information-technology-laboratory.webp'),

  'CICS-501': PHOTO('room-501.webp'),
  'CICS-502': PHOTO('room-502.webp'),
  'CICS-503': PHOTO('room-503.webp'),
  'CICS-504': PHOTO('room-504.webp'),
  'CICS-505': PHOTO('room-505.webp'),
  'CICS-506': PHOTO('room-506.webp'),
});

const DEFAULT_IMAGE_VALUES = new Set(Object.values(DEFAULT_FACILITY_MEDIA));

export function resolveFacilityImageUrl({ code, category, imageUrl } = {}) {
  const custom = String(imageUrl || '').trim();
  const normalizedCode = String(code || '').trim().toUpperCase();
  const matchedPhoto = normalizedCode ? FACILITY_IMAGE_BY_CODE[normalizedCode] : null;

  // Prefer a matched CICS photo over old generic catalog placeholders.
  if (matchedPhoto && (!custom || DEFAULT_IMAGE_VALUES.has(custom))) return matchedPhoto;
  if (custom) return custom;
  if (matchedPhoto) return matchedPhoto;

  if (category === 'Administrative') return DEFAULT_FACILITY_MEDIA.smartRoom;
  if (category === 'Support') return DEFAULT_FACILITY_MEDIA.building;
  return DEFAULT_FACILITY_MEDIA.classroom;
}
