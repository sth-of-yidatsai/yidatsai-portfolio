import ContactForm from "../components/sections/contact-page/ContactForm";
import { useTranslation } from "../hooks/useTranslation";
import "./Contact.css";

export default function Contact() {
  const { t, locale } = useTranslation();
  return (
    <main className="contact-page">
      <header className="contact-hero">
        <p className="contact-eyebrow">{t('contact.hero')}</p>
        {locale.contact?.subtitle && (
          <h1 className="contact-title">{locale.contact.subtitle}</h1>
        )}
      </header>

      <ContactForm />
    </main>
  );
}
