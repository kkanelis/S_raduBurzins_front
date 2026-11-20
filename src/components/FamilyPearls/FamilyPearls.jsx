import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import BasePopup from "../BasePopoup";
import PrivateImage from "../PrivateImage";
import PrivateVideo from "../PrivateVideo";

const emptyForm = {
  title: "",
  text: "",
  context: "",
  category_id: "",
  is_anonymous: false,
};

function FamilyPearls() {
  const [pearls, setPearls] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [media, setMedia] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const mediaPreviews = useMemo(
    () => media.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [media],
  );

  useEffect(() => () => {
    mediaPreviews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [mediaPreviews]);

  const loadOptions = async () => {
    try {
      const response = await api.get("/api/family-pearls/options");
      setCategories(Array.isArray(response.data?.categories) ? response.data.categories : []);
    } catch {
      setError("Neizdevās ielādēt pērļu kategorijas.");
    }
  };

  const loadPearls = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/family-pearls", {
        params: { page, search: search || undefined, category_id: categoryId || undefined },
      });
      setPearls(Array.isArray(response.data?.data) ? response.data.data : []);
      setPagination({
        current_page: response.data?.current_page || page,
        last_page: response.data?.last_page || 1,
        total: response.data?.total || 0,
      });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Neizdevās ielādēt Radu pērles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => loadPearls(1), 200);
    return () => window.clearTimeout(timeout);
  }, [search, categoryId]);

  const changeForm = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "" && value !== false) payload.append(key, value);
    });
    if (form.is_anonymous) payload.append("is_anonymous", "1");
    media.forEach((file) => payload.append("media[]", file));

    try {
      await api.post("/api/family-pearls", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm(emptyForm);
      setMedia([]);
      setShowCreate(false);
      setMessage("Pērle veiksmīgi publicēta.");
      await loadPearls(1);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Neizdevās iesniegt pērli.");
    } finally {
      setSaving(false);
    }
  };

  const handleReaction = async (pearlId, emoji) => {
    try {
      const response = await api.post(`/api/family-pearls/${pearlId}/react`, { emoji });
      setPearls((previous) => previous.map((pearl) => (
        String(pearl.id) === String(pearlId)
          ? { ...pearl, reactions: response.data.reactions }
          : pearl
      )));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Neizdevās saglabāt reakciju.");
    }
  };

  const removeReaction = async (pearlId) => {
    try {
      const response = await api.delete(`/api/family-pearls/${pearlId}/react`);
      setPearls((previous) => previous.map((pearl) => (
        String(pearl.id) === String(pearlId)
          ? { ...pearl, reactions: response.data.reactions }
          : pearl
      )));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Neizdevās noņemt reakciju.");
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-50 pointer-events-none" />
      <div className="section-shell relative py-5 sm:py-8 lg:py-10">
        <div className="space-y-5">
          <section className="card surface-strong p-4 sm:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="eyebrow"><span>💎</span><span>Ģimenes humora arhīvs</span></div>
                <h1 className="mt-3 text-3xl font-black text-dark-purple sm:text-4xl">Radu pērles</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
                  Citāti, notikumi un atmiņas, kas padara mūsu ģimenes stāstus vēl dzīvespriecīgākus.
                </p>
              </div>
              <button type="button" className="btn-primary" onClick={() => setShowCreate(true)}>
                <span aria-hidden="true">＋</span> Pievienot pērli
              </button>
            </div>
          </section>

          {message && <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div>}
          {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

          <section className="card p-3 sm:p-4">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
              <label className="relative">
                <span className="sr-only">Meklēt pērles</span>
                <input value={search} onChange={(event) => setSearch(event.target.value)} className="input-field pl-11" placeholder="Meklēt pēc nosaukuma vai citāta..." />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">⌕</span>
              </label>
              <label>
                <span className="sr-only">Kategorija</span>
                <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="input-field">
                  <option value="">Visas kategorijas</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
            </div>
          </section>

          {loading ? (
            <div className="card text-center text-sm text-muted">Ielādē Radu pērles...</div>
          ) : pearls.length === 0 ? (
            <div className="card py-10 text-center">
              <div className="text-4xl">💎</div>
              <h2 className="mt-3 text-lg font-black">Vēl nav pērļu</h2>
              <p className="mt-1 text-sm text-muted">Esi pirmais, kas dalās ar ģimenes atmiņu.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pearls.map((pearl) => (
                <article key={pearl.id} className="card group flex min-h-64 flex-col overflow-hidden p-0 transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(45,23,38,0.16)]">
                  <div className="h-2 bg-gradient-to-r from-[#7c6b8f] via-[#d4b4a3] to-[#9aaf91]" />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-[#eee7f5] px-3 py-1 text-xs font-bold text-medium-purple">{pearl.category?.name || "Pērle"}</span>
                    </div>
                    <h2 className="mt-4 text-xl font-black">{pearl.title}</h2>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#5f5666]">{pearl.text}</p>
                    {pearl.context && (
                      <div className="mt-4 rounded-2xl border border-white/80 bg-white/70 p-4">
                        <h3 className="text-sm font-black">Konteksts</h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#5f5666]">{pearl.context}</p>
                      </div>
                    )}
                    {pearl.media?.length > 0 && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {pearl.media.map((item) => item.type === "video"
                          ? <PrivateVideo key={item.id} src={item.url} className="max-h-72 w-full rounded-2xl" />
                          : <PrivateImage key={item.id} src={item.url} alt={pearl.title} className="max-h-72 w-full rounded-2xl object-cover" />)}
                      </div>
                    )}
                    <div className="mt-auto pt-5 text-xs font-bold text-muted">
                      {pearl.author?.name ? `Iesniedza: ${pearl.author.name}` : "Anonīma pērle"}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-white/80 pt-4">
                      {[
                        ["😂", "Smieklīgi"],
                        ["❤️", "Patīk"],
                        ["🤯", "Neticami"],
                        ["🏆", "Leģendāri"],
                      ].map(([emoji, label]) => {
                        const active = pearl.reactions?.active === emoji;
                        const count = pearl.reactions?.counts?.[emoji] || 0;
                        return (
                          <button
                            key={emoji}
                            type="button"
                            title={label}
                            aria-label={`${label}: ${count}`}
                            aria-pressed={active}
                            onClick={() => active ? removeReaction(pearl.id) : handleReaction(pearl.id, emoji)}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-black transition ${active ? "border-medium-purple bg-medium-purple text-white shadow-md" : "border-white/80 bg-white/75 text-dark-purple hover:-translate-y-0.5 hover:bg-white"}`}
                          >
                            <span>{emoji}</span>
                            <span>{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {pagination.last_page > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button type="button" disabled={pagination.current_page <= 1} className="btn-ghost" onClick={() => loadPearls(pagination.current_page - 1)}>Iepriekšējā</button>
              <span className="text-sm font-bold text-muted">{pagination.current_page} / {pagination.last_page}</span>
              <button type="button" disabled={pagination.current_page >= pagination.last_page} className="btn-ghost" onClick={() => loadPearls(pagination.current_page + 1)}>Nākamā</button>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <BasePopup title="Pievienot jaunu pērli" onClose={() => setShowCreate(false)} width="820px">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2"><span className="font-semibold">Pērles nosaukums</span><input name="title" value={form.title} onChange={changeForm} className="input-field" maxLength="160" required /></label>
              <label className="grid gap-2"><span className="font-semibold">Kategorija</span><select name="category_id" value={form.category_id} onChange={changeForm} className="input-field" required><option value="">Izvēlies kategoriju</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            </div>
            <label className="grid gap-2"><span className="font-semibold">Citāts vai notikuma apraksts</span><textarea name="text" value={form.text} onChange={changeForm} className="text-area-field" maxLength="5000" required /></label>
            <label className="grid gap-2"><span className="font-semibold">Papildu paskaidrojums vai konteksts</span><textarea name="context" value={form.context} onChange={changeForm} className="text-area-field" maxLength="3000" /></label>
            <label className="grid gap-2"><span className="font-semibold">Fotoattēli vai video</span><input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" multiple onChange={(event) => setMedia(Array.from(event.target.files || []).slice(0, 8))} className="input-field" /><span className="text-xs text-muted">Līdz 8 failiem; attēli līdz 50 MB, video MP4 vai WebM.</span></label>
            {mediaPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {mediaPreviews.map(({ file, url }) => (
                  file.type.startsWith("video/") ? <video key={url} src={url} controls className="h-28 w-full rounded-xl object-cover" /> : <img key={url} src={url} alt="" className="h-28 w-full rounded-xl object-cover" />
                ))}
              </div>
            )}
            <label className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/70 p-4">
              <input type="checkbox" name="is_anonymous" checked={form.is_anonymous} onChange={changeForm} className="h-5 w-5" />
              <span><span className="block font-bold">Iesniegt anonīmi</span><span className="text-xs text-muted">Autora vārds netiks parādīts publiskajā skatā.</span></span>
            </label>
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <div className="flex justify-end gap-3"><button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Atcelt</button><button type="submit" disabled={saving} className="btn-primary">{saving ? "Iesniedz..." : "Iesniegt pērli"}</button></div>
          </form>
        </BasePopup>
      )}

    </div>
  );
}

export default FamilyPearls;
