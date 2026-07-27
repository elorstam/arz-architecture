"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import PremiumFooter from "@/components/PremiumFooter";

gsap.registerPlugin(ScrollTrigger);

const googleMapsUrl =
  "https://www.google.com/maps/search/?api=1&query=Arz%20Mimarl%C4%B1k%20Abdurrahmangazi%20Mahallesi%20Bet%C3%BCl%20Sokak%20Tuna%20%C4%B0%C5%9F%20Merkezi%20No%202%2F4%20Sancaktepe%20%C4%B0stanbul";

const instagramUrl = "https://www.instagram.com/arzmimarliknet/";
const linkedinUrl = "https://www.linkedin.com/company/90222590";

type FormStatus = "idle" | "sending" | "success" | "error";

export default function ContactPage() {
  const pageRef = useRef<HTMLElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useLayoutEffect(() => {
    const page = pageRef.current;

    if (!page) {
      return;
    }

    const context = gsap.context(() => {
      const label = page.querySelector<HTMLElement>(
        "[data-contact-label]",
      );

      const leftItems = gsap.utils.toArray<HTMLElement>(
        "[data-contact-info]",
      );

      const formHeading = page.querySelector<HTMLElement>(
        "[data-form-heading]",
      );

      const formFields = gsap.utils.toArray<HTMLElement>(
        "[data-form-field]",
      );

      const timeline = gsap.timeline({
        delay: 0.1,
        defaults: {
          ease: "power3.out",
        },
      });

      timeline
        .fromTo(
          label,
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
          },
        )
        .fromTo(
          leftItems,
          {
            opacity: 0,
            x: -40,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.85,
            stagger: 0.09,
          },
          "-=0.3",
        )
        .fromTo(
          formHeading,
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
          },
          "-=0.75",
        )
        .fromTo(
          formFields,
          {
            opacity: 0,
            y: 35,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.08,
          },
          "-=0.45",
        );

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, page);

    return () => {
      context.revert();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (formStatus === "sending") {
      return;
    }

    setFormStatus("sending");
    setStatusMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      projectType: String(formData.get("projectType") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
      website: String(formData.get("website") ?? "").trim(),
    };

    if (!payload.name || !payload.phone || !payload.message) {
      setFormStatus("error");
      setStatusMessage(
        "Lütfen ad soyad, telefon ve mesaj alanlarını doldurun.",
      );
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.message || "Mesaj gönderilirken bir hata oluştu.",
        );
      }

      form.reset();
      setFormStatus("success");
      setStatusMessage(
        "Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.",
      );
    } catch (error) {
      setFormStatus("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.",
      );
    }
  }

  return (
    <main
      ref={pageRef}
      className="min-h-screen overflow-hidden bg-[#090909] text-white"
    >
      <Navbar />

      <section className="px-6 pb-24 pt-36 md:px-10 md:pb-32 md:pt-40 lg:px-16 lg:pb-40">
        <div className="mx-auto w-full max-w-[1800px]">
          <p
            data-contact-label
            className="text-[10px] uppercase tracking-[0.45em] text-white/40 opacity-0"
          >
            İletişim
          </p>

          <div className="mt-14 grid gap-20 lg:grid-cols-[0.82fr_1.18fr] lg:gap-0">
            {/* Sol taraf */}
            <div className="lg:border-r lg:border-white/15 lg:pr-16 xl:pr-24">
              <div className="border-t border-white/15">
                {/* Telefon */}
                <a
                  data-contact-info
                  href="tel:+905425704429"
                  className="group grid grid-cols-[42px_1fr_auto] items-center gap-6 border-b border-white/15 py-8 opacity-0 md:py-10"
                >
                  <PhoneIcon />

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.32em] text-white/40">
                      Telefon
                    </p>

                    <p className="mt-3 text-xl font-light tracking-[-0.025em] text-white md:text-2xl">
                      +90 542 570 44 29
                    </p>
                  </div>

                  <span className="text-xl font-light text-white/35 transition-all duration-300 group-hover:translate-x-2 group-hover:text-white">
                    →
                  </span>
                </a>

                {/* E-posta */}
                <a
                  data-contact-info
                  href="mailto:info@arzmimarlik.net"
                  className="group grid grid-cols-[42px_1fr_auto] items-center gap-6 border-b border-white/15 py-8 opacity-0 md:py-10"
                >
                  <MailIcon />

                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.32em] text-white/40">
                      E-posta
                    </p>

                    <p className="mt-3 break-all text-xl font-light tracking-[-0.025em] text-white md:text-2xl">
                      info@arzmimarlik.net
                    </p>
                  </div>

                  <span className="text-xl font-light text-white/35 transition-all duration-300 group-hover:translate-x-2 group-hover:text-white">
                    →
                  </span>
                </a>

                {/* Adres */}
                <div
                  data-contact-info
                  className="grid grid-cols-[42px_1fr_auto] gap-6 border-b border-white/15 py-8 opacity-0 md:py-10"
                >
                  <LocationIcon />

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.32em] text-white/40">
                      Adres
                    </p>

                    <address className="mt-3 not-italic text-xl font-light leading-[1.5] tracking-[-0.025em] text-white md:text-2xl">
                      Abdurrahmangazi Mah.
                      <br />
                      Betül Sok.
                      <br />
                      Tuna İş Merkezi No: 2/4
                      <br />
                      Sancaktepe / İstanbul
                    </address>

                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/map mt-7 inline-flex items-center gap-4 border border-white/30 px-5 py-4 text-[9px] uppercase tracking-[0.3em] text-white transition-colors duration-300 hover:border-white hover:bg-white hover:text-black"
                    >
                      <MapIcon />

                      Yol Tarifi Al

                      <span className="text-base transition-transform duration-300 group-hover/map:translate-x-1 group-hover/map:-translate-y-1">
                        ↗
                      </span>
                    </a>
                  </div>

                  <span className="pt-8 text-xl font-light text-white/35">
                    →
                  </span>
                </div>

                {/* Çalışma saatleri */}
                <div
                  data-contact-info
                  className="grid grid-cols-[42px_1fr_auto] items-center gap-6 border-b border-white/15 py-8 opacity-0 md:py-10"
                >
                  <ClockIcon />

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.32em] text-white/40">
                      Çalışma Saatleri
                    </p>

                    <p className="mt-3 text-xl font-light leading-[1.45] tracking-[-0.025em] text-white md:text-2xl">
                      Pazartesi – Cuma
                      <br />
                      09:00 – 18:00
                    </p>
                  </div>

                  <span className="text-xl font-light text-white/35">
                    →
                  </span>
                </div>

                {/* Sosyal medya */}
                <div
                  data-contact-info
                  className="grid grid-cols-[42px_1fr_auto] items-center gap-6 border-b border-white/15 py-8 opacity-0 md:py-10"
                >
                  <ShareIcon />

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.32em] text-white/40">
                      Sosyal Medya
                    </p>

                    <div className="mt-3 flex flex-col items-start gap-2">
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/social text-xl font-light tracking-[-0.025em] text-white md:text-2xl"
                      >
                        Instagram
                        <span className="ml-3 inline-block text-sm text-white/50 transition-transform duration-300 group-hover/social:translate-x-1 group-hover/social:-translate-y-1">
                          ↗
                        </span>
                      </a>

                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/social text-xl font-light tracking-[-0.025em] text-white md:text-2xl"
                      >
                        LinkedIn
                        <span className="ml-3 inline-block text-sm text-white/50 transition-transform duration-300 group-hover/social:translate-x-1 group-hover/social:-translate-y-1">
                          ↗
                        </span>
                      </a>
                    </div>
                  </div>

                  <span className="text-xl font-light text-white/35">
                    →
                  </span>
                </div>
              </div>
            </div>

            {/* Sağ taraf – form */}
            <div className="lg:pl-16 xl:pl-24">
              <p
                data-form-heading
                className="text-[10px] uppercase tracking-[0.45em] text-white/40 opacity-0"
              >
                Bize Yazın
              </p>

              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="mt-10"
                noValidate
              >
                {/* Spam koruması */}
                <div
                  className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
                  aria-hidden="true"
                >
                  <label htmlFor="website">Website</label>

                  <input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    label="Ad Soyad"
                    name="name"
                    type="text"
                    placeholder="Adınız Soyadınız"
                    autoComplete="name"
                    required
                  />

                  <FormField
                    label="Telefon"
                    name="phone"
                    type="tel"
                    placeholder="05XX XXX XX XX"
                    autoComplete="tel"
                    required
                  />

                  <FormField
                    label="E-posta"
                    name="email"
                    type="email"
                    placeholder="ornek@mail.com"
                    autoComplete="email"
                  />

                  <div
                    data-form-field
                    className="relative border border-white/20 bg-white/[0.015] opacity-0 transition-colors duration-300 focus-within:border-white/65"
                  >
                    <label
                      htmlFor="projectType"
                      className="pointer-events-none absolute left-5 top-5 z-10 text-[9px] uppercase tracking-[0.3em] text-white/75"
                    >
                      Proje Türü
                    </label>

                    <select
                      id="projectType"
                      name="projectType"
                      defaultValue=""
                      className="h-[92px] w-full appearance-none bg-transparent px-5 pb-4 pt-10 text-base text-white/65 outline-none"
                    >
                      <option value="" className="bg-[#111] text-white">
                        Seçiniz
                      </option>

                      <option
                        value="Konut"
                        className="bg-[#111] text-white"
                      >
                        Konut
                      </option>

                      <option
                        value="Villa"
                        className="bg-[#111] text-white"
                      >
                        Villa
                      </option>

                      <option
                        value="Ticari Alan"
                        className="bg-[#111] text-white"
                      >
                        Ticari Alan
                      </option>

                      <option
                        value="Ofis"
                        className="bg-[#111] text-white"
                      >
                        Ofis
                      </option>

                      <option
                        value="İç Mimarlık"
                        className="bg-[#111] text-white"
                      >
                        İç Mimarlık
                      </option>

                      <option
                        value="Kentsel Dönüşüm"
                        className="bg-[#111] text-white"
                      >
                        Kentsel Dönüşüm
                      </option>

                      <option
                        value="Mimari Proje"
                        className="bg-[#111] text-white"
                      >
                        Mimari Proje
                      </option>

                      <option
                        value="Diğer"
                        className="bg-[#111] text-white"
                      >
                        Diğer
                      </option>
                    </select>

                    <span className="pointer-events-none absolute right-5 top-1/2 mt-2 -translate-y-1/2 text-white/60">
                      ⌄
                    </span>
                  </div>
                </div>

                <div
                  data-form-field
                  className="relative mt-6 border border-white/20 bg-white/[0.015] opacity-0 transition-colors duration-300 focus-within:border-white/65"
                >
                  <label
                    htmlFor="message"
                    className="absolute left-5 top-5 text-[9px] uppercase tracking-[0.3em] text-white/75"
                  >
                    Mesaj <span className="text-white/45">*</span>
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={8}
                    placeholder="Projeniz hakkında detaylı bilgi yazabilirsiniz..."
                    className="min-h-[220px] w-full resize-y bg-transparent px-5 pb-5 pt-12 text-base leading-7 text-white outline-none placeholder:text-white/35"
                  />
                </div>

                <button
                  data-form-field
                  type="submit"
                  disabled={formStatus === "sending"}
                  className="group mt-6 flex w-full items-center justify-between border border-white/30 px-7 py-6 text-left opacity-0 transition-all duration-300 hover:border-white hover:bg-white hover:text-black disabled:cursor-wait disabled:opacity-50"
                >
                  <span className="text-sm uppercase tracking-[0.32em]">
                    {formStatus === "sending"
                      ? "Gönderiliyor"
                      : "Gönder"}
                  </span>

                  <span className="text-xl transition-transform duration-300 group-hover:translate-x-2">
                    →
                  </span>
                </button>

                <div
                  data-form-field
                  className="mt-6 opacity-0"
                  aria-live="polite"
                >
                  {statusMessage && (
                    <p
                      className={`text-sm leading-6 ${
                        formStatus === "success"
                          ? "text-white/75"
                          : "text-red-300/90"
                      }`}
                    >
                      {statusMessage}
                    </p>
                  )}

                  <p className="flex items-start gap-3 text-xs leading-6 text-white/35">
                    <LockIcon />

                    Gönderdiğiniz bilgiler gizli tutulur ve yalnızca
                    sizinle iletişim kurmak için kullanılır.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <PremiumFooter />
    </main>
  );
}

