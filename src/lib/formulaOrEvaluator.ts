/**
 * Sistema de avaliação de fórmulas com operador OR e cache em cascata
 * Suporta múltiplas sub-fórmulas alternativas com prioridade da esquerda para direita
 */

interface FormulaCache {
  [variableName: string]: number; // índice da sub-fórmula que funcionou
}

// Cache global em memória (será reinicializado ao trocar de versão)
let formulaCache: FormulaCache = {};

/**
 * Limpa o cache de fórmulas (chamar ao trocar de versão/configuração)
 */
export function clearFormulaCache() {
  formulaCache = {};
}

/**
 * Extrai todas as referências de variáveis de uma fórmula
 * Exemplo: "[1.1] + [1.2] * 2" retorna ["1.1", "1.2"]
 */
export function extractVariableReferences(formula: string): string[] {
  const references: string[] = [];
  const regex = /\[([^\]]+)\]/g;
  let match;
  
  while ((match = regex.exec(formula)) !== null) {
    references.push(match[1]);
  }
  
  return [...new Set(references)]; // Remove duplicados
}

/**
 * Verifica se uma fórmula contém o operador OR
 */
export function isOrFormula(formula: string | null): boolean {
  if (!formula) return false;
  return /\s+OR\s+/i.test(formula);
}

/**
 * Divide uma fórmula OR em sub-fórmulas
 * Máximo de 5 sub-fórmulas permitidas
 */
export function parseOrFormula(formula: string): string[] {
  const subFormulas = formula.split(/\s+OR\s+/i).map(f => f.trim());
  
  if (subFormulas.length > 5) {
    throw new Error('Máximo de 5 sub-fórmulas permitidas');
  }
  
  return subFormulas;
}

/**
 * Verifica se uma sub-fórmula pode ser avaliada
 * (todas as variáveis referenciadas existem e têm valores)
 */
export function canEvaluateSubFormula(
  subFormula: string,
  getValueFn: (accountCode: string) => number | null
): boolean {
  const references = extractVariableReferences(subFormula);
  
  // Se for apenas um número, pode avaliar
  if (references.length === 0) {
    const num = parseFloat(subFormula);
    return !isNaN(num);
  }
  
  // Verificar se todas as variáveis têm valores válidos
  return references.every(ref => {
    const value = getValueFn(ref);
    return value !== null && value !== undefined && !isNaN(value);
  });
}

/**
 * Detecta referências circulares em fórmulas
 */
export function detectCircularReference(
  variableName: string,
  formula: string,
  getAllVariables: () => Array<{ account_code: string; formula: string | null }>
): boolean {
  const visited = new Set<string>();
  const stack = new Set<string>();
  
  function dfs(varName: string): boolean {
    if (stack.has(varName)) return true; // Ciclo detectado!
    if (visited.has(varName)) return false;
    
    visited.add(varName);
    stack.add(varName);
    
    const variables = getAllVariables();
    const variable = variables.find(v => v.account_code === varName);
    
    if (variable?.formula) {
      const references = extractVariableReferences(variable.formula);
      for (const ref of references) {
        if (dfs(ref)) return true;
      }
    }
    
    stack.delete(varName);
    return false;
  }
  
  // Testar com a nova fórmula
  const references = extractVariableReferences(formula);
  for (const ref of references) {
    if (dfs(ref)) return true;
  }
  
  return false;
}

/**
 * Avalia uma fórmula OR com sistema de cache em cascata
 */
export function evaluateOrFormula(
  variableName: string,
  formula: string,
  evaluateSimpleFormula: (subFormula: string) => number,
  getValueFn: (accountCode: string) => number | null
): number {
  const subFormulas = parseOrFormula(formula);
  
  // 1. TENTATIVA RÁPIDA: usar cache
  const cachedIndex = formulaCache[variableName];
  if (cachedIndex !== undefined && cachedIndex < subFormulas.length) {
    if (canEvaluateSubFormula(subFormulas[cachedIndex], getValueFn)) {
      try {
        return evaluateSimpleFormula(subFormulas[cachedIndex]);
      } catch (e) {
        // Se falhar, continuar para cascata
        console.warn(`Cache hit failed for ${variableName}, falling back to cascade`, e);
      }
    }
  }
  
  // 2. CASCATA: testar todas até encontrar válida
  for (let i = 0; i < subFormulas.length; i++) {
    if (canEvaluateSubFormula(subFormulas[i], getValueFn)) {
      try {
        const result = evaluateSimpleFormula(subFormulas[i]);
        formulaCache[variableName] = i; // atualizar cache
        return result;
      } catch (e) {
        console.warn(`Sub-formula ${i} evaluation failed for ${variableName}:`, e);
        continue; // Tentar próxima sub-fórmula
      }
    }
  }
  
  // Nenhuma sub-fórmula válida encontrada
  console.warn(`No valid sub-formula found for ${variableName}`);
  return 0;
}

/**
 * Valida uma fórmula OR antes de guardar
 */
export function validateOrFormula(
  formula: string,
  variableName?: string,
  getAllVariables?: () => Array<{ account_code: string; formula: string | null }>
): { valid: boolean; error?: string } {
  // Validar sintaxe básica
  if (!formula.trim()) {
    return { valid: false, error: 'Fórmula não pode estar vazia' };
  }
  
  // Se não contém OR, não há validação especial
  if (!isOrFormula(formula)) {
    return { valid: true };
  }
  
  // Validar número de sub-fórmulas
  try {
    const subFormulas = parseOrFormula(formula);
    
    if (subFormulas.length < 2) {
      return { valid: false, error: 'Fórmula OR deve ter pelo menos 2 sub-fórmulas' };
    }
    
    // Validar cada sub-fórmula não está vazia
    for (let i = 0; i < subFormulas.length; i++) {
      if (!subFormulas[i].trim()) {
        return { valid: false, error: `Sub-fórmula ${i + 1} não pode estar vazia` };
      }
    }
    
    // Validar referências circulares se possível
    if (variableName && getAllVariables) {
      if (detectCircularReference(variableName, formula, getAllVariables)) {
        return { valid: false, error: 'Referência circular detectada!' };
      }
    }
    
    return { valid: true };
  } catch (e: any) {
    return { valid: false, error: e.message };
  }
}
