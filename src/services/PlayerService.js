// src/services/PlayerService.js
import { supabase } from '../config/supabase.js';

export class PlayerService {
  async create(nome, sobrenome, telefone) {
    const { data, error } = await supabase
      .from('jogadores')
      .insert({ nome, sobrenome, telefone })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
