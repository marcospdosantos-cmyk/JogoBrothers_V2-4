// tests/services/PlayerService.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/config/supabase.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '../../src/config/supabase.js';
import { PlayerService } from '../../src/services/PlayerService.js';

describe('PlayerService', () => {
  let svc;
  beforeEach(() => {
    svc = new PlayerService();
    vi.clearAllMocks();
  });

  it('create() returns player data', async () => {
    const mockPlayer = { id: 'abc', nome: 'João', sobrenome: 'Silva', telefone: '11999999999' };
    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockPlayer, error: null }),
        }),
      }),
    });

    const result = await svc.create('João', 'Silva', '11999999999');
    expect(result).toEqual(mockPlayer);
  });

  it('create() throws on error', async () => {
    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
        }),
      }),
    });

    await expect(svc.create('João', 'Silva', '11999')).rejects.toThrow('DB error');
  });
});
