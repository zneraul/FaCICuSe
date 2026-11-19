import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  GraduationCap,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Wrench,
} from 'lucide-react';
import { PublicLayout } from '../components/PublicLayout.jsx';
import { FacilityImage } from '../components/FacilityImage.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useAuthModal } from '../context/AuthModalContext.jsx';
import { apiRequest } from '../services/api.js';

const CATEGORIES = ['All', 'Learning', 'Administrative', 'Support'];
const FLOORS = ['All Floors', 'First Floor', 'Second Floor', 'Third Floor', 'Fourth Floor', 'Fifth Floor'];

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Discover CICS Building spaces',
    description:
      'Filter CICS classrooms (101–506), Computer Laboratories 1–6, Physics/Tech/IT labs, and administrative or support rooms by floor and category.',
    icon: Compass,
  },
  {
    step: '02',
    title: 'Inspect live booking windows',
    description:
      'Pick any upcoming date to review active Pending and Confirmed time blocks alongside posted CICS facility operating hours.',
    icon: Clock,
  },
  {
    step: '03',
    title: 'Submit conflict-checked request',
    description:
      'Provide your time range, headcount, optional BSIT academic block (e.g. IT-3106), and purpose. Server-side validation checks hours and overlaps.',
    icon: CalendarCheck2,
  },
  {
    step: '04',
    title: 'Coordinate approvals & alerts',
    description:
      'Facilities administrators review requests with recorded notes, triggering instant workspace notifications for students and faculty.',
    icon: BellRing,
  },
];

const ROLE_CARDS = [
  {
    role: 'Students',
    subtitle: 'Academic collaboration & learning rooms',
    icon: GraduationCap,
    points: [
      'Browse all 37 CICS Building classrooms, labs, offices, and support rooms before signing in.',
      'Request reservable Learning classrooms (101–506) and laboratories with optional BSIT academic block tags (e.g. IT-3106).',
      'Track pending or confirmed reservation statuses and receive instant updates.',
      'Log facility maintenance issues across classrooms, labs, or restrooms with clear priority details.',
    ],
  },
  {
    role: 'Professors',
    subtitle: 'Instructional rooms & specialized labs',
    icon: UserCheck,
    points: [
      'Reserve Computer Laboratories 1–6, SMART Classroom, Physics/Tech/IT Labs, and CICS lecture rooms.',
      'Verify open scheduling windows ahead of lab sessions and optional class block schedules.',
      'Manage department-aligned bookings and cancel unused time slots cleanly.',
      'Escalate projector, workstation, or facility repairs directly to CICS maintenance crews.',
    ],
  },
  {
    role: 'System Administrators',
    subtitle: 'CICS governance & space operations',
    icon: ShieldCheck,
    points: [
      'Create, edit, or place CICS facilities into maintenance or restricted status.',
      'Approve or reject reservation requests with audit-logged administrative notes.',
      'Triage maintenance tickets, assign repair teams, and document actions taken.',
      'Manage user roles and inspect administrator-only utilization analytics.',
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: 'Can students and faculty check room availability before signing in?',
    a: 'Yes. The public directory and live availability checker display floor locations, CICS room categories, current operational statuses, and anonymized Pending or Confirmed windows for any selected date.',
  },
  {
    q: 'How are double bookings and overlapping reservations prevented?',
    a: 'Every reservation request is validated inside an atomic server-side transaction against active Pending and Confirmed bookings for that facility and date, rejecting conflicting intervals immediately.',
  },
  {
    q: 'Does a confirmed reservation automatically indicate physical room occupancy?',
    a: 'No. FaCICuSe tracks scheduled reservation hours and documented operational statuses only. Physical room occupancy is never inferred automatically from calendar bookings.',
  },
  {
    q: 'How are facility maintenance issues handled after submission?',
    a: 'Students and professors log structured reports tied directly to the affected space with optional photo evidence. Administrators triage priority, assign crews, and record resolution notes.',
  },
  {
    q: 'Who receives access to campus analytics and role administration?',
    a: 'Operational analytics, audit logs, facility status overrides, and user role assignments are strictly limited to authenticated System Administrators.',
  },
];

function getDefaultDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function LandingPage() {
  const { user } = useAuth();
  const { openSignInModal } = useAuthModal();
  const [facilities, setFacilities] = useState([]);
  const [allFacilities, setAllFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [floor, setFloor] = useState('All Floors');
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  // Live availability preview widget state (Section 5)
  const [previewFacilityId, setPreviewFacilityId] = useState('');
  const [previewDate, setPreviewDate] = useState(getDefaultDate);
  const [previewDetail, setPreviewDetail] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Load unfiltered directory once for the live availability selector & stats
  useEffect(() => {
    let active = true;
    apiRequest('/public/facilities')
      .then((res) => {
        if (!active) return;
        const list = res.facilities || [];
        setAllFacilities(list);
        const firstReservable = list.find((f) => f.isReservable !== false) || list[0];
        if (firstReservable) {
          setPreviewFacilityId((prev) => prev || String(firstReservable.id));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Load filtered campus facilities grid (Section 3)
  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (floor !== 'All Floors') params.set('floor', floor);
    if (search.trim()) params.set('search', search.trim());

    apiRequest(`/public/facilities?${params.toString()}`)
      .then((res) => {
        if (active) setFacilities(res.facilities || []);
      })
      .catch(() => {
        if (active) setFacilities([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [category, floor, search]);

  // Fetch live schedule windows for the selected preview facility & date (Section 5)
  useEffect(() => {
    if (!previewFacilityId || !previewDate) return;
    let active = true;
    setPreviewLoading(true);
    apiRequest(`/public/facilities/${previewFacilityId}?date=${encodeURIComponent(previewDate)}`)
      .then((res) => {
        if (active) setPreviewDetail(res);
      })
      .catch(() => {
        if (active) setPreviewDetail(null);
      })
      .finally(() => {
        if (active) setPreviewLoading(false);
      });
    return () => {
      active = false;
    };
  }, [previewFacilityId, previewDate]);

  const reservableActiveCount = allFacilities.filter(
    (f) => f.isReservable !== false && f.status === 'Available'
  ).length;
  const floorCount = new Set(allFacilities.map((f) => f.floor).filter(Boolean)).size || 5;
  const previewFacilities = allFacilities.filter((f) => f.isReservable !== false);

  return (
    <PublicLayout>
      {/* 1. Hero Section */}
      <section id="home" className="landing-hero" aria-labelledby="hero-heading">
        <div className="glass-panel landing-hero-copy">
          <div className="meta-line">
            <span className="brand-logo-badge" style={{ width: '26px', height: '26px', borderRadius: '7px' }}>
              <img
                src="/assets/images/facicuse-logo.jpg"
                alt=""
                aria-hidden="true"
                style={{ width: '20px', height: '20px', objectFit: 'contain' }}
              />
            </span>
            <span>FaCICuSe Campus Platform</span>
            <span aria-hidden="true">·</span>
            <span>Connected Insights, Coordinated Spaces</span>
          </div>

          <h1 id="hero-heading" className="landing-headline">
            Coordinate every{' '}
            <span className="landing-headline-gradient">classroom, computer lab, and CICS space</span>{' '}
            in one place.
          </h1>

          <p className="landing-subhead">
            Monitoring website for the CICS department facilities at Batangas State University – Alangilan
            Campus that tracks actual room utilization against scheduled allocations and supports conflict-checked booking.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginTop: '0.35rem' }}>
            <Link to="/facilities" className="btn btn-coral">
              <span>Explore Facilities</span>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            {user ? (
              <Link to="/app/dashboard" className="btn btn-glass">
                Open Workspace
              </Link>
            ) : (
              <button
                type="button"
                className="btn btn-glass"
                onClick={() => openSignInModal()}
              >
                Sign In to Workspace
              </button>
            )}
          </div>

          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '0.85rem',
              margin: '0.75rem 0 0',
              paddingTop: '1rem',
              borderTop: '1px solid var(--glass-border-subtle)',
            }}
          >
            <div>
              <dd className="tabular" style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                {allFacilities.length || '37'}
              </dd>
              <dt style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>CICS spaces</dt>
            </div>
            <div>
              <dd className="tabular" style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                {reservableActiveCount}
              </dd>
              <dt style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>Reservable rooms</dt>
            </div>
            <div>
              <dd className="tabular" style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink-primary)' }}>
                {floorCount}
              </dd>
              <dt style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>Building floors</dt>
            </div>
          </dl>
        </div>

        <figure className="landing-hero-media" style={{ margin: 0 }}>
          <img
            src="/assets/images/facilities/cics-building-wider.webp"
            alt="Batangas State University Alangilan CICS building exterior"
            fetchPriority="high"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/assets/images/cics-building.jpg'; }}
          />
          <figcaption className="landing-hero-caption">
            <div style={{ fontWeight: 600, fontSize: '0.96rem' }}>
              College of Informatics and Computing Sciences (CICS)
            </div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(238,242,255,0.86)', marginTop: '0.2rem' }}>
              5-Floor College Building · 1 Building · 5 Floors · 37 Facilities
            </div>
          </figcaption>
        </figure>
      </section>

      {/* 2. About FaCICuSe */}
      <section id="about" className="landing-section" aria-labelledby="about-heading">
        <div className="about-split">
          <div className="glass-panel-tinted" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.15rem' }}>
            <div>
              <span className="section-kicker">About FaCICuSe</span>
              <h2 id="about-heading" className="section-title">
                Connected Insights, Coordinated Spaces across every department.
              </h2>
              <p style={{ color: 'var(--ink-secondary)', marginTop: '0.85rem', fontSize: '0.96rem' }}>
                Universities operate dozens of specialized instructional halls, research labs,
                creative studios, and athletic venues—often managed across disconnected spreadsheets
                and email threads. FaCICuSe brings discovery, scheduling governance, and maintenance
                accountability together inside one transparent campus platform.
              </p>
            </div>

            <div className="alert-banner alert-info">
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                Scheduled booking hours reflect confirmed reservations only and never infer
                unverified physical room occupancy.
              </span>
            </div>
          </div>

          <div className="about-bento-grid">
            <div className="glass-panel">
              <Building2 size={22} color="var(--accent-blue)" aria-hidden="true" />
              <h3 style={{ fontSize: '1.05rem', marginTop: '0.65rem' }}>Centralized Space Catalog</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)', marginTop: '0.35rem' }}>
                Standardized room profiles include building location, seat capacity, operating
                hours, equipment lists, and role access rules.
              </p>
            </div>

            <div className="glass-panel">
              <CalendarCheck2 size={22} color="var(--accent-purple)" aria-hidden="true" />
              <h3 style={{ fontSize: '1.05rem', marginTop: '0.65rem' }}>Zero Double-Bookings</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)', marginTop: '0.35rem' }}>
                Every booking request is checked inside an atomic server transaction against active
                Pending and Confirmed time slots.
              </p>
            </div>

            <div className="glass-panel">
              <Wrench size={22} color="var(--accent-indigo)" aria-hidden="true" />
              <h3 style={{ fontSize: '1.05rem', marginTop: '0.65rem' }}>Direct Issue Routing</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)', marginTop: '0.35rem' }}>
                Equipment failures and safety defects link directly to the affected facility so
                repair crews have full room context immediately.
              </p>
            </div>

            <div className="glass-panel">
              <ShieldCheck size={22} color="var(--accent-violet)" aria-hidden="true" />
              <h3 style={{ fontSize: '1.05rem', marginTop: '0.65rem' }}>Role-Scoped Governance</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)', marginTop: '0.35rem' }}>
                Students, professors, and system administrators each operate within clear permissions
                and auditable approval workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Campus Facilities */}
      <section id="facilities" className="landing-section" aria-labelledby="discovery-heading">
        <div className="section-header-row">
          <div>
            <span className="section-kicker">CICS Building Directory</span>
            <h2 id="discovery-heading" className="section-title">
              Discover CICS Building Spaces
            </h2>
            <p style={{ color: 'var(--ink-secondary)', marginTop: '0.35rem' }}>
              Search all 37 Learning, Administrative, and Support spaces across Floors 1–5 before signing in.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', maxWidth: '100%' }}>
            <label htmlFor="landing-facility-search" className="sr-only">
              Search CICS facilities
            </label>
            <div style={{ position: 'relative', width: 'min(260px, 100%)' }}>
              <Search
                size={16}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '0.8rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--ink-muted)',
                }}
              />
              <input
                id="landing-facility-search"
                type="search"
                className="field-input"
                style={{ paddingLeft: '2.35rem' }}
                placeholder="Search CICS rooms or codes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <label htmlFor="landing-floor-select" className="sr-only">
              Filter by CICS floor
            </label>
            <select
              id="landing-floor-select"
              className="field-select"
              style={{ width: 'auto', minWidth: '145px' }}
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
            >
              {FLOORS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <Link to="/facilities" className="btn btn-glass btn-sm">
              Full Directory
            </Link>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          <div className="v10-tabs" role="tablist" aria-label="Facility categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={category === cat}
                className={`v10-tab-btn ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '2.5rem' }}>
            Loading CICS Building facilities...
          </div>
        ) : facilities.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <p style={{ color: 'var(--ink-secondary)' }}>
              No facilities match your current filter.
            </p>
            <button
              type="button"
              className="btn btn-glass btn-sm"
              style={{ marginTop: '0.85rem' }}
              onClick={() => {
                setCategory('All');
                setFloor('All Floors');
                setSearch('');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="facilities-grid">
            {facilities.slice(0, 6).map((facility) => (
              <article key={facility.id} className="facility-card">
                <div className="facility-media-wrap">
                  <FacilityImage src={facility.imageUrl} alt={facility.name} />
                </div>
                <div className="facility-card-body">
                  <div className="meta-line">
                    <span className="tabular">{facility.code}</span>
                    <span aria-hidden="true">·</span>
                    <span>{facility.category}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`status-text status-${facility.status.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {facility.status}
                    </span>
                  </div>

                  <h3 className="facility-card-title">{facility.name}</h3>
                  <p className="facility-card-desc">{facility.description}</p>

                  <div className="meta-line" style={{ marginTop: '0.2rem' }}>
                    <span>{facility.building}</span>
                    <span aria-hidden="true">·</span>
                    <span>{facility.floor}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular">
                      {facility.capacity != null
                        ? `Cap. ${facility.capacity}`
                        : facility.isReservable === false
                          ? 'Non-reservable'
                          : 'Cap. Unspecified'}
                    </span>
                  </div>

                  <div className="facility-card-footer">
                    <time className="tabular" style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                      {facility.openHour}–{facility.closeHour}
                    </time>
                    <Link to={`/facilities/${facility.id}`} className="btn btn-glass btn-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 4. How It Works */}
      <section id="how-it-works" className="landing-section" aria-labelledby="how-heading">
        <div className="section-header-row">
          <div>
            <span className="section-kicker">How It Works</span>
            <h2 id="how-heading" className="section-title">
              From Discovery to Confirmed Access in Four Clear Steps
            </h2>
            <p style={{ color: 'var(--ink-secondary)', marginTop: '0.35rem' }}>
              A structured reservation lifecycle built to eliminate scheduling conflicts and approval guesswork.
            </p>
          </div>
        </div>

        <div className="steps-timeline">
          {HOW_IT_WORKS_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="glass-panel step-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="step-number">STEP {item.step}</span>
                  <Icon size={20} color="var(--accent-blue)" aria-hidden="true" />
                </div>
                <h3 style={{ fontSize: '1.1rem', marginTop: '0.35rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)' }}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Facility Reservations (Interactive Availability Explorer + Photo Collage) */}
      <section id="reservations" className="landing-section" aria-labelledby="reservations-demo-heading">
        <div className="reservation-demo-split">
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <span className="section-kicker">Facility Reservations</span>
              <h2 id="reservations-demo-heading" className="section-title">
                Check Live Booking Windows Before You Request
              </h2>
              <p style={{ color: 'var(--ink-secondary)', marginTop: '0.45rem', fontSize: '0.94rem' }}>
                Select any campus space and target date below to inspect real recorded schedule blocks
                directly from the reservation ledger.
              </p>
            </div>

            <div className="form-grid-2">
              <div className="field-group">
                <label htmlFor="preview-facility-select" className="field-label">
                  Campus Facility
                </label>
                <select
                  id="preview-facility-select"
                  className="field-select"
                  value={previewFacilityId}
                  onChange={(e) => setPreviewFacilityId(e.target.value)}
                >
                  {(previewFacilities.length > 0 ? previewFacilities : allFacilities).map((f) => (
                    <option key={f.id} value={String(f.id)}>
                      {f.code} · {f.name} ({f.floor})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label htmlFor="preview-date-input" className="field-label">
                  Target Date
                </label>
                <input
                  id="preview-date-input"
                  type="date"
                  className="field-input"
                  value={previewDate}
                  onChange={(e) => setPreviewDate(e.target.value)}
                />
              </div>
            </div>

            <div className="glass-panel-subtle" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {previewLoading ? (
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
                  Checking recorded booking windows...
                </p>
              ) : previewDetail?.facility ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.98rem' }}>{previewDetail.facility.name}</strong>
                      <div className="meta-line">
                        <span>{previewDetail.facility.building}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular">
                          Hours {previewDetail.facility.openHour}–{previewDetail.facility.closeHour}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`status-text status-${previewDetail.facility.status.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {previewDetail.facility.status}
                    </span>
                  </div>

                  {previewDetail.schedule && previewDetail.schedule.length > 0 ? (
                    <div className="schedule-list">
                      {previewDetail.schedule.map((slot) => (
                        <div key={slot.id} className="schedule-row" style={{ padding: '0.55rem 0' }}>
                          <span className="tabular" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                            {slot.startTime} – {slot.endTime}
                          </span>
                          <span
                            className={`status-text status-${slot.status.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {slot.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)' }}>
                      No active reservations recorded for <span className="tabular">{previewDate}</span>.
                      All hours between{' '}
                      <span className="tabular">
                        {previewDetail.facility.openHour}–{previewDetail.facility.closeHour}
                      </span>{' '}
                      are currently open.
                    </p>
                  )}
                </>
              ) : (
                <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)' }}>
                  Select a campus facility to inspect its schedule.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: 'auto' }}>
              {previewFacilityId && (
                <Link to={`/facilities/${previewFacilityId}`} className="btn btn-coral btn-sm">
                  <span>Open Facility &amp; Book</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              )}
              {user ? (
                <Link to="/app/calendar" className="btn btn-glass btn-sm">
                  Open Calendar &amp; Request
                </Link>
              ) : (
                <button
                  type="button"
                  className="btn btn-glass btn-sm"
                  onClick={() => openSignInModal({ returnTo: '/app/calendar' })}
                >
                  Sign In to Submit Request
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'space-between' }}>
            <div className="photo-collage-grid">
              <div className="collage-photo-frame">
                <img
                  src="/assets/images/cics-classroom.jpg"
                  alt="CICS classroom with dual projection screens"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="collage-photo-frame">
                <img
                  src="/assets/images/cics-smart-room.jpg"
                  alt="SMART classroom and collaboration studio with presentation display"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="collage-photo-frame">
                <img
                  src="/assets/images/cics-lab.jpg"
                  alt="CICS computing and technology laboratory"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="collage-photo-frame">
                <img
                  src="/assets/images/cics-building.jpg"
                  alt="Batangas State University Alangilan CICS Building"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="glass-panel-tinted">
              <strong style={{ fontSize: '0.95rem' }}>Server-Side Conflict Protection</strong>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)', marginTop: '0.35rem' }}>
                Requests are validated against posted building hours, maximum room capacity,
                role eligibility, and any active overlapping reservation before confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Maintenance Reporting */}
      <section id="maintenance" className="landing-section" aria-labelledby="maintenance-heading">
        <div className="about-split">
          <figure className="landing-hero-media" style={{ minHeight: '340px', margin: 0 }}>
            <img
              src="/assets/images/cics-lab.jpg"
              alt="Engineering laboratory workstations prepared for inspection and equipment maintenance"
              referrerPolicy="no-referrer"
            />
            <figcaption className="landing-hero-caption">
              <div className="meta-line" style={{ color: 'rgba(224,231,255,0.88)', marginBottom: '0.25rem' }}>
                <span>Ticket Lifecycle</span>
                <span aria-hidden="true">·</span>
                <span>Open → In Progress → Resolved</span>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                Every maintenance issue tracks priority, assigned crew, and resolution notes.
              </div>
            </figcaption>
          </figure>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
            <span className="section-kicker">Maintenance Reporting</span>
            <h2 id="maintenance-heading" className="section-title">
              Report Facility Issues and Follow Repairs to Closure
            </h2>
            <p style={{ color: 'var(--ink-secondary)', fontSize: '0.95rem' }}>
              Notice a failed projector, HVAC imbalance, electrical fault, or damaged bench?
              Students and professors submit structured tickets linked directly to the room,
              alongside priority severity and optional photo documentation.
            </p>
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.2rem',
                color: 'var(--ink-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                fontSize: '0.92rem',
              }}
            >
              <li>Categorized reporting across AV, HVAC, Electrical, Plumbing, and Structural needs.</li>
              <li>Real-time status progression from Open to In Progress, Resolved, or Closed.</li>
              <li>Administrator triage notes and facility status switches when repairs require closure.</li>
            </ul>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.35rem' }}>
              {user ? (
                <Link to="/app/issues" className="btn btn-coral btn-sm">
                  Report or Track Issues
                </Link>
              ) : (
                <button
                  type="button"
                  className="btn btn-coral btn-sm"
                  onClick={() => openSignInModal({ returnTo: '/app/issues' })}
                >
                  Report or Track Issues
                </button>
              )}
              <Link to="/facilities" className="btn btn-glass btn-sm">
                Check Space Statuses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Platform Features */}
      <section id="features" className="landing-section" aria-labelledby="features-heading">
        <div className="section-header-row">
          <div>
            <span className="section-kicker">Platform Features</span>
            <h2 id="features-heading" className="section-title">
              Engineered for Real Campus Operations
            </h2>
          </div>
        </div>

        <div className="features-bento">
          <div className="v24-hero-card feature-span-2">
            <div>
              <div className="meta-line" style={{ color: 'rgba(238,242,255,0.88)' }}>
                <Sparkles size={16} aria-hidden="true" />
                <span>Coordinated Scheduling Engine</span>
              </div>
              <h3 style={{ fontSize: '1.45rem', marginTop: '0.55rem' }}>
                Transaction-safe reservations paired with instant campus alerts
              </h3>
              <p className="v24-hero-sub" style={{ marginTop: '0.55rem' }}>
                FaCICuSe enforces operating hours, role eligibility, capacity caps, and overlap
                locks on the server—then notifies requesters the moment a booking is confirmed or
                updated.
              </p>
            </div>

            <div className="v24-hero-metrics">
              <div>
                <div className="v24-hero-metric-val">100%</div>
                <div className="v24-hero-metric-label">Server-validated slots</div>
              </div>
              <div>
                <div className="v24-hero-metric-val">3 Roles</div>
                <div className="v24-hero-metric-label">Tailored permissions</div>
              </div>
              <div>
                <div className="v24-hero-metric-val">Full Audit</div>
                <div className="v24-hero-metric-label">Admin decision trail</div>
              </div>
            </div>
          </div>

          <div className="glass-panel">
            <Layers size={22} color="var(--accent-blue)" aria-hidden="true" />
            <h3 style={{ fontSize: '1.08rem', marginTop: '0.65rem' }}>Floor &amp; Access Scope</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)', marginTop: '0.4rem' }}>
              Verify CICS floor location, room category, operating hours, and reservation eligibility
              across Learning classrooms, labs, offices, and support rooms.
            </p>
          </div>

          <div className="glass-panel-tinted">
            <BellRing size={22} color="var(--accent-purple)" aria-hidden="true" />
            <h3 style={{ fontSize: '1.08rem', marginTop: '0.65rem' }}>Workspace Notifications</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)', marginTop: '0.4rem' }}>
              Unread booking approvals, rejections, and maintenance updates surface directly inside
              the top bar popover with one-click navigation.
            </p>
          </div>

          <div className="glass-panel">
            <BarChart3 size={22} color="var(--accent-indigo)" aria-hidden="true" />
            <h3 style={{ fontSize: '1.08rem', marginTop: '0.65rem' }}>Admin Utilization Insights</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)', marginTop: '0.4rem' }}>
              Authorized System Administrators inspect scheduled hours, approval rates, and open
              maintenance queues derived strictly from stored records.
            </p>
          </div>

          <div className="glass-panel">
            <ShieldCheck size={22} color="var(--accent-blue)" aria-hidden="true" />
            <h3 style={{ fontSize: '1.08rem', marginTop: '0.65rem' }}>Accountable Audit Trails</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)', marginTop: '0.4rem' }}>
              Facility status edits, reservation decisions, role updates, and repair closures are
              logged with actor identity and timestamp.
            </p>
          </div>
        </div>
      </section>

      {/* 8. User Roles */}
      <section id="user-roles" className="landing-section" aria-labelledby="roles-heading">
        <div className="section-header-row">
          <div>
            <span className="section-kicker">User Roles</span>
            <h2 id="roles-heading" className="section-title">
              Purpose-Built Workspaces for Every Campus Role
            </h2>
            <p style={{ color: 'var(--ink-secondary)', marginTop: '0.35rem' }}>
              Each authenticated role sees only the tools, spaces, and controls relevant to its responsibilities.
            </p>
          </div>
        </div>

        <div className="roles-grid">
          {ROLE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.role} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="role-card-header">
                  <div className="role-icon-box">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem' }}>{card.role}</h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>{card.subtitle}</div>
                  </div>
                </div>

                <ul
                  style={{
                    margin: 0,
                    paddingLeft: '1.15rem',
                    color: 'var(--ink-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                  }}
                >
                  {card.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* 9. Frequently Asked Questions */}
      <section id="faq" className="landing-section" aria-labelledby="faq-heading">
        <div className="section-header-row">
          <div>
            <span className="section-kicker">Questions &amp; Policy</span>
            <h2 id="faq-heading" className="section-title">
              Frequently Asked Questions
            </h2>
          </div>
        </div>

        <div className="faq-list">
          {FAQ_ITEMS.map((item, idx) => {
            const expanded = openFaq === idx;
            return (
              <div key={item.q} className="faq-item">
                <button
                  type="button"
                  className="faq-trigger"
                  aria-expanded={expanded}
                  onClick={() => setOpenFaq(expanded ? -1 : idx)}
                >
                  <span>{item.q}</span>
                  {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expanded && <div className="faq-answer">{item.a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. Final Call to Action */}
      <section className="landing-section" aria-label="Get started">
        <div className="cta-glass-banner">
          <div style={{ maxWidth: '58ch' }}>
            <div className="meta-line" style={{ color: 'rgba(238,242,255,0.88)', marginBottom: '0.45rem' }}>
              <span>Ready to coordinate campus spaces?</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.65rem, 2.8vw, 2.25rem)', color: '#ffffff' }}>
              Explore active university facilities or enter your role workspace.
            </h2>
            <p style={{ color: 'rgba(240,242,255,0.9)', marginTop: '0.55rem', fontSize: '0.98rem' }}>
              Check room schedules immediately as a visitor, or sign in with your university identity
              to reserve spaces and report maintenance issues.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
            <Link to="/facilities" className="btn btn-on-coral">
              <span>Explore Facilities</span>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link to="/timetable" className="btn btn-glass btn-sm">
              <span>View Class Timetable</span>
            </Link>
            {user ? (
              <Link
                to="/app/dashboard"
                className="btn"
                style={{
                  background: 'rgba(20, 17, 46, 0.34)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.38)',
                }}
              >
                Open Workspace
              </Link>
            ) : (
              <button
                type="button"
                className="btn"
                onClick={() => openSignInModal()}
                style={{
                  background: 'rgba(20, 17, 46, 0.34)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.38)',
                }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
