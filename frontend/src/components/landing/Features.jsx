import { useEffect, useRef } from 'react';
import './Features.css';

/* ── Animated cursor typing preview ── */
const RealtimePreview = () => (
  <div className="bp-realtime">
    <div className="bp-doc-bar">
      <div className="bp-doc-dot" style={{ background: '#ef4444' }} />
      <div className="bp-doc-dot" style={{ background: '#f59e0b' }} />
      <div className="bp-doc-dot" style={{ background: '#10b981' }} />
      <span className="bp-doc-title">product-brief.doc</span>
      <span className="bp-live-badge">● LIVE</span>
    </div>
    <div className="bp-doc-body">
      <div className="bp-text-line bp-line-full" />
      <div className="bp-text-line bp-line-75" />
      <div className="bp-cursor-row">
        <div className="bp-user-cursor bp-cursor-a">
          <span className="bp-cursor-name">Alice</span>
          <span className="bp-cursor-caret bp-caret-a" />
        </div>
        <div className="bp-text-line bp-line-40 bp-inline" />
      </div>
      <div className="bp-text-line bp-line-60" />
      <div className="bp-cursor-row">
        <div className="bp-text-line bp-line-20 bp-inline" />
        <div className="bp-user-cursor bp-cursor-b">
          <span className="bp-cursor-name">Bob</span>
          <span className="bp-cursor-caret bp-caret-b" />
        </div>
      </div>
      <div className="bp-text-line bp-line-85" />
      <div className="bp-text-line bp-line-30" />
    </div>
    <div className="bp-avatars">
      {['A', 'B', 'C'].map((l, i) => (
        <div className="bp-avatar" key={i} style={{ '--hue': i === 0 ? '#9333ea' : i === 1 ? '#0891b2' : '#059669', zIndex: 3 - i }}>
          {l}
        </div>
      ))}
      <span className="bp-online-txt">3 editing now</span>
      <span className="bp-synced-badge">Synced ✓</span>
    </div>
  </div>
);

/* ── OT operation stream preview ── */
const OTPreview = () => (
  <div className="bp-ot">
    {[
      { op: 'INSERT', detail: '"Hello world"', pos: 'pos 0', status: 'applied', color: 'purple' },
      { op: 'DELETE', detail: 'char 5–8', pos: 'pos 5', status: 'transformed', color: 'blue' },
      { op: 'INSERT', detail: '"!"', pos: 'pos 10', status: 'merged', color: 'green' },
    ].map((row, i) => (
      <div className="bp-ot-row" key={i} style={{ animationDelay: `${i * 0.3}s` }}>
        <div className={`bp-op-badge bp-op-${row.color}`}>{row.op}</div>
        <div className="bp-op-detail">{row.detail}</div>
        <div className="bp-op-pos">{row.pos}</div>
        <div className={`bp-op-status bp-status-${row.color}`}>{row.status} ✓</div>
      </div>
    ))}
    <div className="bp-ot-footer">
      <span className="bp-ot-engine">OT Engine</span>
      <span className="bp-ot-result">→ "Hello!" — Conflict-free</span>
    </div>
  </div>
);

/* ── Version history preview ── */
const VersionPreview = () => (
  <div className="bp-versions">
    {[
      { label: 'v14 — Just now', author: 'Alice', active: true },
      { label: 'v13 — 12 min ago', author: 'Bob', active: false },
      { label: 'v12 — 1 hr ago', author: 'Alice', active: false },
      { label: 'v11 — Yesterday', author: 'Carol', active: false },
    ].map((v, i) => (
      <div className={`bp-ver-row${v.active ? ' bp-ver-active' : ''}`} key={i}>
        <div className="bp-ver-dot" />
        <div className="bp-ver-info">
          <span className="bp-ver-label">{v.label}</span>
          <span className="bp-ver-author">{v.author}</span>
        </div>
        {v.active && <span className="bp-ver-badge">Latest</span>}
      </div>
    ))}
  </div>
);

