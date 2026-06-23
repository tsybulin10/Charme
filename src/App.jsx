import { useState, useEffect, useContext } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Gallery from './components/Gallery';
import Reviews from './components/Reviews';
import Faq from './components/Faq';
import Contacts from './components/Contacts';
import BookingForm from './components/BookingForm';
import Footer from './components/Footer';
import FloatingButtons from './components/FloatingButtons';
import AdminPanel from './components/AdminPanel';
import { SalonContext } from './context/SalonContext';
import { generateBase32Secret, verifyTOTP } from './lib/totp';
import { ShieldAlert, X, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import crownLogo from './Crown.svg';
import './App.css';

function App() {
  const { securitySettings, updateSecuritySettings, theme, adminTheme, toggleAdminTheme } = useContext(SalonContext);

  const UUID = 'd3b07384-d113-4956-a50f-215d68d37012';

  const [isAdminMode, setIsAdminMode] = useState(false);
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('charme_admin_authenticated') === 'true';
  });


  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Auth steps: 'login' | '2fa_setup' | '2fa_verify' | 'forgot_password' | 'reset_verify' | 'reset_2fa_verify' | 'reset_new'
  const [authStep, setAuthStep] = useState('login');
  
  const [clientIp, setClientIp] = useState('unknown');
  const [resetOtpInput, setResetOtpInput] = useState('');

  // Fetch client IP on mount
  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (response.ok) {
          const data = await response.json();
          if (data && data.ip) {
            setClientIp(data.ip);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch public IP, using fallback: "unknown"', err);
        setClientIp('unknown');
      }
    };
    fetchIp();
  }, []);

  // Login fields
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // 2FA fields
  const [temp2faSecret, setTemp2faSecret] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  // Reset password fields
  const [resetEmailInput, setResetEmailInput] = useState('');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  
  // Demo reset variables
  const [demoResetCode, setDemoResetCode] = useState('');
  const [demoSuccessMessage, setDemoSuccessMessage] = useState('');

  const [preselectedService, setPreselectedService] = useState(null);

  // Secret URL routing listener
  useEffect(() => {
    const checkUrlForAdmin = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;
      
      const containsUUID = pathname.includes(UUID) || hash.includes(UUID);
      
      if (containsUUID) {
        sessionStorage.setItem('charme_admin_secret_accessed', 'true');
      }

      const hasSecretAccess = sessionStorage.getItem('charme_admin_secret_accessed') === 'true';
      const wantsAdmin = hash === '#admin' || hash === `#/${UUID}/admin` || hash.includes('admin');

      if (wantsAdmin && hasSecretAccess) {
        if (isAuthenticated) {
          setIsAdminMode(true);
          setShowLoginModal(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setIsAdminMode(false);
          setShowLoginModal(true);
          setAuthStep('login');
        }
      } else {
        setIsAdminMode(false);
        setShowLoginModal(false);
        if (hash === '#admin' && !hasSecretAccess) {
          window.location.hash = '';
        }
      }
    };

    checkUrlForAdmin(); // Check on load

    window.addEventListener('hashchange', checkUrlForAdmin);
    return () => window.removeEventListener('hashchange', checkUrlForAdmin);
  }, [isAuthenticated]);

  // Sync page theme based on admin mode and independent themes
  useEffect(() => {
    const activeTheme = isAdminMode ? adminTheme : theme;
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [isAdminMode, theme, adminTheme]);

  const handleAdminToggle = (shouldEnterAdmin) => {
    if (shouldEnterAdmin) {
      const hasSecretAccess = sessionStorage.getItem('charme_admin_secret_accessed') === 'true';
      if (hasSecretAccess) {
        window.location.hash = '#admin';
      }
    } else {
      setIsAuthenticated(false);
      sessionStorage.removeItem('charme_admin_authenticated');
      setIsAdminMode(false);
      window.location.hash = '#admin'; // Keep hash as #admin
      setAuthStep('login');
      setShowLoginModal(true); // Open the login modal
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    if (usernameInput === 'AdminCharme' && passwordInput === securitySettings.adminPassword) {
      setUsernameInput('');
      setPasswordInput('');
      setLoginError('');
      
      if (!securitySettings.admin2faSecret) {
        const newSecret = generateBase32Secret();
        setTemp2faSecret(newSecret);
        setAuthStep('2fa_setup');
      } else {
        const storedDeviceId = localStorage.getItem('charme_admin_device_id');
        const trustedDevices = securitySettings.trustedDevices || [];
        const trustedDevice = storedDeviceId ? trustedDevices.find(d => d.deviceId === storedDeviceId) : null;
        
        const isIpMatching = trustedDevice && clientIp !== 'unknown' && trustedDevice.ip === clientIp;
        
        let isRecent = false;
        if (trustedDevice && trustedDevice.lastLoginAt) {
          const lastLoginTime = new Date(trustedDevice.lastLoginAt).getTime();
          isRecent = (Date.now() - lastLoginTime) < 5 * 24 * 60 * 60 * 1000;
        }

        if (trustedDevice && isIpMatching && isRecent) {
          // Bypass 2FA
          const updatedDevices = trustedDevices.map(d => 
            d.deviceId === storedDeviceId 
              ? { ...d, lastLoginAt: new Date().toISOString() } 
              : d
          );
          updateSecuritySettings({ trustedDevices: updatedDevices });
          
          setIsAuthenticated(true);
          sessionStorage.setItem('charme_admin_authenticated', 'true');
          setIsAdminMode(true);
          setShowLoginModal(false);
          setAuthStep('login');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Force 2FA verification
          setAuthStep('2fa_verify');
        }
      }
    } else {
      setLoginError('Невірний логін або пароль. Будь ласка, спробуйте ще раз.');
    }
  };

  const handle2faSubmit = async (e) => {
    e.preventDefault();
    setOtpError('');

    const secretToCheck = authStep === '2fa_setup' ? temp2faSecret : securitySettings.admin2faSecret;
    const isValid = await verifyTOTP(otpInput, secretToCheck);

    if (isValid) {
      let activeSecret = securitySettings.admin2faSecret;
      if (authStep === '2fa_setup') {
        activeSecret = temp2faSecret;
      }

      // Generate or retrieve device ID
      let deviceId = localStorage.getItem('charme_admin_device_id');
      if (!deviceId) {
        deviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('charme_admin_device_id', deviceId);
      }

      // Update trustedDevices
      const trustedDevices = [...(securitySettings.trustedDevices || [])];
      const existingIdx = trustedDevices.findIndex(d => d.deviceId === deviceId);
      const nowStr = new Date().toISOString();
      
      if (existingIdx !== -1) {
        trustedDevices[existingIdx] = {
          ...trustedDevices[existingIdx],
          ip: clientIp,
          lastLoginAt: nowStr
        };
      } else {
        trustedDevices.push({
          deviceId,
          ip: clientIp,
          lastLoginAt: nowStr
        });
      }

      updateSecuritySettings({ 
        admin2faSecret: activeSecret,
        trustedDevices 
      });

      setIsAuthenticated(true);
      sessionStorage.setItem('charme_admin_authenticated', 'true');
      setIsAdminMode(true);
      setShowLoginModal(false);
      setOtpInput('');
      setOtpError('');
      setAuthStep('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setOtpError('Невірний або застарілий 2FA-код. Будь ласка, перевірте час на пристрої.');
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    setResetError('');

    if (resetEmailInput.trim().toLowerCase() === securitySettings.adminEmail.toLowerCase()) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoResetCode(code);
      setAuthStep('reset_verify');
      setResetError('');
    } else {
      setResetError('Користувача з такою електронною поштою не знайдено.');
    }
  };

  const handleResetVerifySubmit = (e) => {
    e.preventDefault();
    setResetError('');

    if (resetCodeInput.trim() === demoResetCode) {
      setResetCodeInput('');
      setResetError('');
      
      if (securitySettings.admin2faSecret) {
        setAuthStep('reset_2fa_verify');
      } else {
        setAuthStep('reset_new');
      }
    } else {
      setResetError('Невірний код підтвердження.');
    }
  };

  const handleReset2faSubmit = async (e) => {
    e.preventDefault();
    setResetError('');

    const isValid = await verifyTOTP(resetOtpInput, securitySettings.admin2faSecret);
    if (isValid) {
      setResetOtpInput('');
      setResetError('');
      setAuthStep('reset_new');
    } else {
      setResetError('Невірний або застарілий 2FA-код.');
    }
  };

  const handleResetNewPasswordSubmit = (e) => {
    e.preventDefault();
    setResetError('');

    if (resetNewPassword.length < 6) {
      setResetError('Пароль має містити щонайменше 6 символів.');
      return;
    }

    updateSecuritySettings({ adminPassword: resetNewPassword });
    setResetNewPassword('');
    setResetError('');
    setDemoSuccessMessage('Пароль успішно змінено! Увійдіть з новим паролем.');
    setAuthStep('login');
  };

  const handleCloseLogin = () => {
    setShowLoginModal(false);
    setUsernameInput('');
    setPasswordInput('');
    setLoginError('');
    setOtpInput('');
    setOtpError('');
    setResetEmailInput('');
    setResetCodeInput('');
    setResetNewPassword('');
    setResetOtpInput('');
    setResetError('');
    setDemoResetCode('');
    setDemoSuccessMessage('');
    window.location.hash = '';
    setAuthStep('login');
  };

  const handleBookService = (service) => {
    setPreselectedService(service);
    const element = document.getElementById('booking');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const clearPreselectedService = () => {
    setPreselectedService(null);
  };

  const isStrictAdmin = window.location.hash === '#admin';

  return (
    <>
      {isAdminMode ? (
        <nav className="admin-navbar">
          <div className="container admin-navbar-container">
            <div className="admin-navbar-left">
              <div className="logo">
                <img 
                  src={crownLogo} 
                  className="logo-icon" 
                  style={{ height: 35, width: 'auto' }} 
                  alt="Crown Logo" 
                />
                <div className="logo-text">
                  <span className="logo-title">Шарм</span>
                  <span className="logo-subtitle">Beauty Salon</span>
                </div>
              </div>
              <span className="admin-navbar-title">Панель Адміна</span>
            </div>
            <div className="admin-navbar-right">
              <button 
                className="theme-toggle" 
                onClick={toggleAdminTheme} 
                aria-label="Toggle theme"
                title={adminTheme === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
              >
                {adminTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button className="btn btn-secondary admin-logout-btn" onClick={() => handleAdminToggle(false)}>
                Вийти
              </button>
            </div>
          </div>
        </nav>
      ) : (
        <Navbar 
          isAdminMode={isAdminMode} 
          onAdminClick={handleAdminToggle} 
        />
      )}

      {isAdminMode ? (
        <AdminPanel />
      ) : (
        <main>
          <Hero />
          <Services onBookService={handleBookService} />
          <About />
          <Gallery />
          <Reviews />
          <Faq />
          <BookingForm 
            preselectedService={preselectedService} 
            clearPreselectedService={clearPreselectedService} 
          />
          <Contacts />
        </main>
      )}

      {!isAdminMode && (
        <>
          <Footer onAdminClick={handleAdminToggle} />
          <FloatingButtons />
        </>
      )}

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className={`login-modal-overlay ${isStrictAdmin ? 'admin-login-overlay' : ''}`} onClick={isStrictAdmin ? undefined : handleCloseLogin}>
          <div className="login-modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            {!isStrictAdmin && (
              <button className="login-modal-close" onClick={handleCloseLogin} aria-label="Close login modal">
                <X size={24} />
              </button>
            )}
            
            {/* Step 1: Login Form */}
            {authStep === 'login' && (
              <>
                <div className="login-modal-header">
                  <ShieldAlert size={36} className="login-header-icon" />
                  <h3>Вхід до кабінету адміністратора</h3>
                  <p>Введіть логін та пароль для авторизації</p>
                </div>
                {demoSuccessMessage && (
                  <div className="demo-alert-box" style={{ borderColor: '#4caf50', backgroundColor: 'rgba(76, 175, 80, 0.08)' }}>
                    <h4 style={{ color: '#4caf50' }}>Успішно</h4>
                    <p style={{ fontSize: '0.8rem' }}>{demoSuccessMessage}</p>
                  </div>
                )}
                <form onSubmit={handleLoginSubmit} className="login-form">
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label className="form-label">Логін</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="AdminCharme"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ position: 'relative', textAlign: 'left' }}>
                    <label className="form-label">Пароль</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="••••••••"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        required
                        style={{ width: '100%', paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password view"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {loginError && <p className="error-text">{loginError}</p>}
                  </div>
                  <button type="submit" className="btn btn-primary login-submit-btn">
                    Далі
                  </button>
                  <div className="login-forgot-link-wrapper">
                    <button type="button" className="login-link-btn" onClick={() => { setAuthStep('forgot_password'); setLoginError(''); setDemoSuccessMessage(''); }}>
                      Забули пароль?
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Step 2: 2FA Setup */}
            {authStep === '2fa_setup' && (
              <>
                <div className="login-modal-header">
                  <ShieldAlert size={36} className="login-header-icon" />
                  <h3>Налаштування 2FA безпеки</h3>
                  <p>Відскануйте QR-код у додатку Google Authenticator (або подібному)</p>
                </div>
                <div className="login-2fa-qr-container">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('otpauth://totp/CharmeBeauty:AdminCharme?secret=' + temp2faSecret + '&issuer=CharmeBeauty')}`}
                    alt="2FA QR Code" 
                    className="login-2fa-qr-image"
                  />
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '0' }}>Або введіть секретний ключ вручную:</p>
                  <span className="login-2fa-secret-text" title="Клацніть, щоб виділити">{temp2faSecret}</span>
                </div>
                <form onSubmit={handle2faSubmit} className="login-form">
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label className="form-label">Введіть 6-значний код підтвердження</label>
                    <input
                      type="text"
                      maxLength="6"
                      className="form-control"
                      placeholder="000000"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      required
                      style={{ letterSpacing: '0.2em', textAlign: 'center', fontSize: '1.2rem' }}
                    />
                    {otpError && <p className="error-text">{otpError}</p>}
                  </div>
                  <button type="submit" className="btn btn-primary login-submit-btn">
                    Підтвердити та увійти
                  </button>
                  <div className="login-forgot-link-wrapper" style={{ justifyContent: 'center' }}>
                    <button type="button" className="login-link-btn" onClick={() => { setAuthStep('login'); setOtpInput(''); setOtpError(''); }}>
                      Назад до входу
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Step 3: 2FA Verification */}
            {authStep === '2fa_verify' && (
              <>
                <div className="login-modal-header">
                  <ShieldAlert size={36} className="login-header-icon" />
                  <h3>Двохфакторна автентифікація</h3>
                  <p>Введіть 6-значний код безпеки з Google Authenticator</p>
                </div>
                <form onSubmit={handle2faSubmit} className="login-form">
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label className="form-label">Код безпеки</label>
                    <input
                      type="text"
                      maxLength="6"
                      className="form-control"
                      placeholder="000000"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      required
                      style={{ letterSpacing: '0.2em', textAlign: 'center', fontSize: '1.2rem' }}
                    />
                    {otpError && <p className="error-text">{otpError}</p>}
                  </div>
                  <button type="submit" className="btn btn-primary login-submit-btn">
                    Перевірити код
                  </button>
                  <div className="login-forgot-link-wrapper" style={{ justifyContent: 'center' }}>
                    <button type="button" className="login-link-btn" onClick={() => { setAuthStep('login'); setOtpInput(''); setOtpError(''); }}>
                      Назад до входу
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Step 4: Forgot Password */}
            {authStep === 'forgot_password' && (
              <>
                <div className="login-modal-header">
                  <ShieldAlert size={36} className="login-header-icon" />
                  <h3>Скидання пароля адміністратора</h3>
                  <p>Введіть зареєстровану пошту для отримання коду</p>
                </div>
                <form onSubmit={handleForgotPasswordSubmit} className="login-form">
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label className="form-label">Електронна пошта</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="tsybulin10@gmail.com"
                      value={resetEmailInput}
                      onChange={(e) => setResetEmailInput(e.target.value)}
                      required
                    />
                    {resetError && <p className="error-text">{resetError}</p>}
                  </div>
                  <button type="submit" className="btn btn-primary login-submit-btn">
                    Отримати код
                  </button>
                  <div className="login-forgot-link-wrapper" style={{ justifyContent: 'center' }}>
                    <button type="button" className="login-link-btn" onClick={() => { setAuthStep('login'); setResetEmailInput(''); setResetError(''); }}>
                      Назад до входу
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Step 5: Reset Code Verification */}
            {authStep === 'reset_verify' && (
              <>
                <div className="login-modal-header">
                  <ShieldAlert size={36} className="login-header-icon" />
                  <h3>Введіть код підтвердження</h3>
                  <p>Ми відправили 6-значний код на вашу пошту</p>
                </div>
                
                <div className="demo-alert-box">
                  <h4>📧 [Демонстрація] Повідомлення від сервера</h4>
                  <p>На пошту <strong>{securitySettings.adminEmail}</strong> надіслано лист.</p>
                  <p style={{ marginTop: '0.5rem' }}>Код для скидання: <code>{demoResetCode}</code></p>
                </div>

                <form onSubmit={handleResetVerifySubmit} className="login-form">
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label className="form-label">Код підтвердження</label>
                    <input
                      type="text"
                      maxLength="6"
                      className="form-control"
                      placeholder="000000"
                      value={resetCodeInput}
                      onChange={(e) => setResetCodeInput(e.target.value.replace(/\D/g, ''))}
                      required
                      style={{ letterSpacing: '0.2em', textAlign: 'center', fontSize: '1.2rem' }}
                    />
                    {resetError && <p className="error-text">{resetError}</p>}
                  </div>
                  <button type="submit" className="btn btn-primary login-submit-btn">
                    Далі
                  </button>
                  <div className="login-forgot-link-wrapper" style={{ justifyContent: 'center' }}>
                    <button type="button" className="login-link-btn" onClick={() => { setAuthStep('forgot_password'); setResetCodeInput(''); setResetError(''); }}>
                      Назад до пошти
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Step 5.5: Reset 2FA Verification */}
            {authStep === 'reset_2fa_verify' && (
              <>
                <div className="login-modal-header">
                  <ShieldAlert size={36} className="login-header-icon" />
                  <h3>Підтвердження 2FA безпеки</h3>
                  <p>Введіть 6-значний код безпеки з Google Authenticator для продовження скидання пароля</p>
                </div>
                <form onSubmit={handleReset2faSubmit} className="login-form">
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label className="form-label">Код безпеки</label>
                    <input
                      type="text"
                      maxLength="6"
                      className="form-control"
                      placeholder="000000"
                      value={resetOtpInput}
                      onChange={(e) => setResetOtpInput(e.target.value.replace(/\D/g, ''))}
                      required
                      style={{ letterSpacing: '0.2em', textAlign: 'center', fontSize: '1.2rem' }}
                    />
                    {resetError && <p className="error-text">{resetError}</p>}
                  </div>
                  <button type="submit" className="btn btn-primary login-submit-btn">
                    Підтвердити
                  </button>
                  <div className="login-forgot-link-wrapper" style={{ justifyContent: 'center' }}>
                    <button type="button" className="login-link-btn" onClick={() => { setAuthStep('reset_verify'); setResetOtpInput(''); setResetError(''); }}>
                      Назад
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Step 6: Enter New Password */}
            {authStep === 'reset_new' && (
              <>
                <div className="login-modal-header">
                  <ShieldAlert size={36} className="login-header-icon" />
                  <h3>Встановлення нового пароля</h3>
                  <p>Введіть новий пароль для доступу до адмін-панелі</p>
                </div>
                <form onSubmit={handleResetNewPasswordSubmit} className="login-form">
                  <div className="form-group" style={{ position: 'relative', textAlign: 'left' }}>
                    <label className="form-label">Новий пароль</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="••••••••"
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        required
                        style={{ width: '100%', paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password view"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {resetError && <p className="error-text">{resetError}</p>}
                  </div>
                  <button type="submit" className="btn btn-primary login-submit-btn">
                    Зберегти новий пароль
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
}

export default App;

