import React, { useState } from 'react';
import { Bug, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';
import { Order } from '../utils/types';
import { OrderItemsDebugger } from '../utils/debugOrderItems';

interface OrderDebugPanelProps {
  orders: Order[];
  onFixOrder?: (order: Order) => void;
}

const OrderDebugPanel: React.FC<OrderDebugPanelProps> = ({ orders, onFixOrder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeAllOrders = () => {
    const globalAnalysis = OrderItemsDebugger.analyzeAllOrders(orders);
    setAnalysis(globalAnalysis);
    console.log('📊 Analyse globale terminée:', globalAnalysis);
  };

  const analyzeSpecificOrder = (order: Order) => {
    const orderAnalysis = OrderItemsDebugger.analyzeOrder(order);
    setSelectedOrder(order);
    setAnalysis(orderAnalysis);
    console.log('🔍 Analyse spécifique terminée:', orderAnalysis);
  };

  const fixSelectedOrder = () => {
    if (!selectedOrder || !onFixOrder) return;
    
    const fixedOrder = OrderItemsDebugger.fixOrder(selectedOrder);
    onFixOrder(fixedOrder);
    
    // Re-analyser après correction
    analyzeSpecificOrder(fixedOrder);
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '0 Ar';
    
    // Convertir en nombre entier et formater avec des espaces pour les milliers
    const nombre = parseInt(amount.toString());
    const formatted = nombre.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return formatted + ' Ar';
  };

  // Identifier les commandes problématiques
  const problematicOrders = orders.filter(order => {
    const orderAnalysis = OrderItemsDebugger.analyzeOrder(order);
    return !orderAnalysis.isValid;
  });

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg transition-colors touch-manipulation ${
          problematicOrders.length > 0
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-gray-800 hover:bg-gray-700 text-white'
        }`}
      >
        <Bug className="w-4 h-4" />
        <span>Debug Commandes</span>
        {problematicOrders.length > 0 && (
          <span className="bg-white text-red-600 px-2 py-1 rounded-full text-xs font-bold">
            {problematicOrders.length}
          </span>
        )}
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 w-96 max-h-[600px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">Debug Commandes</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={analyzeAllOrders}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
              >
                Analyser tout
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {/* Résumé global */}
            {analysis && !selectedOrder && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Résumé global</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{analysis.totalOrders}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Valides:</span>
                    <span className="ml-2 font-medium text-emerald-600 dark:text-emerald-400">{analysis.validOrders}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Invalides:</span>
                    <span className="ml-2 font-medium text-red-600 dark:text-red-400">{analysis.invalidOrders}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Taux:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {((analysis.validOrders / analysis.totalOrders) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {analysis.commonIssues.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Problèmes fréquents:</p>
                    <div className="space-y-1">
                      {analysis.commonIssues.slice(0, 3).map((issue: string, index: number) => (
                        <p key={index} className="text-xs text-red-600 dark:text-red-400">• {issue}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Analyse d'une commande spécifique */}
            {analysis && selectedOrder && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Commande #{selectedOrder.id}
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedOrder(null);
                      setAnalysis(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    {analysis.isValid ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                    <span className={analysis.isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                      {analysis.isValid ? 'Commande valide' : 'Commande invalide'}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 font-mono text-xs">
                    <p>Client: {selectedOrder.customerName}</p>
                    <p>Total: {formatCurrency(selectedOrder.totalAmount)}</p>
                    <p>Articles: {analysis.debugInfo.itemsLength}</p>
                    <p>Type items: {analysis.debugInfo.itemsType}</p>
                    <p>Est tableau: {analysis.debugInfo.isArray ? 'Oui' : 'Non'}</p>
                  </div>
                  
                  {analysis.issues.length > 0 && (
                    <div>
                      <p className="font-medium text-red-600 dark:text-red-400 mb-1">Problèmes:</p>
                      <div className="space-y-1">
                        {analysis.issues.map((issue: string, index: number) => (
                          <p key={index} className="text-xs text-red-600 dark:text-red-400">• {issue}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {analysis.suggestions.length > 0 && (
                    <div>
                      <p className="font-medium text-blue-600 dark:text-blue-400 mb-1">Suggestions:</p>
                      <div className="space-y-1">
                        {analysis.suggestions.map((suggestion: string, index: number) => (
                          <p key={index} className="text-xs text-blue-600 dark:text-blue-400">• {suggestion}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {!analysis.isValid && onFixOrder && (
                    <button
                      onClick={fixSelectedOrder}
                      className="flex items-center space-x-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors w-full justify-center"
                    >
                      <Wrench className="w-3 h-3" />
                      <span>Corriger automatiquement</span>
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Liste des commandes */}
            <div className="p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Commandes ({orders.length})
              </h4>
              
              {problematicOrders.length > 0 && (
                <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs">
                  <p className="text-red-700 dark:text-red-400 font-medium">
                    ⚠️ {problematicOrders.length} commande(s) problématique(s) détectée(s)
                  </p>
                </div>
              )}
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {orders.map((order) => {
                  const orderAnalysis = OrderItemsDebugger.analyzeOrder(order);
                  return (
                    <div
                      key={order.id}
                      onClick={() => analyzeSpecificOrder(order)}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        orderAnalysis.isValid
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                          : 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {orderAnalysis.isValid ? (
                          <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                            #{order.id} - {order.customerName}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {formatCurrency(order.totalAmount)} • {orderAnalysis.debugInfo.itemsLength} articles
                          </p>
                        </div>
                      </div>
                      
                      {!orderAnalysis.isValid && (
                        <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                          {orderAnalysis.issues.slice(0, 2).map((issue, index) => (
                            <p key={index}>• {issue}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDebugPanel;