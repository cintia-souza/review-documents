/**
 * Registra os Slash Commands do bot no Discord.
 * 
 * Rodar UMA VEZ após criar o bot:
 *   node scripts/register-commands.mjs
 * 
 * Pré-requisitos:
 *   - DISCORD_BOT_TOKEN no .env
 *   - DISCORD_APP_ID no .env
 */

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_APP_ID = process.env.DISCORD_APP_ID;

if (!DISCORD_BOT_TOKEN || !DISCORD_APP_ID) {
  console.error('❌ Configure DISCORD_BOT_TOKEN e DISCORD_APP_ID no .env');
  process.exit(1);
}

const commands = [
  {
    name: 'vagas',
    description: 'Mostra vagas recentes de uma área',
    options: [
      {
        name: 'tag',
        description: 'Área de busca (ex: front-end, back-end)',
        type: 3, // STRING
        required: false,
        choices: [
          { name: 'Front-end', value: 'front-end' },
          { name: 'Back-end', value: 'back-end' },
          { name: 'Fullstack', value: 'fullstack' },
        ],
      },
    ],
  },
  {
    name: 'analise',
    description: 'Mostra análise de competências do mercado',
    options: [
      {
        name: 'tag',
        description: 'Área de análise (ex: front-end)',
        type: 3,
        required: false,
        choices: [
          { name: 'Front-end', value: 'front-end' },
          { name: 'Back-end', value: 'back-end' },
          { name: 'Fullstack', value: 'fullstack' },
        ],
      },
    ],
  },
  {
    name: 'mapa',
    description: 'Mapeamento completo de mercado para um cargo',
    options: [
      {
        name: 'cargo',
        description: 'Cargo-alvo (ex: Frontend React Developer)',
        type: 3,
        required: true,
      },
    ],
  },
];

async function registerCommands() {
  const url = `https://discord.com/api/v10/applications/${DISCORD_APP_ID}/commands`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
    body: JSON.stringify(commands),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Erro ao registrar comandos:', response.status, error);
    process.exit(1);
  }

  const data = await response.json();
  console.log(`✅ ${data.length} comandos registrados com sucesso!`);
  data.forEach((cmd) => console.log(`   /${cmd.name} — ${cmd.description}`));
}

registerCommands();
