import styles from './ProductCategoryRow.module.css';

type ProductCategoryRowProps = {
  category: string;
};

export function ProductCategoryRow({ category }: ProductCategoryRowProps) {
  return (
    <tr>
      <th className={styles.category} colSpan={2}>
        {category}
      </th>
    </tr>
  );
}
