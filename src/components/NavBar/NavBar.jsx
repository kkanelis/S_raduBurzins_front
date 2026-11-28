import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/useAuth';
import ProfileAvatar from '../auth/ProfileAvatar';

const iconPaths = {
  home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M9.5 20v-6h5v6"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  albums: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></>,
  pearls: <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></>,
  events: <><path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="m9 16 2 2 4-5"/></>,
  guide: <><circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/></>,
  profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.8 1.8-.06-.06A1.7 1.7 0 0 0 16 18.34a1.7 1.7 0 0 0-1 .66H15v3h-2.5v-3a1.7 1.7 0 0 0-1-.66 1.7 1.7 0 0 0-1.88.34l-.06.06-1.8-1.8.06-.06A1.7 1.7 0 0 0 8.16 15a1.7 1.7 0 0 0-.66-1H4v-2h3.5a1.7 1.7 0 0 0 .66-1A1.7 1.7 0 0 0 7.82 9.1l-.06-.06 1.8-1.8.06.06A1.7 1.7 0 0 0 11.5 7a1.7 1.7 0 0 0 1-.66V3h2.5v3.34a1.7 1.7 0 0 0 1 .66 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.8 1.8-.06.06A1.7 1.7 0 0 0 19.34 11a1.7 1.7 0 0 0 .66 1H22v2h-1.94a1.7 1.7 0 0 0-.66 1Z"/></>,
  admin: <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/></>,
  menu: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
};

function Icon({ name, size = 20, className = '' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {iconPaths[name]}
    </svg>
  );
}

