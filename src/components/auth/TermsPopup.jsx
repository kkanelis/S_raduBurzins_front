import BasePopup from '../BasePopoup';
import { privacySections, policyUpdatedAt } from '../Info/Terms/policyContent';

function TermsPopup({ onClose }) {
  return (
    <BasePopup title="Privātuma politika" onClose={onClose} width="780px">
      <div className="space-y-5">
        <div className="rounded-[1.5rem] bg-gradient-to-br from-dark-purple via-medium-purple to-[#8a6cff] p-5 text-off-white shadow-xl">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-off-white/75">
            Personas datu apstrāde
          </div>
          <h2 className="mt-2 text-2xl font-black">Kā rūpējamies par taviem datiem</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-off-white/90">
            Atjaunināts {policyUpdatedAt}. Šī politika apraksta vietnē apstrādātos datus un tavas tiesības.
          </p>
        </div>

        <div className="grid gap-3">
          {privacySections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-soft"
            >
              <h3 className="text-base font-black text-dark-purple">{section.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{section.text}</p>
            </section>
          ))}
        </div>

        <p className="text-xs leading-5 text-muted">
          Šis teksts ir vietnes informācija par datu apstrādi, nevis juridisks atzinums par pilnīgu atbilstību VDAR.
        </p>
      </div>
    </BasePopup>
  );
}

export default TermsPopup;
