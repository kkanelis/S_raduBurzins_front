import React, { useState } from 'react';

const steps = [
  {
    title: 'Sāc ar galveno izvēlni',
    icon: '🧭',
    description: 'Vietnes sadaļas atver no navigācijas izvēlnes. Lielā ekrānā tā atrodas kreisajā malā; telefonā vai šaurā logā vispirms nospied izvēlnes pogu augšā. Izvēlies sadaļu, kuru vēlies izmantot.',
    tips: [
      'Kalendārs rāda vārda un uzvārda dienas, ģimenes dzimšanas dienas un īpašos pasākumus.',
      'Notikumi ir vieta, kur apskatīt un pārvaldīt tavus pievienotos pasākumus.',
      'Albumos vari glabāt un apskatīt ģimenes fotogrāfijas.',
      'Profila sadaļu atver ar savu vārdu vai profila ikonu izvēlnes apakšdaļā.',
      'Lai atgrieztos sākuma lapā, izvēlies vietnes “Radu Burziņš” nosaukumu izvēlnes augšdaļā.',
    ],
  },
  {
    title: 'Sakārto savu profilu',
    icon: '👤',
    description: 'Profila lapā pārbaudi, vai informācija par tevi ir pareiza. Maini vajadzīgos laukus un spied “Saglabāt profilu”, lai izmaiņas stātos spēkā.',
    tips: [
      'Pārbaudi vārdu, uzvārdu, iesauku, tālruni un e-pasta adresi.',
      'Pievieno vai izlabo dzimšanas datumu. Tas tiek izmantots ģimenes kalendārā, lai parādītu tavu dzimšanas dienu.',
      'Lai nomainītu profila attēlu, sadaļā “Profila attēls” spied faila izvēles lauku un izvēlies attēlu savā ierīcē.',
      'Pirms lapas aizvēršanas noteikti nospied “Saglabāt profilu”; veiksmīgas saglabāšanas paziņojums parādīsies lapā.',
    ],
  },
  {
    title: 'Lasi un pārlūko kalendāru',
    icon: '📅',
    description: 'Kalendārs ir mēneša režģis, kur katra rūtiņa ir viena diena. Dienās var būt redzamas vārda dienas, ģimenes dzimšanas dienas vai pasākumi. Uzspied uz datuma, lai apskatītu pilnu informāciju.',
    tips: [
      'Izmanto bultiņas pa kreisi un pa labi, lai pārietu uz iepriekšējo vai nākamo mēnesi.',
      'Spied “Šodien”, lai uzreiz atgrieztos pie pašreizējā mēneša.',
      'Nospiežot uz dienas, atvērsies tās detaļas: vārda dienas, uzvārda dienas, dzimšanas dienas un ieplānotie pasākumi.',
      'Atver pasākuma informāciju, lai izlasītu aprakstu, datumu, laiku un norādīto vietu.',
      'Dažādās dienu krāsas palīdz pamanīt šodienu, dzimšanas dienas un pasākumu datumus.',
    ],
  },
  {
    title: 'Pievieno pasākumu kalendāram',
    icon: '➕',
    description: 'Kalendāra augšdaļā spied “Jauns notikums”. Aizpildi logā pasākuma informāciju un beigās spied “Pievienot”. Nosaukums un datums ir nepieciešami, lai notikumu saglabātu.',
    tips: [
      'Laukā “Nosaukums” ieraksti īsu, saprotamu pasākuma nosaukumu, piemēram, “Ģimenes pikniks”.',
      'Aprakstā pievieno papildu informāciju, ko pārējiem der zināt.',
      'Izvēlies datumu kalendāra atlasītājā. Ja pasākumam ir noteikts sākuma laiks, ievadi to 24 stundu formātā HH:mm, piemēram, 18:30.',
      'Laukā “Atrašanās vieta” ieraksti vietu, kur pasākums notiks.',
      'Atzīmē “Atkārtojas katru gadu”, ja pasākums katru gadu notiek tajā pašā datumā.',
      'Pasākums pēc noklusējuma ir kopīgs. Atzīmē “Privāts pasākums”, ja tam jābūt redzamam tikai tev un izvēlētajiem cilvēkiem, un tad atzīmē, kuri lietotāji to drīkst redzēt.',
      'Pārbaudi ievadīto informāciju un spied “Pievienot”. Pasākumam jāparādās attiecīgajā kalendāra datumā un tavā notikumu sarakstā.',
    ],
  },
  {
    title: 'Pārvaldi savus notikumus',
    icon: '🗂️',
    description: 'Sadaļā “Notikumi” ir tavi pievienotie pasākumi. Katrs pasākums tiek parādīts atsevišķā kartītē ar nosaukumu, datumu un, ja tie norādīti, aprakstu, laiku un vietu.',
    tips: [
      'Kartītes atzīme “Publisks” vai “Privāts” parāda, kam pasākums ir redzams. Ikgadējiem pasākumiem ir arī atzīme “Atkārtojas katru gadu”.',
      'Lai mainītu pasākumu, atver tā kartīti un spied “Labot”. Maini nosaukumu vai datumu un, ja vajag, aprakstu, vietu vai laiku.',
      'Rediģēšanas logā vari mainīt arī ikgadējo atkārtošanos un publiskuma iestatījumu. Privātam pasākumam atzīmē konkrētos cilvēkus, kuri to drīkst redzēt.',
      'Pēc labojumiem spied “Saglabāt”. Ja pārdomāji, spied “Atcelt”, lai aizvērtu logu nesaglabājot izmaiņas.',
      'Lai noņemtu pasākumu, spied “Dzēst” un apstiprini dzēšanu tikai tad, ja esi pārliecināts.',
    ],
  },
  {
    title: 'Izveido foto albumu',
    icon: '📚',
    description: 'Sadaļā “Albumi” spied “Jauns albums”. Vienā reizē vari izveidot albumu un pievienot tam vienu vai vairākus fotoattēlus.',
    tips: [
      'Ieraksti albuma nosaukumu. Kategorija, emoji un apraksts palīdz albumu vēlāk vieglāk atpazīt.',
      'Laukā “Atlasīt vairākus foto vienlaikus” izvēlies vairākus attēlu failus. Katram attēlam vari pievienot savu nosaukumu un piezīmi.',
      'Ja gribi pievienot foto pa vienam vai pievienot vēl atsevišķus foto ierakstus, izmanto pogu “+ Foto rinda”. Nevajadzīgu rindu vari noņemt.',
      'Pirms saglabāšanas pārbaudi attēlu priekšskatījumus, failu nosaukumus un piezīmes.',
      'Albums sākotnēji ir publisks. Spied “Padarīt privātu”, lai ierobežotu redzamību, un atzīmē cilvēkus, kuriem vēlies albumu kopīgot.',
      'Kad viss gatavs, spied “Saglabāt albumu”. Albums parādīsies albumu sarakstā.',
    ],
  },
  {
    title: 'Apskati un atjauno albumus',
    icon: '🖼️',
    description: 'Albumu sarakstā izvēlies albumu, lai atvērtu tā foto. Spied uz fotoattēla, lai to skatītu lielā skatā. Albuma veidotājs var labot albumu un tā fotoattēlus.',
    tips: [
      'Ja albumu ir daudz, izmanto “Iepriekšējie albumi” un “Nākamie albumi”, lai pārietu starp saraksta lapām.',
      'Foto skatītājā izmanto bultiņas, lai pārietu uz iepriekšējo vai nākamo attēlu; ar aizvēršanas pogu atgriezies albumā.',
      'Spied “❤️ Patīk”, lai pievienotu savu reakciju. Ja vēlies to atsaukt, spied “Noņemt reakciju”.',
      'Lai albumam pievienotu attēlus vēlāk, spied “Pievienot vēl foto”, izvēlies failus, pēc vajadzības ieraksti nosaukumus un piezīmes, tad spied “Pievienot foto”.',
      'Albuma veidotājs var ar “Labot albumu” mainīt nosaukumu, aprakstu, kategoriju un privātuma iestatījumus.',
      'Foto skatītājā albuma veidotājs var izvēlēties “Labot foto”, lai mainītu nosaukumu, piezīmi vai pašu attēlu.',
      'Albuma vai foto dzēšana ir neatgriezeniska darbība. Pirms apstiprināšanas pārliecinies, ka izvēlēts pareizais albums vai attēls.',
    ],
  },
];

function Tutorial() {
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
            <span>Vietnes lietošanas ceļvedis</span>
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-dark-purple sm:text-5xl">
            Iepazīsti vietni soli pa solim
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
            Šeit atradīsi norādes par vietnes sadaļām un to iespējām. Izvēlies soli
            sarakstā vai ej cauri ceļvedim secīgi, izmantojot pogas apakšā.
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

                <h3 className="mt-6 text-sm font-extrabold uppercase tracking-wide text-dark-purple">
                  Kā rīkoties
                </h3>
                <ol className="mt-3 grid gap-3">
                  {step.tips.map((tip, index) => (
                    <li key={tip} className="flex gap-3 rounded-xl border border-[#eee7f5] bg-[#fcfaff] px-4 py-3 text-sm leading-6 text-dark-purple">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eee7f5] text-xs font-black text-[#382d5b]">
                        {index + 1}
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ol>
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
