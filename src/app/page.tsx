const metrics = [
  { label: "clientes ativos", value: "1.8k" },
  { label: "apólices em vigência", value: "94%" },
  { label: "renovações no prazo", value: "87%" },
];

const featureCards = [
  {
    icon: "👥",
    title: "Base de clientes organizada",
    description:
      "Acompanhe dados pessoais, contatos, aniversários e histórico de relacionamento em um único lugar.",
  },
  {
    icon: "🛡️",
    title: "Controle de apólices e vigência",
    description:
      "Monitore prazos, sinistros, coberturas e renovações com alertas visíveis para a operação.",
  },
  {
    icon: "🔐",
    title: "Documentos privados e seguros",
    description:
      "Arquive PDFs de apólices e contratos com acesso restrito, sem expor informações sensíveis publicamente.",
  },
];

const workflow = [
  "Cadastrar cliente e dados de contato",
  "Vincular apólices, vigência e observações",
  "Receber alertas de aniversário e renovação",
  "Acessar documentos privados com segurança",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f4f7ff_0%,_#edf2ff_22%,_#f8fafc_48%,_#ffffff_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <header className="flex items-center justify-between rounded-full border border-slate-200/80 bg-white/80 px-5 py-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-600 text-lg font-bold text-white shadow-md shadow-sky-200">
              A
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">Ampara</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                CRM & seguros
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#funcionalidades" className="transition hover:text-slate-900">
              Funcionalidades
            </a>
            <a href="#fluxo" className="transition hover:text-slate-900">
              Fluxo
            </a>
            <a href="#seguranca" className="transition hover:text-slate-900">
              Segurança
            </a>
          </nav>

          <a
            href="#contato"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Agendar demo
          </a>
        </header>

        <section className="grid items-center gap-12 pb-16 pt-16 lg:grid-cols-[1.2fr_0.8fr] lg:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
              Operação e relacionamento
            </span>

            <h1 className="mt-6 max-w-xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Acompanhe clientes, apólices e renovações com clareza.
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              O Ampara centraliza o cadastro de segurados, vigência, pagamentos e documentos
              em uma plataforma segura para times de operação, atendimento e gestão.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="#funcionalidades"
                className="rounded-full bg-sky-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-500"
              >
                Ver funcionalidades
              </a>
              <a
                href="#seguranca"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                Segurança e compliance
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <div className="text-2xl font-black text-slate-900">{metric.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-8 h-40 w-40 rounded-full bg-sky-200/70 blur-3xl" />
            <div className="absolute -right-4 bottom-10 h-44 w-44 rounded-full bg-indigo-200/70 blur-3xl" />

            <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 p-4 shadow-[0_30px_90px_rgba(15,23,42,0.22)]">
              <div className="rounded-[24px] bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 p-5 text-white">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-sky-200">Painel geral</p>
                    <h2 className="mt-2 text-2xl font-bold">Carteira ativa</h2>
                  </div>
                  <div className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300">
                    Online
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Próxima renovação</p>
                        <p className="mt-2 text-xl font-semibold">Marina Souza</p>
                      </div>
                      <div className="rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
                        12 dias
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Aniversários</p>
                      <p className="mt-2 text-2xl font-black">08</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Documentos</p>
                      <p className="mt-2 text-2xl font-black">146</p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-sky-500/10 p-4">
                    <div className="flex items-center justify-between text-sm text-sky-100">
                      <span>Vigência em dia</span>
                      <span className="font-semibold">94%</span>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-700">
                      <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-sky-400 to-cyan-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="funcionalidades" className="pb-20 pt-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Funcionalidades</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Tudo o que a operação de seguros precisa acompanhar.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {featureCards.map((feature) => (
              <article key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-3xl">
                  {feature.icon}
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-base leading-7 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="fluxo" className="grid gap-8 rounded-[32px] border border-slate-200 bg-slate-900 px-6 py-10 text-white shadow-xl lg:grid-cols-[1fr_1.1fr] lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Fluxo operacional</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Simples para a equipe, útil para a gestão.
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-300">
              Cada cliente é registrado com histórico, contatos, apólices e prazos. Isso reduz
              retrabalho e ajuda a antecipar renovações e pendências.
            </p>
          </div>

          <div className="space-y-4">
            {workflow.map((step, index) => (
              <div key={step} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500 font-bold text-white">
                  {index + 1}
                </div>
                <p className="pt-1 text-base text-slate-100">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="seguranca" className="grid gap-8 py-20 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Segurança</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">Proteção que combina privacidade e conformidade.</h2>
            <ul className="mt-6 space-y-4 text-base leading-7 text-slate-600">
              <li>• Acesso por usuário e vínculo de carteira para evitar cruzamento indevido.</li>
              <li>• PDFs privados com controle de visualização e armazenamento seguro.</li>
              <li>• Estrutura preparada para operar com dados sensíveis e regras de retenção.</li>
            </ul>
          </div>

          <div className="rounded-[28px] bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-8 shadow-inner ring-1 ring-sky-100">
            <div className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Status da proteção</span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Conformidade
                </span>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <div className="mb-2 flex justify-between text-sm text-slate-600">
                    <span>Privacidade</span>
                    <span className="font-semibold">100%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-200">
                    <div className="h-full w-full rounded-full bg-emerald-500" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm text-slate-600">
                    <span>Controle de acesso</span>
                    <span className="font-semibold">96%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-200">
                    <div className="h-full w-[96%] rounded-full bg-sky-500" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm text-slate-600">
                    <span>Documentos privados</span>
                    <span className="font-semibold">98%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-200">
                    <div className="h-full w-[98%] rounded-full bg-indigo-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer id="contato" className="flex flex-col items-center justify-between gap-6 border-t border-slate-200 py-8 text-center text-sm text-slate-600 sm:flex-row sm:text-left">
          <div>
            <div className="text-base font-bold text-slate-900">Ampara</div>
            <p className="mt-1">CRM para clientes, apólices e renovações.</p>
          </div>
          <a href="mailto:contato@ampara.example" className="font-medium text-sky-700 hover:text-sky-800">
            contato@ampara.example
          </a>
        </footer>
      </div>
    </main>
  );
}
