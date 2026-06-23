import { useState, useContext } from 'react';
import { SalonContext } from '../context/SalonContext';
import { Star, Quote, X } from 'lucide-react';
import CustomSelect from './CustomSelect';
import './Reviews.css';

const getAvatarGradient = (name) => {
  const colors = [
    ['#ff9a9e', '#fecfef'],
    ['#a1c4fd', '#c2e9fb'],
    ['#d4fc79', '#96e6a1'],
    ['#f6d365', '#fda085'],
    ['#a18cd1', '#fbc2eb'],
    ['#84fab0', '#8fd3f4'],
    ['#cfd9df', '#e2ebf0'],
    ['#fccb90', '#d5d114']
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return `linear-gradient(135deg, ${colors[index][0]} 0%, ${colors[index][1]} 100%)`;
};

const Reviews = () => {
  const { reviews, services, addReview, blockSettings } = useContext(SalonContext);
  const [activePhoto, setActivePhoto] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    services: [],
    price: '',
    text: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (ratingVal) => {
    setFormData(prev => ({
      ...prev,
      rating: ratingVal
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.text) {
      alert('Будь ласка, заповніть обов\'язкові поля.');
      return;
    }

    addReview({
      name: formData.name,
      rating: Number(formData.rating),
      service: formData.services && formData.services.length > 0 ? formData.services[0] : 'Загальний візит',
      services: formData.services || [],
      price: formData.price || '',
      text: formData.text
    });

    setSubmitted(true);
    setTimeout(() => {
      setFormData({
        name: '',
        rating: 5,
        services: [],
        price: '',
        text: ''
      });
      setSubmitted(false);
    }, 3000);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          className={i <= rating ? "star-icon filled" : "star-icon"}
        />
      );
    }
    return stars;
  };

  const getDisplayDate = (review) => {
    try {
      // 1. Check if date is absolute (e.g. DD.MM.YYYY)
      const absoluteRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
      const match = review.date.match(absoluteRegex);
      
      let absoluteDate = null;
      
      if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const year = parseInt(match[3], 10);
        absoluteDate = new Date(year, month, day);
      } else {
        // 2. It is a relative date string (e.g. "Тиждень тому", "a week ago")
        // Find base date (when the review was imported/added)
        let baseDate = null;
        if (review.createdAt) {
          baseDate = new Date(review.createdAt);
        } else if (review.id && review.id.startsWith('r_')) {
          const timestamp = Number(review.id.replace('r_', ''));
          if (!isNaN(timestamp)) {
            baseDate = new Date(timestamp);
          }
        }
        
        if (!baseDate) {
          // Fallback to current time if no base date is available
          return review.date;
        }
        
        // Parse the relative offset in days
        const s = review.date.toLowerCase().trim();
        let offsetDays = 0;
        
        if (s.includes('тиждень') || s.includes('week') || s.includes('неделю')) {
          const matchNum = s.match(/(\d+)/);
          offsetDays = matchNum ? parseInt(matchNum[1], 10) * 7 : 7;
        } else if (s.includes('місяць') || s.includes('month') || s.includes('месяц')) {
          const matchNum = s.match(/(\d+)/);
          offsetDays = matchNum ? parseInt(matchNum[1], 10) * 30 : 30;
        } else if (s.includes('рік') || s.includes('year') || s.includes('год')) {
          const matchNum = s.match(/(\d+)/);
          offsetDays = matchNum ? parseInt(matchNum[1], 10) * 365 : 365;
        } else if (s.includes('дні') || s.includes('дн') || s.includes('day') || s.includes('назад')) {
          const matchNum = s.match(/(\d+)/);
          offsetDays = matchNum ? parseInt(matchNum[1], 10) : 1;
        }
        
        absoluteDate = new Date(baseDate.getTime() - offsetDays * 24 * 60 * 60 * 1000);
      }
      
      // Calculate relative time from absoluteDate to now
      const now = new Date();
      const diffTime = now - absoluteDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'Щойно';
      if (diffDays === 0) return 'Сьогодні';
      if (diffDays === 1) return 'Вчора';
      if (diffDays < 7) return `${diffDays} днів тому`;
      
      const diffWeeks = Math.floor(diffDays / 7);
      if (diffWeeks === 1) return 'Тиждень тому';
      if (diffWeeks < 4) {
        return `${diffWeeks} тижні тому`;
      }
      
      const diffMonths = Math.floor(diffDays / 30);
      if (diffMonths === 1) return 'Місяць тому';
      if (diffMonths < 12) {
        if (diffMonths >= 2 && diffMonths <= 4) {
          return `${diffMonths} місяці тому`;
        }
        return `${diffMonths} місяців тому`;
      }
      
      const diffYears = Math.floor(diffDays / 365);
      if (diffYears === 1) return 'Рік тому';
      if (diffYears >= 2 && diffYears <= 4) {
        return `${diffYears} роки тому`;
      }
      return `${diffYears} років тому`;
    } catch (e) {
      console.error('Error calculating relative date:', e);
      return review.date;
    }
  };

  return (
    <section id="reviews" className="reviews-section">
      <div className="container">
        <h2 className="section-title">{blockSettings?.reviewsTitle || 'Відгуки клієнтів'}</h2>
        
        <div className="reviews-layout">
          <div className="reviews-feed animate-fade-in">
            {reviews.length > 0 ? (
              reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="review-card glass-card">
                  <Quote className="quote-icon" size={40} />
                  
                  <div className="review-header">
                    <div className="review-author-info">
                      {review.avatar ? (
                        <img src={review.avatar} alt={review.name} className="review-avatar" />
                      ) : (
                        <div 
                          className="review-avatar-fallback" 
                          style={{ background: getAvatarGradient(review.name) }}
                        >
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="review-author-meta">
                        <h4 className="review-author">{review.name}</h4>
                        <span className="review-date">{getDisplayDate(review)}</span>
                      </div>
                    </div>
                    
                    {(review.source === 'google' || review.googleReviewUrl) && (
                      <a 
                        href={review.googleReviewUrl || "https://www.google.com/maps/place/%D0%A1%D0%B0%D0%BB%D0%BE%D0%BD+%D0%BA%D1%80%D0%B0%D1%81%D0%B8+%C2%AB%D0%A8%D0%B0%D1%80%D0%BC%C2%BB/@50.388145,30.475476,17z/data=!4m6!3m5!1s0x40d4c8c7f2127265:0xe54d2417ba3f87c2!8m2!3d50.388145!4d30.475476!9m1!1b1"} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="review-google-badge review-google-link"
                        title="Читати відгук на Google Maps"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google
                      </a>
                    )}
                  </div>

                  <div className="review-stars">
                    {renderStars(review.rating)}
                  </div>
                  
                  {review.price && (
                    <div className="review-price-row">
                      <span className="review-price-badge">{review.price}</span>
                    </div>
                  )}
                  
                  {review.services && review.services.length > 0 ? (
                    <div className="review-services-list">
                      {review.services.map((srv, idx) => (
                        <span key={idx} className="review-service">{srv}</span>
                      ))}
                    </div>
                  ) : (
                    review.service && (
                      <span className="review-service">Послуга: {review.service}</span>
                    )
                  )}
                  
                  <p className="review-text">{review.text}</p>
                  
                  {review.reviewImage && (
                    <div className="review-image-container">
                      <img 
                        src={review.reviewImage} 
                        alt="Фото до відгуку" 
                        className="review-image"
                        onClick={() => setActivePhoto(review.reviewImage)}
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                Немає відгуків. Будьте першим, хто залишить відгук!
              </p>
            )}
          </div>
 
          <div className="review-form-container glass-card animate-fade-in">
            <h3 className="review-form-title">{blockSettings?.reviewsFormTitle || 'Поділіться враженнями'}</h3>
            <p className="review-form-subtitle">{blockSettings?.reviewsFormSubtitle || 'Ваш відгук допоможе нам ставати кращими!'}</p>

            {submitted ? (
              <div className="review-success">
                <span className="success-emoji">✨</span>
                <h4>Дякуємо за відгук!</h4>
                <p>Ваша думка дуже важлива для нас.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="review-form">
                <div className="form-group">
                  <label className="form-label">Ваше ім'я *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Введіть ім'я"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Оцінка *</label>
                  <div className="star-rating-selector">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className={`star-select-btn ${star <= formData.rating ? 'active' : ''}`}
                        onClick={() => handleRatingChange(star)}
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star size={24} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Процедури</label>
                  <CustomSelect
                    name="services"
                    value={formData.services || []}
                    onChange={handleChange}
                    placeholder="-- Оберіть послуги --"
                    multiple={true}
                    searchable={true}
                    options={services.map(s => ({
                      value: s.name,
                      label: s.name
                    }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ціна процедури (опціонально)</label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price || ''}
                    onChange={handleChange}
                    placeholder="Наприклад, 1 000–1 500 ₴"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ваш відгук *</label>
                  <textarea
                    name="text"
                    value={formData.text}
                    onChange={handleChange}
                    placeholder="Напишіть ваші враження..."
                    className="form-control"
                    rows="4"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary review-submit-btn">
                  Надіслати відгук
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {activePhoto && (
        <div className="review-lightbox" onClick={() => setActivePhoto(null)}>
          <div className="review-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={activePhoto} alt="Збільшене фото відгуку" className="review-lightbox-img" />
            <button className="review-lightbox-close" onClick={() => setActivePhoto(null)}>
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Reviews;
