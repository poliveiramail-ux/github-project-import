# Financial Simulation App - Project Export

Este documento contém toda a informação necessária para migrar este projeto para outra ferramenta de desenvolvimento.

---

## 📋 Visão Geral

Aplicação de simulação financeira construída com:
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn/UI
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Charts**: Recharts

---

## 📁 Estrutura do Projeto

```
├── src/
│   ├── components/
│   │   ├── financial/           # Componentes principais
│   │   │   ├── SimulationForm_v2.tsx   # Formulário principal (1599 linhas)
│   │   │   ├── DashboardsView.tsx      # Vista de dashboards
│   │   │   ├── SideMenu.tsx            # Menu lateral
│   │   │   ├── MasterDataManager.tsx   # Gestão de dados mestres
│   │   │   ├── ConfigurationForm.tsx   # Configurações
│   │   │   ├── VersionsManager.tsx     # Gestão de versões
│   │   │   ├── ProjectsManager.tsx     # Gestão de projetos
│   │   │   ├── LanguagesManager.tsx    # Gestão de idiomas
│   │   │   ├── ProgramsManager.tsx     # Gestão de LOBs
│   │   │   ├── HierarchyManager.tsx    # Gestão hierárquica
│   │   │   └── FormulaHelp.tsx         # Ajuda de fórmulas
│   │   └── ui/                  # Componentes Shadcn/UI
│   ├── hooks/
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── formulaOrEvaluator.ts  # Avaliador de fórmulas OR
│   │   └── utils.ts
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts          # Cliente Supabase
│   │       └── types.ts           # Tipos gerados
│   ├── pages/
│   │   ├── Index.tsx              # Página principal
│   │   └── NotFound.tsx
│   ├── index.css                  # Design system tokens
│   ├── App.tsx
│   └── main.tsx
├── tailwind.config.ts
├── vite.config.ts
└── supabase/
    └── config.toml
```

---

## 🎨 Design System (index.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 214 32% 97%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
    --primary: 221 83% 53%;
    --primary-foreground: 210 40% 98%;
    --secondary: 214 32% 91%;
    --secondary-foreground: 222 47% 11%;
    --muted: 214 32% 91%;
    --muted-foreground: 215 16% 47%;
    --accent: 217 91% 60%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 210 40% 98%;
    --border: 214 32% 88%;
    --input: 214 32% 91%;
    --ring: 221 83% 53%;
    --radius: 0.5rem;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}
```

---

## 🗄️ Database Schema (Supabase)

### Tabelas Principais

#### project
```sql
CREATE TABLE public.project (
  id_prj TEXT PRIMARY KEY,
  desc_prj TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### lang
```sql
CREATE TABLE public.lang (
  id_lang TEXT PRIMARY KEY,
  id_prj TEXT REFERENCES project(id_prj),
  desc_lang TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### lob (Line of Business)
```sql
CREATE TABLE public.lob (
  id_lob TEXT PRIMARY KEY,
  id_lang TEXT REFERENCES lang(id_lang),
  name TEXT NOT NULL,
  desc_lob TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### simulation_versions
```sql
CREATE TABLE public.simulation_versions (
  id_sim_ver UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  id_prj TEXT REFERENCES project(id_prj),
  is_base BOOLEAN DEFAULT false,
  status TEXT, -- 'Open', 'Closed', etc.
  notes TEXT,
  order_index INTEGER,
  data JSONB,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);
```

#### simulation_configs
```sql
CREATE TABLE public.simulation_configs (
  id_sim_cfg UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_prj TEXT REFERENCES project(id_prj),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);
```

#### simulation_configs_variables
```sql
CREATE TABLE public.simulation_configs_variables (
  id_sim_cfg_var UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_sim_cfg UUID REFERENCES simulation_configs(id_sim_cfg),
  id_proj TEXT NOT NULL,
  account_num TEXT NOT NULL,
  name TEXT NOT NULL,
  level INTEGER DEFAULT 0,
  parent_account_id UUID REFERENCES simulation_configs_variables(id_sim_cfg_var),
  calculation_type TEXT, -- 'MANUAL', 'FORMULA', 'AUTO'
  formula TEXT,
  value_type TEXT,
  data_origin TEXT,
  page_name TEXT,
  rollup TEXT, -- 'true', 'false', 'hidden'
  blocked BOOLEAN DEFAULT false,
  id_lang TEXT REFERENCES lang(id_lang),
  id_lob TEXT REFERENCES lob(id_lob),
  row_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### simulation
```sql
CREATE TABLE public.simulation (
  id_sim_ver UUID REFERENCES simulation_versions(id_sim_ver),
  id_sim_cfg_var UUID,
  id_proj TEXT NOT NULL,
  version_id TEXT NOT NULL,
  account_num TEXT NOT NULL,
  name TEXT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  value NUMERIC,
  value_orig NUMERIC,
  calculation_type TEXT,
  formula TEXT,
  level TEXT,
  parent_account_id TEXT,
  rollup TEXT,
  page_name TEXT,
  data_origin TEXT,
  value_type TEXT,
  id_lang TEXT,
  id_lob TEXT,
  row_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id_sim_ver, account_num, month, year, id_lang, id_lob)
);
```

#### dashboards
```sql
CREATE TABLE public.dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### variable_dashboards
```sql
CREATE TABLE public.variable_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID REFERENCES dashboards(id),
  variable_id UUID REFERENCES simulation_configs_variables(id_sim_cfg_var),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### detail_indicators
```sql
CREATE TABLE public.detail_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variable_id UUID,
  name TEXT NOT NULL,
  formula TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 📦 Dependências Principais

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.1",
    "@supabase/supabase-js": "^2.75.0",
    "@tanstack/react-query": "^5.83.0",
    "recharts": "^2.15.4",
    "tailwindcss": "^3.x",
    "tailwindcss-animate": "^1.0.7",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "lucide-react": "^0.462.0",
    "sonner": "^1.7.4",
    "date-fns": "^3.6.0",
    "zod": "^3.25.76",
    "react-hook-form": "^7.61.1",
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-*": "various versions"
  }
}
```

---

## 🔧 Ficheiros de Configuração

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

---

## 🧮 Lógica de Fórmulas OR (formulaOrEvaluator.ts)

Sistema de avaliação de fórmulas com operador OR e cache em cascata.

```typescript
// Suporta múltiplas sub-fórmulas alternativas com prioridade da esquerda para direita
// Exemplo: "[1.1] + [1.2] OR [2.1] * 2 OR 0"

