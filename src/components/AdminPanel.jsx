import { useState, useContext } from 'react';
import { SalonContext } from '../context/SalonContext';
import CustomSelect from './CustomSelect';
import { 
  Calendar, Scissors, Image as ImageIcon, Phone, Home, 
  RotateCcw, Trash2, Edit, Plus, Check, FileText, CheckCircle, 
  XCircle, Save, AlertCircle, Star, MessageSquare, Sliders, Info,
  Lock, Upload, Link, Sparkles, X, ArrowUp, ArrowDown
} from 'lucide-react';
import './AdminPanel.css';
import { verifyTOTP } from '../lib/totp';

// Transliteration helper for Ukrainian characters to build slugs
const transliteUaToEn = (text) => {
  const map = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh', 'з': 'z',
    'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
    'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ь': '', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G', 'Д': 'D', 'Е': 'E', 'Є': 'Ye', 'Ж': 'Zh', 'З': 'Z',
    'И': 'Y', 'І': 'I', 'Ї': 'Yi', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P',
    'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
    'Ь': '', 'Ю': 'Yu', 'Я': 'Ya'
  };
  return text.split('').map(char => map[char] || char).join('');
};

const slugify = (text) => {
  return transliteUaToEn(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
};
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

// Image compression helper using Canvas
const compressImage = (file, maxWidth, maxHeight, quality = 0.7) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(null);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

// Parse relative English/Russian/Ukrainian date strings into YYYY-MM-DD format
const getAbsoluteDateFromRelative = (dateStr) => {
  const s = dateStr.toLowerCase().trim();
  let offsetDays = 0;
  
  if (s.includes('week') || s.includes('тиж') || s.includes('недел')) {
    const match = s.match(/(\d+)/);
    offsetDays = match ? parseInt(match[1], 10) * 7 : 7;
  } else if (s.includes('month') || s.includes('міс') || s.includes('месяц')) {
    const match = s.match(/(\d+)/);
    offsetDays = match ? parseInt(match[1], 10) * 30 : 30;
  } else if (s.includes('year') || s.includes('рік') || s.includes('рок') || s.includes('год')) {
    const match = s.match(/(\d+)/);
    offsetDays = match ? parseInt(match[1], 10) * 365 : 365;
  } else if (s.includes('day') || s.includes('день') || s.includes('дн') || s.includes('назад') || s.includes('тому')) {
    const match = s.match(/(\d+)/);
    offsetDays = match ? parseInt(match[1], 10) : 1;
  }
  
  const targetDate = new Date(Date.now() - offsetDays * 24 * 60 * 60 * 1000);
  
  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dd = String(targetDate.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Convert DD.MM.YYYY or relative date strings to YYYY-MM-DD
const parseInputDateToYYYYMMDD = (dateStr) => {
  if (!dateStr) return '';
  const clean = dateStr.trim();
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }
  
  const absMatch = clean.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (absMatch) {
    const dd = String(absMatch[1]).padStart(2, '0');
    const mm = String(absMatch[2]).padStart(2, '0');
    const yyyy = absMatch[3];
    return `${yyyy}-${mm}-${dd}`;
  }
  
  return getAbsoluteDateFromRelative(clean);
};

// Parse copied review text block from Google Maps
const parseGoogleReview = (text) => {
  if (!text) return null;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  const name = lines[0];
  let rating = 5;
  let date = '';
  let price = '';
  let servicesList = [];
  const textLines = [];

  let totalSymbolCount = 0;
  let hasSetRating = false;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();

    // Check if services line
    if (['услуги', 'послуги', 'services'].includes(lineLower)) {
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        servicesList = nextLine.split(',').map(s => s.trim()).filter(Boolean);
        i++; // skip next line containing the services
      }
      continue;
    }

    // Check if footer metadata -> stop parsing rest of lines
    const isFooter = ['цена', 'ціна', 'price'].includes(lineLower) ||
                     lineLower.startsWith('посмотреть перевод') ||
                     lineLower.startsWith('переглянути переклад') ||
                     lineLower.startsWith('see translation');
    if (isFooter) {
      break;
    }

    // Check if metadata badge/info
    const isMetadata = lineLower.includes('local guide') ||
                       lineLower.includes('reviews') ||
                       lineLower.includes('photos') ||
                       lineLower.includes('відгук') ||
                       lineLower.includes('фото') ||
                       lineLower.includes('отзыв') ||
                       lineLower.includes('експерт') ||
                       lineLower.includes('эксперт') ||
                       ['новый', 'новое', 'новий', 'нове', 'new', 'новинка'].includes(lineLower) ||
                       /^\d+\s+(відгук|фото|отзыв|review|photo)/i.test(line);
    if (isMetadata) {
      continue;
    }

    // Check if line consists ENTIRELY of symbols/bars/stars and spaces
    const isSymbolOrBarLine = /^[|\s\u2500-\u257F\u2580-\u259F\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF⭐⭐️🌟✨★☆]+$/.test(line);
    if (isSymbolOrBarLine) {
      // Count how many symbol characters are in the line
      const symbolCount = (line.match(/[|\u2500-\u257F\u2580-\u259F\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF⭐⭐️🌟✨★☆]/g) || []).length;
      if (symbolCount > 0) {
        totalSymbolCount += symbolCount;
        hasSetRating = true;
      }
      continue;
    }

    if (/^[1-5]\/[1-5]$/.test(line)) {
      rating = parseInt(line[0]);
      hasSetRating = false;
      continue;
    }

    // Check if date line
    const isDate = lineLower.includes('ago') ||
                   lineLower.includes('тому') ||
                   lineLower.includes('назад') ||
                   /\d{2}\.\d{2}\.\d{4}/.test(line) ||
                   lineLower.includes('week') ||
                   lineLower.includes('month') ||
                   lineLower.includes('year') ||
                   lineLower.includes('day') ||
                   lineLower.includes('тиж') ||
                   lineLower.includes('міс') ||
                   lineLower.includes('рік') ||
                   lineLower.includes('день') ||
                   lineLower.includes('дн');
    if (isDate && !date) {
      // If the date line has symbols/bars (e.g. "⭐⭐⭐⭐⭐ неделю назад"), extract them
      const symbolCountInDate = (line.match(/[|\u2500-\u257F\u2580-\u259F\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF⭐⭐️🌟✨★☆]/g) || []).length;
      if (symbolCountInDate > 0) {
        totalSymbolCount += symbolCountInDate;
        hasSetRating = true;
      }

      const cleanDatePart = line.replace(/[|\u2500-\u257F\u2580-\u259F\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF⭐⭐️🌟✨★☆\s]+/g, ' ').trim();
      if (cleanDatePart) {
        date = parseInputDateToYYYYMMDD(cleanDatePart);
      }
      continue;
    }

    // Check if price line
    const isPrice = /^\d+[\s\d\u2013\u2014-]*\s*(₴|грн|грн\.|\$|€|zł|usd|eur)/i.test(line);
    if (isPrice && !price) {
      price = line;
      continue;
    }

    // Else it's part of the review text
    textLines.push(line);
  }

  // Set rating based on accumulated symbols
  if (hasSetRating && totalSymbolCount > 0) {
    if (totalSymbolCount >= 9) rating = 5;
    else if (totalSymbolCount === 8 || totalSymbolCount === 7) rating = 4;
    else if (totalSymbolCount === 6) rating = 3;
    else if (totalSymbolCount === 5) rating = 5; // fallback
    else if (totalSymbolCount === 4) rating = 2; // or 4
    else if (totalSymbolCount === 3) rating = 3; // fallback
    else if (totalSymbolCount === 2) rating = 1; // or 2
    else rating = 1;
  }

  let reviewText = textLines.join('\n');

  // Clean Google Translate markers
  if (reviewText.includes('(Translated by Google)')) {
    const originalMatch = reviewText.match(/\(Original\)\n?([\s\S]*)/);
    if (originalMatch) {
      reviewText = originalMatch[1].trim();
    } else {
      reviewText = reviewText
        .replace('(Translated by Google)', '')
        .replace('(Original)', '')
        .trim();
    }
  }

  return { name, rating, date, text: reviewText, price, services: servicesList };
};

