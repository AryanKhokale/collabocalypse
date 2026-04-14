import './LogoBanner.css';

const techs = [
  { name: 'WebSockets', svg: <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { name: 'FastAPI', svg: <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M13 8l-4 5h5l-1 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { name: 'Keycloak', svg: <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg> },
  { name: 'MongoDB', svg: <svg viewBox="0 0 24 24" fill="none"><path d="M12 2C9 7 7 9.5 7 13a5 5 0 0010 0c0-3.5-2-6-5-11z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M12 13v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { name: 'Redis', svg: <svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="8" rx="9" ry="3" stroke="currentColor" strokeWidth="1.5"/><path d="M3 8v8c0 1.657 4.03 3 9 3s9-1.343 9-3V8" stroke="currentColor" strokeWidth="1.5"/><path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3" stroke="currentColor" strokeWidth="1.5"/></svg> },
  { name: 'Docker', svg: <svg viewBox="0 0 24 24" fill="none"><rect x="2" y="9" width="20" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="5" y="6" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="6" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.5"/><rect x="13" y="6" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.5"/><path d="M21 13c1.5-.5 2-1.5 2-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { name: 'React', svg: <svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1.5"/><ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1.5" transform="rotate(-60 12 12)"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg> },
  { name: 'Python', svg: <svg viewBox="0 0 24 24" fill="none"><path d="M12 2C9 2 7 3.5 7 6v2h5v1H6.5C5 9 3 10 3 13s2 4 3.5 4H7v-2c0-1 .5-2 2-2h6c1.5 0 2-1 2-2.5V6c0-2-2-4-5-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M12 22c3 0 5-1.5 5-4v-2h-5v-1h5.5c1.5 0 3.5-1 3.5-4s-2-4-3.5-4H17v2c0 1-.5 2-2 2H9c-1.5 0-2 1-2 2.5V18c0 2 2 4 5 4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><circle cx="9.5" cy="5.5" r="1" fill="currentColor"/><circle cx="14.5" cy="18.5" r="1" fill="currentColor"/></svg> },
  { name: 'Nginx', svg: <svg viewBox="0 0 24 24" fill="none"><polygon points="12,2 22,20 2,20" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 20V12l8 8V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { name: 'JWT', svg: <svg viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/></svg> },
];

const Row = ({ reverse }) => {
  const items = reverse ? [...techs].reverse() : techs;
  return (
    <div className={`lb-track${reverse ? ' lb-track-reverse' : ''}`}>
      {[...items, ...items].map((t, i) => (
        <div className="lb-item" key={i}>
          <span className="lb-icon">{t.svg}</span>
          <span className="lb-name">{t.name}</span>
        </div>
      ))}
    </div>
  );
};

const LogoBanner = () => (
  <section className="lb-section">
    <p className="lb-label">Powered by battle-tested open-source technology</p>
    <div className="lb-wrapper">
      <Row />
    </div>
    <div className="lb-fade-left" />
    <div className="lb-fade-right" />
  </section>
);

export default LogoBanner;
