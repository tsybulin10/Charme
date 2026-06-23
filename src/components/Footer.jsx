import { useContext } from 'react';
import { SalonContext } from '../context/SalonContext';
import { Phone, MapPin, Shield } from 'lucide-react';
import crownLogo from '../Crown.svg';
import './Footer.css';

const CrownIcon = ({ className, size = 35 }) => (
  <img 
    src={crownLogo} 
    className={className} 
    style={{ height: size, width: 'auto' }} 
    alt="Crown Logo" 
  />
);

const Footer = ({ onAdminClick }) => {
  const { contacts } = useContext(SalonContext);

  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getCleanInstagramUrl = (handle) => {
    return `https://instagram.com/${handle.replace('@', '')}`;
  };

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand-col">
          <a href="#" className="footer-logo" onClick={(e) => { e.preventDefault(); handleScrollTo('hero'); }}>
            <CrownIcon className="logo-icon" />
            <div className="logo-text">
              <span className="logo-title">Шарм</span>
              <span className="logo-subtitle">Beauty Salon</span>
            </div>
          </a>
          <p className="footer-brand-text">
            Простір краси та витонченості у Києві. Створюємо досконалі образи за допомогою преміальних технологій та косметики люкс-сегменту.
          </p>
          <div className="footer-socials">
            {contacts.instagram && (
              <a 
                href={getCleanInstagramUrl(contacts.instagram)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-instagram-link"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="instagram-icon"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                <span>Instagram</span>
              </a>
            )}
          </div>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-title">Навігація</h4>
          <ul className="footer-links-list">
            <li><a href="#services" onClick={(e) => { e.preventDefault(); handleScrollTo('services'); }}>Послуги</a></li>
            <li><a href="#about" onClick={(e) => { e.preventDefault(); handleScrollTo('about'); }}>Про нас</a></li>
            <li><a href="#gallery" onClick={(e) => { e.preventDefault(); handleScrollTo('gallery'); }}>Галерея</a></li>
            <li><a href="#reviews" onClick={(e) => { e.preventDefault(); handleScrollTo('reviews'); }}>Відгуки</a></li>
            <li><a href="#contacts" onClick={(e) => { e.preventDefault(); handleScrollTo('contacts'); }}>Контакти</a></li>
          </ul>
        </div>

        <div className="footer-contacts-col">
          <h4 className="footer-title">Зв'язок</h4>
          <ul className="footer-contacts-list">
            <li>
              <MapPin size={16} className="contact-icon" />
              <span>{contacts.address}</span>
            </li>
            <li>
              <Phone size={16} className="contact-icon" />
              <a href={`tel:${contacts.phone1.replace(/[^\d+]/g, '')}`} className="footer-contact-link">{contacts.phone1}</a>
            </li>
            {contacts.phone2 && (
              <li>
                <Phone size={16} className="contact-icon" />
                <a href={`tel:${contacts.phone2.replace(/[^\d+]/g, '')}`} className="footer-contact-link">{contacts.phone2}</a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-container">
          <p className="copyright">
            © {new Date().getFullYear()} Шарм Beauty Salon. Всі права захищені.
          </p>
          {sessionStorage.getItem('charme_admin_secret_accessed') === 'true' && (
            <button className="admin-entry-btn" onClick={() => onAdminClick(true)}>
              <Shield size={14} />
              <span>Кабінет адміністратора</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
