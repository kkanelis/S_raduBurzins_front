import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CalendarDayDetails from './CalendarDayDetails';
import CreateSpecialDay from './CreateSpecialDay';
import { calendarMonthQueryKey, fetchCalendarMonth } from './calendarApi';
import { formatDateKey, getMonthMatrix } from './calendarUtils';

const MONTH_NAMES = [
  'janvāris',
  'februāris',
  'marts',
  'aprīlis',
  'maijs',
  'jūnijs',
  'jūlijs',
  'augusts',
  'septembris',
  'oktobris',
  'novembris',
  'decembris',
];

const WEEKDAY_LABELS = ['Pr', 'Ot', 'Tr', 'Ce', 'Pk', 'Se', 'Sv'];

const emptyDay = (date) => ({
  date,
  name_days: [],
  surname_days: [],
  family_name_days: [],
  family_surname_days: [],
  birthdays: [],
  events: [],
});

function getDayChips(day) {
  const chips = [];
  const seen = new Set();

  const addChip = (type, label) => {
    const key = `${type}:${label}`;
    if (seen.has(key)) return;
    seen.add(key);
    chips.push({ type, label });
  };

  day.birthdays.forEach((person) => {
    addChip(
      'birthday',
      person.is_me ? 'Tava dzimšanas diena' : `${person.first_name} ${person.last_name}`,
    );
  });
  day.family_name_days.forEach((group) => {
    addChip(
      'name',
      group.members.some((member) => member.is_me) ? 'Tava vārda diena' : group.name,
    );
  });
  day.family_surname_days.forEach((group) => {
    addChip(
      'surname',
      group.members.some((member) => member.is_me) ? 'Tava uzvārda diena' : group.surname,
    );
  });
  day.events.forEach((event) => addChip('event', event.title));

  return chips;
}

function dateFromKey(value) {
  return new Date(`${value}T12:00:00`);
}

