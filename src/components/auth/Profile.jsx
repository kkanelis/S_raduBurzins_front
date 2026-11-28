import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import api from '../../services/api';
import { defaultProfileDesign, profileDesignThemes, resolveProfileDesign } from '../../config/profileDesigns';
import { ProfileCard } from '../Users/UsersProfiles';

const inputClassName = 'w-full min-w-0 rounded-xl border border-[#e3dfd8] bg-[#fdfcf9] px-4 py-3 text-sm text-[#2d232e] shadow-sm outline-none transition placeholder:text-[#918894] focus:border-[#534b52] focus:bg-white focus:ring-4 focus:ring-[#534b52]/10';

function normalizedName(name) {
  return name.trim().toLocaleLowerCase('lv-LV').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function personNames(value) {
  return value.trim().split(/[\s-]+/u).filter(Boolean);
}

function surnameStem(name) {
  let normalized = normalizedName(name);
  for (const suffix of ['is', 'us', 'as', 'es', 'os', 'a', 'e', 'i', 's', 'š']) {
    if (normalized.endsWith(suffix)) {
      const stem = normalized.slice(0, -suffix.length);
      if (stem.length >= 3) return stem;
    }
  }
  return '';
}

function findNamedays(records, fullName) {
  const names = personNames(fullName);
  const matches = records.flatMap((record) => (record.names || [])
    .filter((name) => names.some((personName) => normalizedName(personName) === normalizedName(name)))
    .map((name) => ({ name, date: record.date })));
  return matches.length ? matches : names.map((name) => ({ name, date: '05-22' }));
}

function findSurnamedays(records, fullName) {
  const names = personNames(fullName);
  const matches = records.flatMap((record) => (record.surnames || [])
    .filter((name) => names.some((personName) => {
      const personStem = surnameStem(personName);
      const knownStem = surnameStem(name);
      return personStem && knownStem && personStem === knownStem;
    }))
    .map((name) => ({ name, date: record.date })));
  return matches.length ? matches : names.map((name) => ({ name, date: '08-03' }));
}

function displayCalendarDate(value) {
  if (!value) return '';
  const [month, day] = value.split('-').map(Number);
  const names = ['janvāris', 'februāris', 'marts', 'aprīlis', 'maijs', 'jūnijs', 'jūlijs', 'augusts', 'septembris', 'oktobris', 'novembris', 'decembris'];
  return month && day ? `${day}. ${names[month - 1]}` : '';
}

function displayBirthDate(value) {
  if (!value) return '';
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return '';
  return new Date(year, month - 1, day).toLocaleDateString('lv-LV', { day: 'numeric', month: 'long', year: 'numeric' });
}

function isBirthday(value) {
  if (!value) return false;
  const [, month, day] = value.slice(0, 10).split('-');
  const today = new Date();
  return Number(month) === today.getMonth() + 1 && Number(day) === today.getDate();
}

function useLocalImage(user, kind, file, removed) {
  const [src, setSrc] = useState('');
  const path = kind === 'avatar' ? user?.avatar_path : user?.cover_path;

  useEffect(() => {
    let objectUrl = '';
    if (file) {
      objectUrl = URL.createObjectURL(file);
      setSrc(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    if (!user?.id || !path || removed) {
      setSrc('');
      return undefined;
    }
    const controller = new AbortController();
    api.get(`/api/users/${user.id}/${kind}`, {
      responseType: 'blob',
      signal: controller.signal,
      params: { updated_at: user.updated_at || '' },
    }).then(({ data }) => {
      if (!controller.signal.aborted) {
        objectUrl = URL.createObjectURL(data);
        setSrc(objectUrl);
      }
    }).catch(() => {
      if (!controller.signal.aborted) setSrc('');
    });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file, kind, path, removed, user?.id, user?.updated_at]);

  return src;
}

function DecorationLayer({ style }) {
  if (style === 'nature') {
    return <div className="pointer-events-none absolute inset-0 opacity-[0.55]" aria-hidden="true"><span className="absolute left-6 top-5 text-5xl drop-shadow">🌿</span><span className="absolute bottom-5 right-8 text-4xl drop-shadow">🍃</span></div>;
  }
  if (style === 'floral') {
    return <div className="pointer-events-none absolute inset-0 opacity-[0.55]" aria-hidden="true"><span className="absolute left-7 top-5 text-5xl drop-shadow">🌸</span><span className="absolute bottom-5 right-8 text-4xl drop-shadow">✿</span></div>;
  }
  if (style === 'stars') {
    return <div className="pointer-events-none absolute inset-0 opacity-[0.65]" aria-hidden="true"><span className="absolute left-8 top-6 text-5xl drop-shadow">✦</span><span className="absolute right-10 top-10 text-4xl drop-shadow">✧</span><span className="absolute bottom-7 left-1/3 text-3xl">·</span></div>;
  }
  if (style === 'geometric') {
    return <div className="pointer-events-none absolute inset-0 opacity-[0.55]" aria-hidden="true"><span className="absolute left-8 top-7 h-16 w-16 rotate-45 rounded-lg border-2 border-current" /><span className="absolute bottom-6 right-12 h-12 w-12 rounded-full border-2 border-current" /></div>;
  }
  if (style === 'elegant' || style === 'ornaments') {
    return <div className="pointer-events-none absolute inset-0 opacity-[0.55]" aria-hidden="true"><span className="absolute right-8 top-6 text-5xl drop-shadow">❋</span><span className="absolute bottom-6 left-8 h-px w-24 bg-current" /></div>;
  }
  return null;
}

function FrameWrap({ frame, children, style }) {
  const frameClass = {
    classic: 'border-4 border-white/90 shadow-[0_12px_34px_rgba(20,12,20,.28)]',
    soft: 'border-4 border-white/80 ring-4 ring-white/25',
    ornate: 'border-[5px] border-double border-[#e8d7a8] shadow-[0_0_0_4px_rgba(255,255,255,.25),0_12px_34px_rgba(20,12,20,.28)]',
  }[frame] || 'border-4 border-white/90';
  return <div className={`overflow-hidden rounded-full ${frameClass}`} style={style}>{children}</div>;
}

function ProfilePreview({ formData, design, avatarSrc, coverSrc, namedays, surnamedays, birthdayPreview }) {
  const resolved = resolveProfileDesign(design);
  const birthday = isBirthday(formData.date_of_birth) || birthdayPreview;
  const colors = birthday
    ? { ...resolved, background: '#4a2a3e', accent: '#f2c879', surface: '#fff7ef', text: '#2d232e' }
    : resolved;
  const initials = `${formData.first_name?.[0] || ''}${formData.last_name?.[0] || ''}`.toUpperCase();
  const dateItems = [
    { label: 'Dzimšanas diena', value: displayBirthDate(formData.date_of_birth), icon: '🎂' },
    { label: 'Vārda diena', value: namedays.map((item) => `${item.name} – ${displayCalendarDate(item.date)}`).join(' · '), icon: '✦' },
    { label: 'Uzvārda diena', value: surnamedays.map((item) => `${item.name} – ${displayCalendarDate(item.date)}`).join(' · '), icon: '◆' },
  ].filter((item) => item.value);

  return (
    <aside className="lg:sticky lg:top-6">
      <div className="mb-3 flex items-center justify-between">
        <div><div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#807783]">Profila priekšskatījums</div><p className="mt-1 text-xs text-muted">Izmaiņas redzamas uzreiz</p></div>
        <span className="rounded-full border border-white/80 bg-white px-3 py-1.5 text-xs font-bold text-[#534b52] shadow-sm">Mans profils</span>
      </div>
      <article className="overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_24px_70px_rgba(45,35,46,.18)]" style={{ backgroundColor: colors.background, backgroundImage: birthday ? 'url(/images/profile/birthday/birthday-background.png)' : undefined, backgroundSize: 'cover', color: colors.text }}>
        <div className="relative h-44 overflow-hidden sm:h-52" style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.background})` }}>
          {coverSrc && (
            <img
              src={coverSrc}
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
          <DecorationLayer style={design.decorations} />
          {birthday && (
            <>
              <img src="/images/profile/birthday/confetti.png" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-95" />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-[#fff1ad]/70 bg-[#fff4c7]/95 px-3 py-2 text-xs font-black text-[#6f4a16] shadow-[0_8px_24px_rgba(92,57,20,.18)] backdrop-blur">🎉 Šodien dzimšanas diena</div>
              <img src="/images/profile/birthday/balloons.png" alt="" className="pointer-events-none absolute right-[-18px] bottom-[-25px] h-44 w-44 object-contain" />
              <img src="/images/profile/birthday/birthday-cake.png" alt="" className="pointer-events-none absolute bottom-[-28px] left-[44%] h-24 w-24 object-contain" />
            </>
          )}
        </div>
        <div className="relative px-5 pb-7 sm:px-8">
          <div className="-mt-14 flex items-end justify-between gap-3">
            <FrameWrap frame={colors.frame || 'classic'} style={{ width: '112px', height: '112px', background: avatarSrc ? '#fff' : colors.accent, color: colors.background }}>
              {avatarSrc ? <img src={avatarSrc} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-3xl font-black">{initials || 'RB'}</div>}
            </FrameWrap>
            <span className="mb-3 rounded-full border border-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.13em] opacity-75">{resolved.label}</span>
          </div>
          <div className="mt-4">
            <h1 className="break-words text-3xl font-black" style={{ color: colors.text }}>{formData.first_name || 'Vārds'} {formData.last_name || 'Uzvārds'}</h1>
            {formData.nickname && <p className="mt-1 text-sm font-bold opacity-70">“{formData.nickname}”</p>}
            <p className="mt-4 max-w-xl whitespace-pre-wrap text-sm leading-7 opacity-85">{formData.profile_description || 'Šeit būs redzams tavs profila apraksts.'}</p>
            {formData.quote && <blockquote className="mt-5 border-l-2 pl-4 text-sm italic opacity-90" style={{ borderColor: colors.accent }}>“{formData.quote}”</blockquote>}
          </div>
          {dateItems.length > 0 && (
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {dateItems.map((item) => (
                <div key={item.label} className={`rounded-2xl border p-4 ${birthday && item.label === 'Dzimšanas diena' ? 'birthday-date-card border-[#f2c879]/70 ring-2 ring-[#f2c879]/20' : 'border-white/10'}`} style={{ background: colors.surface, color: colors.text }}>
                  <div className="text-lg" style={{ color: colors.accent }}>{item.icon}</div>
                  <div className="mt-2 text-[10px] font-black uppercase tracking-wide opacity-60">{item.label}</div>
                  <div className="mt-1 text-xs font-bold leading-5">{item.value}</div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {formData.location_visible && formData.location && <div className="rounded-2xl border border-white/10 p-4" style={{ background: colors.surface, color: colors.text }}><div className="text-[10px] font-black uppercase opacity-60">Dzīvesvieta</div><div className="mt-1 text-xs font-bold">📍 {formData.location}</div></div>}
            {formData.hobbies && <div className="rounded-2xl border border-white/10 p-4" style={{ background: colors.surface, color: colors.text }}><div className="text-[10px] font-black uppercase opacity-60">Hobiji un intereses</div><div className="mt-1 text-xs font-bold">{formData.hobbies}</div></div>}
            {formData.extra_info && <div className="rounded-2xl border border-white/10 p-4 sm:col-span-2" style={{ background: colors.surface, color: colors.text }}><div className="text-[10px] font-black uppercase opacity-60">Papildu informācija</div><div className="mt-1 whitespace-pre-wrap text-xs font-bold">{formData.extra_info}</div></div>}
          </div>
        </div>
      </article>
    </aside>
  );
}

function ImageUpload({ label, hint, file, existing, removed, onFile, onRemove, compact = false }) {
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const acceptFile = (selected) => {
    if (!selected) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
      setFileError('Izvēlies JPG, PNG vai WebP attēlu.');
      return;
    }
    if (selected.size > 8192 * 1024) {
      setFileError('Attēls pārsniedz 8 MB ierobežojumu.');
      return;
    }
    setFileError('');
    onFile(selected);
  };
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-3"><div><div className="text-sm font-black text-[#2d232e]">{label}</div><p className="mt-1 text-xs text-muted">{hint}</p></div>{existing && <button type="button" onClick={onRemove} className="text-xs font-bold text-[#865d6d] hover:underline">{removed ? 'Atcelt noņemšanu' : 'Noņemt'}</button>}</div>
      <label onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files?.[0]); }} className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 text-center transition ${dragging ? 'border-[#534b52] bg-[#f1f0ea]' : 'border-[#ddd7cf] bg-[#faf9f6] hover:border-[#918a82]'} ${compact ? 'h-28' : 'h-36'}`}>
        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => acceptFile(event.target.files?.[0])} />
        <span className="text-2xl">＋</span><span className="mt-2 text-xs font-bold text-[#534b52]">{file ? file.name : 'Vilkt šeit vai izvēlēties attēlu'}</span>        <span className="mt-1 text-[10px] text-muted">JPG, PNG vai WebP · līdz 8 MB</span>
      </label>
      {fileError && <p role="alert" className="mt-2 text-xs font-bold text-red-600">{fileError}</p>}
    </div>
  );
}

