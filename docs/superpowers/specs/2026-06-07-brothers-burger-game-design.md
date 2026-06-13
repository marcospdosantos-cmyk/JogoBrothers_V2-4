# Brothers Burger Game — Design Spec
**Data:** 2026-06-07  
**Prazo:** 2026-07-10 (reinauguração)  
**Cliente:** Brothers Burger  
**Objetivo:** Jogo web mobile-first para campanha de reinauguração com ranking mensal premiado

---

## 1. Visão Geral

Jogo de plataforma 2D no estilo Super Mario World, com pixel art 16-bit, personagens e universo temático da Brothers Burger. Acessado via QR code ou link nas mesas do restaurante. Os clientes se cadastram, jogam e competem pelo maior score do mês. Ao final do mês, o jogador com maior pontuação ganha um prêmio definido pelo dono da hamburgeria.

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Jogo (frontend) | Phaser.js 3 | Framework HTML5 maduro para plataformers 2D, suporte nativo a sprites, tilemaps e física arcade |
| Backend / Banco | Supabase | PostgreSQL gerenciado, tempo real, gratuito no tier inicial, painel de admin para exportar dados |
| Hospedagem | Vercel | Deploy gratuito, CDN global, carregamento rápido em 4G/5G |
| Arte | Pixel art 16-bit | Estilo SNES, coerente com a referência do Super Mario World |
| Áudio | Chiptune (8-bit) | Loop por fase, efeitos sonoros de ações |

---

## 3. Fluxo do Jogador

```
QR code / Link nas mesas
        ↓
[Tela de Cadastro] ← apenas na 1ª vez (salvo em localStorage)
  • Nome
  • Sobrenome
  • Telefone (formato BR validado)
        ↓
[Tela Inicial]
  • Logo Brothers Burger
  • Botão JOGAR
  • Botão RANKING
        ↓
[Seleção de Personagem]
  • Personagem 1 (redesenho do burger existente)
  • Personagem 2 (novo personagem burger)
        ↓
[Fase 1] → [Fase 2 → Boss 1 ao final] → [Fase 3] → [Fase 4 → Boss Final ao final]
        ↓
[Tela de Fim de Jogo]
  • Hambúrguer montado visualmente (ingredientes coletados)
  • Pontuação final
  • Posição no ranking
  • Botão JOGAR NOVAMENTE
        ↓
[Ranking Global — Top 10]
```

---

## 4. Personagens Jogáveis

Dois personagens selecionáveis na tela de seleção. Mesma jogabilidade, visual diferente. Nomes e personalidades a definir com o cliente.

- **Personagem 1:** Redesenho do burger pixel art existente
- **Personagem 2:** Novo personagem burger, criado do zero

Ambos compartilham o mesmo sistema de estados de power-up (Pequeno → Gigante → Arremessador).

---

## 5. Estrutura das Fases

| # | Cenário | Boss |
|---|---------|------|
| Fase 1 | Cozinha da Brothers Burger | — |
| Fase 2 | Rua / entrega | Hamburguer Monstro (cospe gordura) |
| Fase 3 | Mercado de ingredientes | — |
| Fase 4 | Restaurante rival | Gordão Esfomeado (quer engolir o personagem) |

---

## 6. Inimigos

| Inimigo | Comportamento |
|---------|---------------|
| Picles Gosmento | Anda pelo chão, deixa rastro de gosma que desacelera o personagem |
| Cebola Roxa Ácida | Joga névoa que embaralha os controles por 3 segundos |
| Mosca de Carne | Voa em padrão aleatório pelo cenário |
| Refrigerante Explosivo | Fica parado, explode ao jogador se aproximar |
| *(5º inimigo — a definir com o cliente)* | Sugestão: NPC-inimigo que dá dicas ao morrer |

Todos os inimigos são derrotados por: saltar em cima (spin jump Y ou pulo B), arremesso de batata crua, ou contato durante invencibilidade.

---

## 7. Coletáveis e Pontuação

| Item | Pontos |
|------|--------|
| 🍟 Batata frita | +10 pts |
| 🥬 Ingrediente (alface, tomate, molho, bacon, pão, hambúrguer) | +50 pts cada |
| 🍔 Bônus hambúrguer completo (todos os 6 ingredientes coletados na fase) | +500 pts |

O hambúrguer montado é exibido visualmente na tela de fim de jogo com os ingredientes empilhados em pixel art.

---

## 8. Sistema de Power-ups

### Progressão de estados

```
[Pequeno] → pega Cogumelo Burger → [Gigante] → pega Batata Crua → [Gigante + Arremessador]
```

### Dano recebido

| Estado atual | Toma dano | Resultado |
|-------------|-----------|-----------|
| Pequeno | 1 hit | Perde uma vida |
| Gigante | 1 hit | Volta a Pequeno |
| Arremessador | 1 hit | Volta a Gigante (perde o arremesso) |

