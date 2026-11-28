import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { calendarMonthQueryKey, fetchCalendarMonth } from '../../Calendar/calendarApi';

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function RegWelcome() {
  const [feedbackType, setFeedbackType] = useState('Ideja');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = formatDateKey(today);
  const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const { data: currentMonthData, isLoading: loadingCurrentMonth, isError: currentMonthError } = useQuery({
    queryKey: calendarMonthQueryKey(today.getFullYear(), today.getMonth() + 1),
    queryFn: () => fetchCalendarMonth(today.getFullYear(), today.getMonth() + 1),
  });
  const { data: nextMonthData, isLoading: loadingNextMonth, isError: nextMonthError } = useQuery({
    queryKey: calendarMonthQueryKey(nextMonthDate.getFullYear(), nextMonthDate.getMonth() + 1),
    queryFn: () => fetchCalendarMonth(nextMonthDate.getFullYear(), nextMonthDate.getMonth() + 1),
  });
  const { data: surnameDaysResponse = [], isLoading: loadingSurnameDays, isError: surnameDaysError } = useQuery({
    queryKey: ['surnames'],
    queryFn: async () => {
      const response = await api.get('/api/surnames');
      return response.data || [];
    },
  });

  const upcomingDates = useMemo(() => {
    const lastDate = new Date(`${todayKey}T12:00:00`);
    lastDate.setDate(lastDate.getDate() + 30);
    const days = [
      ...Object.values(currentMonthData?.days || {}),
      ...Object.values(nextMonthData?.days || {}),
    ];
    const items = [];

    days.forEach((day) => {
      if (day.date < todayKey || day.date > formatDateKey(lastDate)) return;
      const date = new Date(`${day.date}T12:00:00`);
      const memberNames = (people) => people.map((person) => `${person.first_name} ${person.last_name}`.trim()).join(', ');

      day.family_name_days?.forEach((group) => items.push({
        id: `name-${day.date}-${group.name}`,
        title: group.name,
        date,
        dateKey: day.date,
        type: 'Vārda diena',
        detail: memberNames(group.members),
        isBirthday: false,
      }));
      day.family_surname_days?.forEach((group) => items.push({
        id: `surname-${day.date}-${group.surname}`,
        title: group.surname,
        date,
        dateKey: day.date,
        type: 'Uzvārda diena',
        detail: memberNames(group.members),
        isBirthday: false,
      }));
      day.birthdays?.forEach((person) => items.push({
        id: `birthday-${day.date}-${person.id}`,
        title: `${person.first_name} ${person.last_name}`.trim(),
        date,
        dateKey: day.date,
        type: 'Dzimšanas diena',
        detail: `Aprit ${person.age_turning} gadi`,
        isBirthday: true,
      }));
      day.events?.forEach((event) => items.push({
        id: `event-${event.id}-${day.date}`,
        title: event.title,
        date,
        dateKey: day.date,
        type: 'Pasākums',
        detail: [event.event_time, event.location].filter(Boolean).join(' · '),
        isBirthday: false,
      }));
    });

    return items.sort((first, second) => first.date - second.date || first.title.localeCompare(second.title, 'lv'));
  }, [currentMonthData, nextMonthData, todayKey]);

  const upcomingFamilyDays = upcomingDates.slice(0, 5);
  const todayHighlights = useMemo(() => {
    return upcomingDates.filter((item) => item.dateKey === todayKey);
  }, [todayKey, upcomingDates]);

  const loading = loadingCurrentMonth || loadingNextMonth;
  const hasError = currentMonthError || nextMonthError;
  const todayData = currentMonthData?.days?.[todayKey];
  const todaysNameDays = todayData?.name_days || [];
  const todaysSurnameDays = Array.isArray(surnameDaysResponse)
    ? surnameDaysResponse.find((item) => String(item.date || '').slice(-5) === todayKey.slice(-5))?.surnames || []
    : surnameDaysResponse?.[todayKey] || [];
  const loadingToday = loadingCurrentMonth || loadingSurnameDays;
  const todayError = currentMonthError || surnameDaysError;

  const submitFeedback = async (event) => {
    event.preventDefault();
    setSendingFeedback(true);
    setFeedbackStatus('');

    try {
      const response = await api.post('/api/feedback', {
        type: feedbackType,
        message: feedbackMessage,
      });
      setFeedbackMessage('');
      setFeedbackStatus(response.data.message);
    } catch (error) {
      const validationMessage = Object.values(error.response?.data?.errors || {}).flat()[0];
      setFeedbackStatus(
        validationMessage || error.response?.data?.message || 'Neizdevās nosūtīt ziņu. Mēģini vēlreiz.'
      );
    } finally {
      setSendingFeedback(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-50 pointer-events-none" />

      <div className="section-shell relative py-5 sm:py-8 lg:py-10">
        <div className="space-y-4 sm:space-y-5">
          <section className="card surface-strong p-4 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
              <div className="eyebrow">
                  <span aria-hidden="true">✦</span>
                  <span>Radu Burziņš</span>
                </div>
                <h1 className="mt-2 text-3xl font-black text-dark-purple">Ģimenes sākums</h1>
                <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
                  {loading ? 'Ielādē tuvākos datumus...' : 'Tuvākie notikumi un ģimenes jaunumi vienuviet.'}
                </p>
              </div>
              <Link
                to="/info#site-updates"
                className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-[#d9c9e8] bg-[#f7f2fb] px-4 py-2.5 text-sm font-bold text-[#563b70] no-underline shadow-sm transition hover:-translate-y-0.5 hover:bg-[#eee7f5] hover:shadow-md sm:self-center"
              >
                <span aria-hidden="true">✨</span>
                Jaunākie atjauninājumi
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </section>

          <section className="card surface-strong p-4 sm:p-5 lg:hidden">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-medium-purple">Šodien ģimenē</p>
                <h2 className="mt-1 text-xl font-black capitalize text-dark-purple">
                  {today.toLocaleDateString('lv-LV', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h2>
              </div>
              <span aria-hidden="true" className="text-2xl">✦</span>
            </div>

            {todayError ? (
              <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                Neizdevās ielādēt šodienas informāciju.
              </p>
            ) : loading || loadingToday ? (
              <p className="mt-3 text-sm text-muted">Ielādē šodienas notikumus...</p>
            ) : (
              <div className="mt-4 space-y-3">
                {todayHighlights.length > 0 ? (
                  <div className="space-y-2">
                    {todayHighlights.map((item) => (
                      <Link
                        key={item.id}
                        to="/calendar"
                        className="flex items-center gap-3 rounded-xl bg-[#f5f0f8] px-3 py-2.5 no-underline"
                      >
                        <span aria-hidden="true" className="text-lg">
                          {item.type === 'Dzimšanas diena' ? '🎂' : item.type === 'Vārda diena' ? '✦' : '📅'}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-dark-purple">{item.title}</span>
                          <span className="block text-xs text-muted">{item.type}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">Šodien nav ieplānotu ģimenes pasākumu.</p>
                )}

                <div className="border-t border-[#ece9e5] pt-3">
                  <h3 className="text-xs font-bold uppercase text-medium-purple">Vārda dienas</h3>
                  {todayError ? (
                    <p role="alert" className="mt-1 text-sm text-red-700">Neizdevās ielādēt vārda dienas.</p>
                  ) : todaysNameDays.length > 0 ? (
                    <p className="mt-1 text-sm font-semibold text-dark-purple">{todaysNameDays.join(', ')}</p>
                  ) : (
                    <p className="mt-1 text-sm text-muted">Šodien vārda dienu nav.</p>
                  )}
                  {todaysSurnameDays.length > 0 && (
                    <p className="mt-1 text-xs text-muted">Uzvārda dienas: {todaysSurnameDays.join(', ')}</p>
                  )}
                </div>
              </div>
            )}
          </section>

          <div className="lg:hidden">
            <Link to="/calendar" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#684b82] px-3 py-3 text-center text-sm font-bold text-white no-underline shadow-sm">
              <span aria-hidden="true">＋</span> Pievienot notikumu
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(250px,0.65fr)]">
            <section className="card surface-strong p-4 sm:p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-lg font-black text-dark-purple sm:text-xl">Tuvākie datumi</h2>
              </div>

              {hasError ? (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Neizdevās ielādēt tuvākos datumus.
                </div>
              ) : loading ? (
                <div className="py-6 text-sm text-muted">Ielādē tuvākos datumus...</div>
              ) : upcomingFamilyDays.length > 0 ? (
                <div className="divide-y divide-[#ece9e5]">
                  {upcomingFamilyDays.map((item) => (
                    <Link
                      key={item.id}
                      to="/calendar"
                      className="group grid grid-cols-[52px_minmax(0,1fr)] items-center gap-3 py-3 no-underline first:pt-1 last:pb-1 sm:grid-cols-[58px_minmax(0,1fr)_auto]"
                    >
                      <div className={`flex h-12 w-12 flex-col items-center justify-center rounded-lg ${item.isBirthday ? 'bg-[#e8f1ea] text-[#4f7f5f]' : item.type === 'Vārda diena' ? 'bg-[#eceffa] text-[#5b6fc4]' : item.type === 'Uzvārda diena' ? 'bg-[#fbf1e1] text-[#b9762a]' : 'bg-[#fbeaed] text-[#d1344f]'}`}>
                        <span className="text-lg font-black leading-none">{item.date.getDate()}</span>
                        <span className="mt-1 text-[9px] font-bold uppercase leading-none">
                          {item.date.toLocaleDateString('lv-LV', { month: 'short' }).replace('.', '')}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold text-dark-purple group-hover:text-medium-purple">{item.title}</div>
                        <div className="mt-0.5 truncate text-xs text-muted">
                          {item.type}{item.detail ? ` · ${item.detail}` : ''}
                        </div>
                      </div>
                      <span className={`col-start-2 w-fit rounded-md px-2 py-1 text-[10px] font-bold sm:col-start-auto ${item.isBirthday ? 'bg-[#e8f1ea] text-[#4f7f5f]' : item.type === 'Vārda diena' ? 'bg-[#eceffa] text-[#5b6fc4]' : item.type === 'Uzvārda diena' ? 'bg-[#fbf1e1] text-[#b9762a]' : 'bg-[#fbeaed] text-[#d1344f]'}`}>
                        {item.date.toLocaleDateString('lv-LV', { day: 'numeric', month: 'long' })}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-sm text-muted">Tuvākajā laikā nav gaidāmu pasākumu vai dzimšanas dienu.</p>
              )}
            </section>

            <section className="card surface-strong hidden p-4 sm:p-6 lg:block">
              <div className="mb-1 flex items-center justify-between gap-3">
                <h2 className="text-lg font-black text-dark-purple sm:text-xl">Šodiena</h2>
              </div>
              <p className="mb-4 text-sm text-muted">
                {today.toLocaleDateString('lv-LV', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>

              {todayError ? (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  Neizdevās ielādēt šodienas vārdadienas.
                </div>
              ) : loadingToday ? (
                <p className="py-3 text-sm text-muted">Ielādē šodienas vārdadienas...</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase text-medium-purple">Vārda dienas</h3>
                    {todaysNameDays.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {todaysNameDays.map((name, index) => (
                          <span key={`${name}-${index}`} className="rounded-md bg-[#f0ebf4] px-2.5 py-1.5 text-sm font-semibold text-dark-purple">
                            {name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-muted">Šodien vārda dienu nav.</p>
                    )}
                  </div>

                  <div className="border-t border-[#ece9e5] pt-3">
                    <h3 className="text-xs font-bold uppercase text-medium-purple">Uzvārda dienas</h3>
                    {todaysSurnameDays.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {todaysSurnameDays.map((surname, index) => (
                          <span key={`${surname}-${index}`} className="rounded-md bg-[#f4eee9] px-2.5 py-1.5 text-sm font-semibold text-dark-purple">
                            {surname}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-muted">Šodien uzvārda dienu nav.</p>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>

          <section className="overflow-hidden rounded-2xl border border-[#e6deeb] bg-white shadow-[0_16px_44px_rgba(47,32,58,0.08)]">
            <div className="grid lg:grid-cols-[minmax(230px,0.72fr)_minmax(0,1.8fr)]">
              <div className="relative overflow-hidden bg-gradient-to-br from-[#30213c] via-[#523c68] to-[#75598d] px-5 py-6 text-white sm:px-7 sm:py-7">
                <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full border border-white/10" />
                <div aria-hidden="true" className="pointer-events-none absolute -right-3 -top-5 h-24 w-24 rounded-full border border-white/10" />
                <div className="relative">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-xl" aria-hidden="true">✦</span>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-white/70">Tava balss ir svarīga</p>
                  <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl text-white">Atsauksmes un idejas</h2>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/80">
                    Kas tev patīk? Ko varētu uzlabot? Uzraksti ziņu saņems vietnes veidotājs.
                  </p>
                </div>
              </div>

              <form onSubmit={submitFeedback} className="space-y-5 p-5 sm:p-7 lg:p-8">
                <fieldset>
                  <legend className="mb-2.5 text-sm font-bold text-dark-purple">Ko vēlies nosūtīt?</legend>
                  <div className="grid grid-cols-2 gap-2 sm:max-w-md">
                    {[
                      { value: 'Ideja', icon: '💡', description: 'Ieteikums jaunai iespējai' },
                      { value: 'Atsauksme', icon: '💬', description: 'Viedoklis par vietni' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={feedbackType === option.value}
                        onClick={() => setFeedbackType(option.value)}
                        className={`rounded-xl border p-3 text-left transition ${
                          feedbackType === option.value
                            ? 'border-[#684b82] bg-[#f4eff8] ring-2 ring-[#684b82]/10'
                            : 'border-[#e8e3e9] bg-white hover:border-[#cbbbd8] hover:bg-[#fbf9fc]'
                        }`}
                      >
                        <span className="flex items-center gap-2 text-sm font-extrabold text-dark-purple">
                          <span aria-hidden="true">{option.icon}</span>
                          {option.value}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-muted">{option.description}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label htmlFor="feedback-message" className="text-sm font-bold text-dark-purple">Tava ziņa</label>
                    <span className="text-xs text-muted">{feedbackMessage.length}/3000</span>
                  </div>
                  <textarea
                    id="feedback-message"
                    value={feedbackMessage}
                    onChange={(event) => setFeedbackMessage(event.target.value)}
                    required
                    minLength={5}
                    maxLength={3000}
                    rows={4}
                    placeholder="Pastāsti savu domu..."
                    className="w-full resize-y rounded-xl border border-[#dedfd7] bg-[#fcfbfd] px-4 py-3 text-sm leading-6 text-dark-purple outline-none transition placeholder:text-muted/70 focus:border-[#684b82] focus:bg-white focus:ring-4 focus:ring-[#684b82]/10"
                  />
                </div>

                <div className="flex flex-col gap-3 border-t border-[#eeeaf0] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-muted">Ziņa tiks nosūtīta privāti vietnes veidotājam.</p>
                  <button
                    type="submit"
                    disabled={sendingFeedback || feedbackMessage.trim().length < 5}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#684b82] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#563b70] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
                  >
                    {sendingFeedback ? 'Sūta...' : 'Nosūtīt'}
                    {!sendingFeedback && <span aria-hidden="true">→</span>}
                  </button>
                </div>
                {feedbackStatus && (
                  <p role="status" className="rounded-lg border border-[#d9ead9] bg-[#f1f8f1] px-3 py-2.5 text-sm font-medium text-[#315d39]">
                    {feedbackStatus}
                  </p>
                )}
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default RegWelcome;
