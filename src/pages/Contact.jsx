import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import ContactForm from "../components/sections/contact-page/ContactForm";
import "./Contact.css";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

export default function Contact() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
      <main className="contact-page">
        <header className="contact-hero">
          <p className="contact-eyebrow">Get in Touch</p>
          <h1 className="contact-title">Let&apos;s Work Together</h1>
        </header>

        <ContactForm />
      </main>
    </GoogleReCaptchaProvider>
  );
}
