import { useEffect, useState } from 'react';
import api from '../../services/api';

function CalendarReminderSettings() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    api.get('/api/user')
      .then(({ data }) => {
        if (typeof data.calendar_reminders_enabled !== 'boolean') {
          throw new Error('Serverī nav pieejams kalendāra atgādinājumu iestatījums. Pārbaudi datubāzes migrācijas.');
        }
        if (active) setEnabled(data.calendar_reminders_enabled);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.message || requestError.message || 'Neizdevās ielādēt atgādinājumu iestatījumu.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const updateEnabled = async (event) => {
    const nextEnabled = event.target.checked;
    setSaving(true);
    setError('');

    try {
      const { data } = await api.patch('/api/user/calendar-reminders', {
        calendar_reminders_enabled: nextEnabled,
      });
      if (typeof data.calendar_reminders_enabled !== 'boolean') {
        throw new Error('Serveris neatgrieza saglabāto atgādinājumu iestatījumu.');
      }
      setEnabled(data.calendar_reminders_enabled);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message
          || requestError.message
          || 'Neizdevās saglabāt atgādinājumu iestatījumu.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section aria-labelledby="calendar-reminder-settings-title">
      <header className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1f0ea] text-[#2d232e]">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
            <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17M8 13h3M8 16h6" />
          </svg>
        </span>
        <span>
          <h2 id="calendar-reminder-settings-title" className="text-base font-black text-dark-purple">Kalendāra atgādinājumi</h2>
          <p className="mt-1 text-xs leading-5 text-muted">Atceries ģimenes svarīgās dienas laikus.</p>
        </span>
      </header>

      <div className="mt-5 rounded-2xl border border-[#e9e6de] bg-[#faf9f6] p-4">
        <label className="flex min-h-12 cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={enabled}
            onChange={updateEnabled}
            disabled={loading || saving}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[#2d232e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#534b52]"
          />
          <span>
            <span className="block text-sm font-bold text-dark-purple">
              {loading ? 'Ielādē iestatījumu…' : saving ? 'Saglabā iestatījumu…' : 'Atgādināt dienu iepriekš'}
            </span>
            <span className="mt-1 block text-xs leading-5 text-muted">
              Saņem push paziņojumu par savu vārda, uzvārda vai dzimšanas dienu. Nepieciešams ieslēgts push abonements.
            </span>
          </span>
        </label>
      </div>
      {error && <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
    </section>
  );
}

export default CalendarReminderSettings;
