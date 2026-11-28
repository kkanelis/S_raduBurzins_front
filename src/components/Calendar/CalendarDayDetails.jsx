import ProfileAvatar from '../auth/ProfileAvatar';
import { formatDateKey } from './calendarUtils';

function PersonList({ people, detail }) {
  if (!people?.length) return null;

  return (
    <ul className="calendar-people-list">
      {people.map((person) => (
        <li key={person.id} className="calendar-person">
          <ProfileAvatar user={person} className="h-10 w-10 border-2 border-white shadow-sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-dark-purple">
              {person.first_name} {person.last_name}
              {person.is_me && <span className="ml-1 text-xs font-semibold text-[#5b6fc4]">(tu)</span>}
            </span>
            {detail && <span className="block truncate text-xs text-muted">{detail(person)}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CalendarDayDetails({ day, loading, error, onCreateEvent }) {
  const date = day?.date ? new Date(`${day.date}T12:00:00`) : null;
  const dateLabel = date
    ? date.toLocaleDateString('lv-LV', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Izvēlētā diena';
  const isToday = date && formatDateKey(date) === formatDateKey(new Date());
  const birthdayForMe = day?.birthdays?.find((person) => person.is_me);
  const nameDayForMe = day?.family_name_days?.find((group) => group.members.some((member) => member.is_me));
  const surnameDayForMe = day?.family_surname_days?.find((group) => group.members.some((member) => member.is_me));
  const celebration = birthdayForMe
    ? { label: 'dzimšanas diena', name: birthdayForMe.first_name }
    : nameDayForMe
      ? { label: 'vārda diena', name: nameDayForMe.members.find((member) => member.is_me)?.first_name }
      : surnameDayForMe
        ? { label: 'uzvārda diena', name: surnameDayForMe.members.find((member) => member.is_me)?.first_name }
        : null;
  const hasCalendarDetails = (day?.name_days?.length || 0)
    + (day?.surname_days?.length || 0)
    + (day?.family_name_days?.length || 0)
    + (day?.family_surname_days?.length || 0)
    + (day?.birthdays?.length || 0)
    + (day?.events?.length || 0) > 0;

  return (
    <section className="calendar-details-card card surface-strong p-4 sm:p-5" aria-labelledby="calendar-day-details-title" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="eyebrow">Dienas informācija</div>
          <h2 id="calendar-day-details-title" className="mt-1 text-lg font-black capitalize text-dark-purple">
            {dateLabel}
          </h2>
        </div>
        {loading && <span className="text-xs font-semibold text-muted">Ielādē…</span>}
      </div>

      {isToday && celebration && (
        <div className="calendar-celebration-banner" role="status">
          <span aria-hidden="true">✦</span>
          <span>Šodien tev {celebration.label}, {celebration.name}!</span>
        </div>
      )}

      {day?.name_days?.length > 0 && (
        <section className="calendar-detail-section calendar-detail-name">
          <h3>Vārda dienu vārdi</h3>
          <div className="calendar-name-tags">
            {day.name_days.map((name, index) => (
              <span key={`${name}-${index}`}>{name}</span>
            ))}
          </div>
        </section>
      )}

      {day?.family_name_days?.length > 0 && (
        <section className="calendar-detail-section calendar-detail-name">
          <h3>Ģimenes vārda dienas</h3>
          <div className="calendar-detail-groups">
            {day.family_name_days.map((group) => (
              <div key={group.name} className="calendar-detail-group">
                <h4>{group.name}</h4>
                <PersonList
                  people={group.members}
                  detail={(person) => person.matched_name && `Svin ${person.matched_name}`}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {(day?.surname_days?.length > 0 || day?.family_surname_days?.length > 0) && (
        <section className="calendar-detail-section calendar-detail-surname">
          <h3>Uzvārda dienas</h3>
          {day.surname_days?.length > 0 && (
            <div className="calendar-name-tags">
              {day.surname_days.map((surname, index) => (
                <span key={`${surname}-${index}`}>{surname}</span>
              ))}
            </div>
          )}
          {day.family_surname_days?.length > 0 && (
            <div className="calendar-detail-groups">
              {day.family_surname_days.map((group) => (
                <div key={group.surname} className="calendar-detail-group">
                  <h4>{group.surname}</h4>
                  <PersonList people={group.members} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {day?.birthdays?.length > 0 && (
        <section className="calendar-detail-section calendar-detail-birthday">
          <h3>Dzimšanas dienas</h3>
          <PersonList people={day.birthdays} detail={(person) => `Aprit ${person.age_turning} gadi`} />
        </section>
      )}

      {day?.events?.length > 0 && (
        <section className="calendar-detail-section calendar-detail-event">
          <h3>Ģimenes notikumi</h3>
          <div className="calendar-event-list">
            {day.events.map((event) => (
              <article key={event.id} className="calendar-event-detail">
                <h4>{event.title}</h4>
                {event.description && <p>{event.description}</p>}
                <div className="calendar-event-meta">
                  {event.event_time && <span>Laiks: {event.event_time}</span>}
                  {event.location && <span>Vieta: {event.location}</span>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {error && (
        <p role="alert" className="calendar-day-empty-state">Šīs dienas informāciju neizdevās ielādēt.</p>
      )}

      {!loading && !error && !hasCalendarDetails && (
        <div className="calendar-day-empty-state">
          <p>Šajā dienā ģimenei nav notikumu. Pievieno pirmo!</p>
          <button type="button" onClick={onCreateEvent} className="btn-primary min-h-11 px-4 text-sm">
            + Pievienot notikumu
          </button>
        </div>
      )}
    </section>
  );
}

export default CalendarDayDetails;
