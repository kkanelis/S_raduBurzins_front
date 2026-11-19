import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/useAuth';

const steps = [
  {
    title: 'Laipni lūgts!',
    icon: '👋',
    description: 'Šis ir kopīgs ģimenes stūrītis, kur apskatīt kalendāru, plānot notikumus un glabāt foto atmiņas. Ceļvedī vari atvērt katru sadaļu atsevišķā cilnē un izmēģināt to pats.',
    tips: [
      'Ceļvedis paliks atvērts, kamēr izmēģināsi vietni citā cilnē.',
      'Privātās sadaļas var izmantot tikai pēc pieslēgšanās apstiprinātam kontam.',
    ],
  },
  {
    title: 'Izveido kontu',
    icon: '📝',
    description: 'Reģistrācijas formā norādi savu vārdu, uzvārdu, e-pastu un paroli. Iesauka, tālrunis un dzimšanas datums nav obligāti; dzimšanas diena parādīsies kopīgajā kalendārā.',
    tips: [
      'Apstiprini paroli un atzīmē piekrišanu abiem noteikumiem.',
      'Izmanto savu īsto e-pastu — tas būs vajadzīgs, lai pieslēgtos.',
      'Paroli ievadi pats; ceļvedis to neprasa un nesaglabā.',
    ],
    path: '/register',
    action: 'Atvērt reģistrāciju',
  },
  {
    title: 'Sagaidi konta apstiprinājumu',
    icon: '⏳',
    description: 'Pēc reģistrācijas konts tiek nosūtīts apstiprināšanai. Kad administrators to apstiprinās, varēsi pieslēgties ar reģistrēto e-pastu un paroli.',
    tips: [
      'Ja nevari pieslēgties uzreiz, vispirms sagaidi apstiprinājumu.',
      'Pēc apstiprināšanas atgriezies šajā ceļvedī un turpini ar nākamajiem soļiem.',
    ],
  },
  {
    title: 'Pieslēdzies',
    icon: '🔑',
    description: 'Atver pieslēgšanās lapu, ievadi savu e-pastu un paroli, un spied “Pieslēgties”. Pēc veiksmīgas pieslēgšanās nonāksi savā sākuma lapā.',
    tips: ['Ja konts vēl nav apstiprināts, sazinies ar vietnes administratoru.'],
    path: '/login',
    action: 'Atvērt pieslēgšanos',
  },
  {
    title: 'Apskati savu profilu',
    icon: '👤',
    description: 'Profilā vari pārbaudīt savu vārdu un kontaktinformāciju, pievienot profila attēlu un saglabāt izmaiņas.',
    tips: [
      'Pārliecinies, ka dzimšanas datums ir pareizs — tas tiek izmantots ģimenes kalendārā.',
      'Profila attēlu un citus privātos datus rediģē tikai savā kontā.',
    ],
    path: '/profile',
    action: 'Atvērt profilu',
  },
  {
    title: 'Izmanto ģimenes kalendāru',
    icon: '📅',
    description: 'Kalendārā apskati vārda dienas, ģimenes dzimšanas dienas un pievienotos īpašos notikumus. Izvēlies datumu, lai redzētu, kas tajā ieplānots.',
    tips: [
      'Ar bultiņām pārej uz citu mēnesi.',
      'Ar “Jauns notikums” pievieno pasākumu, aprakstu, datumu, laiku un vietu.',
      'Notikumu vari iestatīt kā ikgadēju vai privātu un izvēlēties, ar ko to kopīgot.',
    ],
    path: '/calendar',
    action: 'Atvērt kalendāru',
  },
  {
    title: 'Pārvaldi savus notikumus',
    icon: '🗂️',
    description: 'Sadaļā “Notikumi” redzi un pārvaldi savus pasākumus. Spied “Jauns notikums”, lai pievienotu ieceri, tikšanos vai ģimenes svinības.',
    tips: [
      'Norādi nosaukumu un datumu; apraksts, laiks un vieta palīdzēs pārējiem sagatavoties.',
      'Izvēlies, vai notikums ir publisks vai privāts, un vajadzības gadījumā atzīmē konkrētus cilvēkus.',
      'Esošu notikumu vari labot vai dzēst.',
    ],
    path: '/my-events',
    action: 'Atvērt notikumus',
  },
  {
    title: 'Veido foto albumus',
    icon: '📚',
    description: 'Albumos saglabā kopīgas atmiņas. Izveido albumu, pievieno foto un izvēlies, kam albums būs redzams.',
    tips: [
      'Spied “Jauns albums”, ievadi albuma informāciju un izvēlies fotoattēlus.',
      'Atver albumu, lai apskatītu foto, pievienotu attēlus vai reaģētu uz tiem.',
      'Privātiem albumiem vari norādīt, ar kuriem ģimenes locekļiem tos kopīgot.',
    ],
    path: '/albums',
    action: 'Atvērt albumus',
  },
  {
    title: 'Sarunājies ģimenes čatā',
    icon: '💬',
    description: 'Ģimenes čatā vari nosūtīt ziņu un pievienot fotoattēlu. Ja čata lapa neatveras, iespējams, šī sadaļa tavā vietnē pašlaik nav ieslēgta.',
    tips: [
      'Raksti ziņu ievades laukā un spied nosūtīšanas pogu.',
      'Fotoattēlu vari pievienot pie ziņas.',
      'Ja ziņas neatjaunojas uzreiz, reāllaika čatam var nebūt pieejams savienojums.',
    ],
    path: '/family-chat',
    action: 'Atvērt ģimenes čatu',
  },
  {
    title: 'Apskati svētku sadaļu',
    icon: '🎄',
    description: 'Svētku lapā vari apskatīt Ziemassvētku slepenā vecīša izlozi. Ja izloze tev ir pieejama, uzspied uz dāvanas, lai atklātu, kam gatavot pārsteigumu.',
    tips: [
      'Izlozes rezultāti ir atkarīgi no tā, vai šim gadam ir izveidota izloze.',
      'Ja lapu neredzi vai izloze nav pieejama, pajautā vietnes administratoram.',
    ],
    path: '/christmas',
    action: 'Atvērt svētku lapu',
  },
  {
    title: 'Gatavs — sāc darboties!',
    icon: '✨',
    description: 'Tagad zini, kur atrast svarīgākās vietnes iespējas. Vari atgriezties pie jebkura soļa vai atvērt sev vajadzīgo sadaļu.',
    tips: [
      'Privātās lapas ir pieejamas pēc pieslēgšanās.',
      'Lai izietu no konta, izvēlnē spied “Izrakstīties”.',
      'Lai ceļvedi atvērtu vēlāk, izvēlnē izvēlies “Ceļvedis”.',
    ],
    path: '/calendar',
    action: 'Sākt ar kalendāru',
  },
];

