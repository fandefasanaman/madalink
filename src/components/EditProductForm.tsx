import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, Hash, AlertTriangle, Save } from 'lucide-react';
import { Product } from '../utils/types';

interface EditProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (product: Product) => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'milk-kefir' as Product['type'],
    customType: '',
    description: '',
    price: '',
    unit: 'liter' as Product['unit'],
    customUnit: '',
    inStock: '',
    minStock: ''
  });
  const [useCustomType, setUseCustomType] = useState(false);
  const [useCustomUnit, setUseCustomUnit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      // Vérifier si le type ou l'unité sont personnalisés
      const isCustomType = !productTypes.some(t => t.value === product.type);
      const isCustomUnit = !units.some(u => u.value === product.unit);
      
      setFormData({
        name: product.name,
        type: isCustomType ? 'milk-kefir' : product.type,
        customType: isCustomType ? product.type : '',
        description: product.description,
        price: product.price.toString(),
        unit: isCustomUnit ? 'liter' : product.unit,
        customUnit: isCustomUnit ? product.unit : '',
        inStock: product.inStock.toString(),
        minStock: product.minStock.toString()
      });
      setUseCustomType(isCustomType);
      setUseCustomUnit(isCustomUnit);
    }
  }, [product]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!product || !formData.name.trim() || !formData.price || !formData.inStock || !formData.minStock) return;
    
    setIsSaving(true);
    
    // Utiliser le type personnalisé si défini, sinon le type sélectionné
    const productType = useCustomType && formData.customType.trim() 
      ? formData.customType.trim() as Product['type']
      : formData.type;
    
    // Utiliser l'unité personnalisée si définie, sinon l'unité sélectionnée
    const productUnit = useCustomUnit && formData.customUnit.trim()
      ? formData.customUnit.trim() as Product['unit']
      : formData.unit;
    
    const updatedProduct: Product = {
      ...product,
      name: formData.name.trim(),
      type: productType,
      description: formData.description.trim(),
      price: parseInt(formData.price),
      unit: productUnit,
      inStock: parseInt(formData.inStock),
      minStock: parseInt(formData.minStock)
    };
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSave(updatedProduct);
    setIsSaving(false);
    onClose();
  };

  const productTypes = [
    { value: 'milk-kefir', label: 'Kéfir de lait' },
    { value: 'water-kefir', label: 'Kéfir d\'eau' },
    { value: 'kombucha', label: 'Kombucha' },
    { value: 'cheese', label: 'Fromages' },
    { value: 'fermented-vegetables', label: 'Légumes fermentés' },
    { value: 'accessories', label: 'Accessoires' }
  ];

  const units = [
    { value: 'liter', label: 'Litre' },
    { value: 'piece', label: 'Pièce' }
  ];

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Modifier le produit</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Package className="w-4 h-4 inline mr-1" />
                Nom du produit *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Kéfir de lait traditionnel"
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de produit *
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setUseCustomType(false)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      !useCustomType
                        ? 'bg-sage-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Prédéfini
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCustomType(true)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      useCustomType
                        ? 'bg-sage-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Personnalisé
                  </button>
                </div>
                {!useCustomType ? (
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  >
                    {productTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.customType}
                    onChange={(e) => handleInputChange('customType', e.target.value)}
                    placeholder="Ex: Yaourt fermenté, Boisson probiotique..."
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unité de vente *
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setUseCustomUnit(false)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      !useCustomUnit
                        ? 'bg-sage-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Prédéfini
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCustomUnit(true)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      useCustomUnit
                        ? 'bg-sage-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Personnalisé
                  </button>
                </div>
                {!useCustomUnit ? (
                  <select
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  >
                    {units.map(unit => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.customUnit}
                    onChange={(e) => handleInputChange('customUnit', e.target.value)}
                    placeholder="Ex: bouteille, pot, sachet, kg..."
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Description du produit, ingrédients, bienfaits..."
              rows={3}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Prix et stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Prix (Ariary) *
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="9000"
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Hash className="w-4 h-4 inline mr-1" />
                Stock actuel *
              </label>
              <input
                type="number"
                min="0"
                value={formData.inStock}
                onChange={(e) => handleInputChange('inStock', e.target.value)}
                placeholder="50"
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Stock minimum *
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => handleInputChange('minStock', e.target.value)}
                placeholder="10"
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Aperçu du prix */}
          {formData.price && (
            <div className="p-4 bg-sage-50 dark:bg-sage-900/20 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Prix de vente</span>
                <span className="text-lg font-bold text-sage-600 dark:text-sage-400">
                  {(() => {
                    const amount = parseInt(formData.price) || 0;
                    const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
                    return formatted + ' Ar';
                  })()} / {
                    useCustomUnit && formData.customUnit.trim() 
                      ? formData.customUnit.trim()
                      : formData.unit === 'liter' ? 'litre' : 'pièce'
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={
              !formData.name.trim() || 
              !formData.price || 
              !formData.inStock || 
              !formData.minStock || 
              (useCustomType && !formData.customType.trim()) ||
              (useCustomUnit && !formData.customUnit.trim()) ||
              isSaving
            }
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${
              !formData.name.trim() || 
              !formData.price || 
              !formData.inStock || 
              !formData.minStock || 
              (useCustomType && !formData.customType.trim()) ||
              (useCustomUnit && !formData.customUnit.trim()) ||
              isSaving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-sage-600 hover:bg-sage-700 text-white hover:scale-105 hover:shadow-lg hover:shadow-sage-600/25'
            }`}
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-pulse' : ''}`} />
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductForm;