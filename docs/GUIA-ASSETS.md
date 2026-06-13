# Guia de Assets e Level Design — Brothers Burger: O Jogo

Este guia diz **exatamente** o que produzir para substituir os placeholders (os quadrados
coloridos) pela arte, som e fases finais.

> **Regra de ouro:** se o arquivo novo tiver o **mesmo nome**, o **mesmo tamanho** e a
> **mesma ordem de quadros** descritos aqui, é só substituir o arquivo — **não precisa
> mexer em nenhuma linha de código**. Troca e pronto.

---

## 1. Onde ficam os arquivos

```
public/
  assets/
    sprites/      → personagens, inimigos, chefes, itens, logo
    tilesets/     → blocos dos cenários
    tilemaps/     → as 4 fases (arquivos .json do Tiled)
    audio/        → músicas
    audio/sfx/    → efeitos sonoros
```

Estilo geral: **pixel art 16-bit (estética SNES)**. Fundo dos sprites **transparente** (PNG com alpha).

---

## 2. Sprites (pasta `sprites/`)

Cada arquivo é um **spritesheet**: vários quadros lado a lado, todos do mesmo tamanho,
da esquerda para a direita. A ordem dos quadros **importa** — é ela que o jogo usa para
as animações.

### 2.1 Personagens — `char1.png` e `char2.png`
- **Tamanho de cada quadro:** 16×24 px
- **Total de quadros:** 12 (folha final = 192×24 px)

| Quadro | O que desenhar |
|:---:|---|
| 0 | Parado — forma **pequena** |
| 1–4 | Andando — forma pequena (ciclo de caminhada) |
| 5 | Pulando — forma pequena |
| 6–7 | Pulando girando (spin) |
| 8 | Parado — forma **grande** (depois do cogumelo) |
| 9–11 | Andando — forma grande |

> Obs.: os quadros de pulo (5) e giro (6–7) são usados nas duas formas (pequena e grande).
> Faça-os legíveis nos dois tamanhos. `char1` e `char2` são os dois hambúrgueres jogáveis.

### 2.2 Inimigos — `enemies.png`
- **Tamanho de cada quadro:** 16×16 px
- **Total de quadros:** 9 (folha final = 144×16 px)

| Quadro | Inimigo / estado |
|:---:|---|
| 0–1 | Picles Gosmento — andando |
| 2 | Picles — amassado (ao ser pisado) |
| 3–4 | Cebola Roxa Ácida — andando |
| 5–6 | Mosca de Carne — voando |
| 7–8 | Refrigerante Explosivo — parado / pavio aceso |

### 2.3 Chefes — `bosses.png`
- **Tamanho de cada quadro:** 32×32 px
- **Total de quadros:** 9 (folha final = 288×32 px)

| Quadro | Chefe / estado |
|:---:|---|
| 0–1 | Hambúrguer Monstro — andando |
| 2 | Hambúrguer Monstro — levando dano |
| 3 | Bola de gordura (o projétil que ele cospe) |
| 4–5 | Gordão Esfomeado — andando |
| 6–7 | Gordão Esfomeado — investindo (corrida) |
| 8 | Gordão Esfomeado — levando dano |

### 2.4 Power-ups — `powerups.png`
- **Tamanho de cada quadro:** 16×16 px · **Total:** 3 (48×16 px)

| Quadro | Item |
|:---:|---|
| 0 | Cogumelo Burger (deixa gigante) |
| 1 | Batata Crua (habilita arremesso) |
| 2 | Estrela (invencibilidade 10s) |

### 2.5 Coletáveis — `collectibles.png`
- **Tamanho de cada quadro:** 16×16 px · **Total:** 7 (112×16 px)

| Quadro | Item |
|:---:|---|
| 0 | Pão |
| 1 | Alface |
| 2 | Tomate |
| 3 | Molho |
| 4 | Bacon |
| 5 | Hambúrguer |
| 6 | Batata frita (a "moedinha") |

### 2.6 Logo — `ui.png`
Logo da Brothers Burger para a tela inicial. Tamanho livre (sugestão ~256×256 px).

---

## 3. Cenários / Tilesets (pasta `tilesets/`)

Um por fase, com a mesma "pele" visual do ambiente:

| Arquivo | Ambiente |
|---|---|
| `cozinha.png` | Fase 1 — Cozinha |
| `rua.png` | Fase 2 — Rua |
| `mercado.png` | Fase 3 — Mercado |
| `restaurante.png` | Fase 4 — Restaurante Rival |

- **Formato:** imagem com blocos de **16×16 px** em grade. A folha placeholder é 64×64
  (16 blocos), mas pode ser maior se você quiser mais variações de bloco.
- **Bloco mais importante:** o **primeiro bloco (canto superior esquerdo)** é o
  **chão/plataforma sólida** — é nele que o personagem pisa. Os demais blocos são
  decoração (paredes, detalhes, fundo).

---

