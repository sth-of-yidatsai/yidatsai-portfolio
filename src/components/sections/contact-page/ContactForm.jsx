import { useState, useEffect, useCallback } from "react";
import emailjs from "@emailjs/browser";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import "./ContactForm.css";

const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || "YOUR_PUBLIC_KEY";

// Rate limit: max 3 submissions per hour
const RATE_LIMIT_MAX   = 3;
const RATE_LIMIT_MS    = 60 * 60 * 1000;
const RATE_LIMIT_KEY   = "cf_submissions";

// Toast auto-dismiss timing (ms)
const TOAST_VISIBLE_MS = 3500;
const TOAST_REMOVE_MS  = 4200;

// ── Set true to preview toast style, false in production ──────────────────────
const PREVIEW_TOAST = false;

const INTERESTS = [
  "Logo Design",
  "Complete Brand Identity System (CIS)",
  "Website Visuals",
  "Print Design",
  "Packaging Design",
  "Other",
];

const BUDGET_STEPS = [1200, 2500, 3600, 4500, 6000];

const TIMELINES = [
  "Within 1 month",
  "2-3 months",
  "3-6 months",
  "Over 3 months",
  "Flexible timeline",
];

const TAIWAN_COUNTIES = [
  "Taiwan",
  "Taipei City",
  "New Taipei City",
  "Taoyuan City",
  "Taichung City",
  "Tainan City",
  "Kaohsiung City",
  "Hsinchu City",
  "Keelung City",
  "Hsinchu County",
  "Miaoli County",
  "Changhua County",
  "Nantou County",
  "Yunlin County",
  "Chiayi City",
  "Chiayi County",
  "Pingtung County",
  "Yilan County",
  "Hualien County",
  "Taitung County",
  "Penghu County",
  "Kinmen County",
  "Lienchiang County",
];

const REGIONS = [
  "International",
  "Asia Pacific",
  "North America",
  "Europe",
  "Middle East",
  "Latin America",
  "Africa",
  "Oceania",
];

const initialForm = {
  firstName: "",
  lastName: "",
  company: "",
  email: "",
  phone: "",
  locationCounty: "Taiwan",
  locationRegion: "International",
  interests: [],
  budgetIndex: 3,
  timeline: "",
  message: "",
  honeypot: "",       // hidden anti-bot field
};

// ─── Rate limit helpers ───────────────────────────────────────────────────────

function getRateRecords() {
  try {
    return JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || "[]");
  } catch {
    return [];
  }
}

function isRateLimited() {
  const now = Date.now();
  const recent = getRateRecords().filter((t) => now - t < RATE_LIMIT_MS);
  return recent.length >= RATE_LIMIT_MAX;
}