type FormFieldProps = {
  label: string;
  name: string;
  type: "text" | "tel" | "email";
  placeholder: string;
  autoComplete: string;
  required?: boolean;
};

function FormField({
  label,
  name,
  type,
  placeholder,
  autoComplete,
  required = false,
}: FormFieldProps) {
  return (
    <div
      data-form-field
      className="relative border border-white/20 bg-white/[0.015] opacity-0 transition-colors duration-300 focus-within:border-white/65"
    >
      <label
        htmlFor={name}
        className="absolute left-5 top-5 text-[9px] uppercase tracking-[0.3em] text-white/75"
      >
        {label}

        {required && <span className="ml-1 text-white/45">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="h-[92px] w-full bg-transparent px-5 pb-4 pt-10 text-base text-white outline-none placeholder:text-white/35"
      />
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="h-7 w-7 text-white"
      aria-hidden="true"
    >
      <path d="M6.6 2.8 9.3 7a1.5 1.5 0 0 1-.2 1.8L7.5 10.4a16 16 0 0 0 6.1 6.1l1.6-1.6a1.5 1.5 0 0 1 1.8-.2l4.2 2.7a1.5 1.5 0 0 1 .6 1.8l-.7 2.1a2 2 0 0 1-1.9 1.4C9.3 22.7 1.3 14.7 1.3 4.8a2 2 0 0 1 1.4-1.9l2.1-.7a1.5 1.5 0 0 1 1.8.6Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="h-7 w-7 text-white"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="1.5" />

      <path d="m3 6 9 7 9-7" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="h-7 w-7 text-white"
      aria-hidden="true"
    >
      <path d="M20 10c0 5.5-8 12-8 12S4 15.5 4 10a8 8 0 1 1 16 0Z" />

      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="h-7 w-7 text-white"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" />

      <path d="M12 6.5V12l4 2.5" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="h-7 w-7 text-white"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="2.5" />

      <circle cx="6" cy="12" r="2.5" />

      <circle cx="18" cy="19" r="2.5" />

      <path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m3 5 5-2 8 2 5-2v16l-5 2-8-2-5 2V5Z" />

      <path d="M8 3v16M16 5v16" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="mt-1 h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <rect x="5" y="10" width="14" height="11" rx="1.5" />

      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}