import React from 'react';
import './Contact.css';

export default function Contact() {
  return (
    <main className="contact-page">
      <section className="contact-hero container-narrow">
        <h1 className="contact-title">聯絡我</h1>
        <p className="contact-subtitle">歡迎合作、專案洽詢或任何想法交流</p>
      </section>

      <section className="contact-content container-narrow">
        <ul className="contact-list">
          <li className="contact-item">
            <span className="contact-label">Email</span>
            <a className="contact-link clickable" href="mailto:hello@yidatsai.com">hello@yidatsai.com</a>
          </li>
          <li className="contact-item">
            <span className="contact-label">Instagram</span>
            <a className="contact-link clickable" href="#" target="_blank" rel="noreferrer">@yida</a>
          </li>
          <li className="contact-item">
            <span className="contact-label">Behance</span>
            <a className="contact-link clickable" href="#" target="_blank" rel="noreferrer">behance.net/yida</a>
          </li>
          <li className="contact-item">
            <span className="contact-label">LinkedIn</span>
            <a className="contact-link clickable" href="#" target="_blank" rel="noreferrer">linkedin.com/in/yida</a>
          </li>
        </ul>
      </section>
    </main>
  );
}


