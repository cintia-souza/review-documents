import Link from "next/link";

export default function TermosPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-white">
        ← Voltar
      </Link>

      <h1 className="text-3xl font-bold text-white">Termos de Uso</h1>
      <p className="mt-2 text-sm text-zinc-500">Última atualização: Julho 2025</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-300">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e utilizar o ProfileAI, você concorda com estes Termos de Uso.
            Se não concordar com qualquer parte destes termos, não utilize o serviço.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">2. Descrição do Serviço</h2>
          <p>
            O ProfileAI é uma plataforma de análise de perfis profissionais e currículos
            que utiliza inteligência artificial para fornecer recomendações de otimização.
            O serviço não garante resultados específicos de empregabilidade.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">3. Conta do Usuário</h2>
          <p>
            Você é responsável por manter a confidencialidade de suas credenciais de acesso.
            Não compartilhe sua senha com terceiros. Notifique-nos imediatamente sobre
            qualquer uso não autorizado da sua conta.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">4. Uso Aceitável</h2>
          <p>Você concorda em não:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Utilizar o serviço para fins ilegais ou não autorizados</li>
            <li>Enviar conteúdo malicioso, ofensivo ou que viole direitos de terceiros</li>
            <li>Tentar acessar dados de outros usuários</li>
            <li>Realizar engenharia reversa do sistema</li>
            <li>Sobrecarregar o serviço com requisições automatizadas excessivas</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">5. Assinatura Premium</h2>
          <p>
            A assinatura Premium é cobrada mensalmente. Você pode cancelar a qualquer momento.
            Após o cancelamento, o acesso Premium permanece até o fim do período pago.
            Não oferecemos reembolso por períodos parciais.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">6. Propriedade Intelectual</h2>
          <p>
            O conteúdo gerado pela IA é fornecido como sugestão. Você mantém todos os direitos
            sobre seus dados pessoais e currículos enviados. O ProfileAI não reivindica
            propriedade sobre o conteúdo que você envia.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">7. Limitação de Responsabilidade</h2>
          <p>
            O ProfileAI é fornecido &quot;como está&quot;. Não garantimos que o serviço será
            ininterrupto ou livre de erros. Não nos responsabilizamos por decisões
            tomadas com base nas análises fornecidas.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">8. Alterações nos Termos</h2>
          <p>
            Reservamo-nos o direito de modificar estes termos a qualquer momento.
            Alterações significativas serão comunicadas por email.
          </p>
        </section>
      </div>
    </main>
  );
}
