import { useState, useContext, useRef, useEffect } from 'react';
import { SalonContext } from '../context/SalonContext';
import { Clock, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import './Services.css';

const Services = ({ onBookService }) => {
  const { services, blockSettings } = useContext(SalonContext);
  
  // Extract unique categories (Ukrainian translation)
  const categories = [...new Set(services.map(s => JSON.stringify({ en: s.category, ua: s.categoryUa })))].map(c => JSON.parse(c));
  
  const [activeCategory, setActiveCategory] = useState(categories[0]?.en || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllServices, setShowAllServices] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
  
  const tabsRef = useRef(null);

  // Auto-select first category if the active category is no longer valid/empty
  useEffect(() => {
    if (categories.length > 0) {
      const exists = categories.some(cat => cat.en === activeCategory);
      if (!exists) {
        setActiveCategory(categories[0].en);
      }
    }
  }, [categories, activeCategory]);

  // Monitor screen width
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Collapse services list when active category changes
  useEffect(() => {
    setShowAllServices(false);
  }, [activeCategory]);

  const scrollTabs = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const isSearching = searchQuery.trim().length > 0;

  const filteredServices = isSearching
    ? services.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : services.filter(s => s.category === activeCategory);

  const showCollapsibleWrapper = isDesktop && !isSearching;
  const firstThree = filteredServices.slice(0, 3);
  const restOfServices = filteredServices.slice(3);

  const handleBookClick = (service) => {
    if (onBookService) {
      onBookService(service);
    }
  };

  const handleToggleShowAll = () => {
    if (showAllServices) {
      // Scroll smoothly back to original position (top of services section)
      const servicesSection = document.getElementById('services');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setShowAllServices(!showAllServices);
  };

  const renderServiceItem = (service) => (
    <div key={service.id} className="service-item">
      <div className="service-header">
        <div className="service-name-container">
          <h3 className="service-name">{service.name}</h3>
          {isSearching && (
            <span className="service-search-category-badge">{service.categoryUa}</span>
          )}
        </div>
        <div className="service-spacer"></div>
        <span className="service-price">{service.price} ₴</span>
      </div>
      
      {service.description && (
        <p className="service-description">{service.description}</p>
      )}
      
      <div className="service-meta">
        <span className="service-duration">
          <Clock size={14} />
          {service.duration}
        </span>
        
        <button 
          className="btn btn-secondary service-book-btn"
          onClick={() => handleBookClick(service)}
        >
          Записатись
        </button>
      </div>
    </div>
  );

  return (
    <section id="services" className="services-section">
      <div className="container">
        <h2 className="section-title">{blockSettings?.servicesTitle || 'Послуги та ціни'}</h2>
        
        {/* Search Bar */}
        <div className="services-search-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="services-search-input"
              placeholder="Пошук послуг (наприклад: манікюр, масаж)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Categories Tabs Slider */}
        {categories.length > 0 && !isSearching && (
          <div className="services-tabs-slider-wrapper">
            <button 
              className="tabs-scroll-btn scroll-btn-left" 
              onClick={() => scrollTabs('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="services-tabs" ref={tabsRef}>
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  className={`tab-btn ${activeCategory === cat.en ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.en)}
                >
                  {cat.ua}
                </button>
              ))}
            </div>
            
            <button 
              className="tabs-scroll-btn scroll-btn-right" 
              onClick={() => scrollTabs('right')}
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Services List */}
        <div className="services-list">
          {filteredServices.length > 0 ? (
            !showCollapsibleWrapper ? (
              // Flat list for mobile or search
              filteredServices.map(renderServiceItem)
            ) : (
              // Collapsible list for desktop category view
              <>
                {firstThree.map(renderServiceItem)}
                {restOfServices.length > 0 && (
                  <div 
                    className={`services-collapsible-wrapper ${showAllServices ? 'expanded' : 'collapsed'}`}
                    style={{
                      maxHeight: showAllServices ? `${restOfServices.length * 350}px` : '0px',
                      opacity: showAllServices ? 1 : 0,
                      overflow: 'hidden',
                      transition: 'max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in-out',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2.5rem'
                    }}
                  >
                    {restOfServices.map(renderServiceItem)}
                  </div>
                )}
              </>
            )
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', margin: '2rem 0' }}>
              {isSearching ? 'За вашим запитом нічого не знайдено.' : 'Немає послуг у цій категорії.'}
            </p>
          )}
        </div>

        {/* Show More Button */}
        {isDesktop && !isSearching && filteredServices.length > 3 && (
          <div className="show-more-services-container">
            <button 
              className="btn btn-primary show-more-btn"
              onClick={handleToggleShowAll}
            >
              {showAllServices 
                ? 'Згорнути список послуг' 
                : `Показати ще ${filteredServices.length - 3} послуг(и)`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;