## 4. Fases / Mapas (pasta `tilemaps/`)

As 4 fases (`fase1.json` … `fase4.json`) são desenhadas no **[Tiled Editor](https://www.mapeditor.org/)**
(gratuito) e exportadas em **JSON**. O jogo lê duas coisas do mapa: **onde tem chão** e
**onde fica cada objeto** (personagem, inimigos, itens, fim de fase).

### 4.1 Configuração do mapa no Tiled
- Tamanho do tile: **16×16 px**.
- Altura sugerida: **28 tiles** (≈ a altura da tela). Largura à vontade (quanto maior,
  mais longa a fase — a câmera acompanha o jogador).
- Importe o tileset da fase (ex.: `cozinha.png`) no próprio mapa (**tileset embutido**,
  não externo).
- No tileset, marque o **bloco do chão** com uma propriedade booleana
  **`collides = true`**. É isso que faz o personagem não atravessar o chão.

### 4.2 Camadas (os nomes precisam ser exatamente estes)
| Camada | Tipo | Para quê |
|---|---|---|
| `Ground` | Tile Layer | O desenho do chão/plataformas (blocos com `collides`) |
| `Objects` | Object Layer | Marcações de spawn, fim de fase, itens e inimigos |

### 4.3 Objetos da camada `Objects`
Cada objeto é um retângulo posicionado no mapa. O jogo decide o que é cada um pelo campo
**Type** (Tipo) do objeto. Use exatamente estes valores:

| Type | O que vira no jogo |
|---|---|
| `spawn` | Onde o personagem começa (use **Name = `spawn`**) |
| `goal` | Bandeira de fim de fase (use **Name = `goal`**) |
| `fries` | Batata frita (moedinha) |
| `pao`, `alface`, `tomate`, `molho`, `bacon`, `hamburger` | Os 6 ingredientes |
| `mushroom` | Cogumelo Burger |
| `potato_raw` | Batata Crua |
| `star` | Estrela (invencibilidade) |
| `picles`, `cebola`, `mosca`, `refrigerante` | Os inimigos |

Coloque quantos quiser de cada. Posicione os itens sobre o chão/plataformas e os inimigos
no caminho do jogador.

### 4.4 Sobre os chefes (fases 2 e 4)
Hoje o chefe **aparece sozinho** ao chegar perto do fim, em posição fixa. Quando você for
desenhar as fases 2 e 4, me avise: eu troco para o chefe nascer num objeto do mapa
(ex.: `Type = boss`), aí você posiciona a arena do chefe onde quiser. É um ajuste rápido
de código.

---

## 5. Áudio (pastas `audio/` e `audio/sfx/`)

Estilo **chiptune 8-bit**. Hoje são silêncios; substitua pelos sons reais mantendo os nomes.

**Músicas (loop) — `audio/`:**
| Arquivo | Quando toca |
|---|---|
| `fase1.wav` | Fase 1 (Cozinha) |
| `fase2.wav` | Fase 2 (Rua) |
| `fase3.wav` | Fase 3 (Mercado) |
| `fase4.wav` | Fase 4 (Restaurante) |
| `boss.wav` | (reservado para luta de chefe) |

**Efeitos — `audio/sfx/`:**
| Arquivo | Ação |
|---|---|
| `jump.wav` | Pulo |
| `collect.wav` | Pegar ingrediente / batata |
| `powerup.wav` | Pegar power-up / vencer chefe |
| `damage.wav` | Tomar dano |
| `defeat.wav` | (reservado) |

> Os arquivos são `.wav`. Se você só tiver `.mp3` ou `.ogg`, pode usar — só me avise para
> eu trocar a extensão no carregamento (1 linha por som).

---

## 6. Como testar e publicar

**Testar no seu PC** (vê na hora, sem publicar):
```bash
npm run dev
```
Abre em `http://localhost:3000`.

**Publicar para o link do QR** (vai pro ar automático):
```bash
git add .
git commit -m "feat: arte/som/fases finais"
git push
```
Em ~1 minuto o GitHub republica sozinho em
`https://marcospdosantos-cmyk.github.io/JogoBrothers_V2-4/`.

---

## 7. Checklist de produção

- [ ] `char1.png`, `char2.png` (12 quadros, 16×24)
- [ ] `enemies.png` (9 quadros, 16×16)
- [ ] `bosses.png` (9 quadros, 32×32)
- [ ] `powerups.png` (3 quadros, 16×16)
- [ ] `collectibles.png` (7 quadros, 16×16)
- [ ] `ui.png` (logo)
- [ ] `cozinha.png`, `rua.png`, `mercado.png`, `restaurante.png` (tilesets, bloco 0 = chão)
- [ ] `fase1.json` … `fase4.json` (Tiled: camadas `Ground` + `Objects`)
- [ ] 5 músicas + 5 efeitos (`audio/` e `audio/sfx/`)
- [ ] Definir o **5º inimigo** (ainda em aberto)
