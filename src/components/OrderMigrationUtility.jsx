import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { migrateAllOrdersToSeparateCollections, migrateOrderToSeparateCollections } from '../firebase/database';
import { toast } from 'react-toastify';
import { Database, RefreshCw, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const OrderMigrationUtility = () => {
  const { currentUser, userData, isShop } = useAuth();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);
  const [orderId, setOrderId] = useState('');

  const handleMigrateAllOrders = async () => {
    if (!currentUser || !isShop) {
      toast.error('Only shop owners can perform this operation');
      return;
    }

    setIsMigrating(true);
    setMigrationResult(null);

    try {
      toast.info('Starting migration of all orders...');
      const result = await migrateAllOrdersToSeparateCollections();
      
      setMigrationResult(result);
      
      if (result.success) {
        toast.success(`Migration completed! ${result.successCount} orders migrated successfully, ${result.errorCount} errors`);
      } else {
        toast.error(`Migration failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast.error(`Migration failed: ${error.message}`);
      setMigrationResult({ success: false, error: error.message });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleMigrateSingleOrder = async () => {
    if (!currentUser || !isShop) {
      toast.error('Only shop owners can perform this operation');
      return;
    }

    if (!orderId.trim()) {
      toast.error('Please enter an order ID');
      return;
    }

    setIsMigrating(true);
    setMigrationResult(null);

    try {
      toast.info(`Starting migration for order: ${orderId}`);
      const result = await migrateOrderToSeparateCollections(orderId.trim());
      
      setMigrationResult(result);
      
      if (result.success) {
        toast.success(`Order ${orderId} migrated successfully!`);
      } else {
        toast.error(`Migration failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast.error(`Migration failed: ${error.message}`);
      setMigrationResult({ success: false, error: error.message });
    } finally {
      setIsMigrating(false);
    }
  };

  if (!currentUser || !isShop) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Order Data Migration Utility</h3>
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        This utility helps migrate existing orders from the old embedded data structure to the new separate collections structure.
        Address and payment information will be moved to separate collections for better data organization.
      </div>

      <div className="space-y-4">
        {/* Migrate All Orders */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-2">Migrate All Orders</h4>
          <p className="text-sm text-gray-600 mb-3">
            Migrate all existing orders to use separate collections for address and payment data.
          </p>
          <button
            onClick={handleMigrateAllOrders}
            disabled={isMigrating}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
          >
            {isMigrating ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isMigrating ? 'Migrating...' : 'Migrate All Orders'}
          </button>
        </div>

        {/* Migrate Single Order */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-2">Migrate Single Order</h4>
          <p className="text-sm text-gray-600 mb-3">
            Migrate a specific order by entering its ID.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter order ID"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleMigrateSingleOrder}
              disabled={isMigrating || !orderId.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
            >
              {isMigrating ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {isMigrating ? 'Migrating...' : 'Migrate Order'}
            </button>
          </div>
        </div>

        {/* Migration Results */}
        {migrationResult && (
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">Migration Results</h4>
            <div className="space-y-2">
              {migrationResult.success ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>{migrationResult.message}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Error: {migrationResult.error}</span>
                </div>
              )}
              
              {migrationResult.totalOrders && (
                <div className="text-sm text-gray-600">
                  Total orders: {migrationResult.totalOrders} | 
                  Success: {migrationResult.successCount} | 
                  Errors: {migrationResult.errorCount}
                </div>
              )}
              
              {migrationResult.addressId && (
                <div className="text-sm text-gray-600">
                  Address ID: {migrationResult.addressId}
                </div>
              )}
              
              {migrationResult.paymentId && (
                <div className="text-sm text-gray-600">
                  Payment ID: {migrationResult.paymentId}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <h5 className="font-medium text-blue-800 mb-2">What This Migration Does:</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Creates separate documents in 'addresses' collection for shipping addresses</li>
          <li>• Creates separate documents in 'payments' collection for payment information</li>
          <li>• Updates order documents to reference these separate collections</li>
          <li>• Maintains all existing data while improving database structure</li>
        </ul>
      </div>
    </div>
  );
};

export default OrderMigrationUtility;
