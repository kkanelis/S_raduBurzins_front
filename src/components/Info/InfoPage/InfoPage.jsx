import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../../services/api';

const highlights = [
  {
    title: 'Kalendārs',
    text: 'Vārda dienas, dzimšanas dienas un īpašie notikumi vienuviet.',
    icon: '📅',
  },
  {
    title: 'Notikumi',
    text: 'Pievieno un pārvaldi ģimenes pasākumus ātri un pārskatāmi.',
    icon: '🗂️',
  },
  {
    title: 'Profils',
    text: 'Atjauno savu profilu un turi svarīgo informāciju kārtībā.',
    icon: '👤',
  },
];

function InfoPage() {
  const location = useLocation();
  const [updates, setUpdates] = useState([]);
  const [updatesLoading, setUpdatesLoading] = useState(true);
  const [updatesError, setUpdatesError] = useState('');

  useEffect(() => {
    if (location.hash !== '#site-updates') return;

    document.getElementById('site-updates')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [location.hash]);

  useEffect(() => {
    let active = true;
    api.get('/api/site-updates')
      .then(({ data }) => {
        if (!active) return;
        setUpdates(Array.isArray(data?.updates) ? data.updates : []);
      })
      .catch(() => {
        if (!active) return;
        setUpdatesError('Neizdevās ielādēt vietnes jaunumus.');
      })
      .finally(() => {
        if (active) setUpdatesLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-40 pointer-events-none" />

      <div className="section-shell relative py-8 sm:py-12 lg:py-16">
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-white/80 bg-white/88 p-5 shadow-[0_20px_60px_rgba(58,39,99,0.12)] backdrop-blur-xl sm:p-7 lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="space-y-5">
                <div className="eyebrow">
                  <span>✦</span>
                  <span>Par mājaslapu</span>
                </div>

                <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-dark-purple sm:text-5xl lg:text-6xl">
                  Radu Burziņš
                  <span className="block bg-gradient-to-r from-medium-purple via-light-purple to-[#12b5a6] bg-clip-text text-transparent">
                    digitālā ģimenes vieta
                  </span>
                </h1>

                <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
                  Šī mājaslapa ir veidota, lai ģimenes notikumi, kalendārs un svarīgā informācija būtu vienā,
                  skaistā un ērtā vietā.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {highlights.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-white/80 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="text-2xl">{item.icon}</div>
                    <h2 className="mt-3 text-base font-black text-dark-purple">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="site-updates" aria-labelledby="site-updates-heading" className="scroll-mt-6 rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-soft backdrop-blur-sm sm:p-6 lg:p-7">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="eyebrow">
                  <span aria-hidden="true">✦</span>
                  <span>Kas jauns</span>
                </div>
                <h2 id="site-updates-heading" className="mt-2 text-2xl font-black text-dark-purple sm:text-3xl">
                  Vietnes atjauninājumi
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-muted">
                Jaunākās iespējas un uzlabojumi, kas pievienoti vietnei.
              </p>
            </div>

            {updatesLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[0, 1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-[#f1f0ea]" />)}
              </div>
            ) : updatesError ? (
              <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{updatesError}</p>
            ) : updates.length === 0 ? (
              <p className="rounded-2xl border border-[#ece8e2] bg-white p-5 text-sm text-muted">Jaunu atjauninājumu pagaidām nav.</p>
            ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {updates.map((update, index) => (
                <article
                  key={update.title}
                  className={`rounded-2xl border p-4 sm:p-5 ${
                    index === 0
                      ? 'border-[#d9c9e8] bg-gradient-to-br from-[#f7f2fb] to-white'
                      : 'border-[#ece8ef] bg-white/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eee7f5] text-xl">
                      {update.icon}
                    </span>
                    <div className="min-w-0">
                      <span className="inline-flex rounded-full bg-[#f0ebf4] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#684b82]">
                        {index === 0 ? 'Jaunākais' : update.label}
                      </span>
                      <h3 className="mt-2 text-base font-black text-dark-purple">{update.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted">{update.text}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            )}
          </section>

          <section>
            <div className="rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-soft backdrop-blur-sm sm:p-6">
              <div className="eyebrow">
                <span>✦</span>
                <span>Par ideju</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">
                Šis projekts sākās ar to kad man (Kristam Kārlim Grundmanim) radās ideja par kopīgu kalendāru mūsu ģimenei,
                lai vieglāk būtu pārskatīti visu kas visiem tuvojas protams ar iespēju pievienot arī svarīgus notikumus,
                vai arī kādus baļukus vai tak ne? Tad nu es arī sāku veidot savu mazo projektu kas beigās izvērtās par nu bišķīt sarežģītāku
                nekā sākumā biju iecerējis, protams viss arī ieildzinājās ilgāk nekā biju plānojis, bet nu tas tikai tāpēc lai pēctam 
                būtu foršāk un lai viss būtu tā kā es un tu gribam, jo ja jau daru tad daru kārtīgi, vai ne?
              </p>
              <p className="mt-4 text-sm leading-7 text-muted">
                Bet veidojot šo mājaslapu es sapratu, ka varētu būt forši, ja šī vietne būtu ne tikai kalendārs, bet gan vieta,
                kur varētu daudz ko interesantu izdarīt lai tikai nepaliktu par vienkāršu kalendāru, tāpēc arī tika/tiks 
                pievienotas jaunas lietas kā piemēram ideju dēlis, kur varētu pierakstīt dažādas idejas, vai foto albūmu
                kur varētu ielikt dažādas bildes kurās ir redzami dažādi notikumi kuri jau ir notikuši, vai arī kādu citu funkciju kas varētu
                būt noderīga mums un mūsu ģimenei, jo kāpēc gan ne? Ja jau ir doma un iespēja, tad kāpēc gan neizmantot to, vai ne?
              </p>
              <p className="mt-4 text-sm leading-7 text-muted">
                Jaunās funkcijas tiks pievienotas pakāpeniski, jo nevajag jau visu uzreiz, ja nē viss būs un nekā jauna? Tas izklausas garlaicīgi,
                tāpēc es gribu pievienot jaunas lietas pakāpeniski, lai būtu interesanti un lai vienmēr būtu kaut kas jauns ko izmēģināt jo jaunas 
                lietas ir foršākas par vecām lietām, vai ne?
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default InfoPage;
