import { useState, useEffect, useContext, useRef } from 'react';
import { SalonContext } from '../context/SalonContext';
import { Sun, Moon, Menu, X, Scissors, Info, Image as ImageIcon, Star, Phone, Calendar } from 'lucide-react';
import { ExpandableTabs } from './ui/expandable-tabs';
import crownLogo from '../Crown.svg';
import './Navbar.css';

const CrownIcon = ({ className, size = 35 }) => (
  <img 
    src={crownLogo} 
    className={className} 
    style={{ height: size, width: 'auto' }} 
    alt="Crown Logo" 
  />
);

const mobileTabs = [
  { title: 'Послуги', icon: Scissors, id: 'services' },
  { title: 'Про нас', icon: Info, id: 'about' },
  { title: 'Галерея', icon: ImageIcon, id: 'gallery' },
  { title: 'Відгуки', icon: Star, id: 'reviews' },
  { title: 'Запис', icon: Calendar, id: 'booking' },
  { title: 'Контакти', icon: Phone, id: 'contacts' },
];

const Navbar = ({ onAdminClick, isAdminMode }) => {
  const { theme, toggleTheme, adminTheme, toggleAdminTheme } = useContext(SalonContext);
  const currentTheme = isAdminMode ? adminTheme : theme;
  const handleThemeToggle = isAdminMode ? toggleAdminTheme : toggleTheme;
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTabIdx, setActiveTabIdx] = useState(null);
  const [highlightedTabIdx, setHighlightedTabIdx] = useState(null);

  const isScrollingToSectionRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAdminMode) return;
    
    const sections = ['services', 'about', 'gallery', 'reviews', 'booking', 'contacts'];
    const handleScrollSpy = () => {
      if (isScrollingToSectionRef.current) return;

      const scrollPosition = window.scrollY + window.innerHeight / 3;
      
      let currentSection = null;
      for (let i = 0; i < sections.length; i++) {
        const sectionId = sections[i];
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          const isLast = i === sections.length - 1;
          
          if (scrollPosition >= top && (isLast || scrollPosition < top + height)) {
            currentSection = sectionId;
            break;
          }
        }
      }
      
      if (currentSection) {
        const idx = mobileTabs.findIndex(t => t.id === currentSection);
        if (idx !== -1) {
          setActiveTabIdx(idx);
          setHighlightedTabIdx(idx);
        } else {
          setActiveTabIdx(null);
          setHighlightedTabIdx(null);
        }
      } else {
        setActiveTabIdx(null);
        setHighlightedTabIdx(null);
      }
    };

    window.addEventListener('scroll', handleScrollSpy);
    handleScrollSpy();
    return () => {
      window.removeEventListener('scroll', handleScrollSpy);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isAdminMode]);

  const handleNavClick = (sectionId) => {
    setIsOpen(false);

    // Lock scroll spy during programmatic scrolling to prevent "wave" expansion effect
    isScrollingToSectionRef.current = true;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Immediately highlight target tab for snappy user feedback
    const targetIdx = mobileTabs.findIndex(t => t.id === sectionId);
    if (targetIdx !== -1) {
      setActiveTabIdx(targetIdx);
      setHighlightedTabIdx(targetIdx);
    } else if (sectionId === 'hero') {
      setActiveTabIdx(null);
      setHighlightedTabIdx(null);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingToSectionRef.current = false;
    }, 1000);

    if (isAdminMode) {
      onAdminClick(false); // Switch back to user mode
      // Wait a tiny bit for the page to render before scrolling
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleTabChange = (index) => {
    if (index === null) return;
    const tab = mobileTabs[index];
    if (tab) {
      handleNavClick(tab.id);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); handleNavClick('hero'); }}>
          <CrownIcon className="logo-icon" />
          <div className="logo-text">
            <span className="logo-title">Шарм</span>
            <span className="logo-subtitle">Beauty Salon</span>
          </div>
        </a>

        <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
          <li>
            <a href="#services" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('services'); }}>
              Послуги
            </a>
          </li>
          <li>
            <a href="#about" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('about'); }}>
              Про нас
            </a>
          </li>
          <li>
            <a href="#gallery" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('gallery'); }}>
              Галерея
            </a>
          </li>
          <li>
            <a href="#reviews" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('reviews'); }}>
              Відгуки
            </a>
          </li>
          <li>
            <a href="#contacts" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('contacts'); }}>
              Контакти
            </a>
          </li>
          {isAdminMode && (
            <li>
              <a href="#admin" className="nav-link active" onClick={(e) => { e.preventDefault(); setIsOpen(false); }}>
                Панель адміна
              </a>
            </li>
          )}
          <li className="mobile-cta">
            <button className="btn btn-primary" onClick={() => handleNavClick('booking')}>
              Записатись
            </button>
          </li>
        </ul>

        <div className="nav-actions">
          <button 
            className={`theme-toggle-switch ${currentTheme}`}
            onClick={handleThemeToggle} 
            aria-label="Toggle theme"
            title={currentTheme === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
          >
            <div className="switch-track">
              <Sun size={12} className="icon-sun" />
              <Moon size={12} className="icon-moon" />
              <div className="switch-thumb">
                {currentTheme === 'dark' ? <Moon size={10} /> : <Sun size={10} />}
              </div>
            </div>
          </button>

          {!isAdminMode ? (
            <button className="btn btn-primary" onClick={() => handleNavClick('booking')}>
              Записатись
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={() => onAdminClick(false)}>
              Вихід з адмін
            </button>
          )}

          <button className="burger-menu" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {!isAdminMode && (
        <div className="mobile-bottom-nav">
          <ExpandableTabs 
            tabs={mobileTabs} 
            activeTab={activeTabIdx} 
            highlightedTab={highlightedTabIdx}
            onChange={handleTabChange}
            activeColor="text-primary"
            className="mobile-expandable-tabs"
          />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
