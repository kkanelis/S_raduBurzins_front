import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import avatar from '../../assets/rb-avatar.svg';
import TermsPopup from './TermsPopup';
import RulesPopup from './RulesPopup';

function Register() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        nickname: '',
        date_of_birth: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
        rules: false,
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const [resendError, setResendError] = useState('');
    const { register, resendVerificationEmail } = useAuth();
    const [dob, setDob] = useState({ day: '', month: '', year: '' });

    const handleDobChange = (event) => {
        const { name, value } = event.target;
        const newDob = { ...dob, [name]: value };
        setDob(newDob);

        const selectedDate = newDob.day && newDob.month && newDob.year
            ? new Date(Number(newDob.year), Number(newDob.month) - 1, Number(newDob.day))
            : null;
        const isValidDate = selectedDate
            && selectedDate.getFullYear() === Number(newDob.year)
            && selectedDate.getMonth() === Number(newDob.month) - 1
            && selectedDate.getDate() === Number(newDob.day);

        setFormData((current) => ({
            ...current,
            date_of_birth: isValidDate
                ? `${newDob.year}-${String(newDob.month).padStart(2, '0')}-${String(newDob.day).padStart(2, '0')}`
                : '',
        }));
    };

    const days = Array.from({ length: 31 }, (_, index) => index + 1);
    const months = [
        'Janvāris', 'Februāris', 'Marts', 'Aprīlis', 'Maijs', 'Jūnijs',
        'Jūlijs', 'Augusts', 'Septembris', 'Oktobris', 'Novembris', 'Decembris',
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, index) => currentYear - index);

    const handleChange = (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setFormData((current) => ({
            ...current,
            [event.target.name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        setIsSubmitting(true);

        try {
            const response = await register(formData);
            setSuccessMessage(response.data?.message || 'Reģistrācija veiksmīga! Tavs konts nosūtīts apstiprināšanai.');
        } catch (err) {
            const validationError = Object.values(err.response?.data?.errors || {}).flat()[0];
            setError(validationError || err.response?.data?.message || 'Reģistrācijas kļūda. Lūdzu, mēģiniet vēlreiz.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendVerification = async () => {
        setIsResending(true);
        setResendMessage('');
        setResendError('');

        try {
            const response = await resendVerificationEmail(formData.email);
            setResendMessage(response.data.message);
        } catch {
            setResendError('Neizdevās nosūtīt e-pastu. Mēģini vēlreiz vēlāk.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <main className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
            <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-[#8a6cff]/10 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-[#e6dccf]/70 blur-3xl" />

            <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 text-left shadow-[0_28px_90px_rgba(45,23,38,0.16)] backdrop-blur-xl lg:grid-cols-[0.8fr_1.2fr]">
                <section
                    className="relative hidden min-h-full flex-col justify-between overflow-hidden p-10 text-white lg:flex xl:p-14"
                    style={{ background: 'linear-gradient(135deg, #241726 0%, #4f3f63 55%, #8069a0 100%)', color: '#ffffff' }}
                >
                    <div aria-hidden="true" className="absolute -right-24 -top-20 h-80 w-80 rounded-full border border-white/10" />
                    <div aria-hidden="true" className="absolute -right-10 -top-6 h-52 w-52 rounded-full border border-white/10" />
                    <div aria-hidden="true" className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-white/5 blur-2xl" />

                    <div className="relative">
                        <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white/90">
                            <span aria-hidden="true">✦</span>
                            Radu Burziņš
                        </div>
                        <h1 className="mt-12 max-w-sm text-4xl font-black leading-tight tracking-tight text-white xl:text-5xl" style={{ color: '#ffffff' }}>
                            Ģimenes stāsti sākas šeit.
                        </h1>
                    </div>
                </section>

                <section className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 xl:px-14">
                    <div className="mx-auto w-full max-w-2xl">
                        <div className="mb-6 lg:hidden">
                            <img src={avatar} alt="" className="h-14 w-14 rounded-2xl shadow-md" />
                        </div>

                        <div className="mb-6">
                            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-medium-purple">Pievienojies ģimenei</p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight text-dark-purple sm:text-4xl">Izveidot kontu</h2>
                            <p className="mt-3 text-sm leading-6 text-muted">
                                Aizpildi informāciju, lai izveidotu savu kontu.
                            </p>
                        </div>

                        {error && (
                            <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800">
                                <span aria-hidden="true">!</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {successMessage ? (
                            <div role="status" className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
                                <div className="flex items-start gap-3">
                                    <span aria-hidden="true" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-black">✓</span>
                                    <div>
                                        <p>{successMessage}</p>
                                        <p className="mt-2">Pārbaudi <strong>{formData.email}</strong> un apstiprini e-pasta adresi, lai varētu pieslēgties. Pārbaudi arī mēstuļu mapi.</p>
                                    </div>
                                </div>
                                {resendMessage && <p className="text-sm">{resendMessage}</p>}
                                {resendError && <p role="alert" className="text-sm text-red-700">{resendError}</p>}
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={handleResendVerification}
                                        disabled={isResending}
                                        className="btn-ghost px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isResending ? 'Sūta...' : 'Nosūtīt apstiprinājuma e-pastu vēlreiz'}
                                    </button>
                                    <Link to="/login" className="btn-primary inline-flex px-5 py-2.5">
                                        Uz pieslēgšanos
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="register-first-name" className="mb-1.5 block text-sm font-bold text-dark-purple">Vārds *</label>
                                    <input
                                        id="register-first-name"
                                        type="text"
                                        name="first_name"
                                        autoComplete="given-name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Jānis"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="register-last-name" className="mb-1.5 block text-sm font-bold text-dark-purple">Uzvārds *</label>
                                    <input
                                        id="register-last-name"
                                        type="text"
                                        name="last_name"
                                        autoComplete="family-name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Bērzs"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="register-nickname" className="mb-1.5 block text-sm font-bold text-dark-purple">Iesauka</label>
                                    <input
                                        id="register-nickname"
                                        type="text"
                                        name="nickname"
                                        autoComplete="nickname"
                                        value={formData.nickname}
                                        onChange={handleChange}
                                        placeholder="JB2024"
                                        className="input-field"
                                    />
                                </div>

                                <fieldset className="min-w-0 border-0 p-0">
                                    <legend className="mb-1.5 text-sm font-bold text-dark-purple">Dzimšanas datums</legend>
                                    <div className="grid grid-cols-[0.75fr_1.5fr_1fr] gap-2">
                                        <select name="day" value={dob.day} onChange={handleDobChange} aria-label="Dzimšanas diena" className="input-field px-2">
                                            <option value="">Diena</option>
                                            {days.map((day) => <option key={day} value={day}>{day}</option>)}
                                        </select>
                                        <select name="month" value={dob.month} onChange={handleDobChange} aria-label="Dzimšanas mēnesis" className="input-field px-2">
                                            <option value="">Mēnesis</option>
                                            {months.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
                                        </select>
                                        <select name="year" value={dob.year} onChange={handleDobChange} aria-label="Dzimšanas gads" className="input-field px-2">
                                            <option value="">Gads</option>
                                            {years.map((year) => <option key={year} value={year}>{year}</option>)}
                                        </select>
                                    </div>
                                    <p className="mt-2 text-xs leading-5 text-muted">
                                        Dzimšanas datums nav obligāts; tas tiek izmantots kalendāra funkcijās.
                                    </p>
                                </fieldset>

                                <div className="sm:col-span-2">
                                    <label htmlFor="register-email" className="mb-1.5 block text-sm font-bold text-dark-purple">E-pasts *</label>
                                    <input
                                        id="register-email"
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        inputMode="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="tavs.epasts@example.com"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="register-password" className="mb-1.5 block text-sm font-bold text-dark-purple">Parole *</label>
                                    <input
                                        id="register-password"
                                        type="password"
                                        name="password"
                                        autoComplete="new-password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="••••••••"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="register-password-confirmation" className="mb-1.5 block text-sm font-bold text-dark-purple">Apstipriniet paroli *</label>
                                    <input
                                        id="register-password-confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        autoComplete="new-password"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        required
                                        placeholder="••••••••"
                                        className="input-field"
                                    />
                                </div>

                                <div className="space-y-3 pt-1 sm:col-span-2">
                                    <div className="flex items-start gap-3 text-sm leading-5 text-muted">
                                        <input
                                            type="checkbox"
                                            name="terms"
                                            checked={formData.terms}
                                            onChange={handleChange}
                                            required
                                            id="terms"
                                            className="mt-1 h-4 w-4 shrink-0 accent-[#4f3f63]"
                                        />
                                        <p>
                                            <label htmlFor="terms" className="cursor-pointer">Es piekrītu</label>{' '}
                                            <button type="button" className="font-bold text-medium-purple underline underline-offset-2" onClick={() => setShowTerms(true)}>
                                                lietošanas noteikumiem
                                            </button>
                                        </p>
                                    </div>

                                    <div className="flex items-start gap-3 text-sm leading-5 text-muted">
                                        <input
                                            type="checkbox"
                                            name="rules"
                                            checked={formData.rules}
                                            onChange={handleChange}
                                            required
                                            id="rules"
                                            className="mt-1 h-4 w-4 shrink-0 accent-[#4f3f63]"
                                        />
                                        <p>
                                            <label htmlFor="rules" className="cursor-pointer">Esmu iepazinies ar</label>{' '}
                                            <button type="button" className="font-bold text-medium-purple underline underline-offset-2" onClick={() => setShowPrivacyPolicy(true)}>
                                                privātuma politiku
                                            </button>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-primary mt-1 w-full py-3.5 text-base disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2"
                                >
                                    {isSubmitting ? 'Veido kontu...' : 'Izveidot kontu'}
                                    {!isSubmitting && <span aria-hidden="true">→</span>}
                                </button>
                            </form>
                        )}

                        {!successMessage && (
                            <p className="mt-6 text-center text-sm text-muted">
                                Jau ir konts?{' '}
                                <Link to="/login" className="font-extrabold text-medium-purple underline decoration-medium-purple/30 underline-offset-4 transition hover:decoration-medium-purple">
                                    Pieslēgties
                                </Link>
                            </p>
                        )}
                    </div>
                </section>
            </div>

            {showTerms && <RulesPopup onClose={() => setShowTerms(false)} />}
            {showPrivacyPolicy && <TermsPopup onClose={() => setShowPrivacyPolicy(false)} />}
        </main>
    );
}

export default Register;