/* ── Sharing / access control preview ── */
const SharingPreview = () => (
  <div className="bp-share">
    <div className="bp-share-bar">
      <span className="bp-share-url">collab.app/doc/x92kp</span>
      <button className="bp-share-copy">Copy link</button>
    </div>
    <div className="bp-share-list">
      {[
        { name: 'alice@team.io', role: 'Owner', color: '#9333ea' },
        { name: 'bob@team.io', role: 'Editor', color: '#0891b2' },
        { name: 'carol@team.io', role: 'Viewer', color: '#059669' },
      ].map((u, i) => (
        <div className="bp-share-row" key={i}>
          <div className="bp-share-av" style={{ background: u.color }}>{u.name[0].toUpperCase()}</div>
          <span className="bp-share-email">{u.name}</span>
          <span className="bp-share-role">{u.role}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ── Auth / SSO preview ── */
const AuthPreview = () => (
  <div className="bp-auth">
    <div className="bp-auth-flow">
      {['Browser', 'PKCE', 'Keycloak', 'JWT', 'App'].map((step, i) => (
        <div key={i} className="bp-auth-step-wrap">
          <div className={`bp-auth-node${i === 2 ? ' bp-auth-node-center' : ''}`}>{step}</div>
          {i < 4 && <div className="bp-auth-connector" />}
        </div>
      ))}
    </div>
    <div className="bp-auth-badge">OAuth 2.0 + SSO — Zero-trust secured</div>
  </div>
);

const cards = [
  {
    id: 'realtime',
    size: 'large',     // col-span 2, row-span 1
    tag: 'Live Sync',
    title: 'See every keystroke, live.',
    desc: 'WebSocket-powered real-time sync. Every change from every user appears instantly — no refresh, no conflicts, no waiting.',
    preview: <RealtimePreview />,
  },
  {
    id: 'ot',
    size: 'tall',      // col-span 1, row-span 2
    tag: 'OT Engine',
    title: 'Conflict-free by design.',
    desc: 'Our Operational Transform engine transforms concurrent edits so they always converge — automatically, invisibly, perfectly.',
    preview: <OTPreview />,
  },
  {
    id: 'versions',
    size: 'medium',    // col-span 1, row-span 1
    tag: 'Version Control',
    title: 'Full history, every save.',
    desc: 'Optimistic concurrency control versions every save. Detect stale writes before they clobber newer work.',
    preview: <VersionPreview />,
  },
  {
    id: 'share',
    size: 'medium',    // col-span 1, row-span 1
    tag: 'Sharing',
    title: 'Invite by email, control access.',
    desc: 'Share docs in seconds. Granular roles — Owner, Editor, Viewer — keep your data in the right hands.',
    preview: <SharingPreview />,
  },
  {
    id: 'auth',
    size: 'wide',      // col-span 2, row-span 1
    tag: 'Security',
    title: 'Enterprise SSO via Keycloak.',
    desc: 'PKCE-secured OAuth 2.0 flows, multi-realm support, role-based access control — ready for enterprise from day one.',
    preview: <AuthPreview />,
  },
];

const FeaturesSection = () => {
  const refs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('bf-visible');
      }),
      { threshold: 0.08 }
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bf-section" id="features">
      <div className="bf-bg-layer bf-bg-grid" aria-hidden="true" />
      <div className="bf-bg-layer bf-bg-orb bf-bg-orb-a" aria-hidden="true" />
      <div className="bf-bg-layer bf-bg-orb bf-bg-orb-b" aria-hidden="true" />
      <div className="bf-inner">
        <div className="bf-header">
          <h2 className="bf-title">
            Meet the new-gen<br />collaboration experience
          </h2>
          <p className="bf-sub">
            Everything your team needs to write, edit, and ship documents together — in real time, without stepping on each other.
          </p>
        </div>

        <div className="bf-grid">
          {cards.map((card, i) => (
            <div
              key={card.id}
              className={`bf-card bf-card-${card.size} bf-delay-${i}`}
              ref={(el) => (refs.current[i] = el)}
            >
              <div className="bf-card-glow" aria-hidden="true" />
              <div className="bf-card-preview">
                {card.preview}
              </div>
              <div className="bf-card-body">
                <span className="bf-tag">{card.tag}</span>
                <h3 className="bf-card-title">{card.title}</h3>
                <p className="bf-card-desc">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bf-bg-layer bf-bg-orb bf-bg-orb-c" aria-hidden="true" />
      <div className="bf-bg-layer bf-bg-orb bf-bg-orb-d" aria-hidden="true" />
    </section>
  );
};

export default FeaturesSection;
