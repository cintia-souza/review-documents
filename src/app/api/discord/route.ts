import { NextRequest, NextResponse } from 'next/server';
import { verifyDiscordSignature } from '@/lib/discord/verify';
import { handleVagas, handleAnalise, handleMapa } from '@/lib/discord/commands';

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || '';

// Discord Interaction Types
const PING = 1;
const APPLICATION_COMMAND = 2;

// Discord Response Types
const PONG = 1;
const CHANNEL_MESSAGE = 4;

// GET para testar se a rota está ativa
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Discord bot endpoint ativo' });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-signature-ed25519') || '';
  const timestamp = request.headers.get('x-signature-timestamp') || '';

  // Verificação obrigatória do Discord
  if (!DISCORD_PUBLIC_KEY) {
    return NextResponse.json({ error: 'DISCORD_PUBLIC_KEY not configured' }, { status: 500 });
  }

  const isValid = await verifyDiscordSignature(body, signature, timestamp, DISCORD_PUBLIC_KEY);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const interaction = JSON.parse(body);

  // Responde PING (Discord usa para verificar o endpoint)
  if (interaction.type === PING) {
    return NextResponse.json({ type: PONG });
  }

  // Slash Commands
  if (interaction.type === APPLICATION_COMMAND) {
    const { name, options } = interaction.data;

    let response;

    try {
      switch (name) {
        case 'vagas': {
          const tag = options?.[0]?.value || 'front-end';
          response = await handleVagas(tag);
          break;
        }
        case 'analise': {
          const tag = options?.[0]?.value || 'front-end';
          response = await handleAnalise(tag);
          break;
        }
        case 'mapa': {
          const cargo = options?.[0]?.value || 'Frontend React Developer';
          response = await handleMapa(cargo);
          break;
        }
        default:
          response = { content: '❓ Comando não reconhecido.' };
      }
    } catch (err) {
      console.error('[Discord Bot] Erro:', err);
      response = { content: '❌ Erro interno ao processar comando.' };
    }

    return NextResponse.json({
      type: CHANNEL_MESSAGE,
      data: response,
    });
  }

  return NextResponse.json({ error: 'Unknown interaction type' }, { status: 400 });
}