interface FormulaCache {
  [variableName: string]: number; // índice da sub-fórmula que funcionou
}

let formulaCache: FormulaCache = {};

export function clearFormulaCache() {
  formulaCache = {};
}

export function extractVariableReferences(formula: string): string[] {
  const references: string[] = [];
  const regex = /\[([^\]]+)\]/g;
  let match;
  while ((match = regex.exec(formula)) !== null) {
    references.push(match[1]);
  }
  return [...new Set(references)];
}

export function isOrFormula(formula: string | null): boolean {
  if (!formula) return false;
  return /\s+OR\s+/i.test(formula);
}

export function parseOrFormula(formula: string): string[] {
  const subFormulas = formula.split(/\s+OR\s+/i).map(f => f.trim());
  if (subFormulas.length > 5) {
    throw new Error('Máximo de 5 sub-fórmulas permitidas');
  }
  return subFormulas;
}

export function canEvaluateSubFormula(
  subFormula: string,
  getValueFn: (accountCode: string) => number | null
): boolean {
  const references = extractVariableReferences(subFormula);
  if (references.length === 0) {
    return !isNaN(parseFloat(subFormula));
  }
  return references.every(ref => {
    const value = getValueFn(ref);
    return value !== null && value !== undefined && !isNaN(value);
  });
}

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
        console.warn(`Cache hit failed for ${variableName}`);
      }
    }
  }
  
  // 2. CASCATA: testar todas até encontrar válida
  for (let i = 0; i < subFormulas.length; i++) {
    if (canEvaluateSubFormula(subFormulas[i], getValueFn)) {
      try {
        const result = evaluateSimpleFormula(subFormulas[i]);
        formulaCache[variableName] = i;
        return result;
      } catch (e) {
        continue;
      }
    }
  }
  
  return 0;
}
```

---

## 🖼️ Componente Principal: SimulationForm_v2

### Funcionalidades:
1. **Multi-versão**: Suporte a seleção de múltiplas versões simultaneamente
2. **Filtros hierárquicos**: Project → Language → LOB
3. **DrillDown/RollUp**: Agregação e detalhamento por Language e LOB
4. **Tabs dinâmicas**: Baseadas em page_name das variáveis
5. **Tab Dashboards**: Com gráfico waterfall integrado
6. **Edição inline**: Para variáveis leaf de tipo MANUAL
7. **Comparação de valores**: Original vs atual

### Interfaces principais:
```typescript
interface Variable {
  uniqueId: string;
  version_id: string;
  account_code: string;
  name: string;
  calculation_type: 'MANUAL' | 'FORMULA';
  formula: string | null;
  month: number;
  year: number;
  lob: string;
  id_lang: string;
  level: number;
  parent_account_id?: string | null;
  id_sim_cfg_var: string;
  value?: number;
  value_orig?: number;
  row_index: number;
  page_name?: string;
  rollup?: string;
}

interface VersionData {
  versionId: string;
  versionName: string;
  variables: Variable[];
  periods: MonthYear[];
}
```

---

## 📊 Waterfall Chart

Implementado com Recharts, mostra:
- Barras verdes para valores positivos
- Barras vermelhas para valores negativos
- Barra azul (primary) para o total
- Posicionamento em stack para efeito waterfall

---

## 🔑 Variáveis de Ambiente

```env
SUPABASE_URL=https://bvarolppmfsljzeiivba.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 Notas de Migração

1. **Supabase**: Exportar schema e dados via pg_dump ou Supabase dashboard
2. **Tipos**: O ficheiro `types.ts` é gerado automaticamente pelo Supabase CLI
3. **Componentes UI**: Usar Shadcn/UI (https://ui.shadcn.com/)
4. **Estado**: Usar React hooks nativos (useState, useEffect, useMemo)
5. **Queries**: Usar @tanstack/react-query para cache e invalidation

---

## 📂 Ficheiros Completos

Os ficheiros fonte estão disponíveis no repositório. Os principais são:
- `src/components/financial/SimulationForm_v2.tsx` (1599 linhas)
- `src/lib/formulaOrEvaluator.ts`
- `src/index.css`
- `tailwind.config.ts`

---

*Documento gerado em: 2025-12-28*
