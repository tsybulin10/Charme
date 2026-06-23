import { useState, useEffect, useContext } from 'react';
import { SalonContext } from '../context/SalonContext';
import { MessageSquare, Calendar } from 'lucide-react';
import './FloatingButtons.css';

const FloatingButtons = () => {
  const { contacts } = useContext(SalonContext);
  const [isVisible, setIsVisible] = useState(true);

  // Parse clean phone number digits for links
  const cleanPhone = contacts.phone1 ? contacts.phone1.replace(/[^\d]/g, '') : '380972066894';
  const whatsappUrl = `https://wa.me/${cleanPhone}`;
  const telegramUrl = `https://t.me/+${cleanPhone}`;

  useEffect(() => {
    const handleScroll = () => {
      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        const rect = bookingSection.getBoundingClientRect();
        // Hide the sticky bar/buttons if the booking form is visible in the viewport
        if (rect.top < window.innerHeight - 100 && rect.bottom > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBookingScroll = () => {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      const yOffset = -80; // height of fixed header
      const y = bookingSection.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* 1. Floating Desktop Messengers (FAB) */}
      <div className={`floating-messengers ${isVisible ? 'visible' : 'hidden'}`}>
        <a 
          href={telegramUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="fab-btn fab-telegram"
          title="Написати у Telegram"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.12.89-.53 3.32-.74 4.45-.09.47-.26.63-.43.64-.37.03-.65-.25-.97-.46-.5-.33-.78-.53-1.27-.85-.56-.37-.2-.57.12-.91.09-.09 1.57-1.44 1.6-1.57.01-.01.01-.06-.02-.08-.03-.02-.07-.01-.1-.01-.04 0-.71.44-2 1.31-.19.13-.36.19-.51.19-.17 0-.49-.09-.73-.17-.3-.09-.53-.14-.51-.3.01-.08.13-.17.35-.26 1.38-.6 2.29-1 2.73-1.18 1.31-.53 1.58-.62 1.76-.62.04 0 .13.01.19.06.05.05.07.11.08.17-.01.07.01.21.01.26z"/>
          </svg>
        </a>
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="fab-btn fab-whatsapp"
          title="Написати у WhatsApp"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.106 8.106 0 0 1-1.24-4.38c0-4.49 3.66-8.15 8.15-8.15 2.18 0 4.22.85 5.76 2.39a8.09 8.09 0 0 1 2.39 5.76c0 4.49-3.66 8.15-8.15 8.15zm4.47-6.11c-.24-.12-1.45-.71-1.67-.8-.22-.08-.38-.12-.54.12-.16.24-.62.8-.76.95-.14.16-.28.18-.52.06-.24-.12-.99-.36-1.89-1.16-.7-.62-1.17-1.4-1.31-1.64-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.4.12-.12.16-.2.24-.34.08-.14.04-.26-.02-.38-.06-.12-.54-1.31-.74-1.8-.19-.47-.39-.4-.54-.41-.14 0-.31-.01-.47-.01-.16 0-.43.06-.65.3-.22.24-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.72 2.63 4.17 3.69.58.25 1.04.4 1.39.51.59.19 1.12.16 1.54.1.47-.07 1.45-.59 1.65-1.17.2-.59.2-1.09.14-1.17-.06-.08-.22-.12-.46-.24z"/>
          </svg>
        </a>
      </div>

      {/* 2. Mobile Sticky Bottom CTA Bar */}
      <div className={`mobile-sticky-bar ${isVisible ? 'visible' : 'hidden'}`}>
        <div className="sticky-bar-wrapper">
          <div className="sticky-bar-socials">
            <a 
              href={telegramUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="sticky-social-btn sticky-telegram"
              aria-label="Telegram"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.12.89-.53 3.32-.74 4.45-.09.47-.26.63-.43.64-.37.03-.65-.25-.97-.46-.5-.33-.78-.53-1.27-.85-.56-.37-.2-.57.12-.91.09-.09 1.57-1.44 1.6-1.57.01-.01.01-.06-.02-.08-.03-.02-.07-.01-.1-.01-.04 0-.71.44-2 1.31-.19.13-.36.19-.51.19-.17 0-.49-.09-.73-.17-.3-.09-.53-.14-.51-.3.01-.08.13-.17.35-.26 1.38-.6 2.29-1 2.73-1.18 1.31-.53 1.58-.62 1.76-.62.04 0 .13.01.19.06.05.05.07.11.08.17-.01.07.01.21.01.26z"/>
              </svg>
            </a>
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="sticky-social-btn sticky-whatsapp"
              aria-label="WhatsApp"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.106 8.106 0 0 1-1.24-4.38c0-4.49 3.66-8.15 8.15-8.15 2.18 0 4.22.85 5.76 2.39a8.09 8.09 0 0 1 2.39 5.76c0 4.49-3.66 8.15-8.15 8.15zm4.47-6.11c-.24-.12-1.45-.71-1.67-.8-.22-.08-.38-.12-.54.12-.16.24-.62.8-.76.95-.14.16-.28.18-.52.06-.24-.12-.99-.36-1.89-1.16-.7-.62-1.17-1.4-1.31-1.64-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.4.12-.12.16-.2.24-.34.08-.14.04-.26-.02-.38-.06-.12-.54-1.31-.74-1.8-.19-.47-.39-.4-.54-.41-.14 0-.31-.01-.47-.01-.16 0-.43.06-.65.3-.22.24-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.72 2.63 4.17 3.69.58.25 1.04.4 1.39.51.59.19 1.12.16 1.54.1.47-.07 1.45-.59 1.65-1.17.2-.59.2-1.09.14-1.17-.06-.08-.22-.12-.46-.24z"/>
              </svg>
            </a>
          </div>
          
          <button 
            type="button"
            className="sticky-cta-btn"
            onClick={handleBookingScroll}
          >
            <Calendar size={16} />
            <span>Записатися онлайн</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default FloatingButtons;
