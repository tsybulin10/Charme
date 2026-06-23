import { useState, useEffect, useContext } from 'react';
import { SalonContext } from '../context/SalonContext';
import { 
  ShieldCheck, Clock, CalendarCheck, CheckCircle, 
  Award, Heart, Users, Sparkles, Compass, Gift, Coffee, Scissors, Flower2 
} from 'lucide-react';
import CustomSelect from './CustomSelect';
import './BookingForm.css';

const BookingForm = ({ preselectedService, clearPreselectedService }) => {
  const { services, addBooking, blockSettings } = useContext(SalonContext);

  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    serviceId: '',
    date: '',
    time: '',
    clientComment: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isQuickBooking, setIsQuickBooking] = useState(true); // Default to simplified form

  // Set default minimum date to today
  const [minDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // Sync preselected service from Services component click
  useEffect(() => {
    if (preselectedService) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({
        ...prev,
        serviceId: preselectedService.id
      }));
      setIsQuickBooking(false); // Auto-expand form when a specific service is clicked
    }
  }, [preselectedService]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value;
    
    // If user deleted the +380 prefix, restore it
    if (!val.startsWith('+380')) {
      if (val.length < 4) {
        val = '+380';
      } else {
        // Remove '+380' occurrences elsewhere and non-digits
        val = '+380' + val.replace(/^\+380/, '').replace(/\D/g, '');
      }
    } else {
      // Keep +380 prefix and leave only digits after it
      val = '+380' + val.substring(4).replace(/\D/g, '');
    }
    
    // Limit to +380 + 9 digits (13 chars total)
    if (val.length <= 13) {
      setFormData(prev => ({
        ...prev,
        clientPhone: val
      }));
    }
  };

  const handlePhoneFocus = () => {
    if (!formData.clientPhone) {
      setFormData(prev => ({
        ...prev,
        clientPhone: '+380'
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.clientPhone) {
      alert('Будь ласка, заповніть обов\'язкові поля (Ім\'я та Телефон).');
      return;
    }

    // Phone validation for Ukraine (+380 followed by exactly 9 digits)
    const phoneRegex = /^\+380\d{9}$/;
    if (!phoneRegex.test(formData.clientPhone)) {
      alert('Будь ласка, введіть коректний номер телефону України (наприклад: +380XXXXXXXXX, усього 9 цифр після +380).');
      return;
    }

    let selectedServiceObj = null;
    let serviceNameVal = 'Передзвонити для запису';
    let servicePriceVal = '';
    let dateVal = 'Не вказано';
    let timeVal = 'Не вказано';
    let commentVal = formData.clientComment || '';

    if (!isQuickBooking) {
      if (!formData.serviceId || !formData.date || !formData.time) {
        alert('Будь ласка, оберіть послугу, дату та час візиту.');
        return;
      }

      // Date validation (prevent past dates)
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(selectedDate.getTime()) || selectedDate < today) {
        alert('Будь ласка, оберіть коректну дату візиту (сьогодні або в майбутньому).');
        return;
      }

      // Year validation (ensure no crazy future years like 123123)
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1); // maximum 1 year in advance
      if (selectedDate > maxDate) {
        alert('Будь ласка, оберіть дату не більше ніж на рік вперед від поточної.');
        return;
      }

      selectedServiceObj = services.find(s => s.id === formData.serviceId);
      serviceNameVal = selectedServiceObj ? selectedServiceObj.name : 'Послуга';
      servicePriceVal = selectedServiceObj ? selectedServiceObj.price : '';
      dateVal = formData.date;
      timeVal = formData.time;
    } else {
      commentVal = 'Швидкий запис (дзвінок адміністратора)' + (commentVal ? `. Коментар: ${commentVal}` : '');
    }

    addBooking({
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      serviceId: isQuickBooking ? 'quick' : formData.serviceId,
      serviceName: serviceNameVal,
      servicePrice: servicePriceVal,
      date: dateVal,
      time: timeVal,
      clientComment: commentVal
    });

    setIsSubmitted(true);
    if (clearPreselectedService) {
      clearPreselectedService();
    }
  };

  const handleReset = () => {
    setFormData({
      clientName: '',
      clientPhone: '',
      serviceId: '',
      date: '',
      time: '',
      clientComment: ''
    });
    setIsSubmitted(false);
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  return (
    <section id="booking" className="booking-section">
      <div className="container">
        <h2 className="section-title">{blockSettings?.bookingTitle || 'Онлайн-запис'}</h2>
        
        <div className="booking-wrapper">
          <div className="booking-grid">
            
            <div className="booking-info animate-fade-in">
              <h3 className="booking-info-title">{blockSettings?.bookingInfoTitle || 'Забронюйте час'}</h3>
              <p className="booking-info-text">
                {blockSettings?.bookingInfoText}
              </p>
              
              <div className="booking-features">
                {(blockSettings?.bookingFeatures || []).map((feature, idx) => {
                  const getIconComponent = (iconName, index) => {
                    switch (iconName) {
                      case 'ShieldCheck': return ShieldCheck;
                      case 'Clock': return Clock;
                      case 'CalendarCheck': return CalendarCheck;
                      case 'Award': return Award;
                      case 'Heart': return Heart;
                      case 'Users': return Users;
                      case 'Sparkles': return Sparkles;
                      case 'Compass': return Compass;
                      case 'Gift': return Gift;
                      case 'Coffee': return Coffee;
                      case 'Scissors': return Scissors;
                      case 'Flower2': return Flower2;
                      default:
                        if (index === 0) return ShieldCheck;
                        if (index === 1) return Clock;
                        return CalendarCheck;
                    }
                  };
                  const IconComponent = getIconComponent(feature.icon, idx);
                  return (
                    <div key={feature.id || idx} className="feature-item">
                      <div className="feature-icon-wrapper">
                        <IconComponent size={20} />
                      </div>
                      <div>
                        <h4 className="feature-title">{feature.title}</h4>
                        <p className="feature-desc">{feature.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="booking-card glass-card animate-fade-in">
              {isSubmitted ? (
                <div className="booking-success-message">
                  <div className="success-icon-wrapper">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="success-title">Візит заброньовано!</h3>
                  <p className="success-text">
                    Дякуємо, {formData.clientName}! Ваша заявка успішно надіслана. <br />
                    Ми зв'яжемося з вами найближчим часом за номером {formData.clientPhone}.
                  </p>
                  <button className="btn btn-primary" onClick={handleReset}>
                    Записатися ще раз
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="booking-form-grid">
                    <div className="form-group form-full-width">
                      <label className="form-label">Ваше ім'я</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          name="clientName"
                          placeholder="Введіть ваше ім'я"
                          className="form-control"
                          style={{ width: '100%' }}
                          value={formData.clientName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group form-full-width">
                      <label className="form-label">Телефон</label>
                      <input
                        type="tel"
                        name="clientPhone"
                        placeholder="+380"
                        className="form-control"
                        value={formData.clientPhone}
                        onChange={handlePhoneChange}
                        onFocus={handlePhoneFocus}
                        required
                      />
                    </div>

                    <div className="form-group form-full-width booking-toggle-wrapper">
                      <button
                        type="button"
                        className="booking-toggle-details-btn"
                        onClick={() => setIsQuickBooking(!isQuickBooking)}
                      >
                        {isQuickBooking ? '➕ Обрати конкретну послугу, дату та час' : '⚡️ Спрощений швидкий запис (тільки ім\'я та телефон)'}
                      </button>
                    </div>

                    {!isQuickBooking && (
                      <>
                        <div className="form-group form-full-width animate-slide-down">
                          <label className="form-label">Оберіть послугу</label>
                          <CustomSelect
                            name="serviceId"
                            value={formData.serviceId}
                            onChange={handleChange}
                            required={!isQuickBooking}
                            searchable={true}
                            placeholder="-- Оберіть процедуру --"
                            options={services.map(s => ({
                              value: s.id,
                              label: `${s.name} (${s.price} ₴)`
                            }))}
                          />
                        </div>

                        <div className="form-group form-full-width animate-slide-down">
                          <label className="form-label">Коментар до запису (необов'язково)</label>
                          <textarea
                            name="clientComment"
                            placeholder="Наприклад: особливі побажання щодо майстра або деталей візиту..."
                            className="form-control"
                            rows="3"
                            value={formData.clientComment}
                            onChange={handleChange}
                          ></textarea>
                        </div>

                        <div className="form-group animate-slide-down">
                          <label className="form-label">Дата візиту</label>
                          <input
                            type="date"
                            name="date"
                            min={minDate}
                            className="form-control"
                            value={formData.date}
                            onChange={handleChange}
                            required={!isQuickBooking}
                          />
                        </div>

                        <div className="form-group animate-slide-down">
                          <label className="form-label">Час візиту</label>
                          <CustomSelect
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required={!isQuickBooking}
                            placeholder="-- Час --"
                            options={timeSlots.map(slot => ({
                              value: slot,
                              label: slot
                            }))}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary booking-submit-btn">
                    {isQuickBooking ? 'Записатися (передзвонити мені)' : 'Підтвердити запис'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;
