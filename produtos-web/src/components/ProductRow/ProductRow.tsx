import type { Product } from '../../types/product';
import styles from './ProductRow.module.css';

type ProductRowProps = {
  product: Product;
};

export function ProductRow({ product }: ProductRowProps) {
  return (
    <tr className={styles.row}>
      <td className={product.stocked ? styles.name : `${styles.name} ${styles.outOfStock}`}>
        {product.name}
      </td>
      <td className={styles.price}>{product.price}</td>
    </tr>
  );
}
