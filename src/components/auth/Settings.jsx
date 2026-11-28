import React from 'react';
import { Link } from 'react-router-dom';
import PushNotificationSettings from './PushNotificationSettings';

function Settings() {
  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-6 sm:py-8">
      <header className="mb-6">
        <div className="eyebrow">Konts un ierīce</div>
        <h1 className="section-title mt-3">Iestatījumi</h1>
        <p className="mt-2 text-sm text-muted">Pārvaldi paziņojumus un profila iestatījumus vienā vietā.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-[0_18px_55px_rgba(45,35,46,.08)] sm:p-6">
          <PushNotificationSettings />
        </div>
        <aside className="space-y-3">
          <Link to="/profile" className="block rounded-[1.5rem] border border-white/80 bg-white p-5 no-underline shadow-[0_18px_55px_rgba(45,35,46,.08)] transition hover:-translate-y-1">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#817983]">Personīgais profils</span>
            <h2 className="mt-2 text-lg font-black text-[#2d232e]">Mans profils</h2>
            <p className="mt-1 text-sm leading-6 text-[#716875]">Maini profila attēlu, dizainu, aprakstu un citus datus.</p>
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default Settings;
