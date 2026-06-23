import { createContext, useState, useEffect } from 'react';
import { sendTelegramMessage } from '../lib/telegram';

const formatCreatedDate = (isoString) => {
  try {
    const d = new Date(isoString);
    const dateStr = d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} о ${timeStr}`;
  } catch (e) {
    return 'Невідомо';
  }
};

const getStatusLabelUa = (status) => {
  switch (status) {
    case 'new': return 'Нова';
    case 'confirmed': return 'Підтверджено';
    case 'completed': return 'Виконано';
    case 'cancelled': return 'Скасовано';
    case 'wrong': return 'Помилковий номер';
    case 'rework': return 'Перенесено';
    default: return status;
  }
};

// eslint-disable-next-line react-refresh/only-export-components
export const SalonContext = createContext();

import DEFAULT_SERVICES from '../data/services.json';

const DEFAULT_CONTACTS = {
  phone1: '+38 (097) 206-68-94',
  phone2: '',
  address: 'м. Київ, вул. Юлії Здановської, 71Г (пов. 3)',
  email: 'info@charmebeauty.kyiv.ua',
  workingHoursWeekday: 'Пн - Нд: 09:00 - 20:00',
  workingHoursWeekend: '',
  instagram: 'charme_beauty_kyiv',
  googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2542.842777174345!2d30.475476176899477!3d50.3881449725838!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4c8c7f2127265%3A0xe54d2417ba3f87c2!2z0YPQuy4g0K7Qu9C40Lgg0JfQtNCw0L3QvtCy0YHQutC-0LksIDcx0JMsINCa0LjQtdLCAwMjAwMA!5e0!3m2!1suk!2sua!4v1718632800000!5m2!1suk!2sua',
  title: 'Контакти',
  infoTitle: 'Завітайте до нас',
  infoText: 'Ми знаходимося у Києві, Голосіївському районі. Забронюйте візит заздалегідь, щоб ми підготували все необхідне для вашого ідеального відпочинку.'
};

const DEFAULT_GALLERY = [
  {
    id: 'g_banner_94898',
    title: 'Косметологічний масаж обличчя',
    category: 'Cosmetology',
    url: '/images/gallery/banner_94898.jpg'
  },
  {
    id: 'g_banner_94899',
    title: 'Апаратний LPG масаж тіла',
    category: 'Cosmetology',
    url: '/images/gallery/banner_94899.jpg'
  },
  {
    id: 'g_banner_94900',
    title: 'Лазерна епіляція ніг',
    category: 'Cosmetology',
    url: '/images/gallery/banner_94900.jpg'
  },
  {
    id: 'g_banner_94901',
    title: 'Жіноча стрижка у топ-стиліста',
    category: 'Hair',
    url: '/images/gallery/banner_94901.jpg'
  },
  {
    id: 'g_banner_94904',
    title: 'Професійний візаж',
    category: 'Makeup',
    url: '/images/gallery/banner_94904.jpg'
  },
  {
    id: 'g_221335',
    title: 'Вечірній макіяж та локони',
    category: 'Makeup',
    url: '/images/gallery/gallery_221335.jpg'
  },
  {
    id: 'g_221336',
    title: 'Дитяча зачіска з плетінням',
    category: 'Hair',
    url: '/images/gallery/gallery_221336.jpg'
  },
  {
    id: 'g_221337',
    title: 'Елегантний хвіст із плетінням',
    category: 'Hair',
    url: '/images/gallery/gallery_221337.jpg'
  },
  {
    id: 'g_221338',
    title: 'Професійний догляд та вирівнювання волосся',
    category: 'Hair',
    url: '/images/gallery/gallery_221338.jpg'
  },
  {
    id: 'g_221339',
    title: 'Весільна зачіска з декором',
    category: 'Hair',
    url: '/images/gallery/gallery_221339.jpg'
  },
  {
    id: 'g_221340',
    title: 'Ніжний весільний образ',
    category: 'Hair',
    url: '/images/gallery/gallery_221340.jpg'
  },
  {
    id: 'g_221341',
    title: 'Голлівудські хвилі та макіяж',
    category: 'Hair',
    url: '/images/gallery/gallery_221341.jpg'
  },
  {
    id: 'g_221342',
    title: 'Каліфорнійське мелірування та локони',
    category: 'Hair',
    url: '/images/gallery/gallery_221342.jpg'
  },
  {
    id: 'g_221343',
    title: 'Святкова вечірня зачіска',
    category: 'Hair',
    url: '/images/gallery/gallery_221343.jpg'
  },
  {
    id: 'g_221344',
    title: 'Об\'ємна укладка на браш',
    category: 'Hair',
    url: '/images/gallery/gallery_221344.jpg'
  },
  {
    id: 'g_221345',
    title: 'Стильний образ з локонами',
    category: 'Hair',
    url: '/images/gallery/gallery_221345.jpg'
  },
  {
    id: 'g_221346',
    title: 'Розкішні довгі хвилі',
    category: 'Hair',
    url: '/images/gallery/gallery_221346.jpg'
  },
  {
    id: 'g_221347',
    title: 'Денний макіяж та укладка',
    category: 'Makeup',
    url: '/images/gallery/gallery_221347.jpg'
  },
  {
    id: 'g_221348',
    title: 'Стрижка каре з чубчиком та фарбування',
    category: 'Hair',
    url: '/images/gallery/gallery_221348.jpg'
  },
  {
    id: 'g_221349',
    title: 'Образ для особливої події',
    category: 'Makeup',
    url: '/images/gallery/gallery_221349.jpg'
  },
  {
    id: 'g_221350',
    title: 'Витончений вечірній макіяж',
    category: 'Makeup',
    url: '/images/gallery/gallery_221350.jpg'
  },
  {
    id: 'g_221351',
    title: 'Яскраве фарбування в рудий колір',
    category: 'Hair',
    url: '/images/gallery/gallery_221351.jpg'
  },
  {
    id: 'g_221352',
    title: 'Макіяж з акцентом на губи',
    category: 'Makeup',
    url: '/images/gallery/gallery_221352.jpg'
  },
  {
    id: 'g_221353',
    title: 'Стильна стрижка шеггі з укладкою',
    category: 'Hair',
    url: '/images/gallery/gallery_221353.jpg'
  },
  {
    id: 'g_221354',
    title: 'Текстурний низький пучок',
    category: 'Hair',
    url: '/images/gallery/gallery_221354.jpg'
  },
  {
    id: 'g_221355',
    title: 'Макіяж для зйомок',
    category: 'Makeup',
    url: '/images/gallery/gallery_221355.jpg'
  }
];

const DEFAULT_REVIEWS = [
  {
    id: 'r1',
    name: 'Hanna',
    rating: 5,
    text: 'Була тут на манікюрі, все дуже якісно та професійно. Окремо відзначу неймовірний сервіс, дуже турботливе ставлення до клієнтів. На вулиці пішов дощ, а я була без парасольки, і мене провели до найближчого магазину з парасолькою) Перший раз бачу таке ставлення, була в дуже приємному шоці. Дякую 🤍',
    date: '27.05.2026',
    service: 'Манікюр',
    source: 'google',
    googleReviewUrl: 'https://www.google.com/maps/place/%D0%A1%D0%B0%D0%BB%D0%BE%D0%BD+%D0%BA%D1%80%D0%B0%D1%81%D0%B8+%C2%AB%D0%A8%D0%B0%D1%80%D0%BC%C2%BB/@50.388145,30.475476,17z/data=!4m6!3m5!1s0x40d4c8c7f2127265:0xe54d2417ba3f87c2!8m2!3d50.388145!4d30.475476'
  },
  {
    id: 'r2',
    name: 'Svitlana Shaker',
    rating: 5,
    text: 'Випадково потрапила в цей салон — шукала гарного перукаря. Пріоритет також був — недалеко від дому. З перукарем все склалося якнайкраще 😇👍 Ще для мене відкрилися інші несподівані сторони салону Шарм — приємна атмосфера, дуже привітний адміністратор. Я вже стала постійним клієнтом і однозначно рекомендую!',
    date: '15.12.2025',
    service: 'Стрижка та укладка',
    source: 'google',
    googleReviewUrl: 'https://www.google.com/maps/place/%D0%A1%D0%B0%D0%BB%D0%BE%D0%BD+%D0%BA%D1%80%D0%B0%D1%81%D0%B8+%C2%AB%D0%A8%D0%B0%D1%80%D0%BC%C2%BB/@50.388145,30.475476,17z/data=!4m6!3m5!1s0x40d4c8c7f2127265:0xe54d2417ba3f87c2!8m2!3d50.388145!4d30.475476'
  },
  {
    id: 'r3',
    name: 'Влада',
    rating: 5,
    text: 'Обожнюю цей салон! Вже давно ходжу сюди — фарбування, лазер, макіяж, укладки — все завжди ідеально. Майстри дуже дбайливо ставляться до клієнтів, відчувається, що їм важливо, щоб ти пішла задоволеною. Атмосфера затишна, дівчата завжди з посмішкою, і результат 🔥 кожного разу!',
    date: '12.11.2025',
    service: 'Складне фарбування',
    source: 'google',
    googleReviewUrl: 'https://www.google.com/maps/place/%D0%A1%D0%B0%D0%BB%D0%BE%D0%BD+%D0%BA%D1%80%D0%B0%D1%81%D0%B8+%C2%AB%D0%A8%D0%B0%D1%80%D0%BC%C2%BB/@50.388145,30.475476,17z/data=!4m6!3m5!1s0x40d4c8c7f2127265:0xe54d2417ba3f87c2!8m2!3d50.388145!4d30.475476'
  },
  {
    id: 'r4',
    name: 'Ольга Лук\'янова',
    rating: 5,
    text: 'Сподобався салон, дуже затишний і стильний) Прийшла на лазерну епіляцію, залишилась задоволена результатом. Новий лазер і абсолютно безболісно все пройшло. Класний косметолог, дуже уважна та акуратна. Обов\'язково прийду ще.',
    date: '03.06.2025',
    service: 'Лазерна епіляція',
    source: 'google',
    googleReviewUrl: 'https://www.google.com/maps/place/%D0%A1%D0%B0%D0%BB%D0%BE%D0%BD+%D0%BA%D1%80%D0%B0%D1%81%D0%B8+%C2%AB%D0%A8%D0%B0%D1%80%D0%BC%C2%BB/@50.388145,30.475476,17z/data=!4m6!3m5!1s0x40d4c8c7f2127265:0xe54d2417ba3f87c2!8m2!3d50.388145!4d30.475476'
  },
  {
    id: 'r5',
    name: 'Людмила Кібкало',
    rating: 5,
    text: 'Відмінний салон! Смачна кава, дуже привітні адміністратори. Манікюр зробили швидко та якісно. Обов\'язково прийду ще. Рекомендую всім 😄👍',
    date: '15.05.2025',
    service: 'Комплекс манікюру',
    source: 'google',
    googleReviewUrl: 'https://www.google.com/maps/place/%D0%A1%D0%B0%D0%BB%D0%BE%D0%BD+%D0%BA%D1%80%D0%B0%D1%81%D0%B8+%C2%AB%D0%A8%D0%B0%D1%80%D0%BC%C2%BB/@50.388145,30.475476,17z/data=!4m6!3m5!1s0x40d4c8c7f2127265:0xe54d2417ba3f87c2!8m2!3d50.388145!4d30.475476'
  }
];

const DEFAULT_HERO = {
  title: 'Шарм Beauty Salon',
  tagline: 'Ваш особистий простір краси та витонченості у Києві',
  description: 'Поєднуємо передові технології догляду, преміальну косметику люкс-сегменту та високу майстерність фахівців для створення вашого бездоганного образу.',
  bgImage: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=1920&q=80',
  bgMediaType: 'image',
  bgVideo: 'https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-a-woman-getting-hair-cut-in-a-salon-42202-large.mp4'
};

const DEFAULT_ABOUT = {
  image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80',
  imagePosition: 'center',
  mediaType: 'video',
  videoUrl: '/videos/about.mp4',
  subtitle: 'Наш простір',
  title: 'Про Шарм Beauty Salon',
  textLead: 'Шарм Beauty Salon Kyiv — це преміальний салон краси у столиці, створений для тих, хто цінує бездоганну якість та винятковий сервіс.',
  textMain: 'Ми пропонуємо індивідуальний підхід до кожного клієнта, створюючи цілісні образи, що підкреслюють вашу природну красу та індивідуальність. Наша команда складається з топ-стилістів, дипломованих нейл-майстрів та сертифікованих косметологів, які постійно вдосконалюють свої навички та володіють передовими світовими техніками б\'ютьі-індустрії.',
  years: '10+',
  yearsText: 'Років краси',
  features: [
    { id: 'f1', title: 'Сертифіковані майстри', desc: 'Усі фахівці пройшли міжнародне навчання та мають багаторічний досвід.' },
    { id: 'f2', title: 'Люкс матеріали', desc: 'Працюємо виключно на професійних брендах преміум-сегменту.' },
    { id: 'f3', title: 'Комфорт та турбота', desc: 'Затишна атмосфера, вишукана кава та повний релакс під час будь-якої процедури.' },
    { id: 'f4', title: 'Комплексний підхід', desc: 'Можливість виконання процедур у 4 руки для максимальної економії вашого часу.' }
  ]
};

const DEFAULT_BLOCK_SETTINGS = {
  servicesTitle: 'Послуги та ціни',
  galleryTitle: 'Галерея робіт',
  reviewsTitle: 'Відгуки клієнтів',
  reviewsFormTitle: 'Поділіться враженнями',
  reviewsFormSubtitle: 'Ваш відгук допоможе нам ставати кращими!',
  bookingTitle: 'Онлайн-запис',
  bookingInfoTitle: 'Забронюйте час',
  bookingInfoText: 'Оберіть бажану процедуру, зручну дату та час. Наш адміністратор зателефонує вам протягом 15 хвилин для підтвердження візиту.',
  bookingFeatures: [
    { id: 'bf1', title: 'Преміальні матеріали', desc: 'Використовуємо лише ліцензовану косметику люкс сегменту.' },
    { id: 'bf2', title: 'Пунктуальність', desc: 'Ми цінуємо ваш час, тому розпочинаємо візит точно у заплановану годину.' },
    { id: 'bf3', title: 'Зручне скасування', desc: 'Ви можете скасувати або перенести запис у телефонному режимі.' }
  ]
};

const DEFAULT_BOOKINGS = [
  {
    id: 'b1',
    clientName: 'Ірина Мельник',
    clientPhone: '+38 (097) 111-2233',
    serviceId: 's3',
    serviceName: 'Комплекс: Манікюр з покриттям Gelish',
    date: '2026-06-20',
    time: '14:00',
    status: 'confirmed',
    clientComment: 'Бажано до майстра Олени',
    createdAt: '2026-06-17T12:00:00.000Z'
  },
  {
    id: 'b2',
    clientName: 'Анна Бойко',
    clientPhone: '+38 (050) 444-5566',
    serviceId: 's1',
    serviceName: 'Жіноча стрижка та укладка',
    date: '2026-06-21',
    time: '11:30',
    status: 'new',
    clientComment: '',
    createdAt: '2026-06-17T15:30:00.000Z'
  }
];

const sortReviewsByDate = (list) => {
  const getReviewDateObj = (review) => {
    if (review.createdAt) {
      const parsed = new Date(review.createdAt);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    if (review.date) {
      const parts = review.date.split('.');
      if (parts.length === 3) {
        // DD.MM.YYYY
        const parsed = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        if (!isNaN(parsed.getTime())) return parsed;
      }
    }
    // Fallback to id timestamp
    if (review.id && review.id.startsWith('r_')) {
      const t = Number(review.id.replace('r_', ''));
      if (!isNaN(t)) return new Date(t);
    }
    return new Date(0);
  };

  return [...list].sort((a, b) => getReviewDateObj(b) - getReviewDateObj(a));
};

export const SalonProvider = ({ children }) => {
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('charme_services');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: If the saved list is the old default (length < 20 or first ID starts with 's' and not 's_bk_')
        // we overwrite it with the new services list to ensure they get the 341 services.
        const isOldDefault = parsed.length < 20 || (parsed.length > 0 && (parsed[0].id === 's1' || !parsed[0].id.includes('_bk_')));
        if (isOldDefault) {
          localStorage.setItem('charme_services', JSON.stringify(DEFAULT_SERVICES));
          return DEFAULT_SERVICES;
        }
        return parsed;
      } catch {
        return DEFAULT_SERVICES;
      }
    }
    return DEFAULT_SERVICES;
  });

  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('charme_contacts');
    const parsed = saved ? JSON.parse(saved) : {};
    return { ...DEFAULT_CONTACTS, ...parsed };
  });

  const [gallery, setGallery] = useState(() => {
    const saved = localStorage.getItem('charme_gallery');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: If the saved gallery is the old default (length < 10 or contains old Unsplash URLs/IDs like 'g1')
        // we overwrite it with the new default gallery to show the real photos of their work.
        const isOldDefault = parsed.length < 10 || (parsed.length > 0 && parsed.some(item => item.id === 'g1' || item.url.includes('unsplash.com') && item.id !== 'g_nails_def' && item.id !== 'g_brows_def'));
        if (isOldDefault) {
          localStorage.setItem('charme_gallery', JSON.stringify(DEFAULT_GALLERY));
          return DEFAULT_GALLERY;
        }
        return parsed;
      } catch {
        return DEFAULT_GALLERY;
      }
    }
    return DEFAULT_GALLERY;
  });

  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('charme_reviews_v2');
    const list = saved ? JSON.parse(saved) : DEFAULT_REVIEWS;
    return sortReviewsByDate(list);
  });

  const [hero, setHero] = useState(() => {
    const saved = localStorage.getItem('charme_hero_v2');
    const parsed = saved ? JSON.parse(saved) : {};
    return { ...DEFAULT_HERO, ...parsed };
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('charme_bookings');
    return saved ? JSON.parse(saved) : DEFAULT_BOOKINGS;
  });

  const [about, setAbout] = useState(() => {
    const saved = localStorage.getItem('charme_about');
    if (!saved) {
      return DEFAULT_ABOUT;
    }
    try {
      const parsed = JSON.parse(saved);
      const isDefaultUrl = !parsed.videoUrl || 
                            parsed.videoUrl === 'https://www.instagram.com/reel/DMe5nErs9gX/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==' ||
                            parsed.videoUrl.includes('instagram.com/reel/DMe5nErs9gX');
      if (parsed.mediaType === 'image' || isDefaultUrl) {
        parsed.mediaType = 'video';
        parsed.videoUrl = '/videos/about.mp4';
      }
      return { ...DEFAULT_ABOUT, ...parsed };
    } catch {
      return DEFAULT_ABOUT;
    }
  });

  const [blockSettings, setBlockSettings] = useState(() => {
    const saved = localStorage.getItem('charme_block_settings');
    const parsed = saved ? JSON.parse(saved) : {};
    return { ...DEFAULT_BLOCK_SETTINGS, ...parsed };
  });

  const [securitySettings, setSecuritySettings] = useState(() => {
    const saved = localStorage.getItem('charme_security_settings');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      adminEmail: 'tsybulin10@gmail.com',
      adminPassword: 'AdminCharme2026',
      admin2faSecret: '', // Will be generated on first login setup
      ...parsed
    };
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('charme_theme');
    if (saved) return saved;
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });

  const [adminTheme, setAdminTheme] = useState(() => {
    const saved = localStorage.getItem('charme_admin_theme');
    if (saved) return saved;
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });

  // Sync state with localstorage on change
  useEffect(() => {
    localStorage.setItem('charme_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('charme_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('charme_gallery', JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem('charme_reviews_v2', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('charme_hero_v2', JSON.stringify(hero));
  }, [hero]);

  useEffect(() => {
    localStorage.setItem('charme_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('charme_about', JSON.stringify(about));
  }, [about]);

  useEffect(() => {
    localStorage.setItem('charme_block_settings', JSON.stringify(blockSettings));
  }, [blockSettings]);

  useEffect(() => {
    localStorage.setItem('charme_security_settings', JSON.stringify(securitySettings));
  }, [securitySettings]);

  useEffect(() => {
    localStorage.setItem('charme_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('charme_admin_theme', adminTheme);
  }, [adminTheme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleAdminTheme = () => {
    setAdminTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Helper actions
  const addBooking = (newBooking) => {
    const booking = {
      ...newBooking,
      id: 'b_' + Date.now(),
      status: 'new',
      clientComment: newBooking.clientComment || '',
      createdAt: new Date().toISOString()
    };
    setBookings(prev => [booking, ...prev]);

    // Send Telegram Notification for new booking
    const formattedCreated = formatCreatedDate(booking.createdAt);
    const priceText = booking.servicePrice ? ` (${booking.servicePrice} ₴)` : '';
    const message = `🔔 <b>Нове замовлення на сайті!</b>\n\n` +
      `👤 <b>Клієнт:</b> ${booking.clientName}\n` +
      `📞 <b>Телефон:</b> ${booking.clientPhone}\n` +
      `💇 <b>Послуга:</b> ${booking.serviceName}${priceText}\n` +
      `📅 <b>Дата візиту:</b> ${booking.date}\n` +
      `⏰ <b>Час візиту:</b> ${booking.time}\n` +
      `💬 <b>Коментар:</b> ${booking.clientComment || 'Немає'}\n\n` +
      `📩 <b>Створено:</b> ${formattedCreated}`;
    
    sendTelegramMessage(message);
  };

  const updateBookingStatus = (id, newStatus) => {
    const booking = bookings.find(b => b.id === id);
    if (booking && booking.status !== newStatus) {
      const oldStatus = booking.status;
      const oldLabel = getStatusLabelUa(oldStatus);
      const newLabel = getStatusLabelUa(newStatus);
      
      // Look up current service price if it's missing from the booking object
      const servicePrice = booking.servicePrice || (services.find(s => s.id === booking.serviceId)?.price) || '';
      const priceText = servicePrice ? ` (${servicePrice} ₴)` : '';
      const formattedCreated = formatCreatedDate(booking.createdAt);

      const message = `🔄 <b>Статус заявки змінено!</b>\n\n` +
        `👤 <b>Клієнт:</b> ${booking.clientName}\n` +
        `📞 <b>Телефон:</b> ${booking.clientPhone}\n` +
        `💇 <b>Послуга:</b> ${booking.serviceName}${priceText}\n` +
        `📅 <b>Дата візиту:</b> ${booking.date}\n` +
        `⏰ <b>Час візиту:</b> ${booking.time}\n` +
        `📩 <b>Створено:</b> ${formattedCreated}\n\n` +
        `⚠️ <b>Зміна статусу:</b> з "<code>${oldLabel}</code>" на "<code>${newLabel}</code>"`;

      sendTelegramMessage(message);
    }

    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const deleteBooking = (id) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  const updateContacts = (newContacts) => {
    setContacts(newContacts);
  };

  const updateHero = (newHero) => {
    setHero(newHero);
  };

  const updateAbout = (newAbout) => {
    setAbout(newAbout);
  };

  const updateBlockSettings = (newSettings) => {
    setBlockSettings(newSettings);
  };

  const updateSecuritySettings = (newSettings) => {
    setSecuritySettings(prev => ({ ...prev, ...newSettings }));
  };

  // Services actions
  const addService = (newService) => {
    const service = {
      ...newService,
      id: 's_' + Date.now()
    };
    setServices(prev => [...prev, service]);
  };

  const updateService = (id, updatedService) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updatedService } : s));
  };

  const deleteService = (id) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // Gallery actions
  const addGalleryItem = (newItem) => {
    const item = {
      ...newItem,
      id: 'g_' + Date.now()
    };
    setGallery(prev => [item, ...prev]);
  };

  const updateGalleryItem = (id, updatedItem) => {
    setGallery(prev => prev.map(g => g.id === id ? { ...g, ...updatedItem } : g));
  };

  const deleteGalleryItem = (id) => {
    setGallery(prev => prev.filter(g => g.id !== id));
  };

  // Reviews actions
  const addReview = (newReview) => {
    const review = {
      ...newReview,
      id: 'r_' + Date.now(),
      date: newReview.date || new Date().toLocaleDateString('uk-UA'),
      createdAt: newReview.createdAt || new Date().toISOString()
    };
    setReviews(prev => {
      const newList = [review, ...prev];
      return sortReviewsByDate(newList);
    });
  };

  const updateReview = (id, updatedReview) => {
    setReviews(prev => {
      const newList = prev.map(r => r.id === id ? { ...r, ...updatedReview } : r);
      return sortReviewsByDate(newList);
    });
  };

  const deleteReview = (id) => {
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const moveReview = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === reviews.length - 1) return;
    const newReviews = [...reviews];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newReviews[index];
    newReviews[index] = newReviews[targetIndex];
    newReviews[targetIndex] = temp;
    setReviews(newReviews);
  };

  const resetAllData = () => {
    setServices(DEFAULT_SERVICES);
    setContacts(DEFAULT_CONTACTS);
    setGallery(DEFAULT_GALLERY);
    setReviews(DEFAULT_REVIEWS);
    setHero(DEFAULT_HERO);
    setBookings(DEFAULT_BOOKINGS);
    setAbout(DEFAULT_ABOUT);
    setBlockSettings(DEFAULT_BLOCK_SETTINGS);
    setSecuritySettings({
      adminEmail: 'tsybulin10@gmail.com',
      adminPassword: 'AdminCharme2026',
      admin2faSecret: ''
    });
  };

  return (
    <SalonContext.Provider
      value={{
        services,
        contacts,
        gallery,
        reviews,
        hero,
        about,
        blockSettings,
        securitySettings,
        bookings,
        theme,
        toggleTheme,
        adminTheme,
        toggleAdminTheme,
        addBooking,
        updateBookingStatus,
        deleteBooking,
        updateContacts,
        updateHero,
        updateAbout,
        updateBlockSettings,
        addService,
        updateService,
        deleteService,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        addReview,
        updateReview,
        deleteReview,
        moveReview,
        updateSecuritySettings,
        resetAllData
      }}
    >
      {children}
    </SalonContext.Provider>
  );
};
