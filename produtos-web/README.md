# produtos-web

Implementação do exemplo **[Thinking in React](https://react.dev/learn/thinking-in-react)** (tabela de produtos filtrável) com **Vite + React + TypeScript** e estilização com **CSS Modules**.

## Estrutura (hierarquia de componentes — Passo 1 do tutorial)

```
FilterableProductTable   (estado: filterText, inStockOnly)
├── SearchBar            (input de busca + checkbox "em estoque")
└── ProductTable         (filtra e agrupa por categoria)
    ├── ProductCategoryRow
    └── ProductRow       (produto fora de estoque em vermelho)
```

```
src/
├── components/<Componente>/<Componente>.tsx + .module.css
├── data/products.ts     # dados mockados (JSON do tutorial)
└── types/product.ts     # tipo Product
```

## Passos do tutorial aplicados

1. **Dividir a UI em hierarquia de componentes** — 5 componentes acima.
2. **Versão estática** — componentes recebem dados só por props.
3. **Estado mínimo** — apenas `filterText` e `inStockOnly`; a lista filtrada é derivada.
4. **Onde o estado vive** — em `FilterableProductTable`, ancestral comum de `SearchBar` e `ProductTable`.
5. **Fluxo de dados inverso** — `SearchBar` recebe `onFilterTextChange` / `onInStockOnlyChange`.

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
```

## Deploy (Vercel)

Importar o repositório na Vercel com **Root Directory = `produtos-web`**. Framework detectado: Vite (build `npm run build`, output `dist`).
