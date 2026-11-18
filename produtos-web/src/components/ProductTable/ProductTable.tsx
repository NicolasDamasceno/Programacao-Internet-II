import type { ReactElement } from 'react';
import type { Product } from '../../types/product';
import { ProductCategoryRow } from '../ProductCategoryRow/ProductCategoryRow';
import { ProductRow } from '../ProductRow/ProductRow';
import styles from './ProductTable.module.css';

type ProductTableProps = {
  products: Product[];
  filterText: string;
  inStockOnly: boolean;
};

export function ProductTable({ products, filterText, inStockOnly }: ProductTableProps) {
  const rows: ReactElement[] = [];
  let lastCategory: string | null = null;
  const query = filterText.toLowerCase();

  products.forEach((product) => {
    if (!product.name.toLowerCase().includes(query)) {
      return;
    }
    if (inStockOnly && !product.stocked) {
      return;
    }
    if (product.category !== lastCategory) {
      rows.push(<ProductCategoryRow category={product.category} key={product.category} />);
    }
    rows.push(<ProductRow product={product} key={product.name} />);
    lastCategory = product.category;
  });

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.header}>Name</th>
          <th className={styles.header}>Price</th>
        </tr>
      </thead>
      <tbody>
        {rows.length > 0 ? (
          rows
        ) : (
          <tr>
            <td className={styles.empty} colSpan={2}>
              Nenhum produto encontrado.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
