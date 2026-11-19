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

const PHOTO = (name) => `/assets/images/facilities/${name}.webp`;

/** Canonical facility code -> directly matched CICS photo. */
export const FACILITY_IMAGE_BY_CODE = Object.freeze({
  'CICS-1F-ORG': PHOTO('organizations-office'),
  'CICS-101': PHOTO('room-101'),
  'CICS-102': PHOTO('room-102'),
  'CICS-103': PHOTO('room-103'),
  'CICS-104': PHOTO('room-104'),
  'CICS-105': PHOTO('room-105'),
  'CICS-106': PHOTO('room-106'),
  'CICS-1F-UTIL': PHOTO('utility-room'),

  'CICS-2F-FT': PHOTO('female-toilet-2f'),
  'CICS-201': PHOTO('room-201'),
  'CICS-202': PHOTO('room-202'),
  'CICS-2F-CPE': PHOTO('computer-engineering-faculty'),
  'CICS-2F-SAO': PHOTO('student-services'),
  'CICS-2F-CONS': PHOTO('consultation-room'),
  'CICS-2F-FAC': PHOTO('faculty-room'),
  'CICS-2F-DEAN': PHOTO('deans-office'),

  'CICS-3F-FT': PHOTO('female-toilet-3f'),
  'CICS-LAB1': PHOTO('computer-lab-1'),
  'CICS-LAB2': PHOTO('computer-lab-2'),
  'CICS-LAB3': PHOTO('computer-lab-3'),
  'CICS-LAB4': PHOTO('computer-lab-4'),
  'CICS-LAB5': PHOTO('computer-lab-5'),
  'CICS-LAB6': PHOTO('computer-lab-6'),
  'CICS-3F-MT': PHOTO('male-toilet-3f'),

  'CICS-401': PHOTO('room-401'),
  'CICS-4F-PHYS': PHOTO('physics-laboratory'),
  'CICS-4F-SMART': PHOTO('smart-classroom'),
  'CICS-4F-EDL': PHOTO('electronics-distance-learning'),
  'CICS-4F-ITL': PHOTO('information-technology-laboratory'),

  'CICS-501': PHOTO('room-501'),
  'CICS-502': PHOTO('room-502'),
  'CICS-503': PHOTO('room-503'),
  'CICS-504': PHOTO('room-504'),
  'CICS-505': PHOTO('room-505'),
  'CICS-506': PHOTO('room-506'),
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
