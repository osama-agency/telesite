import { useState, useEffect } from "react";
import { productsService } from "../../api/services";
import { Product } from "../../types";
import PageMeta from "../../components/common/PageMeta";
import { Package, TrendingUp, AlertTriangle, CheckCircle, DollarSign } from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusIcon = (product: Product) => {
    if (product.orderPoint) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (product.profitPercentTotal < 10) return <DollarSign className="h-4 w-4 text-amber-500" />;
    if (product.profitPercentTotal > 20) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <TrendingUp className="h-4 w-4 text-blue-500" />;
  };

  const getRowClass = (product: Product) => {
    if (product.orderPoint) return 'bg-red-50 dark:bg-red-950/10';
    if (product.profitPercentTotal < 10) return 'bg-amber-50 dark:bg-amber-950/10';
    if (product.profitPercentTotal > 20) return 'bg-green-50 dark:bg-green-950/10';
    return '';
  };

  return (
    <>
      <PageMeta
        title="Товары | TeleSite Analytics"
        description="Управление товарами и остатками"
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Товары</h1>
          <div className="flex gap-3">
            <button className="btn btn-primary flex items-center gap-2">
              <Package className="h-4 w-4" />
              Добавить товар
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Всего товаров</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Требуют заказа</p>
                <p className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.orderPoint).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">В доставке</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {products.reduce((sum, p) => sum + p.inDelivery, 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Общий остаток</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {products.reduce((sum, p) => sum + p.currentStock, 0)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                <tr>
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts(products.map(p => p.id));
                        } else {
                          setSelectedProducts([]);
                        }
                      }}
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Товар
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Цена продажи
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Себестоимость
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Чистая прибыль
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Остаток
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    В доставке
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      Нет данных
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className={`border-b border-gray-200 dark:border-gray-700 ${getRowClass(product)}`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts([...selectedProducts, product.id]);
                            } else {
                              setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                            }
                          }}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(product)}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-medium">{formatCurrency(product.averageSellingPrice)}</td>
                      <td className="p-4">{formatCurrency(product.costPriceRUB)}</td>
                      <td className={`p-4 font-medium ${product.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(product.netProfit)}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium
                          ${product.currentStock > 50 ? 'bg-green-100 text-green-800' :
                          product.currentStock > 20 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                          {product.currentStock} шт
                        </span>
                      </td>
                      <td className="p-4">{product.inDelivery} шт</td>
                      <td className="p-4">
                        {product.orderPoint ? (
                          <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                            Нужен заказ
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                            В норме
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
} 