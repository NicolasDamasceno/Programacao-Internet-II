# Mini-Prontuário

Projeto-fio da **Semana 01** de Programação para Internet II (TEC.1052) — IFPI, Campus Teresina Central.

Um prontuário eletrônico deliberadamente pequeno: **pacientes** e, ao final da semana, **atendimentos**. O vocabulário (`Patient`, `Encounter`) é inspirado no padrão HL7 FHIR — não vamos implementar FHIR, apenas nomear como o mercado nomeia.

---

## Antes da primeira aula

```bash
node -v          # precisa ser 22 ou maior
npm install
npm run db:reset # cria database/prontuario.db com 8 pacientes fictícios
npm run dev      # sobe em http://localhost:3000
```

Abra <http://localhost:3000>. Você deve ver o cabeçalho do Mini-Prontuário, o campo de busca e **uma lista vazia** — isso é esperado: as lacunas de código ainda não foram preenchidas.

Teste também <http://localhost:3000/api/health> — deve responder `{"status":"ok"}`.

### Extensões recomendadas do VS Code

| Extensão | Para quê |
|---|---|
| REST Client (`humao.rest-client`) | Executar o `requests.http` sem sair do editor |
| SQLite Viewer (`qwtel.sqlite-viewer`) | Abrir `database/prontuario.db` e ver as tabelas |
| Error Lens (`usernamehw.errorlens`) | Ver o erro do TypeScript na própria linha |

---

## Mapa do projeto

```
mini-prontuario/
├── database/
│   ├── schema.sql        estrutura das tabelas
│   ├── seed.sql          dados fictícios
│   └── prontuario.db     gerado por `npm run db:reset` (não versionado)
├── public/               tudo que o navegador recebe
│   ├── index.html        estrutura da página
│   ├── css/
│   │   ├── tokens.css    design tokens — as decisões de design com nome
│   │   ├── base.css      reset, tipografia, esqueleto
│   │   └── components.css componentes de domínio em BEM
│   ├── js/
│   │   ├── api.js        ÚNICO arquivo que fala com a rede
│   │   ├── state.js      o estado e as ações — não conhece o DOM
│   │   ├── render.js     desenha o estado — não decide nada
│   │   └── app.js        orquestra: evento → ação → estado → render
│   └── mock/patients.json  usado no Encontro 1
├── scripts/reset-db.ts
├── src/
│   ├── database.ts          conexão SQLite
│   ├── server.ts            monta o app e liga os routers
│   ├── routes/              só roteamento (patients, encounters)
│   ├── controllers/         traduz HTTP <-> domínio
│   ├── services/            SQL + regra de negócio
│   ├── errors/HttpError.ts  hierarquia de erros (400/404/409/422/413)
│   ├── middlewares/
│   │   ├── errorHandler.ts  todo erro da API sai por aqui, em um único formato
│   │   ├── validate.ts      middleware genérico de validação Zod
│   │   └── upload.ts        multer: nome de arquivo gerado no servidor, mimetype e tamanho
│   └── validation/          schemas Zod de entrada
├── uploads/                 fotos de paciente enviadas pelo endpoint de upload
└── requests.http            casos de teste da API
```

## O fluxo do frontend

```
  usuário digita
        │
        ▼
  app.js  ──chama──►  state.js       (a ação muda o estado)
                          │
                          │ notify()
                          ▼
                      render.js      (a tela é redesenhada)
                          │
                          ▼
                         DOM
```

**O estado muda. A tela é consequência.**

## Encounters (Atividade 01)

O recurso `Encounter` fecha a lacuna do "só cadastra gente": agora dá para
registrar um atendimento (`patientId`, `startedAt`, `chiefComplaint`, `notes`)
para cada paciente, na tela `paciente.html`.

### Por que a ordenação fica no SQL, não no JavaScript

`GET /api/patients/:id/encounters` devolve os atendimentos com
`ORDER BY started_at DESC` (mais recente primeiro). A ordenação foi decidida
no SQL, e não em `Array.prototype.sort()` no frontend, por dois motivos:

1. **O banco já teria que tocar em cada linha para devolvê-la** — pedir para
   ele devolver ordenado não custa uma segunda passada, é o mesmo `SELECT`.
   Ordenar de novo no JavaScript seria refazer um trabalho que o SQLite já fez.
2. **Menos estado para manter certo.** Se a ordenação fosse responsabilidade
   do frontend, toda vez que um atendimento fosse adicionado à lista em
   memória (sem recarregar a página) alguém teria que lembrar de reordenar.
   Deixando o banco garantir a ordem, o frontend só precisa exibir o array
   na ordem em que chegou — uma regra de negócio a menos para errar.

O mesmo raciocínio vale para o contador de atendimentos do cartão do
paciente (Nível 3): `GET /api/patients` calcula `encounterCount` com
`COUNT(e.id)` num `LEFT JOIN` com `encounters`, agrupado por paciente. Não
existe uma coluna `encounter_count` guardada em `patients` — guardar um
número que pode ficar desatualizado a cada `POST /encounters` seria abrir
espaço para o contador mentir. Calculado na hora, ele nunca pode divergir
do banco.

