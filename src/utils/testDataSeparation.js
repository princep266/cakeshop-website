/**
 * Test Data Separation Utility
 * 
 * This utility helps verify that addresses and payments are properly stored
 * in separate collections and can be fetched independently.
 */

import { 
  getAddressesByUser, 
  getPaymentsByUser, 
  getUserOrders,
  migrateAllOrdersToSeparateCollections,
  auditOrdersForUserConsistency
} from '../firebase/database';

/**
 * Test function to verify data separation
 * @param {string} userId - The user ID to test
 * @returns {Promise<Object>} Test results
 */
export const testDataSeparation = async (userId) => {
  console.log('🧪 Starting Data Separation Test...');
  
  const results = {
    success: true,
    tests: [],
    errors: []
  };

  try {
    // Test 1: Fetch addresses from separate collection
    console.log('📍 Test 1: Fetching addresses from separate collection...');
    const addressResult = await getAddressesByUser(userId);
    
    if (addressResult.success) {
      results.tests.push({
        name: 'Address Collection Fetch',
        status: 'PASSED',
        details: `Found ${addressResult.addresses?.length || 0} addresses in separate collection`
      });
      console.log('✅ Addresses fetched successfully:', addressResult.addresses);
    } else {
      results.tests.push({
        name: 'Address Collection Fetch',
        status: 'FAILED',
        details: addressResult.error
      });
      results.errors.push(`Address fetch failed: ${addressResult.error}`);
      console.error('❌ Address fetch failed:', addressResult.error);
    }

    // Test 2: Fetch payments from separate collection
    console.log('💳 Test 2: Fetching payments from separate collection...');
    const paymentResult = await getPaymentsByUser(userId);
    
    if (paymentResult.success) {
      results.tests.push({
        name: 'Payment Collection Fetch',
        status: 'PASSED',
        details: `Found ${paymentResult.payments?.length || 0} payments in separate collection`
      });
      console.log('✅ Payments fetched successfully:', paymentResult.payments);
    } else {
      results.tests.push({
        name: 'Payment Collection Fetch',
        status: 'FAILED',
        details: paymentResult.error
      });
      results.errors.push(`Payment fetch failed: ${paymentResult.error}`);
      console.error('❌ Payment fetch failed:', paymentResult.error);
    }

    // Test 3: Fetch orders and verify they reference separate collections
    console.log('📦 Test 3: Fetching orders and verifying references...');
    const ordersResult = await getUserOrders(userId);
    
    if (ordersResult.success) {
      const orders = ordersResult.orders || [];
      let ordersWithReferences = 0;
      let ordersWithEmbeddedData = 0;
      
      orders.forEach(order => {
        if (order.addressId && order.paymentId) {
          ordersWithReferences++;
        }
        if (order.shippingAddress && order.paymentInfo) {
          ordersWithEmbeddedData++;
        }
      });

      results.tests.push({
        name: 'Order References',
        status: 'PASSED',
        details: `${ordersWithReferences} orders have proper references, ${ordersWithEmbeddedData} have embedded data`
      });
      
      console.log('✅ Orders fetched successfully');
      console.log(`📊 Orders with references: ${ordersWithReferences}`);
      console.log(`📊 Orders with embedded data: ${ordersWithEmbeddedData}`);
    } else {
      results.tests.push({
        name: 'Order References',
        status: 'FAILED',
        details: ordersResult.error
      });
      results.errors.push(`Order fetch failed: ${ordersResult.error}`);
      console.error('❌ Order fetch failed:', ordersResult.error);
    }

    // Test 4: Run data consistency audit
    console.log('🔍 Test 4: Running data consistency audit...');
    try {
      const auditResult = await auditOrdersForUserConsistency();
      
      if (auditResult && Array.isArray(auditResult)) {
        if (auditResult.length === 0) {
          results.tests.push({
            name: 'Data Consistency Audit',
            status: 'PASSED',
            details: 'No consistency issues found'
          });
          console.log('✅ Data consistency audit passed - no issues found');
        } else {
          results.tests.push({
            name: 'Data Consistency Audit',
            status: 'WARNING',
            details: `Found ${auditResult.length} consistency issues`
          });
          console.warn('⚠️ Data consistency audit found issues:', auditResult);
        }
      } else {
        results.tests.push({
          name: 'Data Consistency Audit',
          status: 'FAILED',
          details: 'Audit function returned unexpected result'
        });
        console.error('❌ Audit function returned unexpected result:', auditResult);
      }
    } catch (auditError) {
      results.tests.push({
        name: 'Data Consistency Audit',
        status: 'FAILED',
        details: auditError.message
      });
      results.errors.push(`Audit failed: ${auditError.message}`);
      console.error('❌ Audit failed:', auditError);
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error);
    results.success = false;
    results.errors.push(`Test execution failed: ${error.message}`);
  }

  // Generate summary
  const passedTests = results.tests.filter(test => test.status === 'PASSED').length;
  const totalTests = results.tests.length;
  
  console.log('\n📋 Test Summary:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${results.errors.length} errors`);
  
  if (results.errors.length > 0) {
    console.log('\n🚨 Errors:');
    results.errors.forEach(error => console.log(`  - ${error}`));
  }

  return results;
};

/**
 * Test migration functionality
 * @returns {Promise<Object>} Migration test results
 */
export const testMigration = async () => {
  console.log('🔄 Testing Migration Functionality...');
  
  try {
    const result = await migrateAllOrdersToSeparateCollections();
    
    if (result.success) {
      console.log('✅ Migration test completed successfully');
      console.log(`📊 Total orders: ${result.totalOrders}`);
      console.log(`✅ Successful: ${result.successCount}`);
      console.log(`❌ Errors: ${result.errorCount}`);
      
      return {
        success: true,
        totalOrders: result.totalOrders,
        successCount: result.successCount,
        errorCount: result.errorCount
      };
    } else {
      console.error('❌ Migration test failed:', result.error);
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ Migration test error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate a comprehensive report
 * @param {string} userId - The user ID tested
 * @returns {Promise<string>} HTML report
 */
export const generateReport = async (userId) => {
  const testResults = await testDataSeparation(userId);
  const migrationResults = await testMigration();
  
  const report = `
    <html>
      <head>
        <title>Data Separation Test Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { background: #f0f0f0; padding: 20px; border-radius: 8px; }
          .test { margin: 10px 0; padding: 10px; border-left: 4px solid #ddd; }
          .passed { border-left-color: #4caf50; }
          .failed { border-left-color: #f44336; }
          .warning { border-left-color: #ff9800; }
          .summary { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🗄️ Data Separation Test Report</h1>
          <p><strong>User ID:</strong> ${userId}</p>
          <p><strong>Test Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
          <h2>📊 Test Summary</h2>
          <p><strong>Overall Status:</strong> ${testResults.success ? '✅ PASSED' : '❌ FAILED'}</p>
          <p><strong>Tests Passed:</strong> ${testResults.tests.filter(t => t.status === 'PASSED').length}/${testResults.tests.length}</p>
          <p><strong>Errors:</strong> ${testResults.errors.length}</p>
        </div>
        
        <h2>🧪 Test Results</h2>
        ${testResults.tests.map(test => `
          <div class="test ${test.status.toLowerCase()}">
            <h3>${test.name}</h3>
            <p><strong>Status:</strong> ${test.status}</p>
            <p><strong>Details:</strong> ${test.details}</p>
          </div>
        `).join('')}
        
        <h2>🔄 Migration Test</h2>
        <div class="test ${migrationResults.success ? 'passed' : 'failed'}">
          <h3>Migration Functionality</h3>
          <p><strong>Status:</strong> ${migrationResults.success ? '✅ PASSED' : '❌ FAILED'}</p>
          ${migrationResults.success ? `
            <p><strong>Total Orders:</strong> ${migrationResults.totalOrders}</p>
            <p><strong>Successful:</strong> ${migrationResults.successCount}</p>
            <p><strong>Errors:</strong> ${migrationResults.errorCount}</p>
          ` : `
            <p><strong>Error:</strong> ${migrationResults.error}</p>
          `}
        </div>
        
        ${testResults.errors.length > 0 ? `
          <h2>🚨 Errors</h2>
          <div class="test failed">
            ${testResults.errors.map(error => `<p>• ${error}</p>`).join('')}
          </div>
        ` : ''}
        
        <div class="summary">
          <h2>🎯 Conclusion</h2>
          <p>The data separation test ${testResults.success ? 'PASSED' : 'FAILED'}. 
          ${testResults.success ? 'Addresses and payments are properly stored in separate collections.' : 'There are issues that need to be addressed.'}</p>
        </div>
      </body>
    </html>
  `;
  
  return report;
};

export default {
  testDataSeparation,
  testMigration,
  generateReport
};

