# ⚡ ACTION PLAN - 1 PÁGINA
## O que fazer AGORA para evoluir o UzzOPS

**Data:** 2026-02-07
**Tempo:** 30 min leitura + sprint de 2 semanas
**Status atual:** Sprint 2 completo (100%)
**Próximo:** Sprint 3

---

## 🎯 OBJETIVO

Transformar UzzOPS de sistema funcional → plataforma completa com **métricas preditivas**, **priorização objetiva** e **qualidade garantida**.

---

## 📊 SITUAÇÃO ATUAL VS DESTINO

| Aspecto | ✅ Hoje (Sprint 2) | 🎯 Após Sprint 3-6 |
|---------|-------------------|---------------------|
| **Velocity** | ❌ Não tem | ✅ Tracking + gráfico + tendência |
| **Burndown** | ❌ Não tem | ✅ Sprint + Release + forecast |
| **Priorização** | ⚠️ Manual | ✅ Planning Poker (BV/W) |
| **Qualidade** | ⚠️ DoD estático | ✅ INVEST + DoD evolutivo + Smells |
| **Backlog** | ⚠️ Lista plana | ✅ Mapas mentais + decomposição |
| **Melhoria** | ⚠️ Ad-hoc | ✅ Retros rastreadas |

---

## 🚀 PLANO DE AÇÃO (4 SPRINTS)

### **SPRINT 3 - Métricas (2 semanas) - COMEÇAR AGORA**

**4 Features críticas (22 pts):**

1. **Velocity Tracking** → Prever prazos com dados reais
2. **Burndown Charts** → Detectar atrasos cedo
3. **Forecast por Faixas** → Apresentar prazo honesto
4. **Scrum Health** → Alertas automáticos de problemas

**O que fazer segunda-feira:**
```bash
1. Ler QUICK_START_GUIDE.md (30 min)
2. Rodar migration 008_sprint_3_metrics.sql (10 min)
3. Implementar Velocity (código pronto no guia) (4-6h)
4. Demo para PO (1h)
```

**Resultado:** Sistema prevê prazos + detecta problemas automaticamente

---

### **SPRINT 4 - Priorização (2 semanas)**

**4 Features de qualidade (18 pts):**

1. **Planning Poker** → Priorizar com BV/W
2. **MVP Flag** → Clareza sobre essencial vs nice-to-have
3. **Retrospectives** → Rastrear melhorias
4. **INVEST Validation** → Histórias sempre executáveis

**Resultado:** Backlog priorizado objetivamente + melhoria contínua

---

### **SPRINT 5 - Backlog Avançado (2 semanas)**

**3 Features complexas (24 pts):**

1. **Mapas Mentais** → Visualização hierárquica
2. **Decomposição de Épicos** → Wizard guiado
3. **DoD Evolutivo** → Amadurece com o time

**Resultado:** Backlog visual + histórias sempre pequenas

---

### **SPRINT 6+ - Operacional**

**Features de dia-a-dia (16 pts):**

1. Daily Scrum Logger
2. Spike Tracking
3. Export Relatórios
4. Stealth Mode

**Resultado:** Operação fluida e documentada

---

## ⏱️ CRONOGRAMA REALISTA

```
HOJE          Sprint 3      Sprint 4      Sprint 5      Sprint 6
  │              │             │             │             │
  ├─ Setup ─────┤             │             │             │
  │   (1 dia)   │             │             │             │
  │             │             │             │             │
  ├─────────────┼─ Velocity ─┤             │             │
  │             │  (4 dias)   │             │             │
  │             │             │             │             │
  │             ├─ Burndown ─┤             │             │
  │             │  (4 dias)   │             │             │
  │             │             │             │             │
  │             ├─ Forecast ─┼─ Poker ─────┤             │
  │             │  (2 dias)   │  (5 dias)   │             │
  │             │             │             │             │
  │             ├─ Health ───┼─ MVP ───────┼─ Mapas ─────┤
  │             │  (3 dias)   │  (2 dias)   │  (8 dias)   │
  │             │             │             │             │
  └─────────────┴─────────────┴─────────────┴─────────────┴────→
     Semana 1      2-3          4-5          6-7          8-9
```

**Total:** ~9 semanas (2 meses) para sistema completo

---

## 📋 CHECKLIST DE HOJE

### Preparação (30 min)

- [ ] Ler `IMPLEMENTATION_ROADMAP.md` (overview completo)
- [ ] Ler `QUICK_START_GUIDE.md` (passo a passo)
- [ ] Verificar ambiente: `pnpm dev` funciona
- [ ] Acesso ao Supabase Dashboard

### Setup (30 min)

- [ ] Criar branch `feature/sprint-3-metrics`
- [ ] Rodar migration `008_sprint_3_metrics.sql`
- [ ] Instalar dependência: `pnpm add recharts`
- [ ] Criar estrutura de pastas (ver Quick Start)

### Primeiro Código (4-6h)

- [ ] Hook `useVelocity.ts` (copiar do Quick Start)
- [ ] API `/api/metrics/velocity/route.ts`
- [ ] Componente `VelocityChart.tsx`
- [ ] Página `/metrics/page.tsx`
- [ ] Link no Sidebar

### Validação (1h)

