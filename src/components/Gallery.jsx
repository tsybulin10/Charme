import { useState, useContext, useRef, useCallback, useEffect } from 'react';
import { SalonContext } from '../context/SalonContext';
import { X, ZoomIn, ChevronLeft, ChevronRight, LayoutGrid, Image as ImageIcon } from 'lucide-react';
import './Gallery.css';

const Gallery = () => {
  const { gallery, blockSettings } = useContext(SalonContext);
  const [filter, setFilter] = useState('All');
  const [activeImage, setActiveImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState('slider'); // Default to slider per user request

  // Touch/swipe state
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);

  const categories = [
    { key: 'All', value: 'Всі роботи' },
    { key: 'Hair', value: 'Волосся' },
    { key: 'Nails', value: 'Нігті' },
    { key: 'Cosmetology', value: 'Косметологія' },
    { key: 'Brows', value: 'Брови та Вії' },
    { key: 'Makeup', value: 'Макіяж' }
  ];

  const filteredItems = filter === 'All' 
    ? gallery 
    : gallery.filter(item => item.category === filter);

  const getCategoryName = (catKey) => {
    const found = categories.find(c => c.key === catKey);
    return found ? found.value : catKey;
  };

  // Reset index when filter changes
  const handleFilterChange = (key) => {
    setFilter(key);
    setCurrentIndex(0);
  };

  // Navigation
  const goToSlide = useCallback((index) => {
    if (filteredItems.length === 0) return;
    let newIndex = index;
    if (newIndex < 0) newIndex = filteredItems.length - 1;
    if (newIndex >= filteredItems.length) newIndex = 0;
    setCurrentIndex(newIndex);
  }, [filteredItems.length]);

  const goNext = useCallback(() => goToSlide(currentIndex + 1), [currentIndex, goToSlide]);
  const goPrev = useCallback(() => goToSlide(currentIndex - 1), [currentIndex, goToSlide]);

  // Touch handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX; // Reset to prevent stale value double swipe calculation
    isDragging.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (diff > threshold) goNext();
    else if (diff < -threshold) goPrev();
  };

  // Lightbox navigation
  const lightboxNext = () => {
    if (!activeImage) return;
    const idx = filteredItems.findIndex(item => item.id === activeImage.id);
    const nextIdx = (idx + 1) % filteredItems.length;
    setActiveImage(filteredItems[nextIdx]);
  };

  const lightboxPrev = () => {
    if (!activeImage) return;
    const idx = filteredItems.findIndex(item => item.id === activeImage.id);
    const prevIdx = idx === 0 ? filteredItems.length - 1 : idx - 1;
    setActiveImage(filteredItems[prevIdx]);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!activeImage) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        lightboxNext();
      } else if (e.key === 'ArrowLeft') {
        lightboxPrev();
      } else if (e.key === 'Escape') {
        setActiveImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeImage, lightboxNext, lightboxPrev]);

  const currentItem = filteredItems[currentIndex];

  const getDotsStyle = () => {
    const dotWidth = 10;
    const gap = 8;
    const step = dotWidth + gap; // 18px
    const N = filteredItems.length;
    
    if (N <= 1) return {};
    
    const containerWidth = 250; // Width of the viewport container
    const padding = 6; // Safety padding on left/right ends of the strip
    const totalWidth = N * step - gap + padding * 2;
    
    if (totalWidth <= containerWidth) {
      return {
        transform: 'translateX(0)',
        justifyContent: 'center'
      };
    }
    
    const containerCenter = containerWidth / 2;
    const activeDotCenter = currentIndex * step + dotWidth / 2 + padding;
    
    let translateX = containerCenter - activeDotCenter;
    
    const maxTranslate = 0;
    const minTranslate = containerWidth - totalWidth;
    
    if (translateX > maxTranslate) translateX = maxTranslate;
    if (translateX < minTranslate) translateX = minTranslate;
    
    return {
      transform: `translateX(${translateX}px)`,
      justifyContent: 'flex-start'
    };
  };

  return (
    <section id="gallery" className="gallery-section">
      <div className="container">
        <h2 className="section-title">{blockSettings?.galleryTitle || 'Галерея робіт'}</h2>

        <div className="gallery-filters">
          {categories.map(cat => (
            <button
              key={cat.key}
              className={`tab-btn ${filter === cat.key ? 'active' : ''}`}
              onClick={() => handleFilterChange(cat.key)}
            >
              {cat.value}
            </button>
          ))}
        </div>

        <div className="gallery-view-toggle-row">
          <div className="gallery-view-toggle">
            <button 
              type="button"
              className={`gallery-view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Відобразити сіткою"
            >
              <LayoutGrid size={16} />
              <span>Сітка</span>
            </button>
            <button 
              type="button"
              className={`gallery-view-toggle-btn ${viewMode === 'slider' ? 'active' : ''}`}
              onClick={() => setViewMode('slider')}
              title="Відобразити слайдером"
            >
              <ImageIcon size={16} />
              <span>Слайдер</span>
            </button>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          viewMode === 'slider' ? (
            <div className="gallery-slider-container">
              {/* Slider */}
              <div
                className="gallery-slider"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Left Arrow */}
                <button
                  className="slider-arrow slider-arrow-left"
                  onClick={goPrev}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  aria-label="Попереднє фото"
                >
                  <ChevronLeft size={28} />
                </button>

                {/* Main Image */}
                <div
                  className="slider-image-wrapper"
                  onClick={() => setActiveImage(currentItem)}
                >
                  <img
                    src={currentItem.url}
                    alt={currentItem.title}
                    className="slider-image"
                    loading="lazy"
                    key={currentItem.id}
                    style={{ objectPosition: currentItem.bgPosition || 'center' }}
                  />
                  <div className="slider-image-overlay">
                    <ZoomIn size={24} className="slider-zoom-icon" />
                    <h3 className="slider-image-title">{currentItem.title}</h3>
                    <span className="slider-image-cat">{getCategoryName(currentItem.category)}</span>
                  </div>
                </div>

                {/* Right Arrow */}
                <button
                  className="slider-arrow slider-arrow-right"
                  onClick={goNext}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  aria-label="Наступне фото"
                >
                  <ChevronRight size={28} />
                </button>
              </div>

              {/* Dots Indicator */}
              <div className="slider-dots-viewport">
                <div className="slider-dots" style={getDotsStyle()}>
                  {filteredItems.map((item, idx) => (
                    <button
                      key={item.id}
                      className={`slider-dot ${idx === currentIndex ? 'active' : ''}`}
                      onClick={() => goToSlide(idx)}
                      aria-label={`Слайд ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Counter */}
              <div className="slider-counter">
                {currentIndex + 1} / {filteredItems.length}
              </div>
            </div>
          ) : (
            <div className="gallery-grid">
              {filteredItems.map((item, idx) => (
                <div 
                  key={item.id} 
                  className="gallery-grid-item"
                  onClick={() => {
                    setActiveImage(item);
                    setCurrentIndex(idx);
                  }}
                >
                  <img 
                    src={item.url} 
                    alt={item.title} 
                    className="gallery-grid-img" 
                    loading="lazy"
                    style={{ objectPosition: item.bgPosition || 'center' }}
                  />
                  <div className="gallery-grid-overlay">
                    <ZoomIn size={22} className="gallery-grid-zoom-icon" />
                    <h4 className="gallery-grid-title">{item.title}</h4>
                    <span className="gallery-grid-cat">{getCategoryName(item.category)}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem 0' }}>
            Немає фотографій у цій категорії.
          </p>
        )}

        {/* Lightbox */}
        {activeImage && (
          <div className="lightbox" onClick={() => setActiveImage(null)}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close" onClick={() => setActiveImage(null)}>
                <X size={32} />
              </button>
              <button className="lightbox-arrow lightbox-arrow-left" onClick={lightboxPrev}>
                <ChevronLeft size={36} />
              </button>
              <img src={activeImage.url} alt={activeImage.title} className="lightbox-img" style={{ objectPosition: activeImage.bgPosition || 'center' }} />
              <button className="lightbox-arrow lightbox-arrow-right" onClick={lightboxNext}>
                <ChevronRight size={36} />
              </button>
              <p className="lightbox-caption">{activeImage.title}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