### O fluxo completo, com a API

O diagrama da seção anterior parava na renderização. Incluindo a chamada de
rede — que é o `fetch` escondido dentro de `api.js` — o ciclo de criar um
atendimento fica assim:

```
  usuário preenche o formulário
  e clica em "Registrar atendimento"
                │
                ▼
  patient-detail.js  ──chama──►  api.js               (createEncounter)
                                     │
                                     │ fetch POST /api/patients/:id/encounters
                                     ▼
                                 server.ts             (valida, grava no banco)
                                     │
                                     │ 201 Encounter  |  400 { error }
                                     ▼
  patient-detail.js  ◄──resolve/rejeita── api.js
        │
        │ setEncounters(...)  ou  setFormError(...)
        ▼
  patient-detail-state.js                              (a ação muda o estado)
        │
        │ notify()
        ▼
  patient-detail-render.js                              (a tela é redesenhada)
        │
        ▼
       DOM
```

**Mesma regra de sempre:** evento vira ação, ação muda estado, estado
notifica, render desenha. A API só entra como um detalhe de *como* a ação
busca ou grava o dado — quem decide o que a tela mostra continua sendo o
estado, nunca a resposta HTTP diretamente.

## Camadas, erros, validação e upload (Atividade C)

A API foi reorganizada em `Route → Controller → Service`, seguindo o mesmo
padrão do projeto de referência `projeto-base-camadas`:

- **Route** (`src/routes/`) só roteia: liga um verbo + caminho a uma função
  do controller (e, quando existe, a um middleware de validação/upload).
- **Controller** (`src/controllers/`) só traduz HTTP ↔ domínio: lê `req`,
  chama o Service, formata a resposta. Nenhuma regra de negócio mora aqui.
- **Service** (`src/services/`) só decide: SQL, regra de negócio, tradução
  `snake_case → camelCase`. Não conhece `req`/`res`.

Todo erro passa por um único ponto — `src/middlewares/errorHandler.ts` —,
sempre no formato:

```json
{ "error": { "message": "...", "statusCode": 404, "details": null } }
```

A criação de paciente valida a entrada com Zod (`src/validation/patients.schemas.ts`)
antes de chegar no controller. O endpoint `POST /api/patients/:id/photo`
aceita `image/jpeg` e `image/png` até 2MB, salvando o arquivo com um nome
gerado pelo servidor (nunca o nome original enviado pelo cliente).

### Justificativa arquitetural (Nível 3)

A fronteira entre Controller e Service ficou definida por uma regra simples:
**tudo que precisa de `req` ou `res` fica no Controller; tudo que decide algo
sobre o dado fica no Service.** Um exemplo concreto é `patientsController.uploadPhoto`
(`src/controllers/patients.controller.ts`): ele verifica se `request.file`
existe e lança `UnprocessableEntityError` quando não existe — essa é uma
checagem sobre a *requisição HTTP* (o multer preencheu `req.file` ou não),
não sobre o domínio. Já a checagem "o paciente com este id existe?" mora em
`patientsService.setPhoto` (`src/services/patients.service.ts`), porque essa
é uma pergunta sobre o *dado*, que faria sentido mesmo se a foto chegasse por
outro canal que não HTTP (uma fila, um script de importação em lote). Manter
essa fronteira evitou duplicar a checagem de "paciente existe" em cada rota
que toca em paciente.

## As lacunas

Procure por `TODO` no projeto. Elas estão numeradas na ordem em que serão resolvidas:

| Marca | Arquivo | Quando |
|---|---|---|
| `TODO STATE-1` | `public/js/state.js` | Encontro 1 — Prática 1 |
| `TODO RENDER-1` | `public/js/render.js` | Encontro 1 — Prática 1 |
| `TODO STATE-2` | `public/js/state.js` | Encontro 1 — Prática 2 |
| `TODO CSS-1` e `CSS-2` | `public/css/components.css` | Encontro 1 — Prática 3 |
| `TODO ATIVIDADE 1` | `database/schema.sql` | Atividade extraclasse |

## Regra de escopo

Além de `express`, `better-sqlite3`, `tsx`, `typescript` e Bootstrap por CDN,
a Atividade C (camadas, erros, validação e upload) acrescenta `zod` (validação
de entrada) e `multer` (upload de arquivo) — as duas únicas exceções, e só
para o que está descrito nesta seção.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `req.body` é `undefined` | Falta `app.use(express.json())`, ou o cliente não mandou `Content-Type: application/json` |
| `SQLITE_ERROR: no such table` | Rode `npm run db:reset` |
| `npm install` falha em `better-sqlite3` | Node desatualizado ou faltam ferramentas de build. Veja a seção de plano B no guia do professor |
| A página carrega mas a lista fica vazia | Esperado antes de resolver `TODO RENDER-1` |
| `Cannot use import statement outside a module` | Faltou `type="module"` na tag `<script>` |