function Tutorial() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const step = steps[activeStep];
  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden py-8 sm:py-12">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-30" />

      <div className="section-shell relative z-10">
        <header className="mx-auto mb-7 max-w-3xl text-center">
          <div className="eyebrow justify-center">
            <span aria-hidden="true">✦</span>
            <span>Jauno lietotāju ceļvedis</span>
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-dark-purple sm:text-5xl">
            Iepazīsti vietni soli pa solim
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
            {user
              ? `Prieks tevi redzēt, ${user.first_name}! Atver sadaļas un izmēģini tās savā tempā.`
              : 'Uzzini, kā reģistrēties, pieslēgties un izmantot ģimenes vietnes iespējas.'}
            {' '}Atverot sadaļu, ceļvedis paliks šajā cilnē.
          </p>
        </header>

        <section className="mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 shadow-[0_20px_60px_rgba(58,39,99,0.12)] backdrop-blur-xl">
          <div className="border-b border-[#eee7f5] px-5 py-5 sm:px-8">
            <div className="mb-3 flex items-center justify-between gap-4 text-sm">
              <span className="font-bold text-dark-purple">
                Solis {activeStep + 1} no {steps.length}
              </span>
              <span className="text-muted">{Math.round(progress)}% pabeigts</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-[#eee7f5]"
              role="progressbar"
              aria-label="Ceļveža progress"
              aria-valuemin={0}
              aria-valuemax={steps.length}
              aria-valuenow={activeStep + 1}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-medium-purple to-[#12b5a6] transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
            <nav
              aria-label="Ceļveža soļi"
              className="flex gap-2 overflow-x-auto border-b border-[#eee7f5] p-4 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r lg:p-5"
            >
              {steps.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  aria-current={index === activeStep ? 'step' : undefined}
                  onClick={() => setActiveStep(index)}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition lg:w-full ${
                    index === activeStep
                      ? 'bg-[#eee7f5] text-[#382d5b]'
                      : 'text-muted hover:bg-warm-beige/50 hover:text-dark-purple'
                  }`}
                >
                  <span className="text-lg" aria-hidden="true">{item.icon}</span>
                  <span className="whitespace-nowrap lg:whitespace-normal">{item.title}</span>
                </button>
              ))}
            </nav>

            <article className="flex min-h-[390px] flex-col p-5 sm:p-8">
              <div className="flex-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eee7f5] text-2xl" aria-hidden="true">
                  {step.icon}
                </div>
                <h2 className="text-2xl font-black text-dark-purple sm:text-3xl">{step.title}</h2>
                <p className="mt-4 text-sm leading-7 text-muted sm:text-base">{step.description}</p>

                <ul className="mt-5 grid gap-3">
                  {step.tips.map((tip) => (
                    <li key={tip} className="flex gap-3 rounded-xl border border-[#eee7f5] bg-[#fcfaff] px-4 py-3 text-sm leading-6 text-dark-purple">
                      <span className="font-black text-[#12a899]" aria-hidden="true">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>

                {step.path && (
                  <div className="mt-6">
                    <Link
                      to={step.path}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm no-underline"
                    >
                      {step.action}
                      <span aria-hidden="true">↗</span>
                    </Link>
                    {!user && activeStep >= 4 && activeStep <= 9 && (
                      <p className="mt-2 text-xs text-muted">
                        Šai sadaļai vajadzīgs apstiprināts konts un pieslēgšanās.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#eee7f5] pt-5">
                <button
                  type="button"
                  onClick={() => setActiveStep((current) => Math.max(0, current - 1))}
                  disabled={activeStep === 0}
                  className="btn-ghost px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Iepriekšējais
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep((current) => Math.min(steps.length - 1, current + 1))}
                  disabled={activeStep === steps.length - 1}
                  className="btn-primary px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Nākamais →
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Tutorial;