function Profile() {
  const { user, checkAuth, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('design');
  const [previewMode, setPreviewMode] = useState('full');
  const [birthdayPreview, setBirthdayPreview] = useState(false);
  const [savedForm, setSavedForm] = useState({
    first_name: user?.first_name || '', last_name: user?.last_name || '', nickname: user?.nickname || '',
    phone: user?.phone || '', date_of_birth: user?.date_of_birth || '', email: user?.email || '',
    profile_description: user?.profile_description || '', location: user?.location || '',
    location_visible: user?.location_visible !== false, hobbies: user?.hobbies || '',
    extra_info: user?.extra_info || '', quote: user?.quote || '',
  });
  const [formData, setFormData] = useState(savedForm);
  const [savedDesign, setSavedDesign] = useState({ ...defaultProfileDesign, ...(user?.profile_design || {}) });
  const [profileDesign, setProfileDesign] = useState(savedDesign);
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [removeCover, setRemoveCover] = useState(false);
  const [namedays, setNamedays] = useState([]);
  const [surnamedays, setSurnamedays] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const avatarSrc = useLocalImage(user, 'avatar', avatarFile, removeAvatar);
  const coverSrc = useLocalImage(user, 'cover', coverFile, removeCover);
  const dirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(savedForm)
      || JSON.stringify(profileDesign) !== JSON.stringify(savedDesign)
      || avatarFile !== null || coverFile !== null || removeAvatar || removeCover;
  }, [formData, savedForm, profileDesign, savedDesign, avatarFile, coverFile, removeAvatar, removeCover]);

  useEffect(() => {
    if (!dirty) return undefined;
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!message && !error) return undefined;
    const timer = window.setTimeout(() => {
      setMessage('');
      setError('');
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [message, error]);

  useEffect(() => {
    let active = true;
    Promise.all([api.get('/api/namedays'), api.get('/api/surnames')]).then(([nameday, surname]) => {
      if (!active) return;
      setNamedays(findNamedays(nameday.data, formData.first_name));
      setSurnamedays(findSurnamedays(surname.data, formData.last_name));
    }).catch(() => setError('Neizdevās ielādēt vārda dienu datus.'));
    return () => { active = false; };
  }, [formData.first_name, formData.last_name]);

  if (!user) return <div className="py-8 text-center">Nav lietotāja datu.</div>;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const selectTheme = (theme) => {
    const preset = profileDesignThemes[theme];
    setProfileDesign((current) => ({ ...current, theme, background: preset.background, accent: preset.accent, frame: preset.frame, decorations: preset.decorations }));
  };

  const discardChanges = () => {
    setFormData(savedForm);
    setProfileDesign(savedDesign);
    setAvatarFile(null);
    setCoverFile(null);
    setRemoveAvatar(false);
    setRemoveCover(false);
    setMessage('Nesaglabātās izmaiņas atceltas.');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => payload.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : (value ?? '')));
      payload.append('profile_design', JSON.stringify(profileDesign));
      payload.append('_method', 'PUT');
      if (avatarFile) payload.append('avatar', avatarFile);
      if (coverFile) payload.append('cover', coverFile);
      if (removeAvatar) payload.append('remove_avatar', '1');
      if (removeCover) payload.append('remove_cover', '1');
      const response = await api.post('/api/profile', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.data?.user) {
        if (response.data.user.email !== user.email) {
          await logout();
          navigate('/login', { replace: true, state: { message: 'E-pasts nomainīts. Apstiprini jauno adresi.' } });
          return;
        }
        updateUser(response.data.user);
        await checkAuth();
      }
      setSavedForm(formData);
      setSavedDesign(profileDesign);
      setAvatarFile(null); setCoverFile(null); setRemoveAvatar(false); setRemoveCover(false);
      setMessage('Profils saglabāts.');
    } catch (submissionError) {
      setError(submissionError?.response?.data?.message || 'Neizdevās saglabāt profila datus.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'design', label: 'Dizains', icon: '◆' },
    { key: 'info', label: 'Profila informācija', icon: '◉' },
    { key: 'images', label: 'Attēli', icon: '▧' },
    { key: 'decorations', label: 'Dekorācijas', icon: '✦' },
  ];

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_right,rgba(83,75,82,.10),transparent_32%),linear-gradient(135deg,#f1f0ea,#faf9f6)] px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div><div className="eyebrow">Mans profils</div><h1 className="mt-3 text-4xl font-black tracking-tight text-[#2d232e] sm:text-5xl">Mans profils</h1><p className="mt-2 text-sm text-[#716875]">Izveido savu unikālo ģimenes profilu.</p></div>
          <div className="flex items-center gap-2">
            {dirty && <span className="hidden items-center gap-2 rounded-full border border-[#dfc6a4] bg-[#fff8e9] px-3 py-2 text-xs font-bold text-[#7a5a2e] sm:flex"><span className="h-2 w-2 rounded-full bg-[#d39a45]" />Nav saglabāts</span>}
            {dirty && <button type="button" onClick={discardChanges} className="btn-ghost px-4 py-2.5 text-xs">Atcelt</button>}
            <button form="profile-editor" type="submit" disabled={saving || !dirty} className="btn-primary px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Saglabā...' : 'Saglabāt izmaiņas'}</button>
          </div>
        </header>

        {message && (
          <div role="status" className="fixed bottom-20 left-1/2 z-[1200] flex -translate-x-1/2 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 shadow-[0_14px_40px_rgba(45,35,46,.18)]">
            <span aria-hidden="true">✓</span>{message}
          </div>
        )}
        {error && (
          <div role="alert" className="fixed bottom-20 left-1/2 z-[1200] flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 shadow-[0_14px_40px_rgba(45,35,46,.18)]">
            <span aria-hidden="true">!</span>{error}
          </div>
        )}

        <form id="profile-editor" onSubmit={handleSubmit}>
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(390px,0.95fr)_minmax(430px,1.05fr)]">
            <aside className="lg:sticky lg:top-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#807783]">Profila priekšskatījums</div>
                  <p className="mt-1 text-xs text-muted">Izmaiņas redzamas uzreiz</p>
                </div>
                <div className="flex rounded-full border border-[#e2ddd5] bg-white p-1" role="group" aria-label="Priekšskatījuma skats">
                  <button type="button" onClick={() => setPreviewMode('card')} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${previewMode === 'card' ? 'bg-[#2d232e] text-white' : 'text-[#716875]'}`}>Kartīte</button>
                  <button type="button" onClick={() => setPreviewMode('full')} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${previewMode === 'full' ? 'bg-[#2d232e] text-white' : 'text-[#716875]'}`}>Pilns profils</button>
                </div>
              </div>
              {previewMode === 'card' ? (
                <div className="mx-auto max-w-[380px]">
                  <ProfileCard
                    user={{
                      ...user,
                      first_name: formData.first_name,
                      last_name: formData.last_name,
                      nickname: formData.nickname,
                      profile_description: formData.profile_description,
                      profile_design: profileDesign,
                      hobbies: formData.hobbies,
                      avatar_path: removeAvatar ? null : user.avatar_path,
                      cover_path: removeCover ? null : user.cover_path,
                      birthday: isBirthday(formData.date_of_birth) || birthdayPreview,
                    }}
                    avatarOverride={avatarSrc}
                    coverOverride={coverSrc}
                  />
                </div>
              ) : (
                <ProfilePreview formData={formData} design={profileDesign} avatarSrc={avatarSrc} coverSrc={coverSrc} namedays={namedays} surnamedays={surnamedays} birthdayPreview={birthdayPreview} />
              )}
            </aside>

            <section className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/75 shadow-[0_18px_55px_rgba(45,35,46,.11)] backdrop-blur-xl">
              <nav className="grid grid-cols-2 border-b border-[#ebe7e1] p-2 sm:grid-cols-4" aria-label="Profila iestatījumu kategorijas">
                {tabs.map((tab) => (
                  <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`flex min-h-14 items-center justify-center gap-2 rounded-xl px-2 text-xs font-black transition ${activeTab === tab.key ? 'bg-[#2d232e] text-white shadow-md' : 'text-[#716875] hover:bg-[#f3f1ed]'}`}><span>{tab.icon}</span><span>{tab.label}</span></button>
                ))}
              </nav>

              <div className="p-4 sm:p-6">
                {activeTab === 'design' && (
                  <div>
                    <div className="mb-5"><h2 className="text-xl font-black text-[#2d232e]">Izvēlies dizaina komplektu</h2><p className="mt-1 text-sm text-[#7a727c]">Katrs komplekts maina profila noskaņu, krāsas un dekorācijas.</p></div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {Object.entries(profileDesignThemes).map(([key, preset]) => (
                        <button key={key} type="button" onClick={() => selectTheme(key)} className={`group overflow-hidden rounded-2xl border text-left transition hover:-translate-y-1 hover:shadow-lg ${profileDesign.theme === key ? 'border-[#5f4e67] ring-2 ring-[#5f4e67]/15' : 'border-[#e8e3dc]'}`}>
                          <div className="relative h-28 overflow-hidden" style={{ background: `linear-gradient(135deg, ${preset.background}, ${preset.accent})` }}>
                            <div className="absolute inset-x-3 bottom-3 h-14 rounded-xl border border-white/25" style={{ background: preset.surface }} />
                            <div className="absolute bottom-5 left-6 h-12 w-12 rounded-full border-2 border-white/70" style={{ background: preset.accent }} />
                            {profileDesign.theme === key && <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-[#534b52] shadow">Izvēlēts</span>}
                          </div>
                          <div className="bg-white p-3"><div className="flex items-center justify-between"><span className="text-sm font-black text-[#2d232e]">{preset.label}</span><span className="flex gap-1"><i className="h-3 w-3 rounded-full border" style={{ background: preset.background }} /><i className="h-3 w-3 rounded-full border" style={{ background: preset.accent }} /></span></div><p className="mt-1.5 text-xs leading-5 text-[#817983]">{preset.description}</p></div>
                        </button>
                      ))}
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <label className="rounded-2xl border border-[#ece8e2] bg-[#fdfcf9] p-3"><span className="text-xs font-bold text-[#5d5661]">Fona krāsa</span><input type="color" aria-label="Fona krāsa" value={profileDesign.background || '#2d232e'} onChange={(event) => setProfileDesign((current) => ({ ...current, background: event.target.value }))} className="mt-2 h-12 w-full rounded-xl border-0 bg-transparent p-1" /></label>
                      <label className="rounded-2xl border border-[#ece8e2] bg-[#fdfcf9] p-3"><span className="text-xs font-bold text-[#5d5661]">Akcenta krāsa</span><input type="color" aria-label="Akcenta krāsa" value={profileDesign.accent || '#e0ddcf'} onChange={(event) => setProfileDesign((current) => ({ ...current, accent: event.target.value }))} className="mt-2 h-12 w-full rounded-xl border-0 bg-transparent p-1" /></label>
                    </div>
                    {(import.meta.env.DEV || user.is_admin) && (
                      <label className="mt-5 flex items-center justify-between rounded-2xl border border-[#ece8e2] bg-[#fdfcf9] px-4 py-3 text-sm font-bold text-[#534b52]">
                        <span>Izstrādes dzimšanas dienas režīms</span>
                        <input type="checkbox" checked={birthdayPreview} onChange={(event) => setBirthdayPreview(event.target.checked)} />
                      </label>
                    )}
                    <button type="button" onClick={() => setProfileDesign(defaultProfileDesign)} className="btn-ghost mt-5 px-4 py-2 text-xs">Atgriezt noklusējuma dizainu</button>
                  </div>
                )}

                {activeTab === 'info' && (
                  <div className="grid gap-5">
                    <div><h2 className="text-xl font-black text-[#2d232e]">Profila informācija</h2><p className="mt-1 text-sm text-[#7a727c]">Ievadi to, ko vēlies parādīt ģimenes locekļiem.</p></div>
                    <label className="grid gap-2"><span className="text-xs font-black text-[#534b52]">Profila apraksts</span><textarea name="profile_description" value={formData.profile_description} onChange={handleChange} rows={4} maxLength={1000} className={`${inputClassName} resize-none`} placeholder="Pastāsti par sevi..." /></label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2"><span className="text-xs font-black text-[#534b52]">Iesauka</span><input name="nickname" value={formData.nickname} onChange={handleChange} className={inputClassName} /></label>
                      <label className="grid gap-2"><span className="text-xs font-black text-[#534b52]">Dzīvesvieta</span><input name="location" value={formData.location} onChange={handleChange} className={inputClassName} /></label>
                    </div>
                    <label className="flex items-center gap-3 rounded-xl border border-[#ece8e2] bg-[#fdfcf9] px-4 py-3 text-sm font-bold text-[#534b52]"><input type="checkbox" name="location_visible" checked={formData.location_visible} onChange={handleChange} />Rādīt dzīvesvietu</label>
                    <label className="grid gap-2"><span className="text-xs font-black text-[#534b52]">Hobiji un intereses</span><textarea name="hobbies" value={formData.hobbies} onChange={handleChange} rows={3} maxLength={1000} className={`${inputClassName} resize-none`} /></label>
                    <label className="grid gap-2"><span className="text-xs font-black text-[#534b52]">Citāts</span><textarea name="quote" value={formData.quote} onChange={handleChange} rows={2} maxLength={500} className={`${inputClassName} resize-none`} /></label>
                    <label className="grid gap-2"><span className="text-xs font-black text-[#534b52]">Papildu informācija</span><textarea name="extra_info" value={formData.extra_info} onChange={handleChange} rows={3} maxLength={1000} className={`${inputClassName} resize-none`} /></label>
                  </div>
                )}

                {activeTab === 'images' && (
                  <div className="grid gap-6">
                    <div><h2 className="text-xl font-black text-[#2d232e]">Attēli</h2><p className="mt-1 text-sm text-[#7a727c]">Augšā vāka attēls, centrā profila attēls.</p></div>
                    <ImageUpload label="Vāka attēls" hint="Liels horizontāls attēls dod pārskatāmāku profila noskaņu." file={coverFile} existing={Boolean(user.cover_path)} removed={removeCover} onFile={setCoverFile} onRemove={() => setRemoveCover((value) => !value)} />
                    {(coverSrc || coverFile) && (
                      <div className="grid gap-4 rounded-2xl border border-[#ece8e2] bg-[#fdfcf9] p-4">
                        <div className="flex items-center justify-between"><span className="text-sm font-black text-[#2d232e]">Vāka attēla novietojums</span><button type="button" onClick={() => setProfileDesign((current) => ({ ...current, coverX: 50, coverY: 50, coverScale: 1 }))} className="text-xs font-bold text-[#716875] hover:underline">Atiestatīt</button></div>
                        <label className="grid gap-2"><span className="flex justify-between text-xs font-bold text-[#5d5661]"><span>Horizontāli</span><span>{profileDesign.coverX ?? 50}%</span></span><input type="range" min="0" max="100" value={profileDesign.coverX ?? 50} onChange={(event) => setProfileDesign((current) => ({ ...current, coverX: Number(event.target.value) }))} /></label>
                        <label className="grid gap-2"><span className="flex justify-between text-xs font-bold text-[#5d5661]"><span>Vertikāli</span><span>{profileDesign.coverY ?? 50}%</span></span><input type="range" min="0" max="100" value={profileDesign.coverY ?? 50} onChange={(event) => setProfileDesign((current) => ({ ...current, coverY: Number(event.target.value) }))} /></label>
                        <label className="grid gap-2"><span className="flex justify-between text-xs font-bold text-[#5d5661]"><span>Tuvinājums</span><span>{Math.round((profileDesign.coverScale ?? 1) * 100)}%</span></span><input type="range" min="100" max="180" value={Math.round((profileDesign.coverScale ?? 1) * 100)} onChange={(event) => setProfileDesign((current) => ({ ...current, coverScale: Number(event.target.value) / 100 }))} /></label>
                      </div>
                    )}
                    <ImageUpload label="Profila attēls" hint="Kvadrātisks attēls darbojas vislabāk." file={avatarFile} existing={Boolean(user.avatar_path)} removed={removeAvatar} onFile={setAvatarFile} onRemove={() => setRemoveAvatar((value) => !value)} />
                  </div>
                )}

                {activeTab === 'decorations' && (
                  <div>
                    <div className="mb-5"><h2 className="text-xl font-black text-[#2d232e]">Profila dekorācijas</h2><p className="mt-1 text-sm text-[#7a727c]">Izvēlies papildu vizuālo elementu stilu.</p></div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {[['minimal','Minimālas','·'],['elegant','Elegantās','❋'],['nature','Dabas','🌿'],['floral','Ziedu','🌸'],['stars','Zvaigžņu','✦'],['geometric','Ģeometriskas','◆']].map(([key,label,icon]) => (
                        <button key={key} type="button" onClick={() => setProfileDesign((current) => ({ ...current, decorations: key }))} className={`rounded-2xl border p-4 text-center transition hover:-translate-y-1 ${profileDesign.decorations === key ? 'border-[#534b52] bg-[#f1f0ea] ring-2 ring-[#534b52]/10' : 'border-[#e8e3dc] bg-[#fdfcf9]'}`}><span className="block text-2xl">{icon}</span><span className="mt-2 block text-xs font-black text-[#534b52]">{label}</span></button>
                      ))}
                    </div>
                    <div className="mt-5">
                      <h3 className="mb-3 text-sm font-black text-[#534b52]">Profila attēla rāmis</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {[['classic','Klasisks'],['soft','Mīksts'],['ornate','Dekoratīvs']].map(([key,label]) => (
                          <button key={key} type="button" onClick={() => setProfileDesign((current) => ({ ...current, frame: key }))} className={`rounded-2xl border p-3 text-center ${profileDesign.frame === key ? 'border-[#534b52] bg-[#f1f0ea]' : 'border-[#e8e3dc]'}`}><span className={`mx-auto block h-14 w-14 rounded-full ${key === 'ornate' ? 'border-[5px] border-double border-[#c59f67]' : key === 'soft' ? 'border-4 border-white ring-4 ring-[#dcd5cb]' : 'border-4 border-[#534b52]'}`} /><span className="mt-2 block text-[11px] font-bold text-[#534b52]">{label}</span></button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </form>
        {dirty && (
          <div className="sticky bottom-3 z-[1100] mx-auto mt-4 flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-white/80 bg-[#fffaf7]/95 px-3 py-2.5 shadow-[0_14px_45px_rgba(45,35,46,.18)] backdrop-blur-xl">
            <span className="flex items-center gap-2 text-xs font-bold text-[#7a5a2e]"><span className="h-2 w-2 rounded-full bg-[#d39a45]" />Ir nesaglabātas izmaiņas</span>
            <div className="flex gap-2">
              <button type="button" onClick={discardChanges} className="btn-ghost px-3 py-2 text-xs">Atcelt</button>
              <button form="profile-editor" type="submit" disabled={saving} className="btn-primary px-4 py-2 text-xs">{saving ? 'Saglabā...' : 'Saglabāt'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
