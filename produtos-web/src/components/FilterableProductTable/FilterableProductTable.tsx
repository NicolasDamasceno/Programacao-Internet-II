import { useState } from 'react';
import type { Product } from '../../types/product';
import { SearchBar } from '../SearchBar/SearchBar';
import { ProductTable } from '../ProductTable/ProductTable';
import styles from './FilterableProductTable.module.css';

type FilterableProductTableProps = {
  products: Product[];
};

// Passo 4: o estado (texto do filtro e checkbox) mora no ancestral comum
// de SearchBar (que o altera) e ProductTable (que o lê).
export function FilterableProductTable({ products }: FilterableProductTableProps) {
  const [filterText, setFilterText] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Produtos</h1>
      <SearchBar
        filterText={filterText}
        inStockOnly={inStockOnly}
        onFilterTextChange={setFilterText}
        onInStockOnlyChange={setInStockOnly}
      />
      <ProductTable products={products} filterText={filterText} inStockOnly={inStockOnly} />
    </section>
  );
}
