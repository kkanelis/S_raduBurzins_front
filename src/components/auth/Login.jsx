import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import avatar from '../../assets/rb-avatar.svg';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const { login, resendVerificationEmail } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setResendMessage('');
        setIsSubmitting(true);

        try {
            await login(email, password);
            navigate('/RegWelcome');
        } catch (err) {
            const fieldError = Object.values(err.response?.data?.errors || {}).flat()[0];
            setError(fieldError || err.response?.data?.message || 'Neizdevās pieslēgties. Pārbaudiet e-pastu un paroli.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendVerification = async () => {
        setIsResending(true);
        setResendMessage('');

        try {
            const response = await resendVerificationEmail(email);
            setResendMessage(response.data.message);
        } catch {
            setResendMessage('Neizdevās nosūtīt e-pastu. Mēģini vēlreiz vēlāk.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <main className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
            <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-[#8a6cff]/10 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-[#e6dccf]/70 blur-3xl" />

            <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 text-left shadow-[0_28px_90px_rgba(45,23,38,0.16)] backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">
                <section
                    className="relative hidden min-h-[570px] flex-col justify-between overflow-hidden p-10 text-white lg:flex xl:p-14"
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
                            Viss svarīgais ģimenei vienuviet.
                        </h1>
                    </div>
                </section>

                <section className="flex items-center px-5 py-9 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
                    <div className="mx-auto w-full max-w-md">
                        <div className="mb-8 lg:hidden">
                            <img src={avatar} alt="" className="h-14 w-14 rounded-2xl shadow-md" />
                        </div>

                        <div className="mb-8">
                            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-medium-purple">Laipni lūgti atpakaļ</p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight text-dark-purple sm:text-4xl">Pieslēgties</h2>
                            <p className="mt-3 text-sm leading-6 text-muted">
                                Ievadi sava konta datus, lai turpinātu.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {location.state?.message && (
                                <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-900">
                                    {location.state.message}
                                </p>
                            )}
                            {error && (
                                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800">
                                    <div className="flex gap-3">
                                        <span aria-hidden="true">!</span>
                                        <span>{error}</span>
                                    </div>
                                    {error.toLowerCase().includes('e-pasta adresi') && email && (
                                        <button
                                            type="button"
                                            onClick={handleResendVerification}
                                            disabled={isResending}
                                            className="mt-3 font-bold underline underline-offset-2 disabled:opacity-70"
                                        >
                                            {isResending ? 'Sūta...' : 'Nosūtīt apstiprinājuma e-pastu vēlreiz'}
                                        </button>
                                    )}
                                    {resendMessage && <p className="mt-2">{resendMessage}</p>}
                                </div>
                            )}

                            <div>
                                <label htmlFor="login-email" className="mb-2 block text-sm font-bold text-dark-purple">
                                    E-pasts
                                </label>
                                <input
                                    id="login-email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    inputMode="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                    placeholder="vards@example.com"
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label htmlFor="login-password" className="mb-2 block text-sm font-bold text-dark-purple">
                                    Parole
                                </label>
                                <div className="relative">
                                    <input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        required
                                        className="input-field pr-20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((visible) => !visible)}
                                        aria-label={showPassword ? 'Paslēpt paroli' : 'Rādīt paroli'}
                                        aria-pressed={showPassword}
                                        className="absolute inset-y-0 right-2 my-auto rounded-lg px-2 text-xs font-bold text-medium-purple transition hover:bg-[#4f3f63]/10"
                                    >
                                        {showPassword ? 'Paslēpt' : 'Rādīt'}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full py-3.5 text-base disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isSubmitting ? 'Pieslēdzas...' : 'Pieslēgties'}
                                {!isSubmitting && <span aria-hidden="true">→</span>}
                            </button>
                        </form>

                        <p className="mt-7 text-center text-sm text-muted">
                            Vēl nav konta?{' '}
                            <Link to="/register" className="font-extrabold text-medium-purple underline decoration-medium-purple/30 underline-offset-4 transition hover:decoration-medium-purple">
                                Reģistrēties
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Login;
