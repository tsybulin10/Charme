import { useContext } from 'react';
import { SalonContext } from '../context/SalonContext';
import { Calendar, ArrowRight } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  const { hero } = useContext(SalonContext);

  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper to extract YouTube video ID from various formats
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const ytId = hero.bgMediaType === 'video' ? getYouTubeId(hero.bgVideo) : null;
  const isDirectVideo = hero.bgMediaType === 'video' && !ytId;

  // Use background image if the type is image, or as a CSS fallback for video loading
  const headerStyle = (hero.bgMediaType === 'image' || !hero.bgVideo) && hero.bgImage
    ? { backgroundImage: `url(${hero.bgImage})`, backgroundPosition: hero.bgPosition || 'center' }
    : {};

  return (
    <header id="hero" className="hero" style={headerStyle}>
      
      {/* Background Video (Direct file like MP4 or WebM) */}
      {hero.bgMediaType === 'video' && isDirectVideo && hero.bgVideo && (
        <video 
          src={hero.bgVideo} 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="hero-video"
        />
      )}

      {/* Background Video (YouTube Iframe) */}
      {hero.bgMediaType === 'video' && ytId && (
        <div className="hero-video-wrapper">
          <iframe 
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1`}
            title="Hero Background Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="hero-youtube-iframe"
          />
        </div>
      )}

      <div className="hero-content container animate-fade-in">
        <span className="hero-tagline">{hero.tagline}</span>
        <h1 className="hero-title">{hero.title}</h1>
        <p className="hero-description">{hero.description}</p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={() => handleScrollTo('booking')}>
            <Calendar size={16} />
            Онлайн-запис
          </button>
          <button className="btn btn-secondary" onClick={() => handleScrollTo('services')}>
            Наші послуги
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Hero;

