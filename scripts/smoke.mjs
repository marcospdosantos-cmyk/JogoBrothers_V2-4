import { chromium } from 'playwright';

const URL = process.argv[2] || 'http://localhost:4173/';
const browser = await chromium.launch();

const errors = [];
function attach(page, tag) {
  page.on('pageerror', (e) => errors.push(`[${tag}] PAGEERROR: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${tag}] console.error: ${m.text()}`); });
  page.on('requestfailed', (r) => errors.push(`[${tag}] REQFAIL: ${r.url()} — ${r.failure()?.errorText}`));
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`[${tag}] HTTP ${r.status()}: ${r.url()}`); });
}

async function activeScenes(page) {
  return page.evaluate(() => {
    const g = window.game;
    if (!g) return ['<no window.game>'];
    return g.scene.getScenes(true).map((s) => s.scene.key);
  });
}

// ---- Test 1: primeira visita → CadastroScene → preencher → MenuScene ----
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 576 } });
  attach(page, 'cadastro');
  await page.route('**supabase.co**', (r) => r.abort()); // não tocar no banco real
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2500);

  const hasForm = await page.locator('#cadastro-overlay').count();
  console.log('Formulário de cadastro apareceu?', hasForm === 1 ? 'sim' : 'NÃO');
  await page.screenshot({ path: 'scripts/smoke-cadastro.png' });

  await page.fill('#bb-nome', 'João');
  await page.fill('#bb-sobrenome', 'Silva');
  await page.fill('#bb-tel', '11988887777');
  await page.click('#bb-go');
  await page.waitForTimeout(2500);

  const overlayGone = (await page.locator('#cadastro-overlay').count()) === 0;
  console.log('Após enviar — overlay removido?', overlayGone ? 'sim' : 'NÃO');
  console.log('Cenas ativas após cadastro:', await activeScenes(page));
  await page.close();
}

// ---- Test 2: jogador recorrente → MenuScene → GameScene fase 1 e fase 2 (chefe) ----
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 576 } });
  attach(page, 'jogo');
  await page.addInitScript(() => {
    localStorage.setItem('bb_player_id', 'smoke-test-id');
    localStorage.setItem('bb_player_name', 'Tester');
  });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2500);
  console.log('Cenas ativas (recorrente):', await activeScenes(page));

  // Fase 1 (sem chefe) — exercita tilemap, player, inimigos, controles, HUD
  await page.evaluate(() => window.game.scene.start('GameScene', { playerId: 'smoke-test-id', character: 1, phase: 1 }));
  await page.waitForTimeout(4000);
  console.log('Cenas ativas (fase 1):', await activeScenes(page));
  await page.screenshot({ path: 'scripts/smoke-fase1.png' });

  // Fase 2 (chefe Hambúrguer Monstro) — exercita spawn de chefe + projéteis
  await page.evaluate(() => window.game.scene.start('GameScene', { playerId: 'smoke-test-id', character: 2, phase: 2 }));
  await page.waitForTimeout(4500);
  console.log('Cenas ativas (fase 2/chefe):', await activeScenes(page));
  await page.screenshot({ path: 'scripts/smoke-fase2.png' });

  await page.close();
}

await browser.close();

console.log('\n=== ERROS CAPTURADOS ===');
console.log(errors.length ? errors.join('\n') : '✅ NENHUM erro de runtime em todo o fluxo');
process.exit(errors.length ? 1 : 0);