const AdminPanel = () => {
  const {
    services, contacts, gallery, hero, about, bookings, blockSettings, reviews,
    securitySettings, updateSecuritySettings,
    updateBookingStatus, deleteBooking, updateContacts, updateHero, updateAbout, updateBlockSettings,
    addService, updateService, deleteService, addGalleryItem, updateGalleryItem, deleteGalleryItem,
    addReview, updateReview, deleteReview, moveReview, resetAllData
  } = useContext(SalonContext);

  const [activeTab, setActiveTab] = useState('bookings');

  const scrollToSuccess = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -130; // offset to prevent overlapping by the fixed header
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Security State
  const [securityEmailInput, setSecurityEmailInput] = useState(securitySettings.adminEmail);
  const [securityPasswordInput, setSecurityPasswordInput] = useState('');
  const [securityPasswordConfirm, setSecurityPasswordConfirm] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityError, setSecurityError] = useState('');
  
  // 2FA confirmation states
  const [showSecurity2fa, setShowSecurity2fa] = useState(false);
  const [securityOtpInput, setSecurityOtpInput] = useState('');
  const [securityPendingUpdates, setSecurityPendingUpdates] = useState(null);
  const [security2faError, setSecurity2faError] = useState('');
  
  // Bookings filter
  const [bookingFilter, setBookingFilter] = useState('all');

  // Services State
  const uniqueCategoriesUa = [...new Set(services.map(s => s.categoryUa))].filter(Boolean);

  const [serviceForm, setServiceForm] = useState({
    id: null,
    category: '',
    categoryUa: uniqueCategoriesUa[0] || 'Інше',
    name: '',
    price: '',
    duration: '',
    description: ''
  });
  const [isEditingService, setIsEditingService] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);

  // Search & filter states for admin services list
  const [adminServiceSearch, setAdminServiceSearch] = useState('');
  const [adminServiceCategoryFilter, setAdminServiceCategoryFilter] = useState('all');

  // Gallery State
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    category: 'Hair',
    url: '',
    bgPosition: 'center'
  });
  const [isEditingGallery, setIsEditingGallery] = useState(false);
  const [editingGalleryId, setEditingGalleryId] = useState(null);
  const [galleryImageSource, setGalleryImageSource] = useState('url');

  // Contacts State
  const [contactsForm, setContactsForm] = useState({ ...contacts });
  const [isContactsSaved, setIsContactsSaved] = useState(false);

  // Hero State
  const [heroForm, setHeroForm] = useState({ ...hero });
  const [isHeroSaved, setIsHeroSaved] = useState(false);
  const [heroImageSource, setHeroImageSource] = useState(() => 
    hero.bgImage && hero.bgImage.startsWith('data:image/') ? 'file' : 'url'
  );

  // About State
  const [aboutForm, setAboutForm] = useState({
    subtitle: about.subtitle || '',
    title: about.title || '',
    textLead: about.textLead || '',
    textMain: about.textMain || '',
    years: about.years || '',
    yearsText: about.yearsText || '',
    image: about.image || '',
    imagePosition: about.imagePosition || 'center',
    mediaType: about.mediaType || 'image',
    videoUrl: about.videoUrl || '',
    features: about.features || []
  });
  const [isAboutSaved, setIsAboutSaved] = useState(false);
  const [aboutImageSource, setAboutImageSource] = useState(() => 
    about.image && about.image.startsWith('data:image/') ? 'file' : 'url'
  );

  // About Feature Form State
  const [aboutFeatureForm, setAboutFeatureForm] = useState({
    title: '',
    desc: '',
    icon: 'Award'
  });
  const [isEditingAboutFeature, setIsEditingAboutFeature] = useState(false);
  const [editingAboutFeatureId, setEditingAboutFeatureId] = useState(null);

  // Block settings Form State
  const [blockSettingsForm, setBlockSettingsForm] = useState({ ...blockSettings });
  const [isBlockSettingsSaved, setIsBlockSettingsSaved] = useState(false);

  // Booking Feature Form State
  const [bookingFeatureForm, setBookingFeatureForm] = useState({
    title: '',
    desc: '',
    icon: 'ShieldCheck'
  });
  const [isEditingBookingFeature, setIsEditingBookingFeature] = useState(false);
  const [editingBookingFeatureId, setEditingBookingFeatureId] = useState(null);

  // Reviews Admin State
  const [reviewsForm, setReviewsForm] = useState({
    name: '',
    rating: 5,
    date: '',
    service: '',
    services: [],
    price: '',
    text: '',
    googleReviewUrl: '',
    avatar: '',
    reviewImage: ''
  });
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [isReviewsSaved, setIsReviewsSaved] = useState(false);
  const [fastImportText, setFastImportText] = useState('');
  const [avatarSource, setAvatarSource] = useState('file');
  const [photoSource, setPhotoSource] = useState('file');

  // Bookings filtering
  const filteredBookings = bookings.filter(b => {
    if (bookingFilter === 'all') return true;
    return b.status === bookingFilter;
  });

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'new': return 'status-new';
      case 'confirmed': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      case 'wrong': return 'status-wrong';
      case 'rework': return 'status-rework';
      default: return '';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'new': return 'Новий';
      case 'confirmed': return 'Підтверджено';
      case 'completed': return 'Виконано';
      case 'cancelled': return 'Скасовано';
      case 'wrong': return 'Помилковий status';
      case 'rework': return 'Переробка';
      default: return status;
    }
  };

  const formatCreatedDate = (isoString) => {
    if (!isoString) return 'Невідомо';
    try {
      const d = new Date(isoString);
      const dateStr = d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const timeStr = d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
      return `${dateStr} о ${timeStr}`;
    } catch (e) {
      return 'Невідомо';
    }
  };

  // Service Form Actions
  const handleServiceSubmit = (e) => {
    e.preventDefault();
    const categoryUaClean = serviceForm.categoryUa.trim();
    if (!serviceForm.name || !serviceForm.price || !serviceForm.duration || !categoryUaClean) {
      alert('Будь ласка, заповніть обов\'язкові поля.');
      return;
    }

    const priceNum = Number(serviceForm.price);

    // Sync English category based on Ukrainian name
    let enCat = '';
    const existing = services.find(s => s.categoryUa.toLowerCase() === categoryUaClean.toLowerCase());
    if (existing) {
      enCat = existing.category;
    } else {
      enCat = slugify(categoryUaClean);
    }

    const serviceData = {
      category: enCat,
      categoryUa: categoryUaClean,
      name: serviceForm.name,
      price: priceNum,
      duration: serviceForm.duration,
      description: serviceForm.description
    };

    if (isEditingService) {
      updateService(serviceForm.id, serviceData);
      setIsEditingService(false);
    } else {
      addService(serviceData);
    }

    setServiceForm({
      id: null,
      category: '',
      categoryUa: uniqueCategoriesUa[0] || categoryUaClean || 'Інше',
      name: '',
      price: '',
      duration: '',
      description: ''
    });
    setIsNewCategory(false);
  };

  const handleEditServiceClick = (service) => {
    setServiceForm({
      id: service.id,
      category: service.category,
      categoryUa: service.categoryUa,
      name: service.name,
      price: service.price,
      duration: service.duration,
      description: service.description || ''
    });
    setIsEditingService(true);
    setIsNewCategory(false);
    // Scroll to form
    document.getElementById('service-editor-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelServiceEdit = () => {
    setServiceForm({
      id: null,
      category: '',
      categoryUa: uniqueCategoriesUa[0] || 'Інше',
      name: '',
      price: '',
      duration: '',
      description: ''
    });
    setIsEditingService(false);
    setIsNewCategory(false);
  };

  // Gallery Actions
  const handleGallerySubmit = (e) => {
    e.preventDefault();
    if (!galleryForm.title || !galleryForm.url) {
      alert('Будь ласка, заповніть усі поля.');
      return;
    }

    const itemData = {
      title: galleryForm.title,
      category: galleryForm.category,
      url: galleryForm.url,
      bgPosition: galleryForm.bgPosition || 'center'
    };

    if (isEditingGallery) {
      updateGalleryItem(editingGalleryId, itemData);
      setIsEditingGallery(false);
      setEditingGalleryId(null);
    } else {
      addGalleryItem(itemData);
    }

    setGalleryForm({
      title: '',
      category: 'Hair',
      url: '',
      bgPosition: 'center'
    });
    setGalleryImageSource('url');
  };

  const handleEditGalleryClick = (item) => {
    setGalleryForm({
      title: item.title,
      category: item.category,
      url: item.url || '',
      bgPosition: item.bgPosition || 'center'
    });
    setIsEditingGallery(true);
    setEditingGalleryId(item.id);
    setGalleryImageSource(item.url && item.url.startsWith('data:image/') ? 'file' : 'url');
    // Scroll to form
    document.getElementById('gallery-editor-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelGalleryEdit = () => {
    setGalleryForm({
      title: '',
      category: 'Hair',
      url: '',
      bgPosition: 'center'
    });
    setIsEditingGallery(false);
    setEditingGalleryId(null);
    setGalleryImageSource('url');
  };

  // Contacts Actions
  const handleContactsSubmit = (e) => {
    e.preventDefault();
    updateContacts(contactsForm);
    setIsContactsSaved(true);
    setTimeout(() => setIsContactsSaved(false), 3000);
    scrollToSuccess('contacts-editor-container');
  };

  // Hero Actions
  const handleHeroSubmit = (e) => {
    e.preventDefault();
    updateHero(heroForm);
    setIsHeroSaved(true);
    setTimeout(() => setIsHeroSaved(false), 3000);
    scrollToSuccess('hero-editor-container');
  };

  // About Actions
  const handleAboutSubmit = (e) => {
    e.preventDefault();
    updateAbout(aboutForm);
    setIsAboutSaved(true);
    setTimeout(() => setIsAboutSaved(false), 3000);
    scrollToSuccess('about-editor-container');
  };

  const handleAboutFeatureSubmit = (e) => {
    e.preventDefault();
    if (!aboutFeatureForm.title || !aboutFeatureForm.desc) {
      alert('Будь ласка, заповніть заголовок та опис переваги.');
      return;
    }

    let updatedFeatures;
    if (isEditingAboutFeature) {
      updatedFeatures = aboutForm.features.map(f => 
        f.id === editingAboutFeatureId ? { ...f, title: aboutFeatureForm.title, desc: aboutFeatureForm.desc, icon: aboutFeatureForm.icon } : f
      );
      setIsEditingAboutFeature(false);
      setEditingAboutFeatureId(null);
    } else {
      updatedFeatures = [
        ...aboutForm.features,
        { id: 'f_' + Date.now(), title: aboutFeatureForm.title, desc: aboutFeatureForm.desc, icon: aboutFeatureForm.icon || 'Award' }
      ];
    }

    const newAbout = { ...aboutForm, features: updatedFeatures };
    setAboutForm(newAbout);
    updateAbout(newAbout); // Save directly to context/localStorage
    setAboutFeatureForm({ title: '', desc: '', icon: 'Award' });
  };

  const handleEditAboutFeature = (feature) => {
    setAboutFeatureForm({ 
      title: feature.title, 
      desc: feature.desc,
      icon: feature.icon || 'Award'
    });
    setIsEditingAboutFeature(true);
    setEditingAboutFeatureId(feature.id);
  };

  const handleDeleteAboutFeature = (id) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю перевагу?')) {
      const updatedFeatures = aboutForm.features.filter(f => f.id !== id);
      const newAbout = { ...aboutForm, features: updatedFeatures };
      setAboutForm(newAbout);
      updateAbout(newAbout); // Save directly to context/localStorage
    }
  };

  // Block settings Submit Actions
  const handleBlockSettingsSubmit = (e) => {
    e.preventDefault();
    updateBlockSettings(blockSettingsForm);
    setIsBlockSettingsSaved(true);
    setTimeout(() => setIsBlockSettingsSaved(false), 3000);
    scrollToSuccess('block-settings-editor-container');
  };

  const handleBookingFeatureSubmit = (e) => {
    e.preventDefault();
    if (!bookingFeatureForm.title || !bookingFeatureForm.desc) {
      alert('Будь ласка, введіть заголовок та опис переваги.');
      return;
    }

    let updatedFeatures;
    if (isEditingBookingFeature) {
      updatedFeatures = blockSettingsForm.bookingFeatures.map(f => 
        f.id === editingBookingFeatureId ? { ...f, title: bookingFeatureForm.title, desc: bookingFeatureForm.desc, icon: bookingFeatureForm.icon } : f
      );
      setIsEditingBookingFeature(false);
      setEditingBookingFeatureId(null);
    } else {
      updatedFeatures = [
        ...blockSettingsForm.bookingFeatures,
        { id: 'bf_' + Date.now(), title: bookingFeatureForm.title, desc: bookingFeatureForm.desc, icon: bookingFeatureForm.icon || 'ShieldCheck' }
      ];
    }

    const newSettings = { ...blockSettingsForm, bookingFeatures: updatedFeatures };
    setBlockSettingsForm(newSettings);
    updateBlockSettings(newSettings); // Save directly to context/localStorage
    setBookingFeatureForm({ title: '', desc: '', icon: 'ShieldCheck' });
  };

  const handleEditBookingFeature = (feature) => {
    setBookingFeatureForm({ 
      title: feature.title, 
      desc: feature.desc,
      icon: feature.icon || 'ShieldCheck'
    });
    setIsEditingBookingFeature(true);
    setEditingBookingFeatureId(feature.id);
  };

  const handleDeleteBookingFeature = (id) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю перевагу?')) {
      const updatedFeatures = blockSettingsForm.bookingFeatures.filter(f => f.id !== id);
      const newSettings = { ...blockSettingsForm, bookingFeatures: updatedFeatures };
      setBlockSettingsForm(newSettings);
      updateBlockSettings(newSettings); // Save directly to context/localStorage
    }
  };

  // Reviews Submit Actions
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewsForm.name || !reviewsForm.text) {
      alert('Будь ласка, введіть ім\'я клієнта та текст відгуку.');
      return;
    }

    const ratingNum = Number(reviewsForm.rating);
    let reviewDate = reviewsForm.date;
    let createdAt = new Date().toISOString();
    
    if (reviewDate && reviewDate.includes('-')) {
      const parsedDate = new Date(reviewDate);
      if (!isNaN(parsedDate.getTime())) {
        createdAt = parsedDate.toISOString();
      }
      const parts = reviewDate.split('-'); // [YYYY, MM, DD]
      reviewDate = `${parts[2]}.${parts[1]}.${parts[0]}`; // DD.MM.YYYY
    } else if (!reviewDate) {
      reviewDate = new Date().toLocaleDateString('uk-UA');
    }
    
    const isGoogle = !!reviewsForm.googleReviewUrl || reviewsForm.source === 'google';

    const reviewData = {
      name: reviewsForm.name,
      rating: ratingNum,
      date: reviewDate,
      createdAt: createdAt,
      service: reviewsForm.services && reviewsForm.services.length > 0 ? reviewsForm.services[0] : '',
      services: reviewsForm.services || [],
      price: reviewsForm.price || '',
      text: reviewsForm.text,
      googleReviewUrl: reviewsForm.googleReviewUrl || '',
      avatar: reviewsForm.avatar || '',
      reviewImage: reviewsForm.reviewImage || '',
      source: isGoogle ? 'google' : (reviewsForm.source || '')
    };

    if (isEditingReview) {
      // Find editing review to keep its original createdAt if the date wasn't changed, 
      // or if it changed, use the new one calculated from the form
      const existing = reviews.find(r => r.id === editingReviewId);
      const originalDateString = existing ? existing.date : '';
      if (originalDateString === reviewDate && existing && existing.createdAt) {
        reviewData.createdAt = existing.createdAt;
      }
      
      updateReview(editingReviewId, reviewData);
      setIsEditingReview(false);
      setEditingReviewId(null);
    } else {
      addReview(reviewData);
    }

    setReviewsForm({ 
      name: '', 
      rating: 5, 
      date: '', 
      service: '', 
      services: [],
      price: '',
      text: '',
      googleReviewUrl: '',
      avatar: '',
      reviewImage: ''
    });
    setAvatarSource('file');
    setPhotoSource('file');
    setIsReviewsSaved(true);
    setTimeout(() => setIsReviewsSaved(false), 3000);
    scrollToSuccess('reviews-editor-form');
  };

  const handleEditReviewClick = (review) => {
    setReviewsForm({
      name: review.name,
      rating: review.rating,
      date: parseInputDateToYYYYMMDD(review.date),
      service: review.service || '',
      services: review.services || (review.service ? [review.service] : []),
      price: review.price || '',
      text: review.text,
      googleReviewUrl: review.googleReviewUrl || '',
      avatar: review.avatar || '',
      reviewImage: review.reviewImage || '',
      source: review.source || ''
    });
    setAvatarSource(review.avatar && review.avatar.startsWith('data:image/') ? 'file' : 'url');
    setPhotoSource(review.reviewImage && review.reviewImage.startsWith('data:image/') ? 'file' : 'url');
    setIsEditingReview(true);
    setEditingReviewId(review.id);
    document.getElementById('reviews-editor-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteReviewClick = (id) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей відгук?')) {
      deleteReview(id);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Ви впевнені, що хочете скинути ВСІ дані до початкового стану? Всі нові записи, відгуки та редагування буде втрачено!')) {
      resetAllData();
      // Reload states that are stored locally
      setTimeout(() => {
        setContactsForm({ ...contacts });
        setHeroForm({ ...hero });
        setAboutForm({
          subtitle: about.subtitle || '',
          title: about.title || '',
          textLead: about.textLead || '',
          textMain: about.textMain || '',
          years: about.years || '',
          yearsText: about.yearsText || '',
          image: about.image || '',
          imagePosition: about.imagePosition || 'center',
          mediaType: about.mediaType || 'image',
          videoUrl: about.videoUrl || '',
          features: about.features || []
        });
        setBlockSettingsForm({ ...blockSettings });
        setSecurityEmailInput('tsybulin10@gmail.com');
        alert('Дані успішно скинуто.');
      }, 100);
    }
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    if (!securityEmailInput.trim()) {
      setSecurityError('Email не може бути порожнім.');
      return;
    }

    const emailChanged = securityEmailInput.trim().toLowerCase() !== securitySettings.adminEmail.toLowerCase();
    const passwordChanged = !!securityPasswordInput;

    if (!emailChanged && !passwordChanged) {
      setSecuritySuccess('Змін не виявлено.');
      setTimeout(() => setSecuritySuccess(''), 3000);
      return;
    }

    const updates = { adminEmail: securityEmailInput.trim() };

    if (securityPasswordInput) {
      if (securityPasswordInput.length < 6) {
        setSecurityError('Новий пароль має містити щонайменше 6 символів.');
        return;
      }
      if (securityPasswordInput !== securityPasswordConfirm) {
        setSecurityError('Паролі не співпадають.');
        return;
      }
      updates.adminPassword = securityPasswordInput;
    }

    if (securitySettings.admin2faSecret) {
      setSecurityPendingUpdates(updates);
      setShowSecurity2fa(true);
      setSecurityOtpInput('');
      setSecurity2faError('');
    } else {
      updateSecuritySettings(updates);
      setSecurityPasswordInput('');
      setSecurityPasswordConfirm('');
      setSecuritySuccess('Налаштування безпеки успішно збережено!');
      setTimeout(() => setSecuritySuccess(''), 3000);
      scrollToSuccess('security-editor-container');
    }
  };

  const handleSecurity2faSubmit = async (e) => {
    e.preventDefault();
    setSecurity2faError('');

    if (!securityPendingUpdates) return;

    const isValid = await verifyTOTP(securityOtpInput, securitySettings.admin2faSecret);
    if (isValid) {
      updateSecuritySettings(securityPendingUpdates);
      setSecurityPasswordInput('');
      setSecurityPasswordConfirm('');
      setSecurityOtpInput('');
      setSecurityPendingUpdates(null);
      setShowSecurity2fa(false);
      setSecuritySuccess('Налаштування безпеки успішно збережено!');
      setTimeout(() => setSecuritySuccess(''), 3000);
      scrollToSuccess('security-editor-container');
    } else {
      setSecurity2faError('Невірний або застарілий 2FA-код. Спробуйте ще раз.');
    }
  };

  const handleReset2fa = () => {
    if (window.confirm('Ви впевнені, що хочете скинути налаштування 2FA? При наступному вході потрібно буде відсканувати новий QR-код.')) {
      updateSecuritySettings({ admin2faSecret: '' });
      alert('Двохфакторну автентифікацію (2FA) успешно скинуто. QR-код для нової реєстрації буде згенеровано при наступному вході.');
    }
  };

  const filteredAdminServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(adminServiceSearch.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(adminServiceSearch.toLowerCase()));
    const matchesCategory = adminServiceCategoryFilter === 'all' || s.categoryUa === adminServiceCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="admin-panel container">
      <div className="admin-header">
        <h1 className="admin-title">Панель керування салоном</h1>
        <p className="admin-subtitle">Керуйте замовленнями, цінами, послугами та галереєю</p>
      </div>

      <div className="admin-layout">
        <aside className="admin-sidebar glass-card">
          <nav className="admin-nav">
            <button 
              className={`admin-nav-btn ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar size={18} />
              <span>Записи ({bookings.length})</span>
            </button>
            <button 
              className={`admin-nav-btn ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              <Scissors size={18} />
              <span>Послуги ({services.length})</span>
            </button>
            <button 
              className={`admin-nav-btn ${activeTab === 'gallery' ? 'active' : ''}`}
              onClick={() => setActiveTab('gallery')}
            >
              <ImageIcon size={18} />
              <span>Галерея робіт ({gallery.length})</span>
            </button>
            <button 
              className={`admin-nav-btn ${activeTab === 'hero' ? 'active' : ''}`}
              onClick={() => setActiveTab('hero')}
            >
              <Home size={18} />
              <span>Головна</span>
            </button>
            <button 
              className={`admin-nav-btn ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              <Info size={18} />
              <span>Про нас</span>
            </button>
            <button 
              className={`admin-nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <MessageSquare size={18} />
              <span>Відгуки ({reviews.length})</span>
            </button>
            <button 
              className={`admin-nav-btn ${activeTab === 'contacts' ? 'active' : ''}`}
              onClick={() => setActiveTab('contacts')}
            >
              <Phone size={18} />
              <span>Контакти</span>
            </button>
            <button 
              className={`admin-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Sliders size={18} />
              <span>Інші блоки</span>
            </button>
            <button 
              className={`admin-nav-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Lock size={18} />
              <span>Безпека</span>
            </button>
            <button 
              className={`admin-nav-btn reset-btn`}
              onClick={handleResetData}
            >
              <RotateCcw size={18} />
              <span>Скинути дані</span>
            </button>
          </nav>
        </aside>

        <main className="admin-main-content">
          
          {/* TAB 1: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="admin-tab-content animate-fade-in">
              <div className="tab-header-row">
                <h3>Записи клієнтів</h3>
                <div className="bookings-filters">
                  {['all', 'new', 'confirmed', 'completed', 'cancelled', 'wrong', 'rework'].map(f => (
                    <button 
                      key={f}
                      className={`filter-badge-btn ${bookingFilter === f ? 'active' : ''}`}
                      onClick={() => setBookingFilter(f)}
                    >
                      {f === 'all' ? 'Всі' : getStatusLabel(f)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bookings-list glass-card">
                {filteredBookings.length > 0 ? (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Клієнт</th>
                          <th>Послуга</th>
                          <th>Дата & Час</th>
                          <th>Статус</th>
                          <th style={{ textAlign: 'right' }}>Дії</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map(b => (
                          <tr key={b.id}>
                             <td>
                               <div className="client-info">
                                 <span className="client-name">{b.clientName}</span>
                                 <span className="client-phone">{b.clientPhone}</span>
                                 {b.clientComment && (
                                   <span className="client-comment" style={{ 
                                     display: 'flex',
                                     alignItems: 'flex-start',
                                     gap: '0.25rem',
                                     fontStyle: 'italic', 
                                     fontSize: '0.8rem', 
                                     color: 'var(--color-text-secondary)', 
                                     marginTop: '0.35rem', 
                                     maxWidth: '250px', 
                                     whiteSpace: 'normal', 
                                     borderLeft: '2px solid var(--color-accent-gold)', 
                                     paddingLeft: '0.35rem' 
                                   }}>
                                     <MessageSquare size={12} style={{ color: 'var(--color-accent-gold)', marginTop: '0.15rem', flexShrink: 0 }} />
                                     <span>
                                       <strong style={{ fontWeight: '600', color: 'var(--color-text-muted)', fontStyle: 'normal', marginRight: '0.15rem' }}>Коментар:</strong> "{b.clientComment}"
                                     </span>
                                   </span>
                                 )}
                               </div>
                             </td>
                            <td>
                              <span className="booked-service">{b.serviceName}</span>
                              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-accent-gold)', marginTop: '0.15rem', fontWeight: '500' }}>
                                {b.servicePrice || (services.find(s => s.id === b.serviceId)?.price) || '--'} ₴
                              </span>
                            </td>
                            <td>
                              <div className="booking-datetime">
                                <span>{b.date}</span>
                                <span className="booking-time">{b.time}</span>
                                {b.createdAt && (
                                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }} title="Дата і час створення заявки">
                                    Створено: {formatCreatedDate(b.createdAt)}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge ${getStatusBadgeClass(b.status)}`}>
                                {getStatusLabel(b.status)}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="action-buttons-group">
                                {b.status === 'new' && (
                                  <button 
                                    className="action-icon-btn check-btn"
                                    onClick={() => updateBookingStatus(b.id, 'confirmed')}
                                    title="Підтвердити візит"
                                  >
                                    <Check size={16} />
                                  </button>
                                )}
                                {b.status === 'confirmed' && (
                                  <button 
                                    className="action-icon-btn complete-btn"
                                    onClick={() => updateBookingStatus(b.id, 'completed')}
                                    title="Завершити візит"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                )}
                                {b.status === 'completed' && (
                                  <>
                                    <button 
                                      className="action-icon-btn cancel-visit-btn"
                                      onClick={() => updateBookingStatus(b.id, 'cancelled')}
                                      title="Скасувати візит"
                                    >
                                      <XCircle size={16} />
                                    </button>
                                    <button 
                                      className="action-icon-btn wrong-btn"
                                      onClick={() => updateBookingStatus(b.id, 'wrong')}
                                      title="Помилковий статус"
                                    >
                                      <AlertCircle size={16} />
                                    </button>
                                    <button 
                                      className="action-icon-btn rework-btn"
                                      onClick={() => updateBookingStatus(b.id, 'rework')}
                                      title="Переробка"
                                    >
                                      <RotateCcw size={16} />
                                    </button>
                                  </>
                                )}
                                {b.status === 'rework' && (
                                  <>
                                    <button 
                                      className="action-icon-btn complete-btn"
                                      onClick={() => updateBookingStatus(b.id, 'completed')}
                                      title="Завершити візит"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                    <button 
                                      className="action-icon-btn cancel-visit-btn"
                                      onClick={() => updateBookingStatus(b.id, 'cancelled')}
                                      title="Скасувати візит"
                                    >
                                      <XCircle size={16} />
                                    </button>
                                  </>
                                )}
                                {(b.status !== 'completed' && b.status !== 'cancelled' && b.status !== 'wrong' && b.status !== 'rework') && (
                                  <button 
                                    className="action-icon-btn cancel-visit-btn"
                                    onClick={() => updateBookingStatus(b.id, 'cancelled')}
                                    title="Скасувати візит"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                )}
                                {(b.status === 'wrong' || b.status === 'cancelled') && (
                                  <button 
                                    className="action-icon-btn check-btn"
                                    onClick={() => updateBookingStatus(b.id, 'new')}
                                    title="Відновити (Новий)"
                                  >
                                    <RotateCcw size={16} />
                                  </button>
                                )}
                                <button 
                                  className="action-icon-btn delete-btn"
                                  onClick={() => {
                                    if(window.confirm('Ви впевнені, що хочете видалити цей запис?')) {
                                      deleteBooking(b.id);
                                    }
                                  }}
                                  title="Видалити запис"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">
                    <FileText size={48} />
                    <p>Немає записів за вказаним фільтром.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SERVICES */}
          {activeTab === 'services' && (
            <div className="admin-tab-content animate-fade-in">
              <div className="admin-section-grid">
                
                {/* Services List */}
                <div className="services-admin-list glass-card">
                  <h3>Послуги салону ({filteredAdminServices.length})</h3>
                  
                  {/* Search and Filter Panel */}
                  <div className="admin-services-filter-panel" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem', flexDirection: 'column' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Пошук за назвою або описом..."
                      value={adminServiceSearch}
                      onChange={(e) => setAdminServiceSearch(e.target.value)}
                    />
                    <select
                      className="form-control"
                      value={adminServiceCategoryFilter}
                      onChange={(e) => setAdminServiceCategoryFilter(e.target.value)}
                    >
                      <option value="all">Всі категорії</option>
                      {uniqueCategoriesUa.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="services-admin-scroll">
                    {filteredAdminServices.length > 0 ? (
                      filteredAdminServices.map(s => (
                        <div key={s.id} className="service-admin-item">
                          <div className="service-admin-info">
                            <span className="service-admin-category">{s.categoryUa}</span>
                            <h4 className="service-admin-name">{s.name}</h4>
                            <p className="service-admin-meta">{s.duration} • <strong>{s.price} ₴</strong></p>
                          </div>
                          <div className="service-admin-actions">
                            <button 
                              className="action-icon-btn edit-btn"
                              onClick={() => handleEditServiceClick(s)}
                              title="Редагувати послугу"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="action-icon-btn delete-btn"
                              onClick={() => {
                                if(window.confirm(`Видалити послугу "${s.name}"?`)) {
                                  deleteService(s.id);
                                }
                              }}
                              title="Видалити послугу"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem 0' }}>
                        Нічого не знайдено
                      </p>
                    )}
                  </div>
                </div>

                {/* Add/Edit Form */}
                <div id="service-editor-form" className="service-editor-container glass-card">
                  <h3>{isEditingService ? 'Редагувати послугу' : 'Додати послугу'}</h3>
                  <form onSubmit={handleServiceSubmit} className="admin-form">
                    <div className="form-group">
                      <label className="form-label">Категорія (укр)</label>
                      <select
                        name="categoryUa"
                        className="form-control"
                        value={isNewCategory ? 'NEW_CATEGORY' : serviceForm.categoryUa}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'NEW_CATEGORY') {
                            setIsNewCategory(true);
                            setServiceForm(prev => ({ ...prev, categoryUa: '' }));
                          } else {
                            setIsNewCategory(false);
                            setServiceForm(prev => ({ ...prev, categoryUa: val }));
                          }
                        }}
                      >
                        {uniqueCategoriesUa.map((cat, idx) => (
                          <option key={idx} value={cat}>{cat}</option>
                        ))}
                        <option value="NEW_CATEGORY">Додати нову категорію...</option>
                      </select>
                      {isNewCategory && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Введіть назву нової категорії..."
                            value={serviceForm.categoryUa}
                            onChange={(e) => setServiceForm(prev => ({ ...prev, categoryUa: e.target.value }))}
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Назва послуги *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Наприклад: Манікюр комбінований"
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">Ціна (₴) *</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="750"
                          value={serviceForm.price}
                          onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Тривалість *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="90 хв"
                          value={serviceForm.duration}
                          onChange={(e) => setServiceForm({...serviceForm, duration: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Опис послуги</label>
                      <textarea
                        className="form-control"
                        placeholder="Короткий опис процедури..."
                        rows="3"
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                      ></textarea>
                    </div>

                    <div className="form-actions-row">
                      {isEditingService && (
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={handleCancelServiceEdit}
                          style={{ padding: '0.6rem 1.2rem' }}
                        >
                          Скасувати
                        </button>
                      )}
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        style={{ padding: '0.6rem 1.2rem', marginLeft: 'auto' }}
                      >
                        {isEditingService ? 'Зберегти зміни' : 'Додати послугу'}
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: GALLERY */}
          {activeTab === 'gallery' && (
            <div className="admin-tab-content animate-fade-in">
              <div className="admin-section-grid">
                
                {/* Gallery Items Grid */}
                <div className="gallery-admin-container glass-card">
                  <h3>Роботи в галереї</h3>
                  <div className="gallery-admin-scroll">
                    <div className="gallery-admin-grid">
                      {gallery.map(item => (
                        <div key={item.id} className="gallery-admin-card">
                          <img src={item.url} alt={item.title} className="gallery-admin-img" style={{ objectPosition: item.bgPosition || 'center' }} />
                          <div className="gallery-admin-meta">
                            <h5>{item.title}</h5>
                            <span>{item.category}</span>
                            <button 
                              className="action-icon-btn edit-btn absolute-edit"
                              onClick={() => handleEditGalleryClick(item)}
                              title="Редагувати зображення"
                              style={{
                                position: 'absolute',
                                top: '5px',
                                right: '34px',
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                color: 'var(--color-accent-gold)',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Edit size={12} />
                            </button>
                            <button 
                              className="action-icon-btn delete-btn absolute-delete"
                              onClick={() => {
                                if(window.confirm('Видалити це зображення з галереї?')) {
                                  deleteGalleryItem(item.id);
                                }
                              }}
                              title="Видалити зображення"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add Photo Form */}
                <div id="gallery-editor-form" className="gallery-editor-container glass-card">
                  <h3>{isEditingGallery ? 'Редагувати фото в галереї' : 'Додати фото в галерею'}</h3>
                  <form onSubmit={handleGallerySubmit} className="admin-form">
                    <div className="form-group">
                      <label className="form-label">Назва роботи *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Наприклад: Вечірній макіяж люкс"
                        value={galleryForm.title}
                        onChange={(e) => setGalleryForm({...galleryForm, title: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Категорія</label>
                      <select
                        name="category"
                        className="form-control"
                        value={galleryForm.category}
                        onChange={(e) => setGalleryForm({...galleryForm, category: e.target.value})}
                      >
                        <option value="Hair">Волосся</option>
                        <option value="Nails">Нігті</option>
                        <option value="Cosmetology">Косметологія</option>
                        <option value="Brows">Брови та Вії</option>
                        <option value="Makeup">Макіяж</option>
                        <option value="Interior">Інтер'єр</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Джерело зображення</label>
                      <div className="image-source-toggle" style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                          <input 
                            type="radio" 
                            name="galleryImageSource" 
                            checked={galleryImageSource === 'url'} 
                            onChange={() => setGalleryImageSource('url')} 
                          />
                          <span>Вказати URL</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                          <input 
                            type="radio" 
                            name="galleryImageSource" 
                            checked={galleryImageSource === 'file'} 
                            onChange={() => setGalleryImageSource('file')} 
                          />
                          <span>Завантажити з комп'ютера</span>
                        </label>
                      </div>

                      {galleryImageSource === 'url' ? (
                        <input
                          type="text"
                          className="form-control"
                          placeholder="https://images.unsplash.com/..."
                          value={galleryForm.url}
                          onChange={(e) => setGalleryForm({...galleryForm, url: e.target.value})}
                          required={galleryImageSource === 'url'}
                        />
                      ) : (
                        <div className="file-upload-wrapper">
                          <input
                            type="file"
                            accept="image/*"
                            className="form-control"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setGalleryForm({...galleryForm, url: reader.result});
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            required={galleryImageSource === 'file' && !galleryForm.url}
                          />
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Позиціонування / область фокусу фото</label>
                      <select
                        className="form-control"
                        value={galleryForm.bgPosition || 'center'}
                        onChange={(e) => setGalleryForm({...galleryForm, bgPosition: e.target.value})}
                      >
                        <option value="center">По центру (Center)</option>
                        <option value="top">Зверху (Top)</option>
                        <option value="bottom">Знизу (Bottom)</option>
                        <option value="left">Зліва (Left)</option>
                        <option value="right">Справа (Right)</option>
                      </select>
                    </div>

                    {galleryForm.url && (
                      <div className="image-preview-container">
                        <label className="form-label">Попередній перегляд</label>
                        <img 
                          src={galleryForm.url} 
                          alt="Preview" 
                          className="preview-img" 
                          style={{ objectPosition: galleryForm.bgPosition || 'center' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        style={{ padding: '0.6rem 1.2rem', width: '100%', marginTop: '1rem' }}
                      >
                        {isEditingGallery ? <Save size={16} /> : <Plus size={16} />}
                        {isEditingGallery ? 'Зберегти зміни' : 'Додати роботу'}
                      </button>
                      {isEditingGallery && (
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={handleCancelGalleryEdit}
                          style={{ padding: '0.6rem 1.2rem', width: '100%' }}
                        >
                          Скасувати
                        </button>
                      )}
                    </div>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="admin-tab-content animate-fade-in">
              <div id="contacts-editor-container" className="contacts-editor-container glass-card" style={{ maxWidth: '700px' }}>
                <div className="form-header-row">
                  <h3>Контактна інформація салону</h3>
                  {isContactsSaved && (
                    <span className="save-success-badge">
                      <Save size={14} /> Збережено
                    </span>
                  )}
                </div>
                
                <form onSubmit={handleContactsSubmit} className="admin-form">
                  <div className="form-group">
                    <label className="form-label">Заголовок секції *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={contactsForm.title || ''}
                      onChange={(e) => setContactsForm({...contactsForm, title: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Заголовок блоку опису *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={contactsForm.infoTitle || ''}
                      onChange={(e) => setContactsForm({...contactsForm, infoTitle: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Опис локації / блок тексту *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={contactsForm.infoText || ''}
                      onChange={(e) => setContactsForm({...contactsForm, infoText: e.target.value})}
                      required
                    ></textarea>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Телефон 1 *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={contactsForm.phone1}
                        onChange={(e) => setContactsForm({...contactsForm, phone1: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Телефон 2</label>
                      <input
                        type="text"
                        className="form-control"
                        value={contactsForm.phone2 || ''}
                        onChange={(e) => setContactsForm({...contactsForm, phone2: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Адреса салону *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={contactsForm.address}
                      onChange={(e) => setContactsForm({...contactsForm, address: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Електронна пошта *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={contactsForm.email}
                      onChange={(e) => setContactsForm({...contactsForm, email: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Робочі години (Будні) *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={contactsForm.workingHoursWeekday}
                        onChange={(e) => setContactsForm({...contactsForm, workingHoursWeekday: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Робочі години (Вихідні)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={contactsForm.workingHoursWeekend || ''}
                        onChange={(e) => setContactsForm({...contactsForm, workingHoursWeekend: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Акаунт Instagram (без @)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={contactsForm.instagram}
                      onChange={(e) => setContactsForm({...contactsForm, instagram: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Google Maps Embed URL (src значення iframe)</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={contactsForm.googleMapsEmbed}
                      onChange={(e) => setContactsForm({...contactsForm, googleMapsEmbed: e.target.value})}
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 2rem', marginTop: '1.5rem' }}
                  >
                    Зберегти контакти
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: HERO */}
          {activeTab === 'hero' && (
            <div className="admin-tab-content animate-fade-in">
              <div id="hero-editor-container" className="hero-editor-container glass-card" style={{ maxWidth: '700px' }}>
                <div className="form-header-row">
                  <h3>Контент головного блоку (Hero)</h3>
                  {isHeroSaved && (
                    <span className="save-success-badge">
                      <Save size={14} /> Збережено
                    </span>
                  )}
                </div>

                <form onSubmit={handleHeroSubmit} className="admin-form">
                  <div className="form-group">
                    <label className="form-label">Назва салону / Заголовок *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={heroForm.title}
                      onChange={(e) => setHeroForm({...heroForm, title: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Короткий слоган *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={heroForm.tagline}
                      onChange={(e) => setHeroForm({...heroForm, tagline: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Опис салону *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={heroForm.description}
                      onChange={(e) => setHeroForm({...heroForm, description: e.target.value})}
                      required
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Тип фонового медіа</label>
                    <select
                      className="form-control"
                      value={heroForm.bgMediaType || 'image'}
                      onChange={(e) => setHeroForm({...heroForm, bgMediaType: e.target.value})}
                    >
                      <option value="image">Зображення (Image)</option>
                      <option value="video">Відео (Direct MP4 / YouTube)</option>
                    </select>
                  </div>

                  {heroForm.bgMediaType === 'video' ? (
                    <div className="form-group">
                      <label className="form-label">Посилання на відео (MP4 або YouTube) *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="https://example.com/video.mp4 або https://youtube.com/watch?v=..."
                        value={heroForm.bgVideo || ''}
                        onChange={(e) => setHeroForm({...heroForm, bgVideo: e.target.value})}
                        required={heroForm.bgMediaType === 'video'}
                      />
                      <p className="password-tip" style={{ marginTop: '0.5rem' }}>
                        Підтримуються прямі посилання на файли (<code>.mp4</code>, <code>.webm</code>), а також посилання на відео з <strong>YouTube</strong>.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label className="form-label">Джерело зображення заднього фону</label>
                        <div className="image-source-toggle" style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                            <input 
                              type="radio" 
                              name="heroImageSource" 
                              checked={heroImageSource === 'url'} 
                              onChange={() => setHeroImageSource('url')} 
                            />
                            <span>Вказати URL</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                            <input 
                              type="radio" 
                              name="heroImageSource" 
                              checked={heroImageSource === 'file'} 
                              onChange={() => setHeroImageSource('file')} 
                            />
                            <span>Завантажити з комп'ютера</span>
                          </label>
                        </div>

                        {heroImageSource === 'url' ? (
                          <input
                            type="text"
                            className="form-control"
                            placeholder="https://images.unsplash.com/..."
                            value={heroForm.bgImage || ''}
                            onChange={(e) => setHeroForm({...heroForm, bgImage: e.target.value})}
                            required={heroImageSource === 'url'}
                          />
                        ) : (
                          <div className="file-upload-wrapper">
                            <input
                              type="file"
                              accept="image/*"
                              className="form-control"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setHeroForm({...heroForm, bgImage: reader.result});
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              required={heroImageSource === 'file' && !heroForm.bgImage}
                            />
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Позиціонування / область фокусу фото</label>
                        <select
                          className="form-control"
                          value={heroForm.bgPosition || 'center'}
                          onChange={(e) => setHeroForm({...heroForm, bgPosition: e.target.value})}
                        >
                          <option value="center">По центру (Center)</option>
                          <option value="top">Зверху (Top)</option>
                          <option value="bottom">Знизу (Bottom)</option>
                          <option value="left">Зліва (Left)</option>
                          <option value="right">Справа (Right)</option>
                        </select>
                      </div>
                    </>
                  )}

                  {heroForm.bgMediaType === 'video' && heroForm.bgVideo ? (
                    <div className="hero-preview-container">
                      <label className="form-label">Попередній перегляд фону (Відео)</label>
                      <div 
                        className="hero-preview-bg"
                        style={{ 
                          position: 'relative', 
                          overflow: 'hidden', 
                          backgroundColor: '#121216', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          border: '1px solid var(--color-border)'
                        }}
                      >
                        <div style={{ zIndex: 10, color: 'var(--color-accent-gold)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                          🎬 Відеофон активний:<br/>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', wordBreak: 'break-all' }}>{heroForm.bgVideo}</span>
                        </div>
                      </div>
                    </div>
                  ) : (heroForm.bgImage && (
                    <div className="hero-preview-container">
                      <label className="form-label">Попередній перегляд фону</label>
                      <div 
                        className="hero-preview-bg"
                        style={{ 
                          backgroundImage: `url(${heroForm.bgImage})`,
                          backgroundPosition: heroForm.bgPosition || 'center'
                        }}
                      >
                        <div className="hero-preview-overlay">
                          <span>{heroForm.title}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 2rem', marginTop: '1.5rem' }}
                  >
                    Зберегти головну
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 6: ABOUT */}
          {activeTab === 'about' && (
            <div className="admin-tab-content animate-fade-in">
              <div className="admin-section-grid">
                
                {/* About Content Editor */}
                <div id="about-editor-container" className="service-editor-container glass-card">
                  <div className="form-header-row">
                    <h3>Контент блоку "Про нас"</h3>
                    {isAboutSaved && (
                      <span className="save-success-badge">
                        <Save size={14} /> Збережено
                      </span>
                    )}
                  </div>
                  
                  <form onSubmit={handleAboutSubmit} className="admin-form">
                    <div className="form-group">
                      <label className="form-label">Підзаголовок блоку *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={aboutForm.subtitle}
                        onChange={(e) => setAboutForm({ ...aboutForm, subtitle: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Заголовок блоку *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={aboutForm.title}
                        onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Вступний текст (Жирний лід-абзац) *</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={aboutForm.textLead}
                        onChange={(e) => setAboutForm({ ...aboutForm, textLead: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Основний текст блоку *</label>
                      <textarea
                        className="form-control"
                        rows="5"
                        value={aboutForm.textMain}
                        onChange={(e) => setAboutForm({ ...aboutForm, textMain: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    
                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">Показник досвіду (напр. "10+") *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={aboutForm.years}
                          onChange={(e) => setAboutForm({ ...aboutForm, years: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Текст під показником (напр. "Років краси") *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={aboutForm.yearsText}
                          onChange={(e) => setAboutForm({ ...aboutForm, yearsText: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {/* About Media inputs */}
                    <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                      <div className="form-group">
                        <label className="form-label">Тип медіа блоку "Про нас"</label>
                        <select
                          className="form-control"
                          value={aboutForm.mediaType || 'image'}
                          onChange={(e) => setAboutForm({...aboutForm, mediaType: e.target.value})}
                        >
                          <option value="image">Зображення (Image)</option>
                          <option value="video">Відео (Direct MP4 / YouTube / Instagram)</option>
                        </select>
                      </div>

                      {aboutForm.mediaType === 'video' ? (
                        <div className="form-group">
                          <label className="form-label">Посилання на відео (MP4, YouTube або Instagram Reel) *</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="https://instagram.com/reel/... або https://youtube.com/watch?v=..."
                            value={aboutForm.videoUrl || ''}
                            onChange={(e) => setAboutForm({...aboutForm, videoUrl: e.target.value})}
                            required={aboutForm.mediaType === 'video'}
                          />
                          <p className="password-tip" style={{ marginTop: '0.5rem' }}>
                            Підтримуються прямі посилання на файли (<code>.mp4</code>, <code>.webm</code>), відео з <strong>YouTube</strong>, а також Reels/дописи з <strong>Instagram</strong>.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="form-group">
                            <label className="form-label">Джерело зображення салону</label>
                            <div className="image-source-toggle" style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                                <input 
                                  type="radio" 
                                  name="aboutImageSource" 
                                  checked={aboutImageSource === 'url'} 
                                  onChange={() => setAboutImageSource('url')} 
                                />
                                <span>Вказати URL</span>
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                                <input 
                                  type="radio" 
                                  name="aboutImageSource" 
                                  checked={aboutImageSource === 'file'} 
                                  onChange={() => setAboutImageSource('file')} 
                                />
                                <span>Завантажити з комп'ютера</span>
                              </label>
                            </div>

                            {aboutImageSource === 'url' ? (
                              <input
                                type="text"
                                className="form-control"
                                placeholder="https://images.unsplash.com/..."
                                value={aboutForm.image || ''}
                                onChange={(e) => setAboutForm({...aboutForm, image: e.target.value})}
                                required={aboutImageSource === 'url' && aboutForm.mediaType === 'image'}
                              />
                            ) : (
                              <div className="file-upload-wrapper">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="form-control"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setAboutForm({...aboutForm, image: reader.result});
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  required={aboutImageSource === 'file' && !aboutForm.image && aboutForm.mediaType === 'image'}
                                />
                              </div>
                            )}
                          </div>

                          <div className="form-group">
                            <label className="form-label">Позиціонування / область фокусу фото</label>
                            <select
                              className="form-control"
                              value={aboutForm.imagePosition || 'center'}
                              onChange={(e) => setAboutForm({...aboutForm, imagePosition: e.target.value})}
                            >
                              <option value="center">По центру (Center)</option>
                              <option value="top">Зверху (Top)</option>
                              <option value="bottom">Знизу (Bottom)</option>
                              <option value="left">Зліва (Left)</option>
                              <option value="right">Справа (Right)</option>
                            </select>
                          </div>
                        </>
                      )}

                      {aboutForm.mediaType === 'video' && aboutForm.videoUrl ? (
                        <div className="image-preview-container">
                          <label className="form-label">Попередній перегляд відео</label>
                          <div 
                            style={{ 
                              padding: '1.5rem', 
                              backgroundColor: '#121216', 
                              border: '1px solid var(--color-border)', 
                              borderRadius: 'var(--border-radius-sm)',
                              textAlign: 'center',
                              fontSize: '0.9rem',
                              color: 'var(--color-accent-gold)'
                            }}
                          >
                            🎬 Медіафайл (Відео) обрано:<br/>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', wordBreak: 'break-all' }}>{aboutForm.videoUrl}</span>
                          </div>
                        </div>
                      ) : (aboutForm.mediaType === 'image' && aboutForm.image && (
                        <div className="image-preview-container">
                          <label className="form-label">Попередній перегляд фото</label>
                          <img 
                            src={aboutForm.image} 
                            alt="About Preview" 
                            className="preview-img" 
                            style={{ 
                              maxHeight: '200px', 
                              width: '100%', 
                              objectFit: 'cover', 
                              borderRadius: 'var(--border-radius-sm)',
                              objectPosition: aboutForm.imagePosition || 'center'
                            }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      ))}
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }}>
                      Зберегти контент блоку "Про нас"
                    </button>
                  </form>
                </div>
                
                {/* About Features List CRUD Manager */}
                <div className="services-admin-list glass-card">
                  <h3 style={{ marginBottom: '1.5rem' }}>Переваги у блоці "Про нас"</h3>
                  
                  {/* Feature Editor Form */}
                  <form onSubmit={handleAboutFeatureSubmit} className="admin-form" style={{ borderBottom: '1px dashed var(--color-border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                    <h4>{isEditingAboutFeature ? 'Редагувати перевагу' : 'Додати нову перевагу'}</h4>
                    <div className="form-group">
                      <label className="form-label">Заголовок переваги *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Наприклад: Люкс матеріали"
                        value={aboutFeatureForm.title}
                        onChange={(e) => setAboutFeatureForm({ ...aboutFeatureForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Короткий опис переваги *</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Опишіть детальніше..."
                        value={aboutFeatureForm.desc}
                        onChange={(e) => setAboutFeatureForm({ ...aboutFeatureForm, desc: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Іконка переваги</label>
                      <select
                        className="form-control"
                        value={aboutFeatureForm.icon || 'Award'}
                        onChange={(e) => setAboutFeatureForm({ ...aboutFeatureForm, icon: e.target.value })}
                      >
                        <option value="Award">🏆 Нагорода (Award)</option>
                        <option value="Compass">🧭 Напрямок (Compass)</option>
                        <option value="Heart">❤️ Турбота (Heart)</option>
                        <option value="Users">👥 Команда (Users)</option>
                        <option value="ShieldCheck">🛡️ Безпека / Якість (ShieldCheck)</option>
                        <option value="Clock">🕒 Пунктуальність (Clock)</option>
                        <option value="CalendarCheck">📅 Календар / Запис (CalendarCheck)</option>
                        <option value="Sparkles">✨ Сяйво / Краса (Sparkles)</option>
                        <option value="Gift">🎁 Подарунок (Gift)</option>
                        <option value="Coffee">☕ Кава / Релакс (Coffee)</option>
                        <option value="Scissors">✂️ Стиль / Ножиці (Scissors)</option>
                        <option value="Flower2">🌸 Квітка (Flower2)</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.6rem' }}>
                        {isEditingAboutFeature ? 'Зберегти зміни' : 'Додати перевагу'}
                      </button>
                      {isEditingAboutFeature && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setIsEditingAboutFeature(false);
                            setEditingAboutFeatureId(null);
                            setAboutFeatureForm({ title: '', desc: '', icon: 'Award' });
                          }}
                          style={{ padding: '0.6rem' }}
                        >
                          Скасувати
                        </button>
                      )}
                    </div>
                  </form>

                  {/* List of current features */}
                  <div className="services-admin-scroll">
                    {aboutForm.features && aboutForm.features.length > 0 ? (
                      aboutForm.features.map((feat, idx) => (
                        <div key={feat.id || idx} className="service-admin-item">
                          <div>
                            <h5 style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{feat.title}</h5>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>{feat.desc}</p>
                          </div>
                          <div className="service-admin-actions">
                            <button
                              className="action-icon-btn check-btn"
                              onClick={() => handleEditAboutFeature(feat)}
                              title="Редагувати"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="action-icon-btn delete-btn"
                              onClick={() => handleDeleteAboutFeature(feat.id)}
                              title="Видалити"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>Немає переваг. Додайте першу перевагу.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 7: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="admin-tab-content animate-fade-in">
                
                {/* Reviews Editor Form */}
                <div id="reviews-editor-form" className={`service-editor-container glass-card ${isEditingReview ? 'is-editing' : ''}`}>
                  <div className="form-header-row">
                    <h3>
                      {isEditingReview ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent-gold)' }}>
                          <Edit size={18} /> Редагувати відгук (Режим редагування)
                        </span>
                      ) : 'Додати відгук вручную'}
                    </h3>
                    {isReviewsSaved && (
                      <span className="save-success-badge">
                        <Save size={14} /> Збережено
                      </span>
                    )}
                  </div>

                  {/* Fast Import Box */}
                  {!isEditingReview && (
                    <div className="fast-import-box" style={{ marginBottom: '1.5rem', padding: '1.25rem', border: '1px dashed rgba(var(--color-accent-gold-rgb), 0.3)', borderRadius: 'var(--border-radius-md)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-accent-gold)', fontSize: '0.95rem' }}>
                        <Sparkles size={16} /> Швидкий імпорт відгуку з Google Maps
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                        Скопіюйте блок тексту відгуку на картах Google та вставте сюди. Поля нижче заповняться автоматично:
                      </p>
                      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder="Вставте скопійований текст відгуку сюди..."
                          value={fastImportText}
                          onChange={(e) => setFastImportText(e.target.value)}
                          style={{ fontSize: '0.85rem' }}
                        ></textarea>
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          const urlPattern = /https?:\/\/[^\s]+/;
                          if (urlPattern.test(fastImportText) && (fastImportText.includes('maps') || fastImportText.includes('google'))) {
                            alert("Ви вставили посилання.\n\nЧерез обмеження безпеки Google (CORS) та динамічний рендеринг, отримати текст відгуку автоматично за посиланням без бэкенд-сервера неможливо.\n\nБудь ласка:\n1. Відкрийте це посилання у новій вкладці.\n2. Скопіюйте текст відгуку разом з ім'ям автора.\n3. Вставте скопійований текст сюди для автозаповнення.\n4. Саму ссылку вставте у поле «Посилання на відгук на Google Maps» нижче.");
                            return;
                          }
                          const parsed = parseGoogleReview(fastImportText);
                          if (parsed) {
                            setReviewsForm(prev => ({
                              ...prev,
                              name: parsed.name || prev.name,
                              rating: parsed.rating || prev.rating,
                              date: parsed.date || prev.date,
                              text: parsed.text || prev.text,
                              price: parsed.price || '',
                              services: [] // Keep empty so user can select manually
                            }));
                            setFastImportText('');
                          } else {
                            alert('Не вдалося розпізнати формат відгуку. Переконайтеся, що ви копіюєте блок із ім\'ям, зірочками та текстом.');
                          }
                        }}
                        disabled={!fastImportText.trim()}
                      >
                        <Sparkles size={14} /> Розпізнати та заповнити форму
                      </button>
                    </div>
                  )}
                  
                  <form onSubmit={handleReviewSubmit} className="admin-form">
                    <div className="form-group">
                      <label className="form-label">Ім'я клієнта *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={reviewsForm.name}
                        onChange={(e) => setReviewsForm({ ...reviewsForm, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">Оцінка (1-5 зірочок) *</label>
                        <select
                          className="form-control"
                          value={reviewsForm.rating}
                          onChange={(e) => setReviewsForm({ ...reviewsForm, rating: Number(e.target.value) })}
                        >
                          <option value="5">5 Зірок</option>
                          <option value="4">4 Зірки</option>
                          <option value="3">3 Зірки</option>
                          <option value="2">2 Зірки</option>
                          <option value="1">1 Зірка</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Дата відгуку</label>
                        <input
                          type="date"
                          className="form-control"
                          max={new Date().toISOString().split('T')[0]}
                          value={reviewsForm.date}
                          onChange={(e) => setReviewsForm({ ...reviewsForm, date: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">Виберіть послуги</label>
                        <CustomSelect
                          options={services.map(s => ({ value: s.name, label: s.name }))}
                          value={reviewsForm.services || []}
                          onChange={(e) => setReviewsForm({ ...reviewsForm, services: e.target.value })}
                          placeholder="-- Виберіть послуги --"
                          multiple={true}
                          searchable={true}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Ціна (наприклад, 1 000–1 500 ₴)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Введіть ціну або діапазон"
                          value={reviewsForm.price || ''}
                          onChange={(e) => setReviewsForm({ ...reviewsForm, price: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Посилання на відгук на Google Maps (опціонально)</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Link size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                        <input
                          type="url"
                          className="form-control"
                          placeholder="https://maps.app.goo.gl/..."
                          value={reviewsForm.googleReviewUrl}
                          onChange={(e) => setReviewsForm({ ...reviewsForm, googleReviewUrl: e.target.value })}
                          style={{ paddingLeft: '38px' }}
                        />
                      </div>
                    </div>

                     <div className="form-row-2">
                       <div className="form-group">
                         <label className="form-label">Аватар автора</label>
                         
                         <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                           <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                             <input 
                               type="radio" 
                               name="avatarSource" 
                               checked={avatarSource === 'file'} 
                               onChange={() => setAvatarSource('file')} 
                             />
                             <span>Файл</span>
                           </label>
                           <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                             <input 
                               type="radio" 
                               name="avatarSource" 
                               checked={avatarSource === 'url'} 
                               onChange={() => setAvatarSource('url')} 
                             />
                             <span>Посилання</span>
                           </label>
                         </div>

                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                           {reviewsForm.avatar ? (
                             <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
                               <img src={reviewsForm.avatar} alt="Avatar Preview" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-border)' }} />
                               <button
                                 type="button"
                                 onClick={() => setReviewsForm({ ...reviewsForm, avatar: '' })}
                                 style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px', padding: 0 }}
                               >
                                 <X size={10} />
                               </button>
                             </div>
                           ) : (
                             <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem', flexShrink: 0 }}>
                               Немає
                             </div>
                           )}

                           {avatarSource === 'file' ? (
                             <label className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                               <Upload size={12} /> Обрати
                               <input
                                 type="file"
                                 accept="image/*"
                                 style={{ display: 'none' }}
                                 onChange={async (e) => {
                                   const file = e.target.files[0];
                                   if (file) {
                                     const compressed = await compressImage(file, 120, 120, 0.7);
                                     setReviewsForm(prev => ({ ...prev, avatar: compressed }));
                                   }
                                 }}
                               />
                             </label>
                           ) : (
                             <input
                               type="url"
                               className="form-control"
                               placeholder="https://example.com/avatar.jpg"
                               value={reviewsForm.avatar && !reviewsForm.avatar.startsWith('data:image/') ? reviewsForm.avatar : ''}
                               onChange={(e) => setReviewsForm({ ...reviewsForm, avatar: e.target.value })}
                               style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                             />
                           )}
                         </div>
                       </div>

                       <div className="form-group">
                         <label className="form-label">Прикріпити фото відгуку</label>

                         <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                           <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                             <input 
                               type="radio" 
                               name="photoSource" 
                               checked={photoSource === 'file'} 
                               onChange={() => setPhotoSource('file')} 
                             />
                             <span>Файл</span>
                           </label>
                           <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                             <input 
                               type="radio" 
                               name="photoSource" 
                               checked={photoSource === 'url'} 
                               onChange={() => setPhotoSource('url')} 
                             />
                             <span>Посилання</span>
                           </label>
                         </div>

                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                           {reviewsForm.reviewImage ? (
                             <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
                               <img src={reviewsForm.reviewImage} alt="Review Image Preview" style={{ width: '48px', height: '40px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--color-border)' }} />
                               <button
                                 type="button"
                                 onClick={() => setReviewsForm({ ...reviewsForm, reviewImage: '' })}
                                 style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px', padding: 0 }}
                               >
                                 <X size={10} />
                               </button>
                             </div>
                           ) : (
                             <div style={{ width: '48px', height: '40px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem', flexShrink: 0 }}>
                               Немає
                             </div>
                           )}

                           {photoSource === 'file' ? (
                             <label className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                               <Upload size={12} /> Обрати
                               <input
                                 type="file"
                                 accept="image/*"
                                 style={{ display: 'none' }}
                                 onChange={async (e) => {
                                   const file = e.target.files[0];
                                   if (file) {
                                     const compressed = await compressImage(file, 600, 600, 0.7);
                                     setReviewsForm(prev => ({ ...prev, reviewImage: compressed }));
                                   }
                                 }}
                               />
                             </label>
                           ) : (
                             <input
                               type="url"
                               className="form-control"
                               placeholder="https://example.com/photo.jpg"
                               value={reviewsForm.reviewImage && !reviewsForm.reviewImage.startsWith('data:image/') ? reviewsForm.reviewImage : ''}
                               onChange={(e) => setReviewsForm({ ...reviewsForm, reviewImage: e.target.value })}
                               style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                             />
                           )}
                         </div>
                       </div>
                     </div>
                    
                    <div className="form-group">
                      <label className="form-label">Текст відгуку *</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        value={reviewsForm.text}
                        onChange={(e) => setReviewsForm({ ...reviewsForm, text: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                        {isEditingReview ? 'Оновити відгук' : 'Опублікувати відгук'}
                      </button>
                      {isEditingReview && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setIsEditingReview(false);
                            setEditingReviewId(null);
                            setReviewsForm({ name: '', rating: 5, date: '', service: '', services: [], price: '', text: '', googleReviewUrl: '', avatar: '', reviewImage: '' });
                            setAvatarSource('file');
                            setPhotoSource('file');
                          }}
                        >
                          Скасувати
                        </button>
                      )}
                    </div>
                  </form>
                </div>
                
                {/* Reviews List */}
                <div className="gallery-admin-container glass-card">
                  <h3 style={{ marginBottom: '1.5rem' }}>Опубліковані відгуки</h3>
                  <div className="services-admin-scroll" style={{ maxHeight: '550px' }}>
                    {reviews.map((rev, idx) => (
                      <div key={rev.id || idx} className="service-admin-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {rev.avatar ? (
                              <img src={rev.avatar} alt={rev.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-border)' }} />
                            ) : (
                              <div 
                                style={{ width: '28px', height: '28px', borderRadius: '50%', background: getAvatarGradient(rev.name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}
                              >
                                {rev.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span style={{ fontWeight: 600 }}>{rev.name}</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{rev.date}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.2rem', color: 'var(--color-accent-gold)' }}>
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} size={12} fill="currentColor" />
                          ))}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          {rev.service && (
                            <span style={{ fontSize: '0.75rem', background: 'rgba(var(--color-accent-gold-rgb), 0.1)', color: 'var(--color-accent-gold)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                              {rev.service}
                            </span>
                          )}
                          {rev.googleReviewUrl && (
                            <a 
                              href={rev.googleReviewUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#4285f4', textDecoration: 'none', background: 'rgba(66, 133, 244, 0.08)', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(66, 133, 244, 0.15)' }}
                            >
                              Google Link
                            </a>
                          )}
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0.25rem 0', wordBreak: 'break-word', width: '100%' }}>"{rev.text}"</p>
                        
                        {rev.reviewImage && (
                          <img src={rev.reviewImage} alt="Attached" style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)', margin: '0.25rem 0' }} />
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-end', marginTop: '0.25rem' }}>
                          {idx > 0 && (
                            <button
                              type="button"
                              className="action-icon-btn"
                              onClick={() => moveReview(idx, 'up')}
                              title="Перемістити вгору"
                              style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                            >
                              <ArrowUp size={14} />
                            </button>
                          )}
                          {idx < reviews.length - 1 && (
                            <button
                              type="button"
                              className="action-icon-btn"
                              onClick={() => moveReview(idx, 'down')}
                              title="Перемістити вниз"
                              style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                            >
                              <ArrowDown size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            className="action-icon-btn check-btn"
                            onClick={() => handleEditReviewClick(rev)}
                            title="Редагувати відгук"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            className="action-icon-btn delete-btn"
                            onClick={() => handleDeleteReviewClick(rev.id)}
                            title="Видалити відгук"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

            </div>
          )}

          {/* TAB 8: BLOCK SETTINGS */}
          {activeTab === 'settings' && (
            <div className="admin-tab-content animate-fade-in">
              <div className="admin-section-grid">
                
                {/* Titles and Texts form */}
                <div id="block-settings-editor-container" className="service-editor-container glass-card">
                  <div className="form-header-row">
                    <h3>Заголовки та опис блоків</h3>
                    {isBlockSettingsSaved && (
                      <span className="save-success-badge">
                        <Save size={14} /> Збережено
                      </span>
                    )}
                  </div>
                  
                  <form onSubmit={handleBlockSettingsSubmit} className="admin-form">
                    <div className="form-group">
                      <label className="form-label">Заголовок секції "Послуги та ціни" *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={blockSettingsForm.servicesTitle}
                        onChange={(e) => setBlockSettingsForm({ ...blockSettingsForm, servicesTitle: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Заголовок секції "Галерея робіт" *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={blockSettingsForm.galleryTitle}
                        onChange={(e) => setBlockSettingsForm({ ...blockSettingsForm, galleryTitle: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Заголовок секції "Відгуки клієнтів" *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={blockSettingsForm.reviewsTitle}
                        onChange={(e) => setBlockSettingsForm({ ...blockSettingsForm, reviewsTitle: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Заголовок форми відгуків *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={blockSettingsForm.reviewsFormTitle}
                        onChange={(e) => setBlockSettingsForm({ ...blockSettingsForm, reviewsFormTitle: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Опис форми відгуків *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={blockSettingsForm.reviewsFormSubtitle}
                        onChange={(e) => setBlockSettingsForm({ ...blockSettingsForm, reviewsFormSubtitle: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                      <div className="form-group">
                        <label className="form-label">Заголовок секції "Запис" *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={blockSettingsForm.bookingTitle}
                          onChange={(e) => setBlockSettingsForm({ ...blockSettingsForm, bookingTitle: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Заголовок картки запису *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={blockSettingsForm.bookingInfoTitle}
                          onChange={(e) => setBlockSettingsForm({ ...blockSettingsForm, bookingInfoTitle: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Опис картки запису *</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={blockSettingsForm.bookingInfoText}
                          onChange={(e) => setBlockSettingsForm({ ...blockSettingsForm, bookingInfoText: e.target.value })}
                          required
                        ></textarea>
                      </div>
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
                      Зберегти налаштування блоків
                    </button>
                  </form>
                </div>
                
                {/* Booking Features List CRUD Manager */}
                <div className="services-admin-list glass-card">
                  <h3 style={{ marginBottom: '1.5rem' }}>Переваги у блоці "Запис"</h3>
                  
                  {/* Feature Editor Form */}
                  <form onSubmit={handleBookingFeatureSubmit} className="admin-form" style={{ borderBottom: '1px dashed var(--color-border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                    <h4>{isEditingBookingFeature ? 'Редагувати перевагу' : 'Додати перевагу запису'}</h4>
                    <div className="form-group">
                      <label className="form-label">Заголовок переваги *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Наприклад: Пунктуальність"
                        value={bookingFeatureForm.title}
                        onChange={(e) => setBookingFeatureForm({ ...bookingFeatureForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Короткий опис переваги *</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Опишіть перевагу..."
                        value={bookingFeatureForm.desc}
                        onChange={(e) => setBookingFeatureForm({ ...bookingFeatureForm, desc: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Іконка переваги</label>
                      <select
                        className="form-control"
                        value={bookingFeatureForm.icon || 'ShieldCheck'}
                        onChange={(e) => setBookingFeatureForm({ ...bookingFeatureForm, icon: e.target.value })}
                      >
                        <option value="ShieldCheck">🛡️ Безпека / Якість (ShieldCheck)</option>
                        <option value="Clock">🕒 Пунктуальність (Clock)</option>
                        <option value="CalendarCheck">📅 Календар / Запис (CalendarCheck)</option>
                        <option value="Award">🏆 Нагорода (Award)</option>
                        <option value="Compass">🧭 Напрямок (Compass)</option>
                        <option value="Heart">❤️ Турбота (Heart)</option>
                        <option value="Users">👥 Команда (Users)</option>
                        <option value="Sparkles">✨ Сяйво / Краса (Sparkles)</option>
                        <option value="Gift">🎁 Подарунок (Gift)</option>
                        <option value="Coffee">☕ Кава / Релакс (Coffee)</option>
                        <option value="Scissors">✂️ Стиль / Ножиці (Scissors)</option>
                        <option value="Flower2">🌸 Квітка (Flower2)</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.6rem' }}>
                        {isEditingBookingFeature ? 'Зберегти зміни' : 'Додати перевагу'}
                      </button>
                      {isEditingBookingFeature && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setIsEditingBookingFeature(false);
                            setEditingBookingFeatureId(null);
                            setBookingFeatureForm({ title: '', desc: '', icon: 'ShieldCheck' });
                          }}
                          style={{ padding: '0.6rem' }}
                        >
                          Скасувати
                        </button>
                      )}
                    </div>
                  </form>

                  {/* List of current booking features */}
                  <div className="services-admin-scroll">
                    {blockSettingsForm.bookingFeatures && blockSettingsForm.bookingFeatures.length > 0 ? (
                      blockSettingsForm.bookingFeatures.map((feat, idx) => (
                        <div key={feat.id || idx} className="service-admin-item">
                          <div>
                            <h5 style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{feat.title}</h5>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>{feat.desc}</p>
                          </div>
                          <div className="service-admin-actions">
                            <button
                              className="action-icon-btn check-btn"
                              onClick={() => handleEditBookingFeature(feat)}
                              title="Редагувати перевагу"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="action-icon-btn delete-btn"
                              onClick={() => handleDeleteBookingFeature(feat.id)}
                              title="Видалити перевагу"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>Немає переваг. Додайте першу перевагу.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 9: SECURITY */}
          {activeTab === 'security' && (
            <div className="admin-tab-content animate-fade-in">
              <div className="admin-section-grid">
                
                {/* Form to change Email and Password */}
                <div id="security-editor-container" className="service-editor-container glass-card">
                  <div className="form-header-row">
                    <h3>Параметри безпеки кабінету</h3>
                    {securitySuccess && (
                      <span className="save-success-badge">
                        <Save size={14} /> Збережено
                      </span>
                    )}
                  </div>
                  
                  <form onSubmit={handleSecuritySubmit} className="admin-form">
                    <div className="form-group">
                      <label className="form-label">Email адміністратора (для скидання пароля) *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={securityEmailInput}
                        onChange={(e) => setSecurityEmailInput(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                      <h4>Зміна пароля</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                        Залиште поля пароля порожніми, якщо не хочете його змінювати
                      </p>
                      
                      <div className="form-group">
                        <label className="form-label">Новий пароль</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Мінімум 6 символів"
                          value={securityPasswordInput}
                          onChange={(e) => setSecurityPasswordInput(e.target.value)}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Підтвердження нового пароля</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Повторіть пароль"
                          value={securityPasswordConfirm}
                          onChange={(e) => setSecurityPasswordConfirm(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {securityError && <p className="error-text" style={{ marginBottom: '1rem' }}>{securityError}</p>}
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                      Зберегти зміни безпеки
                    </button>
                  </form>
                </div>
                
                {/* 2FA Status and Setup Re-scan */}
                <div className="services-admin-list glass-card">
                  <h3>Двохфакторна автентифікація (2FA)</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                    Налаштування безпеки входу через Google Authenticator
                  </p>
                  
                  {securitySettings.admin2faSecret ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
                      <div className="save-success-badge" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', border: '1px solid #4caf50', display: 'inline-flex', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        🛡️ 2FA Активна
                      </div>
                      
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                        Ви можете відсканувати цей QR-код на інших пристроях (наприклад, на новому телефоні), щоб додати обліковий запис у Google Authenticator повторно:
                      </p>
                      
                      <div className="login-2fa-qr-container" style={{ margin: '0', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '1rem', border: '1px solid var(--color-border)' }}>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('otpauth://totp/CharmeBeauty:AdminCharme?secret=' + securitySettings.admin2faSecret + '&issuer=CharmeBeauty')}`}
                          alt="2FA QR Code" 
                          className="login-2fa-qr-image"
                          style={{ width: '150px', height: '150px' }}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0 0' }}>Секретний ключ:</p>
                        <span className="login-2fa-secret-text" style={{ fontSize: '0.75rem' }}>{securitySettings.admin2faSecret}</span>
                      </div>
                      
                      <div style={{ width: '100%', borderTop: '1px dashed var(--color-border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          onClick={handleReset2fa}
                          style={{ color: 'var(--color-error)', borderColor: 'rgba(244, 67, 54, 0.3)', width: '100%' }}
                        >
                          Скинути та налаштувати заново
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        Двохфакторна автентифікація ще не активована. Вона буде автоматично налаштована при наступному вході в адмін-панель.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* 2FA Confirmation Modal for Security Settings */}
      {showSecurity2fa && (
        <div className="login-modal-overlay" style={{ zIndex: 11000 }} onClick={() => { setShowSecurity2fa(false); setSecurityOtpInput(''); setSecurity2faError(''); }}>
          <div className="login-modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <button className="login-modal-close" onClick={() => { setShowSecurity2fa(false); setSecurityOtpInput(''); setSecurity2faError(''); }} aria-label="Close modal">
              <XCircle size={24} />
            </button>
            
            <div className="login-modal-header">
              <Lock size={36} className="login-header-icon" />
              <h3>Підтвердження дії</h3>
              <p>Для зміни email або пароля введіть 6-значний код з Google Authenticator</p>
            </div>
            
            <form onSubmit={handleSecurity2faSubmit} className="login-form">
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Код безпеки 2FA</label>
                <input
                  type="text"
                  maxLength="6"
                  className="form-control"
                  placeholder="000000"
                  value={securityOtpInput}
                  onChange={(e) => setSecurityOtpInput(e.target.value.replace(/\D/g, ''))}
                  required
                  style={{ letterSpacing: '0.2em', textAlign: 'center', fontSize: '1.2rem' }}
                  autoFocus
                />
                {security2faError && <p className="error-text">{security2faError}</p>}
              </div>
              
              <button type="submit" className="btn btn-primary login-submit-btn">
                Підтвердити та зберегти
              </button>
              
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ marginTop: '0.5rem', width: '100%' }}
                onClick={() => { setShowSecurity2fa(false); setSecurityOtpInput(''); setSecurity2faError(''); }}
              >
                Скасувати
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