function NavItem({ to, icon, label, badge, collapsed = false }) {
  return (
    <NavLink
      to={to}
      aria-label={collapsed ? label : undefined}
      className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''} ${collapsed ? 'nav-link-collapsed' : ''}`}
    >
      <span className="nav-link-icon"><Icon name={icon} /><span className="nav-badge-slot">{badge ? <span className="nav-dot" /> : null}</span></span>
      {!collapsed && <span className="nav-link-label">{label}</span>}
      {collapsed && <span className="nav-tooltip" role="tooltip">{label}</span>}
    </NavLink>
  );
}

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('rb-nav-collapsed') === 'true'; } catch { return false; }
  });
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetOffset, setSheetOffset] = useState(0);
  const sheetDragStart = useRef(0);
  const [calendarBadge, setCalendarBadge] = useState(false);
  const [eventBadge, setEventBadge] = useState(false);
  const sheetRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle('nav-collapsed', collapsed);
    try { localStorage.setItem('rb-nav-collapsed', String(collapsed)); } catch (storageError) {
      console.warn('Neizdevās saglabāt navigācijas stāvokli.', storageError);
    }
  }, [collapsed]);

  useEffect(() => () => document.body.classList.remove('nav-collapsed'), []);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/api/users/status').catch(() => ({ data: { users: [] } })),
      api.get('/api/user/special-days').catch(() => ({ data: [] })),
    ]).then(([usersResponse, eventsResponse]) => {
      if (!active) return;
      const now = new Date();
      const monthDay = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const users = usersResponse.data?.users || usersResponse.data || [];
      setCalendarBadge(users.some((item) => item.date_of_birth?.slice(5, 10) === monthDay));
      const events = Array.isArray(eventsResponse.data) ? eventsResponse.data : eventsResponse.data?.events || [];
      setEventBadge(events.length > 0);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!moreOpen) return undefined;
    const previous = document.activeElement;
    const sheet = sheetRef.current;
    sheet?.querySelector('button, a')?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMoreOpen(false);
      if (event.key !== 'Tab' || !sheet) return;
      const focusable = [...sheet.querySelectorAll('button, a')].filter((element) => !element.disabled);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus();
    };
  }, [moreOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    setMoreOpen(false);
    await logout();
    navigate('/login');
  };

  const startSheetDrag = (event) => {
    sheetDragStart.current = event.clientY;
  };

  const moveSheetDrag = (event) => {
    if (!sheetDragStart.current) return;
    setSheetOffset(Math.max(0, event.clientY - sheetDragStart.current));
  };

  const endSheetDrag = () => {
    if (sheetOffset > 80) setMoreOpen(false);
    setSheetOffset(0);
    sheetDragStart.current = 0;
  };

  const groups = [
    { label: 'Pamatā', links: [{ to: '/RegWelcome', label: 'Sākums', icon: 'home' }, { to: '/calendar', label: 'Kalendārs', icon: 'calendar', badge: calendarBadge }, { to: '/users', label: 'Lietotāji', icon: 'users' }] },
    { label: 'Ģimenes saturs', links: [{ to: '/albums', label: 'Albumi', icon: 'albums' }, { to: '/family-pearls', label: 'Radu pērles', icon: 'pearls' }] },
    { label: 'Pārvaldība', links: [{ to: '/my-events', label: 'Mani notikumi', icon: 'events', badge: eventBadge }, { to: '/tutorial', label: 'Ceļvedis', icon: 'guide' }] },
  ];

  const bottomMoreLinks = [
    { to: '/family-pearls', label: 'Radu pērles', icon: 'pearls' },
    { to: '/my-events', label: 'Mani notikumi', icon: 'events', badge: eventBadge },
    { to: '/tutorial', label: 'Ceļvedis', icon: 'guide' },
    { to: '/profile', label: 'Mans profils', icon: 'profile' },
    { to: '/settings', label: 'Iestatījumi', icon: 'settings' },
  ];

  return (
    <>
      <aside className={`desktop-sidebar ${collapsed ? 'desktop-sidebar-collapsed' : ''}`}>
        <div className="sidebar-brand">
          <Link to="/RegWelcome" className="sidebar-logo" aria-label="Radu Burziņš sākums">
            <img className="sidebar-rb" src="/icons/rb-icon-180.png" alt="" />
            {!collapsed && <span className="sidebar-name">Radu Burziņš</span>}
          </Link>
          <button type="button" className="collapse-button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Izvērst navigāciju' : 'Sabrukt navigāciju'} aria-expanded={!collapsed}>
            <Icon name="chevron" className={collapsed ? '' : 'rotate-180'} />
          </button>
        </div>

        <nav className="desktop-nav" aria-label="Galvenā navigācija">
          {groups.map((group) => (
            <div className="nav-group" key={group.label}>
              {!collapsed && <div className="nav-group-label">{group.label}</div>}
              {group.links.map((link) => <NavItem key={link.to} {...link} collapsed={collapsed} />)}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer" ref={menuRef}>
          <NavLink to="/profile" className={({ isActive }) => `profile-block ${isActive ? 'profile-block-active' : ''}`} aria-label="Skatīt manu profilu">
            <ProfileAvatar user={user} className="profile-block-avatar" />
            {!collapsed && (
              <span className="profile-block-copy">
                <span className="profile-block-name">{user.first_name} {user.last_name}</span>
                <span className="profile-block-link">Skatīt profilu</span>
              </span>
            )}
          </NavLink>
          {!collapsed && (
            <button type="button" className="menu-trigger" onClick={() => setMenuOpen((value) => !value)} aria-label="Profila izvēlne" aria-expanded={menuOpen}>
              <Icon name="menu" />
            </button>
          )}
          {collapsed && (
            <button type="button" className="collapsed-profile-menu" onClick={() => setMenuOpen((value) => !value)} aria-label="Profila izvēlne">
              <Icon name="menu" />
            </button>
          )}
          {menuOpen && (
            <div className="profile-menu" role="menu">
              <Link role="menuitem" to="/profile" onClick={() => setMenuOpen(false)}><Icon name="profile" />Mans profils</Link>
              <button role="menuitem" type="button" onClick={() => { setMenuOpen(false); navigate('/settings'); }}><Icon name="settings" />Iestatījumi</button>
              {user.is_admin && <a role="menuitem" href="https://api.raduburzins.lv/admin" target="_blank" rel="noopener noreferrer"><Icon name="admin" />Admin panelis</a>}
              <button role="menuitem" type="button" onClick={handleLogout} className="profile-menu-danger"><Icon name="logout" />Izrakstīties</button>
            </div>
          )}
        </div>
      </aside>

      <header className="mobile-header">
        <Link to="/RegWelcome" className="mobile-logo" aria-label="Radu Burziņš sākums"><img src="/icons/rb-icon-180.png" alt="" /><strong>Radu Burziņš</strong></Link>
        <NavLink to="/profile" aria-label="Atvērt manu profilu"><ProfileAvatar user={user} className="mobile-avatar" /></NavLink>
      </header>

      <nav className="mobile-bottom-nav" aria-label="Mobilā galvenā navigācija">
        <NavLink to="/RegWelcome" className={({ isActive }) => isActive ? 'mobile-nav-item mobile-nav-active' : 'mobile-nav-item'}><Icon name="home" /><span>Sākums</span></NavLink>
        <NavLink to="/calendar" className={({ isActive }) => isActive ? 'mobile-nav-item mobile-nav-active' : 'mobile-nav-item'}><span className="mobile-icon-wrap"><Icon name="calendar" />{calendarBadge && <span className="mobile-nav-dot" />}</span><span>Kalendārs</span></NavLink>
        <NavLink to="/users" className={({ isActive }) => isActive ? 'mobile-nav-item mobile-nav-active' : 'mobile-nav-item'}><Icon name="users" /><span>Lietotāji</span></NavLink>
        <NavLink to="/albums" className={({ isActive }) => isActive ? 'mobile-nav-item mobile-nav-active' : 'mobile-nav-item'}><Icon name="albums" /><span>Albumi</span></NavLink>
        <button type="button" className="mobile-nav-item" onClick={() => setMoreOpen(true)} aria-haspopup="dialog" aria-expanded={moreOpen}><Icon name="menu" /><span>Vairāk</span></button>
      </nav>

      {moreOpen && (
        <div className="mobile-sheet-backdrop" role="presentation" onPointerDown={(event) => event.target === event.currentTarget && setMoreOpen(false)}>
          <section
            ref={sheetRef}
            className="mobile-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Citas navigācijas sadaļas"
            style={{ transform: `translateY(${sheetOffset}px)` }}
          >
            <div
              className="sheet-drag"
              onPointerDown={startSheetDrag}
              onPointerMove={moveSheetDrag}
              onPointerUp={endSheetDrag}
              onPointerCancel={endSheetDrag}
            >
              <button type="button" aria-label="Aizvērt izvēlni" onClick={() => setMoreOpen(false)}><span /></button>
            </div>
            <div className="mobile-sheet-links">
              {bottomMoreLinks.map((link) => <NavLink key={link.to} to={link.to} onClick={() => setMoreOpen(false)}><span><Icon name={link.icon} />{link.label}</span>{link.badge && <span className="nav-dot" />}</NavLink>)}
              {user.is_admin && <a href="https://api.raduburzins.lv/admin" target="_blank" rel="noopener noreferrer"><span><Icon name="admin" />Admin panelis</span></a>}
              <button type="button" onClick={handleLogout} className="mobile-sheet-danger"><span><Icon name="logout" />Izrakstīties</span></button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default NavBar;
