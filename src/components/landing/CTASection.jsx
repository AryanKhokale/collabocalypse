import { useEffect, useRef } from 'react';
import './CTASection.css';

const PARTICLES = [
  { x: '4%', y: '8%', size: '2px', delay: '0.2s', duration: '5.1s' },
  { x: '10%', y: '14%', size: '3px', delay: '1.3s', duration: '6s' },
  { x: '16%', y: '10%', size: '2px', delay: '2s', duration: '4.8s' },
  { x: '22%', y: '16%', size: '3px', delay: '0.6s', duration: '5.7s' },
  { x: '28%', y: '12%', size: '2px', delay: '1.8s', duration: '5.3s' },
  { x: '34%', y: '18%', size: '3px', delay: '2.5s', duration: '6.2s' },
  { x: '40%', y: '10%', size: '2px', delay: '0.4s', duration: '5.4s' },
  { x: '46%', y: '16%', size: '3px', delay: '1.6s', duration: '5.8s' },
  { x: '52%', y: '12%', size: '2px', delay: '2.3s', duration: '4.9s' },
  { x: '58%', y: '18%', size: '3px', delay: '0.7s', duration: '5.9s' },
  { x: '64%', y: '10%', size: '2px', delay: '1.1s', duration: '5.2s' },
  { x: '70%', y: '16%', size: '3px', delay: '2.1s', duration: '6.1s' },
  { x: '76%', y: '12%', size: '2px', delay: '0.5s', duration: '5.5s' },
  { x: '82%', y: '18%', size: '3px', delay: '1.9s', duration: '5.7s' },
  { x: '88%', y: '10%', size: '2px', delay: '2.6s', duration: '6.3s' },
  { x: '94%', y: '14%', size: '3px', delay: '0.9s', duration: '5.6s' },

  { x: '6%', y: '30%', size: '3px', delay: '1.4s', duration: '5.4s' },
  { x: '12%', y: '36%', size: '2px', delay: '0.8s', duration: '5s' },
  { x: '18%', y: '32%', size: '3px', delay: '2.2s', duration: '5.8s' },
  { x: '24%', y: '38%', size: '2px', delay: '0.3s', duration: '5.1s' },
  { x: '30%', y: '34%', size: '3px', delay: '1.7s', duration: '6s' },
  { x: '36%', y: '40%', size: '2px', delay: '2.4s', duration: '4.9s' },
  { x: '42%', y: '32%', size: '3px', delay: '0.1s', duration: '5.6s' },
  { x: '48%', y: '38%', size: '2px', delay: '1.2s', duration: '5.3s' },
  { x: '54%', y: '34%', size: '3px', delay: '2.5s', duration: '6.2s' },
  { x: '60%', y: '40%', size: '2px', delay: '0.6s', duration: '5s' },
  { x: '66%', y: '32%', size: '3px', delay: '1.5s', duration: '5.7s' },
  { x: '72%', y: '38%', size: '2px', delay: '2s', duration: '4.8s' },
  { x: '78%', y: '34%', size: '3px', delay: '0.4s', duration: '5.9s' },
  { x: '84%', y: '40%', size: '2px', delay: '1.8s', duration: '5.2s' },
  { x: '90%', y: '32%', size: '3px', delay: '2.3s', duration: '6.1s' },
  { x: '96%', y: '38%', size: '2px', delay: '0.7s', duration: '5.5s' },

  { x: '4%', y: '56%', size: '2px', delay: '1s', duration: '5.2s' },
  { x: '10%', y: '62%', size: '3px', delay: '2.1s', duration: '6s' },
  { x: '16%', y: '58%', size: '2px', delay: '0.5s', duration: '4.9s' },
  { x: '22%', y: '64%', size: '3px', delay: '1.6s', duration: '5.8s' },
  { x: '28%', y: '60%', size: '2px', delay: '2.4s', duration: '5.4s' },
  { x: '34%', y: '66%', size: '3px', delay: '0.9s', duration: '6.2s' },
  { x: '40%', y: '58%', size: '2px', delay: '1.3s', duration: '5.1s' },
  { x: '46%', y: '64%', size: '3px', delay: '2.6s', duration: '5.9s' },
  { x: '52%', y: '60%', size: '2px', delay: '0.2s', duration: '4.8s' },
  { x: '58%', y: '66%', size: '3px', delay: '1.9s', duration: '5.7s' },
  { x: '64%', y: '58%', size: '2px', delay: '2.2s', duration: '5.3s' },
  { x: '70%', y: '64%', size: '3px', delay: '0.8s', duration: '6.1s' },
  { x: '76%', y: '60%', size: '2px', delay: '1.4s', duration: '5s' },
  { x: '82%', y: '66%', size: '3px', delay: '2.5s', duration: '5.6s' },
  { x: '88%', y: '58%', size: '2px', delay: '0.6s', duration: '5.2s' },
  { x: '94%', y: '64%', size: '3px', delay: '1.7s', duration: '6.3s' },

  { x: '6%', y: '80%', size: '3px', delay: '2s', duration: '5.7s' },
  { x: '14%', y: '86%', size: '2px', delay: '0.7s', duration: '5.1s' },
  { x: '22%', y: '82%', size: '3px', delay: '1.5s', duration: '6s' },
  { x: '30%', y: '88%', size: '2px', delay: '2.3s', duration: '4.9s' },
  { x: '38%', y: '84%', size: '3px', delay: '0.4s', duration: '5.8s' },
  { x: '46%', y: '90%', size: '2px', delay: '1.8s', duration: '5.3s' },
  { x: '54%', y: '82%', size: '3px', delay: '2.6s', duration: '6.2s' },
  { x: '62%', y: '88%', size: '2px', delay: '0.9s', duration: '5s' },
  { x: '70%', y: '84%', size: '3px', delay: '1.2s', duration: '5.9s' },
  { x: '78%', y: '90%', size: '2px', delay: '2.1s', duration: '5.4s' },
  { x: '86%', y: '82%', size: '3px', delay: '0.3s', duration: '6.1s' },
  { x: '94%', y: '88%', size: '2px', delay: '1.6s', duration: '5.6s' },
];

const CTASection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('cs-visible'); }),
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="cs-section" ref={sectionRef}>
      {/* Ambient glow blobs */}
      <div className="cs-glow cs-glow-left" />
      <div className="cs-glow cs-glow-right" />

      <div className="cs-inner">
        <div className="cs-particles" aria-hidden="true">
          {PARTICLES.map((particle, index) => (
            <span
              className="cs-particle"
              key={index}
              style={{
                '--x': particle.x,
                '--y': particle.y,
                '--size': particle.size,
                '--delay': particle.delay,
                '--duration': particle.duration,
              }}
            />
          ))}
        </div>

        <h2 className="cs-title">
          The future of<br />
          <span className="cs-title-grad">team collaboration</span><br />
          starts here.
        </h2>

        <p className="cs-sub">
          Join thousands of teams already writing, editing, and shipping
          documents faster with Collabocalypse. Real-time. Conflict-free. Enterprise-ready.
        </p>

        <div className="cs-actions">
          <button className="cs-btn-primary">
            Start Collaborating
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="cs-btn-ghost">View live demo</button>
        </div>

        <p className="cs-note">No credit card required &nbsp;·&nbsp; Free forever plan available</p>
      </div>
    </section>
  );
};

export default CTASection;