function recordSubmission() {
  const now = Date.now();
  const recent = getRateRecords().filter((t) => now - t < RATE_LIMIT_MS);
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify([...recent, now]));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContactForm() {
  const [form, setForm]           = useState(initialForm);
  const [status, setStatus]       = useState("idle"); // idle | sending | success | error | rate-limited
  const [toastVisible, setToastVisible] = useState(false);
  const { executeRecaptcha }      = useGoogleReCaptcha();

  // Auto-dismiss toast (skipped in preview mode)
  useEffect(() => {
    if (PREVIEW_TOAST) return;
    if (status === "idle" || status === "sending") return;

    setToastVisible(true);
    const hideTimer   = setTimeout(() => setToastVisible(false), TOAST_VISIBLE_MS);
    const resetTimer  = setTimeout(() => setStatus("idle"),      TOAST_REMOVE_MS);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(resetTimer);
    };
  }, [status]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleInterest = useCallback((label) => {
    setForm((prev) => {
      const has = prev.interests.includes(label);
      return {
        ...prev,
        interests: has
          ? prev.interests.filter((i) => i !== label)
          : [...prev.interests, label],
      };
    });
  }, []);

  const handleTimeline = useCallback((t) => {
    setForm((prev) => ({ ...prev, timeline: prev.timeline === t ? "" : t }));
  }, []);

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Honeypot check — bots fill hidden fields
      if (form.honeypot) return;

      if (!form.firstName || !form.lastName || !form.email) return;
      if (!executeRecaptcha) return;

      // Rate limit check
      if (isRateLimited()) {
        setStatus("rate-limited");
        return;
      }

      setStatus("sending");

      try {
        await executeRecaptcha("contact_form");

        const budgetValue = BUDGET_STEPS[form.budgetIndex];
        const budgetLabel =
          form.budgetIndex === BUDGET_STEPS.length - 1
            ? `$${budgetValue.toLocaleString()}+`
            : `$${budgetValue.toLocaleString()}`;

        const templateParams = {
          from_name:  `${form.firstName} ${form.lastName}`,
          from_email: form.email,
          phone:      form.phone    || "—",
          company:    form.company  || "—",
          location:   `${form.locationCounty} / ${form.locationRegion}`,
          interests:  form.interests.length ? form.interests.join(", ") : "—",
          budget:     budgetLabel,
          timeline:   form.timeline || "—",
          message:    form.message  || "—",
        };

        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          { publicKey: EMAILJS_PUBLIC_KEY }
        );

        recordSubmission();
        setStatus("success");
        setForm(initialForm);
      } catch (err) {
        console.error("EmailJS error:", err);
        setStatus("error");
      }
    },
    [form, executeRecaptcha]
  );

  // ─── Derived ───────────────────────────────────────────────────────────────

  const budgetValue = BUDGET_STEPS[form.budgetIndex];
  const budgetDisplay =
    form.budgetIndex === BUDGET_STEPS.length - 1
      ? `$\u00a0${budgetValue.toLocaleString()}+`
      : `$\u00a0${budgetValue.toLocaleString()}`;

  const toastMessage =
    status === "success"      ? "Message sent! I\u2019ll get back to you soon."
    : status === "error"      ? "Something went wrong. Please try again or email hello@yidatsai.com directly."
    : status === "rate-limited" ? "Too many submissions. Please try again later."
    : "";

  const toastType =
    status === "success" ? "success"
    : "error";

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <section className="cf">

      {/* ── Toast notification (fixed, outside layout flow) ── */}
      {(PREVIEW_TOAST || (status !== "idle" && status !== "sending")) && (
        <div
          className={`cf__toast cf__toast--${PREVIEW_TOAST ? "success" : toastType}${(PREVIEW_TOAST || toastVisible) ? " cf__toast--visible" : ""}`}
          role="status"
          aria-live="polite"
        >
          {PREVIEW_TOAST ? "Message sent! I\u2019ll get back to you soon." : toastMessage}
        </div>
      )}

      <form className="cf__form" onSubmit={handleSubmit} noValidate>

        {/* ── Honeypot (hidden from real users, bots fill it) ── */}
        <div className="cf__honeypot" aria-hidden="true">
          <input
            type="text"
            name="honeypot"
            value={form.honeypot}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* ── Name ── */}
        <div className="cf__row">
          <span className="cf__label">My name is</span>
          <div className="cf__fields cf__fields--split">
            <input
              className="cf__input"
              type="text"
              name="firstName"
              placeholder="First Name*"
              value={form.firstName}
              onChange={handleChange}
              required
            />
            <input
              className="cf__input"
              type="text"
              name="lastName"
              placeholder="Last Name*"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* ── Company ── */}
        <div className="cf__row">
          <span className="cf__label">Company/Brand Name</span>
          <div className="cf__fields">
            <input
              className="cf__input"
              type="text"
              name="company"
              placeholder="Please enter company or brand name"
              value={form.company}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ── Contact ── */}
        <div className="cf__row">
          <span className="cf__label">You can reach me at</span>
          <div className="cf__fields cf__fields--split">
            <input
              className="cf__input"
              type="email"
              name="email"
              placeholder="email@example.com*"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              className="cf__input"
              type="tel"
              name="phone"
              placeholder="+886 912-345-678"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ── Location ── */}
        <div className="cf__row">
          <span className="cf__label">My location</span>
          <div className="cf__fields cf__fields--split">
            <div className="cf__select-wrap">
              <select
                className="cf__select"
                name="locationCounty"
                value={form.locationCounty}
                onChange={handleChange}
              >
                {TAIWAN_COUNTIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <span className="cf__select-arrow" aria-hidden="true">&#x25BE;</span>
            </div>
            <div className="cf__select-wrap">
              <select
                className="cf__select"
                name="locationRegion"
                value={form.locationRegion}
                onChange={handleChange}
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <span className="cf__select-arrow" aria-hidden="true">&#x25BE;</span>
            </div>
          </div>
        </div>

        {/* ── Interests ── */}
        <div className="cf__row cf__row--interests">
          <span className="cf__label">I am primarily interested in</span>
          <div className="cf__fields">
            <div className="cf__interest-grid">
              {INTERESTS.map((label) => {
                const checked = form.interests.includes(label);
                return (
                  <label key={label} className="cf__interest-item">
                    <span
                      className={`cf__radio-ring${checked ? " cf__radio-ring--checked" : ""}`}
                      aria-hidden="true"
                    />
                    <input
                      type="checkbox"
                      className="cf__checkbox-hidden"
                      checked={checked}
                      onChange={() => handleInterest(label)}
                    />
                    <span className="cf__interest-label">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Budget ── */}
        <div className="cf__row cf__row--budget">
          <span className="cf__label">My budget is</span>
          <div className="cf__fields">
            <div className="cf__budget-track">
              <div className="cf__budget-dots">
                {BUDGET_STEPS.map((v, i) => (
                  <button
                    key={v}
                    type="button"
                    className={`cf__budget-step${i === form.budgetIndex ? " cf__budget-step--active" : ""}`}
                    onClick={() => setForm((prev) => ({ ...prev, budgetIndex: i }))}
                    aria-label={`Budget ${i === BUDGET_STEPS.length - 1 ? `$${v.toLocaleString()}+` : `$${v.toLocaleString()}`}`}
                  >
                    <span className="cf__budget-dot-wrap">
                      <span className="cf__budget-dot" />
                    </span>
                    <span className="cf__budget-label">
                      {i === BUDGET_STEPS.length - 1
                        ? `$\u00a0${v.toLocaleString()}+`
                        : `$\u00a0${v.toLocaleString()}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Timeline ── */}
        <div className="cf__row cf__row--timeline">
          <span className="cf__label">Expected Timeline</span>
          <div className="cf__fields">
            <div className="cf__timeline-grid">
              {TIMELINES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`cf__timeline-btn${form.timeline === t ? " cf__timeline-btn--active" : ""}`}
                  onClick={() => handleTimeline(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Message ── */}
        <div className="cf__row cf__row--message">
          <span className="cf__label">Please tell me more about your project</span>
          <div className="cf__fields">
            <textarea
              className="cf__textarea"
              name="message"
              placeholder="Please briefly describe your brand background, target audience, and the goals you wish to achieve with this design project"
              value={form.message}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </div>

        {/* ── Footer: note ── */}
        <div className="cf__footer">
          <p className="cf__note">
            Fields marked with * are required. Other information is optional but will help us better understand your needs.
          </p>
        </div>

        {/* ── Send button ── */}
        <div className="cf__send-wrap">
          <button
            type="submit"
            className={`cf__send-btn clickable${status === "sending" ? " cf__send-btn--sending" : ""}`}
            disabled={status === "sending"}
            aria-label="Send"
          >
            <span className="cf__send-text">
              {status === "sending" ? "Sending" : "Send"}
            </span>
          </button>
        </div>

      </form>
    </section>
  );
}
