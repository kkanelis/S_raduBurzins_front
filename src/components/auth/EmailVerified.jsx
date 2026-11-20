import { Link } from 'react-router-dom';

function EmailVerified() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10 sm:px-6">
      <section className="card w-full max-w-lg text-center">
        <span aria-hidden="true" className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl font-black text-emerald-800">
          ✓
        </span>
        <h1 className="mt-5 text-3xl font-black text-dark-purple">E-pasts apstiprināts!</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Tava e-pasta adrese ir apstiprināta. Vari pieslēgties, tiklīdz administrators būs apstiprinājis kontu.
        </p>
        <Link to="/login" className="btn-primary mt-6 inline-flex px-6 py-3">
          Uz pieslēgšanos
        </Link>
      </section>
    </main>
  );
}

export default EmailVerified;