function Calendar() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [focusDateKey, setFocusDateKey] = useState(null);
  const touchStartX = useRef(null);
  const dayButtonRefs = useRef(new Map());

  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();
  const monthNumber = currentMonth + 1;
  const queryKey = calendarMonthQueryKey(currentYear, monthNumber);
  const {
    data: calendarData,
    isLoading,
    isError,
  } = useQuery({
    queryKey,
    queryFn: () => fetchCalendarMonth(currentYear, monthNumber),
  });

  useEffect(() => {
    [-1, 1].forEach((offset) => {
      const adjacent = new Date(currentYear, currentMonth + offset, 1);
      const year = adjacent.getFullYear();
      const month = adjacent.getMonth() + 1;
      queryClient.prefetchQuery({
        queryKey: calendarMonthQueryKey(year, month),
        queryFn: () => fetchCalendarMonth(year, month),
      });
    });
  }, [currentMonth, currentYear, queryClient]);

  useEffect(() => {
    if (!focusDateKey) return;
    const button = dayButtonRefs.current.get(focusDateKey);
    if (button) {
      button.focus();
      setFocusDateKey(null);
    }
  }, [calendarData, currentMonth, currentYear, focusDateKey]);

  const monthCells = useMemo(
    () => getMonthMatrix(currentYear, currentMonth),
    [currentYear, currentMonth],
  );
  const monthDays = calendarData?.days || {};
  const selectedDateKey = formatDateKey(selectedDate);
  const selectedDay = monthDays[selectedDateKey] || emptyDay(selectedDateKey);
  const monthLabel = `${MONTH_NAMES[currentMonth]} ${currentYear}`;

  const updateMonth = (offset) => {
    setSelectedDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const handleToday = () => setSelectedDate(new Date());
  const openDay = (date) => setSelectedDate(date);

  const handleDayKeyDown = (event, date) => {
    const offsets = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const offset = offsets[event.key];
    if (!offset) return;

    event.preventDefault();
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + offset);
    setFocusDateKey(formatDateKey(nextDate));
    setSelectedDate(nextDate);
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 70) return;
    updateMonth(distance > 0 ? -1 : 1);
  };

  const monthlyFamilyDays = Object.values(monthDays)
    .filter((day) => day.family_name_days.length
      || day.family_surname_days.length
      || day.birthdays.length
      || day.events.length);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-50 pointer-events-none" />
      <div className="section-shell relative py-4 sm:py-7 lg:py-10">
        <header className="card surface-strong mb-4 p-4 sm:mb-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="eyebrow"><span aria-hidden="true">✦</span><span>Ģimene</span></div>
              <h1 className="mt-2 text-3xl font-black text-dark-purple">Kalendārs</h1>
              <p className="mt-2 max-w-xl text-sm text-muted">
                Vārda un uzvārda dienas, dzimšanas dienas un ģimenes notikumi vienuviet.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="calendar-header-create btn-primary shrink-0"
            >
              <span aria-hidden="true">+</span> Jauns notikums
            </button>
          </div>
        </header>

        {isError && (
          <div role="alert" className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Kalendāra datus neizdevās ielādēt. Pamēģini vēlreiz pēc brīža.
          </div>
        )}

        <div className="calendar-month-shell">
          <div className="calendar-month-layout">
            <section className="calendar-month-card card surface-strong min-w-0 p-3 sm:p-5" aria-label="Ģimenes kalendārs">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:flex-none sm:justify-start">
                  <button
                    type="button"
                    onClick={() => updateMonth(-1)}
                    aria-label="Iepriekšējais mēnesis"
                    className="calendar-month-nav"
                  >
                    <span aria-hidden="true">←</span>
                  </button>
                  <h2 className="min-w-0 flex-1 text-center text-lg font-black capitalize text-dark-purple sm:min-w-[12rem] sm:flex-none sm:text-xl">
                    {monthLabel}
                  </h2>
                  <button
                    type="button"
                    onClick={() => updateMonth(1)}
                    aria-label="Nākamais mēnesis"
                    className="calendar-month-nav"
                  >
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
                <button type="button" onClick={handleToday} className="btn-ghost min-h-11 px-4 text-sm">
                  Šodien
                </button>
              </div>

              <div className="mb-2 flex items-center justify-between text-xs text-muted">
                <span>{isLoading ? 'Ielādē kalendāru…' : 'Izvēlies dienu, lai apskatītu detaļas.'}</span>
                <span className="hidden sm:inline">Pārvelc pa kreisi vai pa labi, lai mainītu mēnesi.</span>
              </div>

              <div
                className="calendar-grid-gesture"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={() => { touchStartX.current = null; }}
              >
                <div className="calendar-weekdays" aria-hidden="true">
                  {WEEKDAY_LABELS.map((label, index) => (
                    <div key={`${label}-${index}`} className={index > 4 ? 'calendar-weekday calendar-weekday-weekend' : 'calendar-weekday'}>
                      {label}
                    </div>
                  ))}
                </div>
                <div
                  key={`${currentYear}-${monthNumber}`}
                  className="calendar-day-grid"
                  role="group"
                  aria-label={`${monthLabel} dienas`}
                  aria-busy={isLoading}
                >
                  {monthCells.map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="calendar-day-empty" aria-hidden="true" />;
                    }

                    const dateKey = formatDateKey(date);
                    const day = monthDays[dateKey] || emptyDay(dateKey);
                    const chips = getDayChips(day);
                    const isToday = formatDateKey(new Date()) === dateKey;
                    const isSelected = selectedDateKey === dateKey;
                    const isMine = day.birthdays.some((person) => person.is_me)
                      || day.family_name_days.some((group) => group.members.some((member) => member.is_me))
                      || day.family_surname_days.some((group) => group.members.some((member) => member.is_me));
                    const priority = day.birthdays.length
                      ? 'birthday'
                      : day.family_name_days.length
                        ? 'name'
                        : day.family_surname_days.length
                          ? 'surname'
                          : day.events.length
                            ? 'event'
                            : '';
                    const isWeekend = (index % 7) > 4;
                    const labels = chips.map((chip) => chip.label);
                    const accessibleLabel = [
                      `${date.getDate()}. ${MONTH_NAMES[currentMonth]}`,
                      isToday ? 'šodien' : '',
                      ...labels,
                    ].filter(Boolean).join(', ');

                    return (
                      <button
                        key={dateKey}
                        ref={(element) => {
                          if (element) dayButtonRefs.current.set(dateKey, element);
                          else dayButtonRefs.current.delete(dateKey);
                        }}
                        type="button"
                        aria-label={accessibleLabel}
                        aria-current={isSelected ? 'date' : undefined}
                        onClick={() => openDay(date)}
                        onKeyDown={(event) => handleDayKeyDown(event, date)}
                        className={[
                          'calendar-day-button',
                          priority ? `calendar-day-${priority}` : '',
                          isWeekend && !priority ? 'calendar-day-weekend' : '',
                          isSelected ? 'calendar-day-selected' : '',
                          isMine ? 'calendar-day-mine' : '',
                        ].filter(Boolean).join(' ')}
                      >
                        <span className={`calendar-day-number ${isToday ? 'calendar-day-number-today' : ''}`}>
                          {date.getDate()}
                        </span>
                        {isToday && <span className="calendar-today-word">Šodien</span>}
                        {day.name_days.length > 0 && (
                          <span className="calendar-day-names" title={day.name_days.join(', ')}>
                            {day.name_days.join(', ')}
                          </span>
                        )}
                        <span className="calendar-day-chips" aria-hidden="true">
                          {chips.slice(0, 2).map((chip, chipIndex) => (
                            <span
                              key={`${chip.type}-${chip.label}-${chipIndex}`}
                              className={`calendar-event-chip calendar-event-chip-${chip.type}`}
                              title={chip.label}
                            >
                              <span className="calendar-chip-dot" />
                              <span className="calendar-event-chip-label">{chip.label}</span>
                            </span>
                          ))}
                          {chips.length > 2 && <span className="calendar-more-chips">+{chips.length - 2}</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="calendar-legend" aria-label="Notikumu leģenda">
                <span className="calendar-legend-item">
                  <span aria-hidden="true" className="calendar-legend-dot calendar-legend-dot-name" />
                  Vārda diena
                </span>
                <span className="calendar-legend-item">
                  <span aria-hidden="true" className="calendar-legend-dot calendar-legend-dot-surname" />
                  Uzvārda diena
                </span>
                <span className="calendar-legend-item">
                  <span aria-hidden="true" className="calendar-legend-dot calendar-legend-dot-birthday" />
                  Dzimšanas diena
                </span>
                <span className="calendar-legend-item">
                  <span aria-hidden="true" className="calendar-legend-dot calendar-legend-dot-event" />
                  Ģimenes notikums
                </span>
              </div>
            </section>

            <aside className="calendar-side-column" aria-label="Izvēlētās dienas informācija">
              <CalendarDayDetails
                day={selectedDay}
                loading={isLoading}
                error={isError}
                onCreateEvent={() => setShowCreateModal(true)}
              />
              <section className="calendar-month-summary card surface-strong p-4 sm:p-5">
                <h2 className="text-sm font-extrabold text-dark-purple">Šī mēneša ģimenes dienas</h2>
                {monthlyFamilyDays.length > 0 ? (
                  <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto">
                    {monthlyFamilyDays.map((day) => {
                      const date = dateFromKey(day.date);
                      const summaries = [
                        ...day.family_name_days.map((item) => item.name),
                        ...day.family_surname_days.map((item) => item.surname),
                        ...day.birthdays.map((person) => person.is_me ? 'Tava dzimšanas diena' : person.first_name),
                        ...day.events.map((event) => event.title),
                      ];
                      const isPast = day.date < formatDateKey(new Date());

                      return (
                        <li key={day.date}>
                          <button
                            type="button"
                            onClick={() => setSelectedDate(date)}
                            className={`calendar-summary-item ${isPast ? 'calendar-summary-past' : ''}`}
                          >
                            <span className="calendar-summary-date">{date.getDate()}. {MONTH_NAMES[date.getMonth()]}</span>
                            <span className="calendar-summary-label">{summaries.slice(0, 2).join(' · ')}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted">Šajā mēnesī nav ģimenes dienu vai notikumu.</p>
                )}
              </section>
            </aside>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="calendar-floating-create"
            >
              <span aria-hidden="true">+</span> Jauns notikums
            </button>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateSpecialDay
          initialDate={selectedDate}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['calendar-month'] });
            queryClient.invalidateQueries({ queryKey: ['special-days'] });
            queryClient.invalidateQueries({ queryKey: ['user-special-days'] });
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

export default Calendar;
