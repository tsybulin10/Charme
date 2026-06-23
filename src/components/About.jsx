import { useContext, useEffect, useRef } from 'react';
import { SalonContext } from '../context/SalonContext';
import { 
  Award, Compass, Heart, Users, 
  ShieldCheck, Clock, CalendarCheck, Sparkles, Gift, Coffee, Scissors, Flower2 
} from 'lucide-react';
import './About.css';

const About = () => {
  const { about } = useContext(SalonContext);
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    let ticking = false;

    const checkVisibility = () => {
      const currentVideo = videoRef.current;
      if (!currentVideo) return;
      const rect = currentVideo.getBoundingClientRect();
      
      // Video is considered in view if its top is above the viewport bottom (minus 80px buffer)
      // and its bottom is below the viewport top (plus 80px buffer).
      const inView = rect.top < window.innerHeight - 80 && rect.bottom > 80;
      
      if (inView) {
        if (currentVideo.paused) {
          currentVideo.play().catch((err) => {
            console.log("[AboutVideo] Play error:", err);
          });
        }
      } else {
        if (!currentVideo.paused) {
          currentVideo.pause();
        }
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(checkVisibility);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Run an initial check after mounting
    const timer = setTimeout(checkVisibility, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      clearTimeout(timer);
      if (videoElement) {
        videoElement.pause();
      }
    };
  }, [about.videoUrl, about.mediaType]);

  const getInstagramEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /(?:instagram\.com)\/(?:p|reel)\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regExp);
    if (match && match[1]) {
      return `https://www.instagram.com/p/${match[1]}/embed`;
    }
    return null;
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2] && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  const instagramEmbedUrl = about.mediaType === 'video' ? getInstagramEmbedUrl(about.videoUrl) : null;
  const youtubeEmbedUrl = about.mediaType === 'video' ? getYouTubeEmbedUrl(about.videoUrl) : null;
  const isDirectVideo = about.mediaType === 'video' && !instagramEmbedUrl && !youtubeEmbedUrl;

  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="about-grid">
          <div className="about-image-container animate-fade-in">
            <div className="about-image-wrapper">
              
              {about.mediaType === 'video' && instagramEmbedUrl && (
                <iframe
                  src={instagramEmbedUrl}
                  title="About Instagram Video"
                  className="about-instagram-iframe"
                  scrolling="no"
                  frameBorder="0"
                  allowTransparency="true"
                  allow="encrypted-media"
                />
              )}

              {about.mediaType === 'video' && youtubeEmbedUrl && (
                <iframe
                  src={youtubeEmbedUrl}
                  title="About YouTube Video"
                  className="about-instagram-iframe"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}

              {about.mediaType === 'video' && isDirectVideo && about.videoUrl && (
                <video
                  ref={videoRef}
                  src={about.videoUrl}
                  loop
                  muted
                  playsInline
                  className="about-video"
                />
              )}

              {(about.mediaType === 'image' || !about.videoUrl) && (
                <img
                  src={about.image}
                  alt="Шарм Beauty Salon Interior"
                  className="about-img main-img"
                  style={{ objectPosition: about.imagePosition || 'center' }}
                />
              )}

              <div className="about-img-accent"></div>
            </div>
            <div className="about-experience-badge">
              <span className="years">{about.years || '10+'}</span>
              <span className="text">{about.yearsText || 'Років краси'}</span>
            </div>
          </div>

          <div className="about-content animate-fade-in">
            <span className="about-subtitle">{about.subtitle || 'Наш простір'}</span>
            <h2 className="about-title">{about.title || 'Про Шарм Beauty Salon'}</h2>
            <p className="about-text-lead" style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
              {about.textLead}
            </p>

            <div className="about-badges-row">
              <span className="about-accent-badge">✨ 100% Стерильно</span>
              <span className="about-accent-badge">🏆 Преміум матеріали</span>
              <span className="about-accent-badge">💖 Турбота та комфорт</span>
            </div>

            <div className="about-bullets-list">
              <div className="about-bullet-item">
                <span className="about-bullet-icon">✨</span>
                <div>
                  <strong>Індивідуальний підхід:</strong> Створюємо бездоганні образи, які найкраще підкреслюють вашу природну красу.
                </div>
              </div>
              <div className="about-bullet-item">
                <span className="about-bullet-icon">👥</span>
                <div>
                  <strong>Топ-команда фахівців:</strong> Дипломовані нейл-майстри, косметологи та стилісти з постійним навчанням.
                </div>
              </div>
              <div className="about-bullet-item">
                <span className="about-bullet-icon">🛡️</span>
                <div>
                  <strong>Безпека та якість:</strong> Гарантуємо 3-етапну стерилізацію всіх інструментів та сертифіковані люкс-бренди.
                </div>
              </div>
            </div>

            <div className="about-features">
              {(about.features || []).map((feature, idx) => {
                const getIconComponent = (iconName, index) => {
                  switch (iconName) {
                    case 'Award': return Award;
                    case 'Compass': return Compass;
                    case 'Heart': return Heart;
                    case 'Users': return Users;
                    case 'ShieldCheck': return ShieldCheck;
                    case 'Clock': return Clock;
                    case 'CalendarCheck': return CalendarCheck;
                    case 'Sparkles': return Sparkles;
                    case 'Gift': return Gift;
                    case 'Coffee': return Coffee;
                    case 'Scissors': return Scissors;
                    case 'Flower2': return Flower2;
                    default:
                      if (index === 0) return Award;
                      if (index === 1) return Compass;
                      if (index === 2) return Heart;
                      return Users;
                  }
                };
                const IconComponent = getIconComponent(feature.icon, idx);
                return (
                  <div key={feature.id || idx} className="about-feature-item">
                    <div className="about-feature-icon">
                      <IconComponent size={22} />
                    </div>
                    <div>
                      <h4 className="about-feature-title">{feature.title}</h4>
                      <p className="about-feature-desc">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

