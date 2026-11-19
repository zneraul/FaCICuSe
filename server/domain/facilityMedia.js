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

const PHOTO = (floor, name) => `/assets/images/facilities/${floor}/${name}.webp`;

/** Canonical facility code -> directly matched CICS photo. */
export const FACILITY_IMAGE_BY_CODE = Object.freeze({
  'CICS-1F-ORG': PHOTO('1st-floor', 'cics-organizations-office'),
  'CICS-101': PHOTO('1st-floor', 'room-101'),
  'CICS-102': PHOTO('1st-floor', 'room-102'),
  'CICS-103': PHOTO('1st-floor', 'room-103'),
  'CICS-104': PHOTO('1st-floor', 'room-104'),
  'CICS-105': PHOTO('1st-floor', 'room-105'),
  'CICS-106': PHOTO('1st-floor', 'room-106'),
  'CICS-1F-UTIL': PHOTO('1st-floor', 'utility-room'),

  'CICS-2F-FT': PHOTO('2nd-floor', 'female-toilet'),
  'CICS-201': PHOTO('2nd-floor', 'room-201'),
  'CICS-202': PHOTO('2nd-floor', 'room-202'),
  'CICS-2F-CPE': PHOTO('2nd-floor', 'computer-engineering-faculty'),
  'CICS-2F-SAO': PHOTO('2nd-floor', 'cics-student-services'),
  'CICS-2F-CONS': PHOTO('2nd-floor', 'consultation-room'),
  'CICS-2F-FAC': PHOTO('2nd-floor', 'cics-faculty-room'),
  'CICS-2F-DEAN': PHOTO('2nd-floor', 'dean-s-office'),

  'CICS-3F-FT': PHOTO('3rd-floor', 'female-toilet'),
  'CICS-LAB1': PHOTO('3rd-floor', 'computer-laboratory-1'),
  'CICS-LAB2': PHOTO('3rd-floor', 'computer-laboratory-2'),
  'CICS-LAB3': PHOTO('3rd-floor', 'computer-laboratory-3'),
  'CICS-LAB4': PHOTO('3rd-floor', 'computer-laboratory-4'),
  'CICS-LAB5': PHOTO('3rd-floor', 'computer-laboratory-5'),
  'CICS-LAB6': PHOTO('3rd-floor', 'computer-laboratory-6'),
  'CICS-3F-MT': PHOTO('3rd-floor', 'male-toilet'),

  'CICS-401': PHOTO('4th-floor', 'room-401'),
  'CICS-4F-PHYS': PHOTO('4th-floor', 'physics-laboratory'),
  'CICS-4F-SMART': PHOTO('4th-floor', 'smart-classroom'),
  'CICS-4F-EDL': PHOTO('4th-floor', 'electronics-distance-learning'),
  'CICS-4F-ITL': PHOTO('4th-floor', 'information-technology-laboratory'),

  'CICS-501': PHOTO('5th-floor', 'room-501'),
  'CICS-502': PHOTO('5th-floor', 'room-502'),
  'CICS-503': PHOTO('5th-floor', 'room-503'),
  'CICS-504': PHOTO('5th-floor', 'room-504'),
  'CICS-505': PHOTO('5th-floor', 'room-505'),
  'CICS-506': PHOTO('5th-floor', 'room-506'),
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
