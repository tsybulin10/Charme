import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import './Faq.css';

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = [
    {
      question: 'Які у вас ціни та чи є приховані доплати?',
      answer: 'Усі ціни на наші послуги є повністю прозорими та фіксованими. Ви можете ознайомитися з ними в розділі «Послуги та ціни». Жодних прихованих платежів або обов\'язкових доплат на місці немає.'
    },
    {
      question: 'Яка середня тривалість процедури?',
      answer: 'Тривалість залежить від обраної процедури: комплексний манікюр триває близько 1-1.5 години, моделювання та фарбування брів — 45-60 хвилин, стрижка та професійна укладка волосся — від 1 до 2 годин. Точний час для вашого візиту обов\'язково підтвердить адміністратор під час дзвінка.'
    },
    {
      question: 'Чи стерильні інструменти, які ви використовуєте?',
      answer: 'Ваша безпека — наш абсолютний пріоритет. Усі металеві інструменти проходять обов\'язкову триетапну стерилізацію: дезінфекція у спеціальному розчині, передстерилізаційне очищення та термічна обробка в сухожаровій шафі (автоклаві) в індивідуальних крафт-пакетах, які відкриваються виключно при вас. Для решти процедур застосовуються тільки одноразові розхідні матеріали.'
    },
    {
      question: 'Де саме ви знаходитесь і чи є парковка?',
      answer: 'Ми розташовані за адресою: м. Київ, вул. Юлії Здановської, 71Г (3 поверх). Біля будівлі є безкоштовна гостьова парковка, де ви можете зручно залишити свій автомобіль.'
    },
    {
      question: 'Як я можу скасувати або перенести свій запис?',
      answer: 'Ми з розумінням ставимося до змін у планах. Ви можете безкоштовно скасувати або перенести візит. Для цього просто зателефонуйте нам або напишіть у будь-який зручний месенджер (Telegram/WhatsApp) щонайменше за 2 години до запланованого часу.'
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section" id="faq">
      <div className="container">
        <div className="faq-header animate-fade-in">
          <HelpCircle size={28} className="faq-title-icon" />
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>Часті запитання</h2>
          <p className="faq-subtitle">Відповідаємо на найпопулярніші запитання клієнток перед візитом</p>
        </div>

        <div className="faq-list">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`faq-item glass-card ${isOpen ? 'active' : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <div className="faq-question-row">
                  <h3 className="faq-question">{item.question}</h3>
                  <div className={`faq-arrow-wrapper ${isOpen ? 'rotated' : ''}`}>
                    <ChevronDown size={18} />
                  </div>
                </div>
                
                <div 
                  className="faq-answer-wrapper"
                  style={{
                    maxHeight: isOpen ? '200px' : '0px',
                    opacity: isOpen ? 1 : 0
                  }}
                >
                  <p className="faq-answer">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faq;
