import Link from "next/link";

export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-white">
        ← Voltar
      </Link>

      <h1 className="text-3xl font-bold text-white">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-zinc-500">Última atualização: Julho 2025</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-300">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">1. Dados que Coletamos</h2>
          <p>Coletamos apenas os dados estritamente necessários para o funcionamento do serviço:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Dados de conta:</strong> Nome, email e senha (armazenada com hash criptográfico bcrypt)</li>
            <li><strong>Dados de análise:</strong> URLs de LinkedIn ou textos de currículos enviados para análise</li>
            <li><strong>Dados de uso:</strong> Histórico de análises e scores gerados</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">2. Como Usamos seus Dados</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Fornecer e melhorar o serviço de análise de perfis</li>
            <li>Gerar recomendações personalizadas via IA</li>
            <li>Manter seu histórico de análises acessível</li>
            <li>Processar pagamentos (via Stripe — não armazenamos dados de cartão)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">3. Proteção de Dados</h2>
          <p>Implementamos medidas técnicas e organizacionais para proteger seus dados:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Senhas armazenadas com hash bcrypt (irreversível)</li>
            <li>Comunicação criptografada via HTTPS/TLS</li>
            <li>Banco de dados com acesso restrito e criptografia em repouso</li>
            <li>Tokens de sessão com expiração automática (JWT)</li>
            <li>Rate limiting para prevenção de ataques de força bruta</li>
            <li>Headers de segurança (CSP, HSTS, X-Frame-Options)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">4. Compartilhamento de Dados</h2>
          <p><strong>Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros</strong>, exceto:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Google Gemini API:</strong> Textos de currículos/perfis são enviados para análise por IA. O Google não retém esses dados conforme sua política de API.</li>
            <li><strong>Stripe:</strong> Para processamento de pagamentos. Stripe é certificado PCI-DSS Level 1.</li>
            <li><strong>Obrigação legal:</strong> Se exigido por lei ou ordem judicial.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">5. Retenção de Dados</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Dados de conta: mantidos enquanto a conta estiver ativa</li>
            <li>Histórico de análises: mantido por 12 meses após a última atividade</li>
            <li>Após exclusão da conta: todos os dados são removidos em até 30 dias</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">6. Seus Direitos (LGPD)</h2>
          <p>Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incompletos ou desatualizados</li>
            <li>Solicitar a exclusão dos seus dados</li>
            <li>Revogar consentimento a qualquer momento</li>
            <li>Solicitar portabilidade dos dados</li>
            <li>Ser informado sobre compartilhamento de dados</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">7. Cookies</h2>
          <p>Utilizamos apenas cookies essenciais para o funcionamento do serviço:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Session token:</strong> Mantém sua sessão autenticada (expira ao fechar o navegador ou após inatividade)</li>
            <li><strong>CSRF token:</strong> Proteção contra ataques de falsificação de requisição</li>
          </ul>
          <p className="mt-2">
            <strong>Não utilizamos</strong> cookies de rastreamento, analytics de terceiros ou publicidade.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">8. Menores de Idade</h2>
          <p>
            O serviço não é destinado a menores de 18 anos. Não coletamos
            intencionalmente dados de menores.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">9. Contato</h2>
          <p>
            Para exercer seus direitos ou esclarecer dúvidas sobre privacidade,
            entre em contato pelo email disponível na plataforma.
          </p>
        </section>
      </div>
    </main>
  );
}