### Power-ups

| Power-up | Equivalente Mario | Mecânica |
|----------|------------------|----------|
| 🍄 Cogumelo Burger | Cogumelo | Pequeno → Gigante. Sem limite de tempo. Toma dano → Pequeno. |
| 🥔 Batata Crua | Flor de Fogo | Gigante → pode arremessar batatas cruas nos inimigos. Toma dano → perde o arremesso, volta a Gigante. Precisa achar outro power-up para recuperar. |
| ⭐ Invencibilidade | Estrela | 10 segundos de invencibilidade em qualquer estado. Derrota inimigos por contato. |

---

## 9. Controles Mobile

Layout fiel ao controle SNES com botões virtuais na tela.

```
┌─────────────────────────────────────┐
│           [TELA DO JOGO]            │
│                                     │
│                        [ X ]        │
│  (joystick)      [ Y ]      [ A ]   │
│                        [ B ]        │
│                                     │
└─────────────────────────────────────┘
```

| Botão | Função |
|-------|--------|
| **Joystick esquerdo** | Mover (esquerda/direita) e agachar |
| **B** | Pular |
| **A** | Arremessar batata crua *(só com power-up Batata Crua ativo)* |
| **X** | Correr / Acelerar |
| **Y** | Pular girando (spin jump — derrota inimigos por cima) |

- Suporte a multi-toque: X (correr) + B (pular) simultâneos
- Y + joystick para baixo no ar = spin jump descendente

---

## 10. Telas do Jogo

| Tela | Conteúdo |
|------|----------|
| Cadastro | Nome, Sobrenome, Telefone — exibida apenas na 1ª sessão |
| Inicial | Logo Brothers Burger, JOGAR, RANKING |
| Seleção de Personagem | Personagem 1 vs Personagem 2 com animação idle |
| HUD (durante jogo) | Vidas, pontuação, power-up ativo, logo Brothers |
| Pausa | Botão no canto superior da tela durante o jogo |
| Game Over / Fim | Hambúrguer montado, pontuação, posição no ranking, JOGAR NOVAMENTE |
| Boss | Barra de vida do boss exibida na HUD |
| Ranking | Top 10 com nome e pontuação; posição do jogador atual destacada |

---

## 11. Sistema de Cadastro e Ranking

### Banco de dados (Supabase)

**Tabela: jogadores**
```
id          uuid (PK)
nome        text
sobrenome   text
telefone    text
criado_em   timestamp
```

**Tabela: pontuacoes**
```
id            uuid (PK)
jogador_id    uuid (FK → jogadores)
score         integer
personagem    integer (1 ou 2)
criado_em     timestamp
```

### Regras
- Cada partida salva uma linha em `pontuacoes`
- O ranking exibe a **maior pontuação** de cada jogador (não a última)
- Ranking reseta mensalmente — o dono da Brothers reseta manualmente via painel Supabase
- Dados exportáveis em CSV para sorteio do prêmio

### Identificação do jogador
- Após cadastro, `jogador_id` salvo em `localStorage`
- Retornando na mesma sessão/dispositivo: não pede cadastro novamente
- Dispositivo diferente: pede cadastro novamente (intencionalmente simples, sem login/senha)

---

## 12. Identidade Visual

- Cores, logo e tipografia da Brothers Burger aplicados na HUD e telas de menu
- Fonte pixel art para todos os textos do jogo
- Estilo 16-bit coerente com referência SNES em todos os sprites e cenários
- Música chiptune em loop por fase
- Efeitos sonoros para: pulo, coleta de item, power-up, dano, derrota de inimigo, boss

---

## 13. Fora de Escopo (v1)

Os itens abaixo ficam para versões futuras após a reinauguração:

- App nativo (iOS/Android)
- Login com conta (Google, email)
- Múltiplas campanhas simultâneas
- Fase de editor de fases para o dono
- Modo multiplayer
- Mais de 4 fases

---

## 14. Cronograma Estimado

**Prazo total: 33 dias (até 2026-07-10)**

| Semana | Entregável |
|--------|-----------|
| Semana 1 (07–13 jun) | Setup do projeto, Supabase, tela de cadastro e ranking, controles mobile |
| Semana 2 (14–20 jun) | Fase 1 completa + inimigos base + sistema de power-ups |
| Semana 3 (21–27 jun) | Fase 2 + Boss 1 + sistema de coletáveis e pontuação |
| Semana 4 (28 jun–04 jul) | Fases 3 e 4 + Boss Final |
| Semana 5 (05–09 jul) | Polimento, testes mobile, ajustes de balanceamento, deploy |
| **10 jul** | **Reinauguração — go live** |
