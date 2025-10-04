import React, { useState } from 'react';
import { Package, Plus, Search, AlertTriangle, CreditCard as Edit, Trash2 } from 'lucide-react';
import { Product } from '../utils/types';

interface ProductsProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

const Products: React.FC<ProductsProps> = ({ 
  products, 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'milk-kefir' | 'water-kefir' | 'accessories'>('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || product.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getTypeLabel = (type: Product['type']) => {
    switch (type) {
      case 'milk-kefir': return 'Kéfir de lait';
      case 'water-kefir': return 'Kéfir d\'eau';
      case 'kombucha': return 'Kombucha';
      case 'cheese': return 'Fromages';
      case 'fermented-vegetables': return 'Légumes fermentés';
      case 'accessories': return 'Accessoires';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getTypeColor = (type: Product['type']) => {
    switch (type) {
      case 'milk-kefir': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'water-kefir': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'kombucha': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'cheese': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'fermented-vegetables': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'accessories': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '0 Ar';
    
    // Convertir en nombre entier et formater avec des espaces pour les milliers
    const nombre = parseInt(amount.toString());
    const formatted = nombre.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return formatted + ' Ar';
  };

  const lowStockProducts = products.filter(p => p.inStock <= p.minStock);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Produits</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Gérez votre catalogue de kéfir</p>
        </div>
        <button
          onClick={onAddProduct}
          className="flex items-center justify-center space-x-2 bg-sage-600 hover:bg-sage-700 text-white px-4 py-3 sm:py-2 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-sage-600/25 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm sm:text-base">Nouveau produit</span>
        </button>
      </div>

      {/* Alerte stock faible */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-medium text-amber-800 dark:text-amber-300 text-sm sm:text-base">
              Alerte stock faible ({lowStockProducts.length} produits)
            </h3>
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {lowStockProducts.map(product => (
              <span
                key={product.id}
                className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-300 text-xs sm:text-sm rounded-full truncate max-w-32 sm:max-w-none"
              >
                {product.name} ({product.inStock} restants)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recherche et filtres */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher des produits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent text-sm sm:text-base w-full lg:w-auto lg:flex-shrink-0"
        >
          <option value="all">Tous les types</option>
          <option value="milk-kefir">Kéfir de lait</option>
          <option value="water-kefir">Kéfir d'eau</option>
          <option value="kombucha">Kombucha</option>
          <option value="cheese">Fromages</option>
          <option value="fermented-vegetables">Légumes fermentés</option>
          <option value="accessories">Accessoires</option>
        </select>
      </div>

      {/* Grille des produits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun produit trouvé</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
              {searchTerm ? 'Essayez d\'ajuster vos critères de recherche' : 'Ajoutez votre premier produit'}
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
            >
              {/* En-tête du produit */}
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-sage-600 to-sage-700 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                      {product.name}
                    </h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getTypeColor(product.type)}`}>
                      {getTypeLabel(product.type)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={() => onEditProduct(product)}
                    className="p-2 text-gray-500 hover:text-sage-600 dark:hover:text-sage-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteProduct(product.id)}
                    className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 font-medium">
                {formatCurrency(product.price)} / {
                  product.unit === 'liter' ? 'litre' : 
                  product.unit === 'piece' ? 'pièce' : 
                  product.unit
                }
              </p>

              {/* Prix et stock */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Prix</span>
                  <span className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(product.price)} / {
                      product.unit === 'liter' ? 'litre' : 
                      product.unit === 'piece' ? 'pièce' : 
                      product.unit
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Stock</span>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${
                      product.inStock <= product.minStock 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-900 dark:text-white'
                    } text-sm sm:text-base`}>
                      {product.inStock}
                    </span>
                    {product.inStock <= product.minStock && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>

                {/* Barre de stock */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                  <div
                    className={`h-1.5 sm:h-2 rounded-full transition-all ${
                      product.inStock <= product.minStock
                        ? 'bg-red-500'
                        : product.inStock <= product.minStock * 2
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.min((product.inStock / (product.minStock * 3)) * 100, 100)}%`
                    }}
                  />
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Stock minimum: {product.minStock}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;