- [ ] `pnpm dev` roda sem erros
- [ ] `/metrics` carrega
- [ ] Gráfico aparece (ou mensagem apropriada)
- [ ] Commit + push

### Demo (1h)

- [ ] Mostrar para PO
- [ ] Colher feedback
- [ ] Ajustar se necessário

---

## 🎓 CONCEITOS-CHAVE (MEMORIZAR)

### Do Guia Scrum Cap. 8

**Velocity** = Story Points Done por Sprint
- **Usa para:** Prever prazo de releases
- **Estabiliza em:** 3-6 sprints
- **Fórmula:** `Prazo = Total Pontos / Velocity Média`

### Do Guia Scrum Cap. 7

**Smells** = Sinais de deterioração
- Sprint variável → Velocity inútil
- Carry-over > 30% → Planejamento ruim
- Done falso → Retrabalho explode

### Do Guia Scrum Cap. 5

**BV/W** = Business Value / Work Effort
- Alto valor + baixo esforço = Prioridade máxima
- Baixo valor + alto esforço = Vai pro fim

---

## 💰 ROI ESPERADO

### Dados dos Guias Scrum (Cap. 12):

**Baseline típico SEM Scrum:**
- Lead Time: 12-15 semanas
- Deploy: 1× por trimestre
- Bugs: 15 por release
- Satisfação time: 3/5

**Target COM Scrum (após 6 meses):**
- Lead Time: < 4 semanas (**-66%**)
- Deploy: 1× por Sprint (**+600%**)
- Bugs: < 5 por release (**-66%**)
- Satisfação: ≥ 4/5 (**+40%**)

### No UzzOPS especificamente:

**Ganhos estimados após Sprint 3:**
- ✅ Previsão de prazo realista (antes: chute)
- ✅ Detecção de atraso 5-7 dias antes (antes: surpresa)
- ✅ Alertas automáticos de problemas (antes: manual)
- ✅ Forecast honesto para stakeholder (antes: promessa fake)

---

## ⚠️ RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| **Time não tem tempo** | Alta | Start com 1 feature (Velocity). Resto depois. |
| **Migration falha** | Baixa | Backup banco antes. Testar em dev primeiro. |
| **PO não usa** | Média | Demo early & often. Mostrar valor cedo. |
| **Complexity creep** | Média | Seguir exatamente o código do guia. Não inventar. |

---

## 🎯 DECISÕES CRÍTICAS

### Você PRECISA decidir HOJE:

1. **Quando começar Sprint 3?**
   - ✅ Recomendado: Segunda-feira próxima
   - ⚠️ Não recomendado: "Quando der tempo" (nunca dá)

2. **Quem vai implementar?**
   - ✅ Se 1 dev: focar só em Velocity (Quick Win)
   - ✅ Se 2+ devs: paralelizar (Velocity + Burndown)

3. **Como validar sucesso?**
   - ✅ Sprint 3 Review: mostrar gráfico funcionando
   - ✅ Métrica: PO consegue prever prazo sem chutar

---

## 📞 PRÓXIMOS PASSOS

### Hoje (30 min):
1. Ler este documento ✓
2. Ler `QUICK_START_GUIDE.md`
3. Decidir data de início do Sprint 3

### Segunda-feira:
1. Planning A (PO + Time): escolher features
2. Planning B (Time): quebrar em tarefas
3. Começar US-3.1 (Velocity)

### Sexta-feira (Sprint 3 - Dia 10):
1. Sprint Review: demo
2. Retrospectiva: o que melhorar?
3. Planning Sprint 4

---

## 📚 DOCUMENTAÇÃO COMPLETA

1. **IMPLEMENTATION_ROADMAP.md** → Visão completa (30 min)
2. **QUICK_START_GUIDE.md** → Setup + primeiro código (30 min)
3. **SPRINT_4_DETAILED.md** → Próximo sprint (referência)
4. **008_sprint_3_metrics.sql** → Migration SQL (copiar/colar)

---

## ✅ CHECKLIST FINAL - ESTÁ PRONTO?

- [ ] Li este documento completo
- [ ] Entendi os 4 sprints (3→4→5→6)
- [ ] Sei o que fazer segunda-feira
- [ ] Tenho acesso ao Supabase
- [ ] Ambiente de dev funciona (`pnpm dev`)
- [ ] PO está alinhado
- [ ] Time está alocado
- [ ] Sprint 3 agendado

**Se TODOS ✅ → COMEÇAR SEGUNDA!**
**Se algum ❌ → Resolver HOJE para começar segunda.**

---

## 🎉 MENSAGEM FINAL

Você está a **10 dias** de ter um sistema que:
- Prevê prazos automaticamente
- Detecta problemas sozinho
- Prioriza por valor real
- Melhora continuamente

**O código está pronto.** (Ver Quick Start)
**A arquitetura está desenhada.** (Ver Roadmap)
**O SQL está escrito.** (Ver migration 008)

**Só falta:** EXECUTAR.

---

**BOA SORTE! 🚀**

*"O melhor jeito de prever o futuro é criá-lo."* - Peter Drucker

---

**Última atualização:** 2026-02-07
**Próxima revisão:** Após Sprint 3 Review
**Versão:** 1.0
