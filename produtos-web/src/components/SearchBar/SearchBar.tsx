import styles from './SearchBar.module.css';

type SearchBarProps = {
  filterText: string;
  inStockOnly: boolean;
  onFilterTextChange: (value: string) => void;
  onInStockOnlyChange: (value: boolean) => void;
};

// Passo 5: fluxo de dados inverso — SearchBar recebe callbacks do pai
// para atualizar o estado que pertence a FilterableProductTable.
export function SearchBar({
  filterText,
  inStockOnly,
  onFilterTextChange,
  onInStockOnlyChange,
}: SearchBarProps) {
  return (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
      <input
        className={styles.input}
        type="text"
        value={filterText}
        placeholder="Search..."
        aria-label="Buscar produto"
        onChange={(e) => onFilterTextChange(e.target.value)}
      />
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => onInStockOnlyChange(e.target.checked)}
        />
        Only show products in stock
      </label>
    </form>
  );
}
