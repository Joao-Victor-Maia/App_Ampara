import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export default function SignUpPage() {
  if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <main className="auth-screen"><section className="auth-message"><Image src="/amparaseg-logo.svg" alt="AmparaSeg, Corretora de Seguros. Seguro que acolhe." width={640} height={190} className="brand-logo auth-brand-logo" priority /><h1>Autenticação não configurada</h1><p>Adicione as chaves do Clerk ao ambiente para ativar o cadastro e o login.</p><Link href="/">Voltar ao CRM</Link></section></main>;
  }

  return <main className="auth-screen"><SignUp /></main>;
}
