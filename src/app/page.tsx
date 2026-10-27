"use client";

import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CarFront,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  Gift,
  Heart,
  House,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import Image from "next/image";
import { Show, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthday: string | null;
  company: string;
};

type Policy = {
  id: string;
  clientId: string;
  number: string | null;
  insurer: string | null;
  type: string | null;
  vehiclePlate?: string | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  premium: number | null;
  startDate: string | null;
  endDate: string;
  notes: string;
  pdfName?: string | null;
};

type Section = "inicio" | "clientes" | "apolices" | "vigencias" | "agenda";
type ModalState = { kind: "client"; item?: Client } | { kind: "policy"; item?: Policy } | null;

const clientStorageKey = "ampara.clients.v1";
const policyStorageKey = "ampara.policies.v1";
const cloudAuthConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
const today = new Date();
const isoDate = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
};
const dateAfter = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return isoDate(date);
};
const yearForBirthday = (month: number, day: number) =>
  `${today.getFullYear() - 32}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const seedClients: Client[] = [
  { id: "c-1", name: "Helena Ferreira", email: "helena.ferreira@email.com", phone: "(11) 98841-2090", birthday: yearForBirthday(10, 3), company: "" },
  { id: "c-2", name: "Camila Andrade", email: "camila.andrade@email.com", phone: "(11) 99730-1184", birthday: yearForBirthday(10, 8), company: "" },
  { id: "c-3", name: "Augusto Nunes", email: "augusto.nunes@email.com", phone: "(21) 98106-3228", birthday: yearForBirthday(11, 14), company: "Nunes Arquitetura" },
  { id: "c-4", name: "Mariana Lopes", email: "mariana.lopes@email.com", phone: "(31) 99280-4106", birthday: yearForBirthday(12, 2), company: "" },
  { id: "c-5", name: "Roberto Alves", email: "roberto.alves@email.com", phone: "(41) 98821-4570", birthday: yearForBirthday(1, 19), company: "" },
  { id: "c-6", name: "Isabela Martins", email: "isabela.martins@email.com", phone: "(51) 99613-2845", birthday: yearForBirthday(2, 7), company: "Martins Consultoria" },
];

const seedPolicies: Policy[] = [
  { id: "p-1", clientId: "c-1", number: "AU-2948106", insurer: "Porto Seguro", type: "Automóvel", premium: 4280, startDate: dateAfter(-320), endDate: dateAfter(14), notes: "Renovação em negociação. Cliente pediu cotação com carro reserva." },
  { id: "p-2", clientId: "c-2", number: "RE-1085293", insurer: "Tokio Marine", type: "Residencial", premium: 1180, startDate: dateAfter(-280), endDate: dateAfter(5), notes: "Enviar proposta de renovação e revisar cobertura de danos elétricos." },
  { id: "p-3", clientId: "c-3", number: "EM-7754012", insurer: "Mapfre", type: "Empresarial", premium: 6940, startDate: dateAfter(-210), endDate: dateAfter(29), notes: "Aguardando inventário atualizado de equipamentos." },
  { id: "p-4", clientId: "c-4", number: "VI-3901845", insurer: "Bradesco Seguros", type: "Vida", premium: 2360, startDate: dateAfter(-170), endDate: dateAfter(61), notes: "Capital segurado atualizado após contato de setembro." },
  { id: "p-5", clientId: "c-5", number: "AU-8814077", insurer: "Azul Seguros", type: "Automóvel", premium: 3150, startDate: dateAfter(-120), endDate: dateAfter(94), notes: "" },
  { id: "p-6", clientId: "c-6", number: "RE-6302148", insurer: "Porto Seguro", type: "Residencial", premium: 940, startDate: dateAfter(-80), endDate: dateAfter(285), notes: "" },
  { id: "p-7", clientId: "c-1", number: "VI-4420971", insurer: "SulAmérica", type: "Vida", premium: 1870, startDate: dateAfter(-52), endDate: dateAfter(313), notes: "Cobertura adicional para doenças graves." },
];

const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "inicio", label: "Visão geral", icon: LayoutDashboard },
  { id: "clientes", label: "Clientes", icon: UsersRound },
  { id: "apolices", label: "Apólices", icon: FileText },
  { id: "vigencias", label: "Vigências", icon: Clock3 },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
];

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
const dateLabel = (date: string | null, options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" }) =>
  date ? new Intl.DateTimeFormat("pt-BR", options).format(new Date(`${date}T12:00:00`)) : "Não informado";
const normalizeSearchText = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const initials = (name: string) => name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
const nextBirthday = (date: string | null) => {
  if (!date) return null;
  const [, month, day] = date.split("-").map(Number);
  const next = new Date(today.getFullYear(), month - 1, day);
  if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) next.setFullYear(next.getFullYear() + 1);
  return next;
};
const daysUntil = (date: Date) => Math.ceil((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86_400_000);
const kindIcon = (type: string | null, size = 17) => {
  if (type === "Automóvel") return <CarFront size={size} />;
  if (type === "Residencial") return <House size={size} />;
  if (type === "Vida") return <Heart size={size} />;
  return <BriefcaseBusiness size={size} />;
};

function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  return <span className={`avatar${small ? " avatar-small" : ""}`}>{initials(name)}</span>;
}

function Status({ endDate }: { endDate: string }) {
  const days = daysUntil(new Date(`${endDate}T12:00:00`));
  if (days < 0) return <span className="status status-muted">Encerrada</span>;
  if (days <= 30) return <span className="status status-warning"><span />Vence em {days} dias</span>;
  return <span className="status status-active"><span />Ativa</span>;
}

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const greetingName = user?.firstName || user?.fullName?.trim().split(/\s+/)[0] || user?.username || "Ana";
  const [clients, setClients] = useState<Client[]>(cloudAuthConfigured ? [] : seedClients);
  const [policies, setPolicies] = useState<Policy[]>(cloudAuthConfigured ? [] : seedPolicies);
  const [section, setSection] = useState<Section>("inicio");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudError, setCloudError] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    if (!cloudAuthConfigured) {
      let savedClients: string | null = null;
      let savedPolicies: string | null = null;
      try {
        savedClients = localStorage.getItem(clientStorageKey);
        savedPolicies = localStorage.getItem(policyStorageKey);
      } catch {
        localStorage.removeItem(clientStorageKey);
        localStorage.removeItem(policyStorageKey);
      }
      queueMicrotask(() => {
        if (!active) return;
        if (savedClients) setClients(JSON.parse(savedClients) as Client[]);
        if (savedPolicies) setPolicies(JSON.parse(savedPolicies) as Policy[]);
        setReady(true);
      });
      return () => { active = false; };
    }
    if (!isLoaded) return;
    if (!isSignedIn) {
      queueMicrotask(() => {
        if (!active) return;
        setCloudReady(false);
        setCloudError(false);
        setClients([]);
        setPolicies([]);
        setReady(true);
      });
      return () => { active = false; };
    }
    queueMicrotask(() => { if (active) setReady(true); });
    fetch("/api/workspace", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          if (active) setCloudError(true);
          return;
        }
        const workspace = await response.json() as { clients: Client[]; policies: Policy[] };
        if (!active) return;
        setClients(workspace.clients);
        setPolicies(workspace.policies);
        setCloudReady(true);
      })
      .catch(() => { if (active) setCloudError(true); });
    return () => { active = false; };
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!ready || cloudReady || cloudAuthConfigured) return;
    localStorage.setItem(clientStorageKey, JSON.stringify(clients));
    localStorage.setItem(policyStorageKey, JSON.stringify(policies));
  }, [clients, policies, ready, cloudReady]);

  const clientById = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients]);
  const upcomingPolicies = useMemo(
    () => policies.filter((policy) => daysUntil(new Date(`${policy.endDate}T12:00:00`)) >= 0).sort((a, b) => a.endDate.localeCompare(b.endDate)),
    [policies],
  );
  const upcomingBirthdays = useMemo(
    () => clients.flatMap((client) => {
      const date = nextBirthday(client.birthday);
      return date ? [{ client, date }] : [];
    }).sort((a, b) => a.date.getTime() - b.date.getTime()),
    [clients],
  );
  const normalizedQuery = normalizeSearchText(query);
  const filteredClients = clients.filter((client) =>
    normalizeSearchText(`${client.name} ${client.email} ${client.phone} ${client.company}`).includes(normalizedQuery),
  );
  const filteredPolicies = policies.filter((policy) => {
    const client = clientById.get(policy.clientId);
    const vehicleDetails = policy.type === "Automóvel"
      ? `${policy.vehiclePlate ?? ""} ${policy.vehicleMake ?? ""} ${policy.vehicleModel ?? ""}`
      : "";
    return normalizeSearchText(`${policy.number ?? ""} ${policy.insurer ?? ""} ${policy.type ?? ""} ${vehicleDetails} ${client?.name ?? ""}`).includes(normalizedQuery);
  });
  const activePolicies = policies.filter((policy) => daysUntil(new Date(`${policy.endDate}T12:00:00`)) >= 0);
  const renewalCount = upcomingPolicies.filter((policy) => daysUntil(new Date(`${policy.endDate}T12:00:00`)) <= 30).length;
  const premiumTotal = activePolicies.reduce((total, policy) => total + (policy.premium ?? 0), 0);
  const missingPremiumCount = activePolicies.filter((policy) => policy.premium === null).length;

  async function saveClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (modal?.kind !== "client") return;
    if (cloudAuthConfigured && !cloudReady) {
      window.alert("O banco de dados ainda não está disponível. Seus dados não foram salvos.");
      return;
    }
    const data = new FormData(event.currentTarget);
    const client: Client = {
      id: modal.item?.id ?? crypto.randomUUID(),
      name: String(data.get("name")).trim(),
      email: String(data.get("email")).trim(),
      phone: String(data.get("phone")).trim(),
      birthday: String(data.get("birthday")) || null,
      company: String(data.get("company")).trim(),
    };
    if (cloudReady && !await saveToCloud("/api/clients", "POST", client)) return;
    setClients((current) => modal.item ? current.map((item) => item.id === client.id ? client : item) : [client, ...current]);
    setModal(null);
  }

  async function savePolicy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (modal?.kind !== "policy") return;
    if (cloudAuthConfigured && !cloudReady) {
      window.alert("O banco de dados ainda não está disponível. Seus dados não foram salvos.");
      return;
    }
    const data = new FormData(event.currentTarget);
    const selectedPdf = data.get("pdf");
    const pdfFile = selectedPdf instanceof File && selectedPdf.size > 0 ? selectedPdf : null;
    if (pdfFile && (!pdfFile.name.toLowerCase().endsWith(".pdf") || pdfFile.size > 4 * 1024 * 1024)) {
      window.alert("Selecione um PDF de até 4 MB.");
      return;
    }
    const startDate = String(data.get("startDate")) || null;
    const endDate = String(data.get("endDate"));
    const type = String(data.get("type")) || null;
    if (startDate && endDate < startDate) {
      window.alert("O fim da vigência precisa ser igual ou posterior ao início.");
      return;
    }
    const policy: Policy = {
      id: modal.item?.id ?? crypto.randomUUID(),
      clientId: String(data.get("clientId")),
      number: String(data.get("number")).trim() || null,
      insurer: String(data.get("insurer")).trim() || null,
      type,
      vehiclePlate: type === "Automóvel" ? String(data.get("vehiclePlate") ?? "").trim().toUpperCase() || null : null,
      vehicleMake: type === "Automóvel" ? String(data.get("vehicleMake") ?? "").trim() || null : null,
      vehicleModel: type === "Automóvel" ? String(data.get("vehicleModel") ?? "").trim() || null : null,
      premium: String(data.get("premium")).trim() ? Number(data.get("premium")) : null,
      startDate,
      endDate,
      notes: String(data.get("notes")).trim(),
      pdfName: modal.item?.pdfName ?? null,
    };
    if (cloudReady && !await saveToCloud("/api/policies", "POST", policy)) return;
    let savedPolicy = policy;
    if (cloudReady && pdfFile) {
      const pdfName = await uploadPdfToCloud(policy.id, pdfFile);
      if (!pdfName) {
        setPolicies((current) => modal.item ? current.map((item) => item.id === policy.id ? policy : item) : [policy, ...current]);
        setModal({ kind: "policy", item: policy });
        return;
      }
      savedPolicy = { ...policy, pdfName };
    }
    setPolicies((current) => modal.item ? current.map((item) => item.id === savedPolicy.id ? savedPolicy : item) : [savedPolicy, ...current]);
    setModal(null);
  }

  async function removePolicyPdf(policy: Policy) {
    if (!window.confirm(`Remover o PDF ${policy.pdfName}?`)) return;
    if (!await saveToCloud(`/api/policies/${encodeURIComponent(policy.id)}/pdf`, "DELETE")) return;
    setPolicies((current) => current.map((item) => item.id === policy.id ? { ...item, pdfName: null } : item));
    setModal((current) => current?.kind === "policy" && current.item?.id === policy.id
      ? { kind: "policy", item: { ...current.item, pdfName: null } }
      : current);
  }

  async function removeClient(client: Client) {
    if (!window.confirm(`Excluir ${client.name}? As apólices vinculadas também serão removidas.`)) return;
    if (cloudAuthConfigured && !cloudReady) return window.alert("O banco de dados ainda não está disponível. Nenhum dado foi excluído.");
    if (cloudReady && !await saveToCloud(`/api/clients?id=${encodeURIComponent(client.id)}`, "DELETE")) return;
    setClients((current) => current.filter((item) => item.id !== client.id));
    setPolicies((current) => current.filter((policy) => policy.clientId !== client.id));
  }

  async function removePolicy(policy: Policy) {
    if (!window.confirm(`Excluir a apólice ${policy.number || "sem número informado"}?`)) return;
    if (cloudAuthConfigured && !cloudReady) return window.alert("O banco de dados ainda não está disponível. Nenhum dado foi excluído.");
    if (cloudReady && !await saveToCloud(`/api/policies?id=${encodeURIComponent(policy.id)}`, "DELETE")) return;
    setPolicies((current) => current.filter((item) => item.id !== policy.id));
  }

  const pageTitle = navItems.find((item) => item.id === section)?.label ?? "Visão geral";

  if (cloudAuthConfigured && isLoaded && !isSignedIn) {
    return <main className="auth-screen"><section className="auth-message"><Image src="/amparaseg-logo.svg" alt="AmparaSeg, Corretora de Seguros. Seguro que acolhe." width={640} height={190} className="brand-logo auth-brand-logo" priority /><h1>Entre para acessar sua carteira</h1><p>Faça login para visualizar clientes, apólices e vigências do seu workspace.</p><div className="welcome-actions" style={{ justifyContent: "center" }}><SignInButton mode="modal"><button className="button button-primary">Entrar</button></SignInButton><SignUpButton mode="modal"><button className="button button-secondary">Criar conta</button></SignUpButton></div></section></main>;
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar${mobileNavOpen ? " sidebar-open" : ""}`}>
        <div className="brand-row">
          <Image src="/amparaseg-logo.svg" alt="AmparaSeg, Corretora de Seguros. Seguro que acolhe." width={640} height={190} className="brand-logo" priority />
          <button className="icon-button mobile-close" onClick={() => setMobileNavOpen(false)} aria-label="Fechar menu"><X size={18} /></button>
        </div>
        <div className="workspace-switcher">
          <span className="workspace-avatar">A</span>
          <span className="workspace-copy"><strong>Ampara Seguros</strong><small>Espaço de trabalho</small></span>
          <ChevronDown size={15} />
        </div>
        <span className="nav-caption">MENU PRINCIPAL</span>
        <nav className="main-nav" aria-label="Menu principal">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-link${section === id ? " nav-link-active" : ""}`} onClick={() => { setSection(id); setMobileNavOpen(false); }}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {id === "vigencias" && renewalCount > 0 && <span className="nav-count">{renewalCount}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip"><span className="tip-icon"><Gift size={17} /></span><strong>Relacionamento em dia</strong><p>{upcomingBirthdays.length} aniversários cadastrados.</p><button onClick={() => setSection("agenda")}>Ver agenda <ArrowRight size={14} /></button></div>
          <div className="profile-row"><Avatar name="Ana Martins" /><span className="profile-copy"><strong>Ana Martins</strong><small>Corretora</small></span><MoreHorizontal size={19} /></div>
        </div>
      </aside>

      {mobileNavOpen && <button className="mobile-scrim" onClick={() => setMobileNavOpen(false)} aria-label="Fechar navegação" />}

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button>
          <div className="breadcrumb"><span>Ampara Seguros</span><span className="breadcrumb-divider">/</span><strong>{pageTitle}</strong></div>
          <div className="topbar-actions">
            <label className="search-box"><Search size={17} /><input aria-label="Buscar clientes e apólices" placeholder="Buscar cliente, apólice..." value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>⌘ K</kbd></label>
            <button className="icon-button notification-button" onClick={() => setSection("vigencias")} aria-label="Ver notificações de vigências"><Bell size={18} />{renewalCount > 0 && <span />}</button>
            <Show when="signed-out">
              <SignInButton mode="modal"><button className="button button-secondary">Entrar</button></SignInButton>
              <SignUpButton mode="modal"><button className="button button-primary">Criar conta</button></SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
            {!cloudReady && !cloudAuthConfigured && <Avatar name="Ana Martins" small />}
          </div>
        </header>

        <div className="page-content">
          <div className={`demo-notice${cloudReady ? " cloud-notice" : ""}`}><span className="demo-dot" />{cloudReady ? "Banco Neon conectado" : cloudError ? "Banco de dados indisponível" : "Modo demonstração"} <span className="notice-divider">·</span> {cloudReady ? "dados sincronizados com segurança" : cloudError ? "configure Neon e Clerk para continuar" : "alterações salvas neste navegador"}</div>
          {section === "inicio" && <Dashboard firstName={greetingName} clients={clients} policies={policies} clientById={clientById} upcomingPolicies={upcomingPolicies} upcomingBirthdays={upcomingBirthdays} activePolicies={activePolicies.length} renewalCount={renewalCount} premiumTotal={premiumTotal} missingPremiumCount={missingPremiumCount} onSection={setSection} onNewPolicy={() => setModal({ kind: "policy" })} onNewClient={() => setModal({ kind: "client" })} />}
          {section === "clientes" && <ClientsPage clients={filteredClients} policies={policies} query={query} onQueryChange={setQuery} onNew={() => setModal({ kind: "client" })} onEdit={(client) => setModal({ kind: "client", item: client })} onDelete={removeClient} />}
          {section === "apolices" && <PoliciesPage policies={filteredPolicies} clientById={clientById} query={query} onQueryChange={setQuery} onNew={() => setModal({ kind: "policy" })} onEdit={(policy) => setModal({ kind: "policy", item: policy })} onDelete={removePolicy} />}
          {section === "vigencias" && <RenewalsPage policies={upcomingPolicies} clientById={clientById} onEdit={(policy) => setModal({ kind: "policy", item: policy })} />}
          {section === "agenda" && <AgendaPage birthdays={upcomingBirthdays} policies={upcomingPolicies} clientById={clientById} onEdit={(policy) => setModal({ kind: "policy", item: policy })} />}
          <footer className="page-footer"><span>Ampara CRM</span><span>Seus relacionamentos, bem cuidados.</span><button onClick={() => window.print()}><ArrowDownToLine size={14} /> Exportar / imprimir</button></footer>
        </div>
      </main>

      {modal && <RecordModal modal={modal} clients={clients} cloudReady={cloudReady} onClose={() => setModal(null)} onSaveClient={saveClient} onSavePolicy={savePolicy} onRemovePdf={removePolicyPdf} />}
    </div>
  );
}

async function saveToCloud(path: string, method: "POST" | "DELETE", body?: object) {
  try {
    const response = await fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) throw new Error("Falha ao salvar no banco de dados.");
    return true;
  } catch {
    window.alert("Não foi possível sincronizar com o Neon. Verifique sua conexão e tente novamente.");
    return false;
  }
}

async function uploadPdfToCloud(policyId: string, file: File) {
  try {
    const form = new FormData();
    form.set("file", file);
    const response = await fetch(`/api/policies/${encodeURIComponent(policyId)}/pdf`, { method: "POST", body: form });
    if (!response.ok) throw new Error("Falha ao enviar o PDF.");
    const result = await response.json() as { name: string };
    return result.name;
  } catch {
    window.alert("Não foi possível enviar o PDF privado. Confira a conexão com o Vercel Blob e tente novamente.");
    return null;
  }
}

function Dashboard({ firstName, clients, policies, clientById, upcomingPolicies, upcomingBirthdays, activePolicies, renewalCount, premiumTotal, missingPremiumCount, onSection, onNewPolicy, onNewClient }: {
  firstName: string;
  clients: Client[]; policies: Policy[]; clientById: Map<string, Client>; upcomingPolicies: Policy[];
  upcomingBirthdays: { client: Client; date: Date }[]; activePolicies: number; renewalCount: number;
  premiumTotal: number; missingPremiumCount: number; onSection: (section: Section) => void; onNewPolicy: () => void; onNewClient: () => void;
}) {
  const greeting = today.getHours() < 12 ? "Bom dia" : today.getHours() < 18 ? "Boa tarde" : "Boa noite";
  const dateText = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(today);
  const soon = upcomingPolicies.filter((policy) => daysUntil(new Date(`${policy.endDate}T12:00:00`)) <= 45).slice(0, 4);
  const birthdays = upcomingBirthdays.filter(({ date }) => daysUntil(date) <= 45).slice(0, 4);

  return <>
    <section className="welcome-row"><div><div className="eyebrow">{dateText}</div><h1>{greeting}, {firstName}<span className="greeting-period">.</span></h1><p>Veja o que merece sua atenção hoje.</p></div><div className="welcome-actions"><button className="button button-secondary" onClick={onNewClient}><Plus size={16} /> Novo cliente</button><button className="button button-primary" onClick={onNewPolicy}><Plus size={17} /> Nova apólice</button></div></section>

    <section className="metric-grid" aria-label="Resumo da carteira">
      <Metric icon={UsersRound} label="Clientes ativos" value={String(clients.length).padStart(2, "0")} note="na sua carteira" accent="green" />
      <Metric icon={ShieldCheck} label="Apólices vigentes" value={String(activePolicies).padStart(2, "0")} note={`${renewalCount} vencem nos próximos 30 dias`} accent="blue" />
      <Metric icon={Clock3} label="Renovações próximas" value={String(renewalCount).padStart(2, "0")} note="próximos 30 dias" accent="amber" />
      <Metric icon={BriefcaseBusiness} label="Prêmios informados" value={money(premiumTotal)} note={missingPremiumCount ? `${missingPremiumCount} sem valor informado` : "valores cadastrados"} accent="coral" />
    </section>

    <div className="dashboard-columns">
      <section className="content-panel renewals-panel">
        <div className="panel-heading"><div><span className="section-kicker">ACOMPANHAMENTO</span><h2>Vigências próximas</h2><p>Não deixe nenhuma renovação passar.</p></div><button className="text-link" onClick={() => onSection("vigencias")}>Ver todas <ArrowRight size={15} /></button></div>
        {soon.length ? <div className="renewal-list">{soon.map((policy) => {
          const client = clientById.get(policy.clientId);
          const remaining = daysUntil(new Date(`${policy.endDate}T12:00:00`));
          return <button className="renewal-row" key={policy.id} onClick={() => onSection("vigencias")}><span className="policy-type-icon">{kindIcon(policy.type)}</span><span className="renewal-copy"><strong>{client?.name ?? "Cliente removido"}</strong><small>{policy.type || "Tipo não informado"} <span>·</span> {policy.insurer || "Seguradora não informada"}</small></span><span className={`renewal-date${remaining <= 7 ? " renewal-date-urgent" : ""}`}><strong>{remaining === 0 ? "Hoje" : `${remaining} dias`}</strong><small>{dateLabel(policy.endDate)}</small></span><ArrowUpRight className="row-arrow" size={16} /></button>;
        })}</div> : <EmptyState text="Nenhuma vigência próxima. Sua carteira está em dia." />}
        <button className="panel-footer-link" onClick={() => onSection("vigencias")}>Acessar calendário de renovações <ArrowRight size={14} /></button>
      </section>

      <section className="content-panel birthdays-panel">
        <div className="panel-heading"><div><span className="section-kicker">RELACIONAMENTO</span><h2>Próximos aniversários</h2><p>Um bom motivo para se aproximar.</p></div><span className="birthday-heading-icon"><Gift size={17} /></span></div>
        {birthdays.length ? <div className="birthday-list">{birthdays.map(({ client, date }) => {
          const remaining = daysUntil(date);
          return <div className="birthday-row" key={client.id}><Avatar name={client.name} small /><span className="birthday-copy"><strong>{client.name}</strong><small>{remaining === 0 ? "Faz aniversário hoje" : remaining === 1 ? "Amanhã" : `Em ${remaining} dias`}</small></span><span className="birthday-date">{dateLabel(isoDate(date), { day: "2-digit", month: "short" })}</span></div>;
        })}</div> : <EmptyState text="Sem aniversários nos próximos 45 dias." />}
        <button className="panel-footer-link" onClick={() => onSection("agenda")}>Ver agenda completa <ArrowRight size={14} /></button>
      </section>
    </div>

    <section className="content-panel policies-panel">
      <div className="panel-heading"><div><span className="section-kicker">SUA CARTEIRA</span><h2>Apólices recentes</h2><p>Acompanhe os contratos e observações importantes.</p></div><button className="text-link" onClick={() => onSection("apolices")}>Ver apólices <ArrowRight size={15} /></button></div>
      <PolicyTable policies={policies.slice(0, 5)} clientById={clientById} compact />
    </section>

    <section className="quick-actions"><span className="quick-icon"><CalendarDays size={19} /></span><div><strong>Rotina em dia, cliente bem cuidado.</strong><p>Registre uma conversa, atualize uma apólice ou confira quem está chegando perto de renovar.</p></div><button className="button button-secondary" onClick={onNewClient}>Adicionar cliente <Plus size={15} /></button></section>
  </>;
}

function Metric({ icon: Icon, label, value, note, accent }: { icon: typeof UsersRound; label: string; value: string; note: string; accent: string }) {
  return <article className={`metric-card metric-${accent}`}><div className="metric-top"><span className="metric-icon"><Icon size={18} /></span><span className="metric-trend"><ArrowUpRight size={14} /></span></div><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-note">{note}</div></article>;
}

function ClientsPage({ clients, policies, query, onQueryChange, onNew, onEdit, onDelete }: { clients: Client[]; policies: Policy[]; query: string; onQueryChange: (value: string) => void; onNew: () => void; onEdit: (client: Client) => void; onDelete: (client: Client) => void }) {
  return <>
    <section className="page-heading"><div><span className="section-kicker">RELACIONAMENTO</span><h1>Clientes</h1><p>Uma visão clara de cada pessoa e da carteira que vocês construíram.</p></div><button className="button button-primary" onClick={onNew}><Plus size={17} /> Novo cliente</button></section>
    <section className="content-panel table-panel"><div className="table-toolbar"><div><strong>{clients.length} clientes</strong><span> · organizados por nome</span></div><label className="table-search"><Search size={15} /><input type="search" aria-label="Pesquisar clientes" placeholder="Pesquisar clientes..." value={query} onChange={(event) => onQueryChange(event.target.value)} /></label></div>
      {clients.length ? <div className="table-scroll"><table><thead><tr><th>CLIENTE</th><th>CONTATO</th><th>APÓLICES</th><th>ANIVERSÁRIO</th><th></th></tr></thead><tbody>{clients.map((client) => {
        const clientPolicies = policies.filter((policy) => policy.clientId === client.id);
        return <tr key={client.id}><td><div className="client-cell"><Avatar name={client.name} small /><span><strong>{client.name}</strong><small>{client.company || "Pessoa física"}</small></span></div></td><td><span>{client.email || "—"}</span><small className="table-subline">{client.phone || "Sem telefone"}</small></td><td><span className="policy-count">{clientPolicies.length}</span> <span className="muted-text">{clientPolicies.length === 1 ? "apólice" : "apólices"}</span></td><td>{dateLabel(client.birthday, { day: "2-digit", month: "long" })}</td><td><div className="row-actions"><button className="icon-button" onClick={() => onEdit(client)} aria-label={`Editar ${client.name}`}><Pencil size={15} /></button><button className="icon-button danger-action" onClick={() => onDelete(client)} aria-label={`Excluir ${client.name}`}><Trash2 size={15} /></button></div></td></tr>;
      })}</tbody></table></div> : <EmptyState text={query ? "Nenhum cliente corresponde à sua busca." : "Cadastre seu primeiro cliente para começar."} />}
    </section>
  </>;
}

function PoliciesPage({ policies, clientById, query, onQueryChange, onNew, onEdit, onDelete }: { policies: Policy[]; clientById: Map<string, Client>; query: string; onQueryChange: (value: string) => void; onNew: () => void; onEdit: (policy: Policy) => void; onDelete: (policy: Policy) => void }) {
  return <>
    <section className="page-heading"><div><span className="section-kicker">PROTEÇÃO E PATRIMÔNIO</span><h1>Apólices</h1><p>Dados, vigências e observações reunidos em um só lugar.</p></div><button className="button button-primary" onClick={onNew}><Plus size={17} /> Nova apólice</button></section>
    <section className="content-panel table-panel"><div className="table-toolbar"><div><strong>{policies.length} apólices</strong><span> · carteira completa</span></div><label className="table-search"><Search size={15} /><input type="search" aria-label="Pesquisar apólices" placeholder="Pesquisar por número, cliente ou seguradora..." value={query} onChange={(event) => onQueryChange(event.target.value)} /></label></div>
      {policies.length ? <PolicyTable policies={policies} clientById={clientById} onEdit={onEdit} onDelete={onDelete} /> : <EmptyState text={query ? "Nenhuma apólice corresponde à sua busca." : "Cadastre uma apólice para acompanhar suas vigências."} />}
    </section>
  </>;
}

function PolicyTable({ policies, clientById, compact = false, onEdit, onDelete }: { policies: Policy[]; clientById: Map<string, Client>; compact?: boolean; onEdit?: (policy: Policy) => void; onDelete?: (policy: Policy) => void }) {
  return <div className="table-scroll"><table><thead><tr><th>APÓLICE</th><th>CLIENTE</th><th>VIGÊNCIA</th><th>PRÊMIO TOTAL</th><th>STATUS</th>{!compact && <th>AÇÕES</th>}</tr></thead><tbody>{policies.map((policy) => {
    const client = clientById.get(policy.clientId);
    const policyLabel = policy.number || "Número não informado";
    const vehicleDetails = policy.type === "Automóvel"
      ? [policy.vehiclePlate, policy.vehicleMake, policy.vehicleModel].filter(Boolean).join(" · ")
      : "";
    return <tr key={policy.id}><td><div className="policy-cell"><span className="policy-type-icon">{kindIcon(policy.type, 16)}</span><span><strong>{policy.type || "Tipo não informado"}</strong><small>{policyLabel} · {policy.insurer || "Seguradora não informada"}</small>{vehicleDetails && <small className="vehicle-details">{vehicleDetails}</small>}{policy.pdfName && <a className="pdf-link" href={`/api/policies/${encodeURIComponent(policy.id)}/pdf`} target="_blank" rel="noreferrer"><Paperclip size={11} />{policy.pdfName}</a>}{policy.notes && <span className="note-indicator"><span />Com observação</span>}</span></div></td><td><div className="client-cell"><Avatar name={client?.name ?? "Cliente removido"} small /><span><strong>{client?.name ?? "Cliente removido"}</strong><small>{client?.company || client?.email || ""}</small></span></div></td><td><span>{policy.startDate ? `${dateLabel(policy.startDate)} – ` : ""}{dateLabel(policy.endDate, { day: "2-digit", month: "short", year: "numeric" })}</span><small className="table-subline">{policy.notes || "Sem observações"}</small></td><td><strong>{policy.premium === null ? "—" : money(policy.premium)}</strong></td><td><Status endDate={policy.endDate} /></td>{!compact && <td><div className="row-actions"><button className="button button-secondary button-small" onClick={() => onEdit?.(policy)} aria-label={`Editar ${policyLabel}`}><Pencil size={14} />Editar</button><button className="icon-button danger-action" onClick={() => onDelete?.(policy)} aria-label={`Excluir ${policyLabel}`}><Trash2 size={15} /></button></div></td>}</tr>;
  })}</tbody></table></div>;
}

function RenewalsPage({ policies, clientById, onEdit }: { policies: Policy[]; clientById: Map<string, Client>; onEdit: (policy: Policy) => void }) {
  const nearTerm = policies.filter((policy) => daysUntil(new Date(`${policy.endDate}T12:00:00`)) <= 30);
  const later = policies.filter((policy) => daysUntil(new Date(`${policy.endDate}T12:00:00`)) > 30);
  return <>
    <section className="page-heading"><div><span className="section-kicker">PREVISIBILIDADE</span><h1>Vigências</h1><p>Antecipe renovações e mantenha cada cliente protegido.</p></div><div className="renewal-summary"><span className="renewal-summary-number">{nearTerm.length}</span><span>nos próximos<br />30 dias</span></div></section>
    <section className="content-panel renewal-detail-panel"><div className="panel-heading"><div><span className="section-kicker section-kicker-alert">ATENÇÃO PRIORITÁRIA</span><h2>Próximos 30 dias</h2><p>Entre em contato para preparar cada renovação.</p></div></div>{nearTerm.length ? <div className="renewal-detail-list">{nearTerm.map((policy) => <RenewalDetail key={policy.id} policy={policy} client={clientById.get(policy.clientId)} onEdit={() => onEdit(policy)} />)}</div> : <EmptyState text="Nenhuma apólice vence nos próximos 30 dias." />}</section>
    <section className="content-panel renewal-detail-panel later-panel"><div className="panel-heading"><div><span className="section-kicker">PLANEJAMENTO</span><h2>Próximos 90 dias</h2><p>Renovações que já podem entrar no seu radar.</p></div></div>{later.filter((policy) => daysUntil(new Date(`${policy.endDate}T12:00:00`)) <= 90).length ? <div className="renewal-detail-list">{later.filter((policy) => daysUntil(new Date(`${policy.endDate}T12:00:00`)) <= 90).map((policy) => <RenewalDetail key={policy.id} policy={policy} client={clientById.get(policy.clientId)} onEdit={() => onEdit(policy)} />)}</div> : <EmptyState text="Nenhuma renovação adicional nos próximos 90 dias." />}</section>
  </>;
}

function RenewalDetail({ policy, client, onEdit }: { policy: Policy; client?: Client; onEdit: () => void }) {
  const remaining = daysUntil(new Date(`${policy.endDate}T12:00:00`));
  return <article className="renewal-detail-row"><span className="policy-type-icon">{kindIcon(policy.type, 18)}</span><span className="renewal-detail-copy"><strong>{client?.name ?? "Cliente removido"}</strong><small>{policy.type || "Tipo não informado"} · {policy.insurer || "Seguradora não informada"} · apólice {policy.number || "não informada"}</small><span className="renewal-note">{policy.notes || "Nenhuma observação registrada."}</span></span><span className={`renewal-countdown${remaining <= 7 ? " renewal-date-urgent" : ""}`}><strong>{remaining === 0 ? "Hoje" : `${remaining} dias`}</strong><small>{dateLabel(policy.endDate, { day: "2-digit", month: "long", year: "numeric" })}</small></span><button className="button button-secondary button-small" onClick={onEdit}><Pencil size={14} /> Atualizar</button></article>;
}

function AgendaPage({ birthdays, policies, clientById, onEdit }: { birthdays: { client: Client; date: Date }[]; policies: Policy[]; clientById: Map<string, Client>; onEdit: (policy: Policy) => void }) {
  const events = [
    ...birthdays.map(({ client, date }) => ({ id: `b-${client.id}`, date, title: `Aniversário de ${client.name}`, detail: client.company || "Relacionamento", kind: "birthday" as const })),
    ...policies.map((policy) => ({ id: `p-${policy.id}`, date: new Date(`${policy.endDate}T12:00:00`), title: `Renovação · ${policy.type || "apólice"}`, detail: `${clientById.get(policy.clientId)?.name ?? "Cliente removido"} · ${policy.insurer || "Seguradora não informada"}`, kind: "renewal" as const, policy })),
  ].filter((event) => daysUntil(event.date) >= 0).sort((a, b) => a.date.getTime() - b.date.getTime());
  return <>
    <section className="page-heading"><div><span className="section-kicker">PRÓXIMOS COMPROMISSOS</span><h1>Agenda</h1><p>Aniversários e renovações em ordem cronológica.</p></div><div className="agenda-month"><CalendarDays size={17} />{new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(today)}</div></section>
    <section className="content-panel agenda-panel">{events.length ? <div className="agenda-list">{events.map((event) => <div className="agenda-event" key={event.id}><div className="agenda-date"><strong>{String(event.date.getDate()).padStart(2, "0")}</strong><span>{new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(event.date).replace(".", "")}</span></div><span className={`agenda-event-icon${event.kind === "birthday" ? " agenda-birthday" : " agenda-renewal"}`}>{event.kind === "birthday" ? <Gift size={17} /> : <Clock3 size={17} />}</span><span className="agenda-event-copy"><strong>{event.title}</strong><small>{event.detail}</small></span><span className="agenda-event-distance">{daysUntil(event.date) === 0 ? "Hoje" : daysUntil(event.date) === 1 ? "Amanhã" : `Em ${daysUntil(event.date)} dias`}</span>{event.kind === "renewal" && <button className="icon-button" aria-label="Editar apólice" onClick={() => onEdit(event.policy)}><Pencil size={15} /></button>}</div>)}</div> : <EmptyState text="Nenhum compromisso futuro na sua agenda." />}</section>
  </>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty-state"><span><Check size={19} /></span><p>{text}</p></div>;
}

function RecordModal({ modal, clients, cloudReady, onClose, onSaveClient, onSavePolicy, onRemovePdf }: { modal: Exclude<ModalState, null>; clients: Client[]; cloudReady: boolean; onClose: () => void; onSaveClient: (event: FormEvent<HTMLFormElement>) => void; onSavePolicy: (event: FormEvent<HTMLFormElement>) => void; onRemovePdf: (policy: Policy) => void }) {
  const [policyType, setPolicyType] = useState(modal.kind === "policy" ? modal.item?.type ?? "Automóvel" : "");
  const isClient = modal.kind === "client";
  const attachedPdf = modal.kind === "policy" ? modal.item?.pdfName : null;
  const title = isClient ? modal.item ? "Editar cliente" : "Novo cliente" : modal.item ? "Editar apólice" : "Nova apólice";
  return (
    <div className="modal-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="record-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading">
          <div>
            <span className="section-kicker">{isClient ? "RELACIONAMENTO" : "PROTEÇÃO"}</span>
            <h2 id="modal-title">{title}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={19} /></button>
        </div>
        {isClient ? (
          <form onSubmit={onSaveClient} className="record-form">
            <label>Nome completo<input name="name" required defaultValue={modal.item?.name} placeholder="Ex.: Maria Oliveira" autoFocus /></label>
            <div className="form-row">
              <label>E-mail<input name="email" type="email" defaultValue={modal.item?.email} placeholder="maria@email.com" /></label>
              <label>Telefone<input name="phone" type="tel" defaultValue={modal.item?.phone} placeholder="(11) 99999-9999" /></label>
            </div>
            <div className="form-row">
              <label>Data de nascimento<input name="birthday" type="date" defaultValue={modal.item?.birthday ?? ""} /></label>
              <label>Empresa <span className="optional-label">opcional</span><input name="company" defaultValue={modal.item?.company} placeholder="Nome da empresa" /></label>
            </div>
            <div className="modal-actions">
              <button type="button" className="button button-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="button button-primary">{modal.item ? "Salvar alterações" : "Adicionar cliente"}</button>
            </div>
          </form>
        ) : (
          <form onSubmit={onSavePolicy} className="record-form">
            <label>Cliente<select name="clientId" required defaultValue={modal.item?.clientId ?? clients[0]?.id}>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
            <div className="form-row">
              <label>Número da apólice<input name="number" defaultValue={modal.item?.number ?? ""} placeholder="Ex.: AU-2948106" /></label>
              <label>Seguradora<input name="insurer" defaultValue={modal.item?.insurer ?? ""} placeholder="Nome da seguradora" /></label>
            </div>
              <div className="form-row">
                <label>Tipo<select name="type" value={policyType} onChange={(event) => setPolicyType(event.target.value)}><option value="">Não informado</option><option>Automóvel</option><option>Residencial</option><option>Vida</option><option>Empresarial</option><option>Saúde</option><option>Outro</option></select></label>
              <label>Prêmio total (R$)<input name="premium" type="number" min="0" step="0.01" defaultValue={modal.item?.premium ?? ""} placeholder="0,00" /></label>
            </div>
            {policyType === "Automóvel" && <div className="form-row vehicle-form-row">
              <label>Placa<input name="vehiclePlate" defaultValue={modal.kind === "policy" ? modal.item?.vehiclePlate ?? "" : ""} placeholder="Ex.: ABC1D23" autoCapitalize="characters" /></label>
              <label>Marca<input name="vehicleMake" defaultValue={modal.kind === "policy" ? modal.item?.vehicleMake ?? "" : ""} placeholder="Ex.: Toyota" /></label>
              <label>Modelo<input name="vehicleModel" defaultValue={modal.kind === "policy" ? modal.item?.vehicleModel ?? "" : ""} placeholder="Ex.: Corolla" /></label>
            </div>}
            <div className="form-row">
              <label>Início da vigência<input name="startDate" type="date" defaultValue={modal.item?.startDate ?? ""} /></label>
              <label>Fim da vigência<input name="endDate" type="date" required defaultValue={modal.item?.endDate} /></label>
            </div>
            <label className="pdf-upload-field">PDF da apólice<input name="pdf" type="file" accept="application/pdf,.pdf" disabled={!cloudReady} /><small>{cloudReady ? "PDF de até 4 MB. Armazenado em Blob privado." : "Conecte o Vercel Blob para habilitar anexos."}</small></label>
            {attachedPdf && modal.kind === "policy" && modal.item && <div className="attached-pdf"><a className="pdf-link" href={`/api/policies/${encodeURIComponent(modal.item.id)}/pdf`} target="_blank" rel="noreferrer"><FileText size={15} />{attachedPdf}</a><button type="button" className="text-link" onClick={() => onRemovePdf(modal.item as Policy)}>Remover PDF</button></div>}
            <label>Observações sobre a apólice<textarea name="notes" rows={3} defaultValue={modal.item?.notes} placeholder="Condições especiais, histórico de contato, próximos passos..." /></label>
            <div className="modal-actions">
              <button type="button" className="button button-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="button button-primary">{modal.item ? "Salvar alterações" : "Adicionar apólice"}</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
