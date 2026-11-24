import React from 'react';
import { Link } from 'react-router-dom';
import { policyUpdatedAt, privacySections, termsSections } from './policyContent';

function PolicySection({ section }) {
  return (
    <section
      key={section.title}
      className="rounded-[1.5rem] border border-white/80 bg-white/85 p-5 shadow-soft backdrop-blur-sm sm:p-6"
    >
      <h3 className="text-lg font-black text-dark-purple">{section.title}</h3>
      <p className="mt-3 text-sm leading-7 text-muted">{section.text}</p>
    </section>
  );
}

function Terms() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-40" />

      <div className="section-shell relative py-8 sm:py-12 lg:py-16">
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-white/80 bg-white/88 p-5 shadow-[0_20px_60px_rgba(58,39,99,0.12)] backdrop-blur-xl sm:p-7 lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-5">
                <div className="eyebrow">
                  <span aria-hidden="true">✦</span>
                  <span>Juridiskā informācija</span>
                </div>

                <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-dark-purple sm:text-5xl lg:text-6xl">
                  Lietošanas noteikumi un
                  <span className="block bg-gradient-to-r from-medium-purple via-light-purple to-[#12b5a6] bg-clip-text text-transparent">
                    privātuma politika
                  </span>
                </h1>

                <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
                  Noteikumi skaidro vietnes lietošanu; privātuma politika - personas datu apstrādi un tavas tiesības.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {[
                  { label: 'Pieprasījumi', value: 'Atbildes VDAR termiņā' },
                  { label: 'Datu dzēšana', value: 'Līdz 30 dienām' },
                  { label: 'Atjaunināts', value: policyUpdatedAt },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[1.5rem] border border-white/80 bg-white p-4 shadow-soft"
                  >
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-muted">
                      {stat.label}
                    </div>
                    <div className="mt-2 text-lg font-black text-dark-purple">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section aria-labelledby="privacy-policy-heading" className="space-y-4">
            <div>
              <div className="eyebrow">Personas datu apstrāde</div>
              <h2 id="privacy-policy-heading" className="mt-3 text-2xl font-black text-dark-purple sm:text-3xl">
                Privātuma politika
              </h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {privacySections.map((section) => <PolicySection key={section.title} section={section} />)}
            </div>
          </section>

          <section aria-labelledby="terms-heading" className="space-y-4">
            <div>
              <div className="eyebrow">Drošai un cieņpilnai videi</div>
              <h2 id="terms-heading" className="mt-3 text-2xl font-black text-dark-purple sm:text-3xl">
                Lietošanas noteikumi
              </h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {termsSections.map((section) => <PolicySection key={section.title} section={section} />)}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/80 bg-white/85 p-5 text-sm leading-7 text-muted shadow-soft backdrop-blur-sm sm:p-6">
            <p>
              Datu pieprasījumiem: <a className="font-bold text-medium-purple underline" href="mailto:mail@raduburzins.lv">mail@raduburzins.lv</a>.
            </p>
            <p className="mt-3 text-xs">
              Šī informācija ir sagatavota, balstoties uz pašlaik pārbaudāmo vietnes funkcionalitāti. Tā pati par sevi nav juridisks apliecinājums pilnīgai VDAR atbilstībai.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Terms;
