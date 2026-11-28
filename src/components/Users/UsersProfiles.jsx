import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { resolveProfileDesign } from '../../config/profileDesigns';

function usePrivateImage(userId, kind, hasMedia) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!userId || !hasMedia) {
      setUrl('');
      return undefined;
    }
    const controller = new AbortController();
    let objectUrl = '';
    setUrl('');
    api.get(`/api/users/${userId}/${kind}`, { responseType: 'blob', signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          objectUrl = URL.createObjectURL(data);
          setUrl(objectUrl);
        }
      })
      .catch(() => {});
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [userId, kind, hasMedia]);
  return url;
}

function formatDate(value) {
  if (!value) return '';
  const [month, day] = value.split('-');
  const months = ['janvāris','februāris','marts','aprīlis','maijs','jūnijs','jūlijs','augusts','septembris','oktobris','novembris','decembris'];
  return `${Number(day)}. ${months[Number(month) - 1]}`;
}

function formatBirthDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('lv-LV', { day: 'numeric', month: 'long', year: 'numeric' });
}

function ProfilePopup({ user, onClose }) {
  const avatarUrl = usePrivateImage(user.id, 'avatar', Boolean(user.avatar_path));
  const coverUrl = usePrivateImage(user.id, 'cover', Boolean(user.cover_path));
  const design = resolveProfileDesign(user.profile_design);
  const birthday = Boolean(user.birthday);
  const active = birthday ? { ...design, background: '#f5a2d5', accent: '#ffffff', surface: '#fff7ef', text: '#2d232e' } : design;

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  const frameClass = design.frame === 'soft'
    ? 'border-4 border-white/80 ring-4 ring-white/25'
    : design.frame === 'ornate'
      ? 'border-[5px] border-double border-[#e8d7a8]'
      : 'border-4 border-white/90';

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-label={`${user.first_name} ${user.last_name} profils`} className="relative max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-[1.75rem] shadow-[0_30px_90px_rgba(20,12,20,0.35)]" style={{ backgroundColor: active.background, backgroundImage: birthday ? 'url(/images/profile/birthday/birthday-background.png)' : undefined, backgroundSize: 'cover', color: active.text }}>
        <button type="button" onClick={onClose} className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[#2d232e]/75 text-xl text-white shadow-lg backdrop-blur" aria-label="Aizvērt profilu">×</button>

        <div className="relative h-44 overflow-hidden sm:h-56" style={{ background: coverUrl && !birthday ? 'transparent' : `linear-gradient(135deg, ${active.accent}, ${active.background})` }}>
          {coverUrl && (
            <img
              src={coverUrl}
              alt=""
              className="h-full w-full"
              style={{
                objectFit: 'cover',
                objectPosition: `${design.coverX ?? 50}% ${design.coverY ?? 50}%`,
                transform: `scale(${design.coverScale ?? 1})`,
                transformOrigin: 'center',
              }}
            />
          )}
          {!coverUrl && design.decorations !== 'none' && (
            <div className="pointer-events-none absolute inset-0 opacity-[0.65]" aria-hidden="true">
              {design.decorations === 'floral' ? <span className="absolute left-8 top-6 text-5xl drop-shadow">🌸</span> : design.decorations === 'nature' ? <span className="absolute left-8 top-6 text-5xl drop-shadow">🌿</span> : design.decorations === 'stars' ? <span className="absolute right-10 top-6 text-4xl drop-shadow">✦ ✧</span> : <span className="absolute right-10 top-6 text-4xl drop-shadow">❋</span>}
            </div>
          )}
          {birthday && (
            <>
              <img src="/images/profile/birthday/confetti.png" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-95" />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-[#fff1ad]/70 bg-[#fff4c7]/95 px-3 py-2 text-xs font-black text-[#6f4a16] shadow-[0_8px_24px_rgba(92,57,20,.18)] backdrop-blur">🎉 Šodien dzimšanas diena</div>
              <img src="/images/profile/birthday/balloons.png" alt="" className="pointer-events-none absolute right-[-15px] bottom-[-34px] h-48 w-48 object-contain" />
              <img src="/images/profile/birthday/birthday-cake.png" alt="" className="pointer-events-none absolute bottom-[-28px] left-[44%] h-28 w-28 object-contain" />
            </>
          )}
        </div>

        <div className="relative z-10 -mt-16 px-5 pb-6 sm:px-8 sm:pb-8">
          {birthday ? (
            <div className="relative h-32 w-32 sm:h-36 sm:w-36">
              <div className="absolute inset-[14%] overflow-hidden rounded-full text-3xl font-black" style={{ background: avatarUrl ? '#fff' : active.accent, color: avatarUrl ? active.text : active.background }}>
                {avatarUrl ? <img src={avatarUrl} alt={`${user.first_name} ${user.last_name}`} className="h-full w-full rounded-full object-cover" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <div className="flex h-full items-center justify-center">{initials}</div>}
              </div>
            </div>
          ) : (
            <div className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full text-3xl font-black sm:h-32 sm:w-32 ${frameClass}`} style={{ borderColor: active.accent, background: avatarUrl ? '#fff' : active.accent, color: avatarUrl ? active.text : active.background }}>
              {avatarUrl ? <img src={avatarUrl} alt={`${user.first_name} ${user.last_name}`} className="h-full w-full rounded-full object-cover" /> : initials}
            </div>
          )}

          <div className="mt-4" style={{ color: active.text }}>
            <h2 className="text-3xl font-black sm:text-4xl" style={{ color: active.text }}>{user.first_name} {user.last_name}</h2>
            {user.nickname && <p className="mt-1 text-sm font-bold opacity-75">“{user.nickname}”</p>}
            {user.profile_description && <p className="mt-3 max-w-xl text-sm leading-7 opacity-90">{user.profile_description}</p>}
            {user.quote && <blockquote className="mt-4 border-l-2 pl-4 text-sm italic opacity-90" style={{ borderColor: active.accent }}>“{user.quote}”</blockquote>}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Dzimšanas diena', value: formatBirthDate(user.date_of_birth), icon: '🎂' },
              { label: 'Vārda diena', value: user.namedays?.map((item) => `${item.name} – ${formatDate(item.date)}`).join(' • ') || '', icon: '✦' },
              { label: 'Uzvārda diena', value: user.surnamedays?.map((item) => `${item.name} – ${formatDate(item.date)}`).join(' • ') || '', icon: '◆' },
            ].map((item) => item.value ? (
              <div key={item.label} className={`rounded-2xl border p-4 shadow-sm ${birthday && item.label === 'Dzimšanas diena' ? 'birthday-date-card border-[#f2c879]/70 ring-2 ring-[#f2c879]/20' : 'border-white/20'}`} style={{ background: active.surface, color: active.text }}>
                <div className="mb-2 text-xl" style={{ color: active.accent }}>{item.icon}</div>
                <div className="text-[11px] font-black uppercase opacity-65">{item.label}</div>
                <div className="mt-1 text-sm font-bold">{item.value}</div>
              </div>
            ) : null)}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {user.location_visible && user.location && (
              <div className="rounded-2xl border border-white/20 p-4" style={{ background: active.surface, color: active.text }}>
                <div className="text-xs font-black uppercase opacity-65">Dzīvesvieta</div>
                <div className="mt-1 text-sm font-bold">📍 {user.location}</div>
              </div>
            )}
            {user.hobbies && (
              <div className="rounded-2xl border border-white/20 p-4" style={{ background: active.surface, color: active.text }}>
                <div className="text-xs font-black uppercase opacity-65">Hobiji un intereses</div>
                <div className="mt-1 text-sm font-bold">{user.hobbies}</div>
              </div>
            )}
            {user.extra_info && (
              <div className="rounded-2xl border border-white/20 p-4 sm:col-span-2" style={{ background: active.surface, color: active.text }}>
                <div className="text-xs font-black uppercase opacity-65">Papildu informācija</div>
                <div className="mt-1 whitespace-pre-wrap text-sm font-bold">{user.extra_info}</div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function UsersProfiles() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/users')
      .then(({ data }) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setError('Neizdevās ielādēt ģimenes locekļus. Mēģini vēlreiz vēlāk.'))
      .finally(() => setLoading(false));
  }, []);

  const visibleUsers = users.filter((user) => {
    const matchesSearch = `${user.first_name} ${user.last_name} ${user.nickname || ''}`.toLocaleLowerCase('lv-LV').includes(search.toLocaleLowerCase('lv-LV'));
    return matchesSearch;
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
      <header className="mb-6">
        <div className="eyebrow">Ģimenes locekļi</div>
        <h1 className="section-title mt-3">Lietotāji</h1>
        <p className="mt-2 text-sm text-muted">Apskati apstiprināto ģimenes locekļu profilus.</p>
      </header>

      <div className="mb-5">
        <label className="relative block w-full sm:max-w-md">
          <span className="sr-only">Meklēt lietotāju</span>
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#807783]">⌕</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Meklēt pēc vārda vai uzvārda..." className="w-full rounded-2xl border border-[#e5e0d8] bg-white py-3 pl-10 pr-4 text-sm text-dark-purple shadow-sm outline-none transition focus:border-[#534b52] focus:ring-4 focus:ring-[#534b52]/10" />
        </label>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Ielādē lietotāju kartītes">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[344px] overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-[0_8px_30px_rgba(45,35,46,0.08)]" aria-hidden="true">
              <div className="h-[128px] animate-pulse bg-[#ebe8e2]" />
              <div className="-mt-11 px-5">
                <div className="h-20 w-20 rounded-full border-4 border-white bg-[#dcd7cf] animate-pulse" />
                <div className="mt-4 h-5 w-2/3 rounded-full bg-[#ebe8e2] animate-pulse" />
                <div className="mt-2 h-3 w-1/3 rounded-full bg-[#f0eee9] animate-pulse" />
                <div className="mt-5 h-12 rounded-lg bg-[#f3f1ed] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">{error}</div>
      ) : visibleUsers.length === 0 ? (
        <div className="rounded-[24px] border border-white/80 bg-white px-6 py-12 text-center text-sm text-[#716875] shadow-[0_8px_30px_rgba(45,35,46,0.08)]">
          {search ? 'Neatradām nevienu lietotāju ar šo meklēšanas frāzi.' : 'Apstiprinātu ģimenes locekļu vēl nav.'}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => setSelected(user)}
              aria-haspopup="dialog"
              aria-label={`Atvērt ${user.first_name} ${user.last_name} profilu`}
              className="group h-full w-full text-left rounded-[24px] focus-visible:outline-offset-4"
            >
              <ProfileCard user={user} />
            </button>
          ))}
        </div>
      )}
      {selected && <ProfilePopup user={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export function ProfileCard({ user, avatarOverride = '', coverOverride = '' }) {
  const avatarUrl = usePrivateImage(user.id, 'avatar', Boolean(user.avatar_path));
  const coverUrl = usePrivateImage(user.id, 'cover', Boolean(user.cover_path));
  const resolvedAvatarUrl = avatarOverride || avatarUrl;
  const resolvedCoverUrl = coverOverride || coverUrl;
  const kit = resolveProfileDesign(user.profile_design);
  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  const fallbackGradient = `linear-gradient(135deg, ${kit.background}, ${kit.accent})`;
  const birthday = Boolean(user.birthday);
  const active = birthday
    ? { ...kit, background: '#f5a2d5', accent: '#ffffff', surface: '#fff7ef', text: '#2d232e' }
    : kit;
  const avatarFrameClass = kit.frame === 'soft'
    ? 'ring-4 ring-white/60'
    : kit.frame === 'ornate'
      ? 'border-[4px] border-double border-[#e8d7a8]'
      : 'border-4 border-white';

  return (
    <div
      className="flex h-[320px] w-full flex-col overflow-hidden rounded-[24px] border border-white/30 text-left shadow-[0_8px_30px_rgba(45,35,46,0.10)] transition duration-250 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_16px_38px_rgba(45,35,46,0.16)]"
      style={{ background: active.background, color: active.text }}
    >
      <div
        className="relative h-[128px] shrink-0 overflow-hidden"
        style={{
          background: !birthday && resolvedCoverUrl
            ? 'transparent'
            : birthday
              ? 'linear-gradient(135deg, #f5a2d5, #fff4b8)'
              : fallbackGradient,
        }}
      >
        {resolvedCoverUrl && (
          <img
            src={resolvedCoverUrl}
            alt={`Vāka attēls: ${user.first_name} ${user.last_name}`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            onError={(event) => { event.currentTarget.style.display = 'none'; }}
            style={{
              objectPosition: `${kit.coverX ?? 50}% ${kit.coverY ?? 50}%`,
              transform: `scale(${kit.coverScale ?? 1})`,
              transformOrigin: 'center',
            }}
          />
        )}
        {!birthday && !resolvedCoverUrl && kit.decorations !== 'none' && (
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {kit.decorations === 'floral' && (
              <><span className="absolute left-5 top-4 text-4xl opacity-70">🌸</span><span className="absolute bottom-3 right-6 text-3xl opacity-70">✿</span></>
            )}
            {kit.decorations === 'nature' && (
              <><span className="absolute left-5 top-4 text-4xl opacity-75">🌿</span><span className="absolute bottom-3 right-6 text-3xl opacity-75">🍃</span></>
            )}
            {kit.decorations === 'stars' && (
              <><span className="absolute left-5 top-4 text-3xl text-[#f1f0ea] opacity-80">✦</span><span className="absolute right-8 top-5 text-2xl text-[#f1f0ea] opacity-70">✧</span></>
            )}
            {kit.decorations === 'geometric' && (
              <><span className="absolute left-5 top-5 h-12 w-12 rotate-45 rounded-lg border-2 border-white/45" /><span className="absolute bottom-4 right-7 h-9 w-9 rounded-full border-2 border-white/40" /></>
            )}
            {(kit.decorations === 'elegant' || kit.decorations === 'ornaments') && (
              <span className="absolute right-7 top-5 text-3xl text-white/70">❋</span>
            )}
          </div>
        )}
        {birthday && (
          <>
            <img src="/images/profile/birthday/confetti.png" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
            <span className="absolute right-3 top-3 z-10 rounded-full border border-[#fff1ad]/70 bg-[#fff4c7]/95 px-2.5 py-1.5 text-[10px] font-black text-[#6f4a16] shadow">Dzimšanas diena</span>
            <img src="/images/profile/birthday/balloons.png" alt="" className="pointer-events-none absolute -bottom-7 right-[-8px] h-24 w-24 object-contain" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
            <img src="/images/profile/birthday/birthday-cake.png" alt="" className="pointer-events-none absolute bottom-[-17px] left-[43%] h-16 w-16 object-contain" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
          </>
        )}
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col px-5 pb-4" style={{ background: active.surface, color: active.text }}>
        <div className={`-mt-11 h-[88px] w-[88px] shrink-0 overflow-hidden rounded-full shadow-[0_6px_18px_rgba(45,35,46,.16)] ${avatarFrameClass}`} style={{ background: avatarUrl ? '#fff' : active.accent, color: active.background }}>
          {resolvedAvatarUrl ? (
            <img
              src={resolvedAvatarUrl}
              alt={`Profila attēls: ${user.first_name} ${user.last_name}`}
              className="h-full w-full rounded-full object-cover"
              loading="lazy"
              decoding="async"
              onError={(event) => { event.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-black">{initials}</div>
          )}
        </div>

        <h2 className="mt-2 line-clamp-2 min-h-[48px] break-words text-[19px] font-black leading-[24px]" style={{ color: active.text }}>
          {user.first_name} {user.last_name}
        </h2>
        <p className="mt-[-20px] h-[18px] truncate text-sm italic opacity-70" style={{ color: active.text }}>
          {user.nickname ? `“${user.nickname}”` : ''}
        </p>
        <p className="mt-2 line-clamp-3 min-h-[54px] text-[13px] leading-[18px] opacity-85" style={{ color: active.text }}>
          {user.profile_description?.trim() || 'Vēl nav pievienojis aprakstu'}
        </p>
      </div>
    </div>
  );
}

export default UsersProfiles;
