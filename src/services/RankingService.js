// src/services/RankingService.js
import { supabase } from '../config/supabase.js';

export class RankingService {
  async saveScore(jogadorId, score, personagem) {
    const { data, error } = await supabase
      .from('pontuacoes')
      .insert({ jogador_id: jogadorId, score, personagem })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getTopTen() {
    const { data, error } = await supabase
      .from('pontuacoes')
      .select('score, jogadores(nome, sobrenome)')
      .order('score', { ascending: false })
      .limit(200);
    if (error) throw error;

    const best = {};
    for (const row of data) {
      const key = `${row.jogadores.nome} ${row.jogadores.sobrenome}`;
      if (!best[key] || best[key] < row.score) best[key] = row.score;
    }
    return Object.entries(best)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  async getPlayerBestScore(jogadorId) {
    const { data, error } = await supabase
      .from('pontuacoes')
      .select('score')
      .eq('jogador_id', jogadorId)
      .order('score', { ascending: false })
      .limit(1)
      .single();
    if (error || !data) return 0;
    return data.score;
  }

  async getPlayerRank(jogadorId) {
    const { data, error } = await supabase
      .from('pontuacoes')
      .select('score, jogador_id')
      .order('score', { ascending: false });
    if (error) return null;
    const best = {};
    for (const row of data) {
      if (!best[row.jogador_id] || best[row.jogador_id] < row.score)
        best[row.jogador_id] = row.score;
    }
    const sorted = Object.keys(best).sort((a, b) => best[b] - best[a]);
    const idx = sorted.indexOf(jogadorId);
    return idx === -1 ? null : idx + 1;
  }
}
