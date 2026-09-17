# Painel de Medicação

Atividade de laboratório — 90 minutos, em dupla, com apoio de IA em **modo chat apenas**.

## Antes de começar

```bash
node -v          # precisa ser 22 ou maior
npm install
npm run db:reset # cria database/prontuario.db com 3 prescrições fictícias
npm run dev      # sobe em http://localhost:3000
```

Abra <http://localhost:3000>. Você deve ver o formulário e a lista **vazia** — isso é esperado, a API de prescrições ainda não existe.

Teste também <http://localhost:3000/api/health> — deve responder `{"status":"ok"}`.

## O que já vem pronto

- `database/schema.sql`, `database/seed.sql`, `src/database.ts` — banco pronto, não mexa aqui
- `public/index.html`, `public/css/*` — estrutura visual pronta
- `public/js/*.js` — camada de comunicação, estado e render do CRUD de prescrições

## Camadas, erros e validação

O backend segue o mesmo padrão `Route → Controller → Service` do
Mini-Prontuário (`projeto-base-camadas`), adaptado ao recurso `medications`:

- `src/routes/medications.routes.ts` — só roteamento.
- `src/controllers/medications.controller.ts` — traduz HTTP ↔ domínio.
- `src/services/medications.service.ts` — SQL + regra de negócio.
- `src/errors/HttpError.ts` + `src/middlewares/errorHandler.ts` — todo erro
  sai no formato `{ "error": { "message", "statusCode", "details" } }`.
- `src/validation/medications.schemas.ts` + `src/middlewares/validate.ts` —
  validação de entrada com Zod na criação de prescrição.

Este painel não tem um recurso de "paciente" próprio (o nome do paciente é
só um campo de texto), por isso não existe aqui um endpoint de upload de
foto equivalente ao do Mini-Prontuário.

## Regra de escopo

Além de `express`, `better-sqlite3`, `tsx`, `typescript` e Bootstrap por CDN,
esta camada de refatoração acrescenta `zod` para validação de entrada.

## IA nesta atividade

**Chat apenas** (ChatGPT, Gemini, Claude). Nada de modo agente, Copilot autônomo, Cursor Agent ou "vibe coding". Você lê, digita e entende cada linha antes de seguir.
