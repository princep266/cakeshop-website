import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auditOrdersForUserConsistency } from '../firebase/database';
import { AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';

const OrderAuditUtility = () => {
  const { currentUser, userData, isShop } = useAuth();
  const [auditResult, setAuditResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAudit = async () => {
    if (!currentUser || !isShop) {
      setError('Only shop owners can run order audits');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setAuditResult(null);

      console.log('Running order audit...');
      const result = await auditOrdersForUserConsistency();

      if (result.success) {
        setAuditResult(result);
        console.log('Audit completed successfully:', result);
      } else {
        setError(result.error || 'Audit failed');
        console.error('Audit failed:', result.error);
      }
    } catch (err) {
      console.error('Error running audit:', err);
      setError('Failed to run audit: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Only show for shop owners
  if (!currentUser || !isShop) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
          Order Audit Utility
        </h3>
        <button
          onClick={runAudit}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>{loading ? 'Running...' : 'Run Audit'}</span>
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        This utility checks for data consistency issues in orders, such as missing userId fields.
        Use this to identify and fix any data problems.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {auditResult && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="font-medium text-gray-800">Audit Complete</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{auditResult.totalOrdersAudited}</div>
              <div className="text-sm text-gray-600">Total Orders Audited</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{auditResult.issuesFound}</div>
              <div className="text-sm text-gray-600">Issues Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {auditResult.totalOrdersAudited - auditResult.issuesFound}
              </div>
              <div className="text-sm text-gray-600">Clean Orders</div>
            </div>
          </div>

          {auditResult.issues.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Issues Found:</h4>
              <div className="space-y-2">
                {auditResult.issues.map((issue, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-red-800">
                          {issue.collection}/{issue.documentId}
                        </div>
                        <div className="text-sm text-red-600">{issue.issue}</div>
                      </div>
                      <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded">
                        {issue.collection}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {auditResult.issues.length === 0 && (
            <div className="text-center py-4">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-green-700 font-medium">No issues found! All orders have proper user IDs.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderAuditUtility;
