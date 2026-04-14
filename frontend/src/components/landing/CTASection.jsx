import { useEffect, useRef } from 'react';
import './CTASection.css';

export const CTA_PARTICLES = [
  // Top region (0-24%)
  { x: '2%', y: '4%', size: '2px', delay: '0.1s', duration: '5.3s' },
  { x: '4%', y: '8%', size: '2px', delay: '0.2s', duration: '5.1s' },
  { x: '7%', y: '6%', size: '3px', delay: '1.7s', duration: '5.9s' },
  { x: '10%', y: '14%', size: '3px', delay: '1.3s', duration: '6s' },
  { x: '13%', y: '11%', size: '2px', delay: '2.7s', duration: '5.2s' },
  { x: '16%', y: '10%', size: '2px', delay: '2s', duration: '4.8s' },
  { x: '19%', y: '7%', size: '3px', delay: '0.9s', duration: '5.6s' },
  { x: '22%', y: '16%', size: '3px', delay: '0.6s', duration: '5.7s' },
  { x: '25%', y: '13%', size: '2px', delay: '2.4s', duration: '6.1s' },
  { x: '28%', y: '12%', size: '2px', delay: '1.8s', duration: '5.3s' },
  { x: '31%', y: '9%', size: '3px', delay: '0.4s', duration: '5.8s' },
  { x: '34%', y: '18%', size: '3px', delay: '2.5s', duration: '6.2s' },
  { x: '37%', y: '11%', size: '2px', delay: '1.1s', duration: '5s' },
  { x: '40%', y: '10%', size: '2px', delay: '0.4s', duration: '5.4s' },
  { x: '43%', y: '15%', size: '3px', delay: '2.2s', duration: '5.7s' },
  { x: '46%', y: '16%', size: '3px', delay: '1.6s', duration: '5.8s' },
  { x: '49%', y: '8%', size: '2px', delay: '0.8s', duration: '6s' },
  { x: '52%', y: '12%', size: '2px', delay: '2.3s', duration: '4.9s' },
  { x: '55%', y: '14%', size: '3px', delay: '1.4s', duration: '5.5s' },
  { x: '58%', y: '18%', size: '3px', delay: '0.7s', duration: '5.9s' },
  { x: '61%', y: '11%', size: '2px', delay: '2.6s', duration: '5.1s' },
  { x: '64%', y: '10%', size: '2px', delay: '1.1s', duration: '5.2s' },
  { x: '67%', y: '17%', size: '3px', delay: '0.3s', duration: '6.3s' },
  { x: '70%', y: '16%', size: '3px', delay: '2.1s', duration: '6.1s' },
  { x: '73%', y: '9%', size: '2px', delay: '1.5s', duration: '5.4s' },
  { x: '76%', y: '12%', size: '2px', delay: '0.5s', duration: '5.5s' },
  { x: '79%', y: '14%', size: '3px', delay: '2.8s', duration: '5.8s' },
  { x: '82%', y: '18%', size: '3px', delay: '1.9s', duration: '5.7s' },
  { x: '85%', y: '11%', size: '2px', delay: '0.6s', duration: '6s' },
  { x: '88%', y: '10%', size: '2px', delay: '2.6s', duration: '6.3s' },
  { x: '91%', y: '13%', size: '3px', delay: '1.2s', duration: '5.2s' },
  { x: '94%', y: '14%', size: '3px', delay: '0.9s', duration: '5.6s' },
  { x: '97%', y: '8%', size: '2px', delay: '2.3s', duration: '5.9s' },

  // Upper-middle region (25-49%)
  { x: '3%', y: '26%', size: '2px', delay: '1.8s', duration: '5.4s' },
  { x: '6%', y: '30%', size: '3px', delay: '1.4s', duration: '5.4s' },
  { x: '9%', y: '28%', size: '2px', delay: '0.5s', duration: '6.1s' },
  { x: '12%', y: '36%', size: '2px', delay: '0.8s', duration: '5s' },
  { x: '15%', y: '33%', size: '3px', delay: '2.4s', duration: '5.7s' },
  { x: '18%', y: '32%', size: '3px', delay: '2.2s', duration: '5.8s' },
  { x: '21%', y: '29%', size: '2px', delay: '0.7s', duration: '5.3s' },
  { x: '24%', y: '38%', size: '2px', delay: '0.3s', duration: '5.1s' },
  { x: '27%', y: '35%', size: '3px', delay: '1.9s', duration: '6.2s' },
  { x: '30%', y: '34%', size: '3px', delay: '1.7s', duration: '6s' },
  { x: '33%', y: '31%', size: '2px', delay: '2.5s', duration: '5.5s' },
  { x: '36%', y: '40%', size: '2px', delay: '2.4s', duration: '4.9s' },
  { x: '39%', y: '37%', size: '3px', delay: '0.9s', duration: '5.8s' },
  { x: '42%', y: '32%', size: '3px', delay: '0.1s', duration: '5.6s' },
  { x: '45%', y: '29%', size: '2px', delay: '1.6s', duration: '6.1s' },
  { x: '48%', y: '38%', size: '2px', delay: '1.2s', duration: '5.3s' },
  { x: '51%', y: '35%', size: '3px', delay: '2.7s', duration: '5.9s' },
  { x: '54%', y: '34%', size: '3px', delay: '2.5s', duration: '6.2s' },
  { x: '57%', y: '31%', size: '2px', delay: '0.4s', duration: '5.2s' },
  { x: '60%', y: '40%', size: '2px', delay: '0.6s', duration: '5s' },
  { x: '63%', y: '37%', size: '3px', delay: '1.8s', duration: '5.7s' },
  { x: '66%', y: '32%', size: '3px', delay: '1.5s', duration: '5.7s' },
  { x: '69%', y: '29%', size: '2px', delay: '2.1s', duration: '6s' },
  { x: '72%', y: '38%', size: '2px', delay: '2s', duration: '4.8s' },
  { x: '75%', y: '35%', size: '3px', delay: '0.8s', duration: '5.4s' },
  { x: '78%', y: '34%', size: '3px', delay: '0.4s', duration: '5.9s' },
  { x: '81%', y: '31%', size: '2px', delay: '2.6s', duration: '5.1s' },
  { x: '84%', y: '40%', size: '2px', delay: '1.8s', duration: '5.2s' },
  { x: '87%', y: '37%', size: '3px', delay: '0.2s', duration: '6.3s' },
  { x: '90%', y: '32%', size: '3px', delay: '2.3s', duration: '6.1s' },
  { x: '93%', y: '29%', size: '2px', delay: '1.3s', duration: '5.5s' },
  { x: '96%', y: '38%', size: '2px', delay: '0.7s', duration: '5.5s' },

  // Middle region (50-74%)
  { x: '2%', y: '52%', size: '3px', delay: '2.2s', duration: '5.6s' },
  { x: '4%', y: '56%', size: '2px', delay: '1s', duration: '5.2s' },
  { x: '7%', y: '54%', size: '2px', delay: '0.6s', duration: '5.9s' },
  { x: '10%', y: '62%', size: '3px', delay: '2.1s', duration: '6s' },
  { x: '13%', y: '59%', size: '2px', delay: '1.4s', duration: '5.3s' },
  { x: '16%', y: '58%', size: '2px', delay: '0.5s', duration: '4.9s' },
  { x: '19%', y: '55%', size: '3px', delay: '2.5s', duration: '5.7s' },
  { x: '22%', y: '64%', size: '3px', delay: '1.6s', duration: '5.8s' },
  { x: '25%', y: '61%', size: '2px', delay: '0.3s', duration: '6.1s' },
  { x: '28%', y: '60%', size: '2px', delay: '2.4s', duration: '5.4s' },
  { x: '31%', y: '57%', size: '3px', delay: '1.7s', duration: '5.5s' },
  { x: '34%', y: '66%', size: '3px', delay: '0.9s', duration: '6.2s' },
  { x: '37%', y: '63%', size: '2px', delay: '2.8s', duration: '5.1s' },
  { x: '40%', y: '58%', size: '2px', delay: '1.3s', duration: '5.1s' },
  { x: '43%', y: '55%', size: '3px', delay: '0.7s', duration: '5.8s' },
  { x: '46%', y: '64%', size: '3px', delay: '2.6s', duration: '5.9s' },
  { x: '49%', y: '61%', size: '2px', delay: '1.2s', duration: '5.3s' },
  { x: '52%', y: '60%', size: '2px', delay: '0.2s', duration: '4.8s' },
  { x: '55%', y: '57%', size: '3px', delay: '2.3s', duration: '6s' },
  { x: '58%', y: '66%', size: '3px', delay: '1.9s', duration: '5.7s' },
  { x: '61%', y: '63%', size: '2px', delay: '0.4s', duration: '5.4s' },
  { x: '64%', y: '58%', size: '2px', delay: '2.2s', duration: '5.3s' },
  { x: '67%', y: '55%', size: '3px', delay: '1.5s', duration: '5.9s' },
  { x: '70%', y: '64%', size: '3px', delay: '0.8s', duration: '6.1s' },
  { x: '73%', y: '61%', size: '2px', delay: '2.7s', duration: '5.2s' },
  { x: '76%', y: '60%', size: '2px', delay: '1.4s', duration: '5s' },
  { x: '79%', y: '57%', size: '3px', delay: '0.1s', duration: '6.2s' },
  { x: '82%', y: '66%', size: '3px', delay: '2.5s', duration: '5.6s' },
  { x: '85%', y: '63%', size: '2px', delay: '1.8s', duration: '5.7s' },
  { x: '88%', y: '58%', size: '2px', delay: '0.6s', duration: '5.2s' },
  { x: '91%', y: '55%', size: '3px', delay: '2.1s', duration: '5.8s' },
  { x: '94%', y: '64%', size: '3px', delay: '1.7s', duration: '6.3s' },
  { x: '97%', y: '61%', size: '2px', delay: '0.9s', duration: '5.4s' },

  // Bottom region (75-100%)
  { x: '3%', y: '77%', size: '2px', delay: '1.6s', duration: '5.5s' },
  { x: '6%', y: '80%', size: '3px', delay: '2s', duration: '5.7s' },
  { x: '9%', y: '78%', size: '2px', delay: '0.8s', duration: '6.1s' },
  { x: '11%', y: '85%', size: '3px', delay: '2.4s', duration: '5.3s' },
  { x: '14%', y: '86%', size: '2px', delay: '0.7s', duration: '5.1s' },
  { x: '17%', y: '83%', size: '3px', delay: '1.9s', duration: '5.9s' },
  { x: '20%', y: '81%', size: '2px', delay: '2.7s', duration: '5.4s' },
  { x: '22%', y: '82%', size: '3px', delay: '1.5s', duration: '6s' },
  { x: '25%', y: '87%', size: '2px', delay: '0.4s', duration: '5.6s' },
  { x: '28%', y: '89%', size: '3px', delay: '2.2s', duration: '5.2s' },
  { x: '30%', y: '88%', size: '2px', delay: '2.3s', duration: '4.9s' },
  { x: '33%', y: '85%', size: '3px', delay: '1.1s', duration: '5.8s' },
  { x: '36%', y: '83%', size: '2px', delay: '0.6s', duration: '6.2s' },
  { x: '38%', y: '84%', size: '3px', delay: '0.4s', duration: '5.8s' },
  { x: '41%', y: '91%', size: '2px', delay: '2.5s', duration: '5.5s' },
  { x: '44%', y: '92%', size: '3px', delay: '1.3s', duration: '6.1s' },
  { x: '46%', y: '90%', size: '2px', delay: '1.8s', duration: '5.3s' },
  { x: '49%', y: '87%', size: '3px', delay: '0.2s', duration: '5.7s' },
  { x: '52%', y: '85%', size: '2px', delay: '2.6s', duration: '5.9s' },
  { x: '54%', y: '82%', size: '3px', delay: '2.6s', duration: '6.2s' },
  { x: '57%', y: '89%', size: '2px', delay: '1.4s', duration: '5.1s' },
  { x: '60%', y: '94%', size: '3px', delay: '0.7s', duration: '5.4s' },
  { x: '62%', y: '88%', size: '2px', delay: '0.9s', duration: '5s' },
  { x: '65%', y: '86%', size: '3px', delay: '2.1s', duration: '6s' },
  { x: '68%', y: '83%', size: '2px', delay: '1.7s', duration: '5.6s' },
  { x: '70%', y: '84%', size: '3px', delay: '1.2s', duration: '5.9s' },
  { x: '73%', y: '91%', size: '2px', delay: '0.5s', duration: '5.2s' },
  { x: '76%', y: '96%', size: '3px', delay: '2.8s', duration: '5.8s' },
  { x: '78%', y: '90%', size: '2px', delay: '2.1s', duration: '5.4s' },
  { x: '81%', y: '87%', size: '3px', delay: '0.3s', duration: '6.3s' },
  { x: '84%', y: '85%', size: '2px', delay: '1.6s', duration: '5.5s' },
  { x: '86%', y: '82%', size: '3px', delay: '0.3s', duration: '6.1s' },
  { x: '89%', y: '89%', size: '2px', delay: '2.4s', duration: '5.7s' },
  { x: '92%', y: '93%', size: '3px', delay: '1.8s', duration: '5.3s' },
  { x: '94%', y: '88%', size: '2px', delay: '1.6s', duration: '5.6s' },
  { x: '97%', y: '86%', size: '3px', delay: '0.9s', duration: '6.2s' },
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
          {CTA_PARTICLES.map((particle, index) => (
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
      </div>
    </section>
  );
};

export default CTASection;
