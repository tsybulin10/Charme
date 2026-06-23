import { useContext } from 'react';
import { SalonContext } from '../context/SalonContext';
import { Phone, MapPin, Mail, Clock } from 'lucide-react';
import './Contacts.css';

const Contacts = () => {
  const { contacts } = useContext(SalonContext);

  const getCleanInstagramUrl = (handle) => {
    return `https://instagram.com/${handle.replace('@', '')}`;
  };

  return (
    <section id="contacts" className="contacts-section">
      <div className="container">
        <h2 className="section-title">{contacts.title || 'Контакти'}</h2>

        <div className="contacts-grid">
          <div className="contacts-info animate-fade-in">
            <h3 className="contacts-info-title">{contacts.infoTitle || 'Завітайте до нас'}</h3>
            <p className="contacts-info-text">
              {contacts.infoText}
            </p>

            <div className="contact-details-list">
              <div className="contact-detail-item">
                <div className="contact-icon-wrapper">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="detail-label">Адреса</h4>
                  <p className="detail-value">{contacts.address}</p>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="contact-icon-wrapper">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="detail-label">Телефони для запису</h4>
                  <p className="detail-value">
                    <a href={`tel:${contacts.phone1.replace(/[^\d+]/g, '')}`} className="contact-link">{contacts.phone1}</a>
                    {contacts.phone2 && (
                      <>
                        <br />
                        <a href={`tel:${contacts.phone2.replace(/[^\d+]/g, '')}`} className="contact-link">{contacts.phone2}</a>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="contact-icon-wrapper">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="detail-label">Режим роботи</h4>
                  <p className="detail-value">
                    {contacts.workingHoursWeekday}
                    {contacts.workingHoursWeekend && (
                      <>
                        <br />
                        {contacts.workingHoursWeekend}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="contact-icon-wrapper">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="detail-label">Email</h4>
                  <p className="detail-value">
                    <a href={`mailto:${contacts.email}`} className="contact-link">{contacts.email}</a>
                  </p>
                </div>
              </div>

              {contacts.instagram && (
                <div className="contact-detail-item">
                  <div className="contact-icon-wrapper">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                  </div>
                  <div>
                    <h4 className="detail-label">Instagram</h4>
                    <p className="detail-value">
                      <a
                        href={getCleanInstagramUrl(contacts.instagram)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-link instagram-link"
                      >
                        @{contacts.instagram.replace('@', '')}
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="contacts-map-container glass-card animate-fade-in">
            {contacts.googleMapsEmbed ? (
              <iframe
                src={contacts.googleMapsEmbed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Шарм Beauty Salon Kyiv Location Map"
                className="contacts-map-iframe"
              ></iframe>
            ) : (
              <div className="map-placeholder">
                <MapPin size={40} className="placeholder-icon" />
                <p>Мапа локації завантажується...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacts;
