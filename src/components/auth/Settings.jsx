import React from 'react';
import { Link } from 'react-router-dom';
import PushNotificationSettings from './PushNotificationSettings';
import CalendarReminderSettings from './CalendarReminderSettings';

function Settings() {
  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
      <header className="mb-5 flex items-center gap-4 rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-[0_18px_55px_rgba(45,35,46,.07)] sm:mb-6 sm:p-7">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f1f0ea] text-[#2d232e] sm:h-14 sm:w-14">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            <circle cx="9" cy="6" r="2" fill="#f1f0ea" />
            <circle cx="15" cy="12" r="2" fill="#f1f0ea" />
            <circle cx="10" cy="18" r="2" fill="#f1f0ea" />
          </svg>
        </span>
        <div className="min-w-0">
          <div className="eyebrow">Konts un ierīce</div>
          <h1 className="section-title mt-1">Iestatījumi</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">Pārvaldi paziņojumus un personīgā profila informāciju vienuviet.</p>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-white/80 bg-white/90 p-5 shadow-[0_18px_55px_rgba(45,35,46,.07)] sm:p-6">
          <PushNotificationSettings />
        </div>
        <div className="rounded-[1.75rem] border border-white/80 bg-white/90 p-5 shadow-[0_18px_55px_rgba(45,35,46,.07)] sm:p-6">
          <CalendarReminderSettings />
        </div>
        <aside className="lg:col-span-2">
          <Link
            to="/profile"
            className="group flex min-h-24 items-center gap-4 rounded-[1.75rem] border border-[#e0ddcf] bg-[#f1f0ea] p-5 no-underline transition hover:-translate-y-0.5 hover:border-[#c9c4b5] hover:shadow-[0_14px_32px_rgba(45,35,46,.09)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#534b52] sm:p-6"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#2d232e] shadow-sm">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="3.25" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 19a6.5 6.5 0 0 1 13 0" />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-black uppercase tracking-[0.12em] text-[#716875]">Personīgais profils</span>
              <span className="mt-1 block text-lg font-black text-[#2d232e]">Mans profils</span>
              <span className="mt-1 block text-sm leading-6 text-[#716875]">Maini profila attēlu, dizainu, aprakstu un citus datus.</span>
            </span>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-[#534b52] transition-transform group-hover:translate-x-1" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default Settings;
