import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import ContactForm from "../components/sections/contact-page/ContactForm";
import { useTranslation } from "../hooks/useTranslation";
import "./Contact.css";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

export default function Contact() {
  const { t, locale } = useTranslation();
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
      <main className="contact-page">
        <header className="contact-hero">
          <p className="contact-eyebrow">{t('contact.hero')}</p>
          {locale.contact?.subtitle && (
            <h1 className="contact-title">{locale.contact.subtitle}</h1>
          )}
        </header>

        <ContactForm />
      </main>
    </GoogleReCaptchaProvider>
  );
}
