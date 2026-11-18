import { FilterableProductTable } from './components/FilterableProductTable/FilterableProductTable';
import { PRODUCTS } from './data/products';

export default function App() {
  return <FilterableProductTable products={PRODUCTS} />;
}
