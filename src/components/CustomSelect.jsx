import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './CustomSelect.css';

const CustomSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  name, 
  required, 
  searchable = false,
  multiple = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectRef = useRef(null);

  const isSelected = (val) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(val);
    }
    return value === val;
  };

  const getDisplayText = () => {
    if (multiple) {
      if (Array.isArray(value) && value.length > 0) {
        return value.join(', ');
      }
      return placeholder || '-- Оберіть --';
    } else {
      const selectedOption = options.find(opt => opt.value === value);
      return selectedOption ? selectedOption.label : placeholder || '-- Оберіть --';
    }
  };

  const displayText = getDisplayText();
  const hasValue = multiple 
    ? (Array.isArray(value) && value.length > 0)
    : !!value;

  // Close on outside click and reset search
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.target.classList.contains('custom-select-search')) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
        selectRef.current?.focus();
      }
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(prev => {
        const next = !prev;
        if (!next) setSearchQuery('');
        return next;
      });
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      const filtered = getFilteredOptions();
      if (filtered.length === 0) return;
      const currentVal = multiple ? (Array.isArray(value) && value[0]) : value;
      const currentIndex = filtered.findIndex(opt => opt.value === currentVal);
      const nextIndex = Math.min(currentIndex + 1, filtered.length - 1);
      handleSelect(filtered[nextIndex].value);
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault();
      const filtered = getFilteredOptions();
      if (filtered.length === 0) return;
      const currentIndex = filtered.findIndex(opt => opt.value === value);
      const prevIndex = Math.max(currentIndex - 1, 0);
      handleSelect(filtered[prevIndex].value);
    }
  };

  const handleSelect = (val) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const nextValue = currentValues.includes(val)
        ? currentValues.filter(v => v !== val)
        : [...currentValues, val];
      onChange({ target: { name, value: nextValue } });
    } else {
      onChange({ target: { name, value: val } });
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const getFilteredOptions = () => {
    let result = options;
    if (searchQuery) {
      result = options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Add custom selected options that are not in the main options list
    if (multiple && Array.isArray(value)) {
      const customOptions = value
        .filter(val => !options.some(opt => opt.value === val))
        .map(val => ({ value: val, label: val }));
        
      const filteredCustom = searchQuery
        ? customOptions.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
        : customOptions;
        
      return [...filteredCustom, ...result];
    }
    
    return result;
  };

  const filteredOptions = getFilteredOptions();

  return (
    <div
      className={`custom-select ${isOpen ? 'open' : ''} ${multiple ? 'multiple' : ''}`}
      ref={selectRef}
      tabIndex={0}
      role="listbox"
      aria-expanded={isOpen}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`custom-select-trigger ${!hasValue ? 'placeholder' : ''}`}
        onClick={() => {
          setIsOpen(prev => {
            const next = !prev;
            if (!next) setSearchQuery('');
            return next;
          });
        }}
      >
        <span className="custom-select-text">{displayText}</span>
        <ChevronDown size={18} className={`custom-select-arrow ${isOpen ? 'rotated' : ''}`} />
      </div>

      {isOpen && (
        <div className="custom-select-dropdown">
          {searchable && (
            <div className="custom-select-search-wrapper" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                className="custom-select-search"
                placeholder="Пошук послуги..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          )}
          <div className="custom-select-options-list">
            {searchQuery && !filteredOptions.some(opt => opt.label.toLowerCase() === searchQuery.toLowerCase()) && (
              <div 
                className="custom-select-option custom-select-add-option"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(searchQuery);
                  setSearchQuery('');
                }}
              >
                + Додати "{searchQuery}"
              </div>
            )}
            
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const selected = isSelected(opt.value);
                return (
                  <div
                    key={`${opt.value}-${idx}`}
                    className={`custom-select-option ${selected ? 'selected' : ''}`}
                    onClick={(e) => {
                      if (multiple) {
                        e.stopPropagation(); // keep dropdown open on multiple select click
                      }
                      handleSelect(opt.value);
                    }}
                    role="option"
                    aria-selected={selected}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <span>{opt.label}</span>
                    {multiple && selected && (
                      <Check size={16} className="custom-select-option-check" />
                    )}
                  </div>
                );
              })
            ) : (
              !searchQuery && <div className="custom-select-no-results">Нічого не знайдено</div>
            )}
          </div>
        </div>
      )}

      {/* Hidden native select for form validation */}
      {required && (
        <select
          name={name}
          value={multiple ? (value && value.length > 0 ? value[0] : '') : value}
          onChange={onChange}
          required
          tabIndex={-1}
          className="custom-select-hidden"
          aria-hidden="true"
        >
          <option value="">{placeholder}</option>
          {options.map((opt, idx) => (
            <option key={`${opt.value}-${idx}`} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}
    </div>
  );
};

export default CustomSelect;
