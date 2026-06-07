// tests/services/RankingService.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/config/supabase.js', () => ({
  supabase: { from: vi.fn() },
}));

import { supabase } from '../../src/config/supabase.js';
import { RankingService } from '../../src/services/RankingService.js';

describe('RankingService', () => {
  let svc;
  beforeEach(() => { svc = new RankingService(); vi.clearAllMocks(); });

  it('saveScore() inserts and returns row', async () => {
    const row = { id: '1', jogador_id: 'abc', score: 1500, personagem: 1 };
    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: row, error: null }),
        }),
      }),
    });
    const result = await svc.saveScore('abc', 1500, 1);
    expect(result.score).toBe(1500);
  });

  it('getTopTen() returns ranked list deduped by player', async () => {
    const rows = [
      { score: 2000, jogadores: { nome: 'Ana', sobrenome: 'Lima' } },
      { score: 1000, jogadores: { nome: 'Bob', sobrenome: 'Cruz' } },
      { score: 1500, jogadores: { nome: 'Ana', sobrenome: 'Lima' } },
    ];
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: rows, error: null }),
        }),
      }),
    });
    const top = await svc.getTopTen();
    expect(top[0].name).toBe('Ana Lima');
    expect(top[0].score).toBe(2000);
    expect(top).toHaveLength(2);
  });
});
