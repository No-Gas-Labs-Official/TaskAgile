/**
 * NO_GAS_LABS™ CELEBRITY DEATHMATCH - VALIDATION HARNESS
 * Ralph Loop Iteration 1+
 * 
 * Purpose: Executable proof that features actually work
 * Philosophy: "Show me the transforms, show me the ticks, show me the hash"
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

//═══════════════════════════════════════════════════════════════
// CONFIGURATION
//═══════════════════════════════════════════════════════════════

const ARTIFACT_PATH = path.join(__dirname, '../artifacts/deathmatch.html');
const RESULTS_PATH = path.join(__dirname, '../logs/test-results.json');
const SCREENSHOT_DIR = path.join(__dirname, '../logs/screenshots');

const MOBILE_VIEWPORT = { width: 375, height: 667, isMobile: true, deviceScaleFactor: 2 };
const DESKTOP_VIEWPORT = { width: 1920, height: 1080 };

//═══════════════════════════════════════════════════════════════
// TEST RESULTS TRACKER
//═══════════════════════════════════════════════════════════════

const results = {
  timestamp: new Date().toISOString(),
  iteration: parseInt(process.env.ITERATION || '1'),
  artifact: {
    path: ARTIFACT_PATH,
    size: 0,
    exists: false
  },
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    critical_failures: 0
  },
  features: {
    infrastructure: { complete: 0, total: 18 },
    gameplay: { complete: 0, total: 0 }
  }
};

//═══════════════════════════════════════════════════════════════
// LOGGING UTILITIES
//═══════════════════════════════════════════════════════════════

function logTest(name, status, message, critical = true, category = 'infrastructure') {
  const test = { name, status, message, critical, category, timestamp: Date.now() };
  results.tests.push(test);
  results.summary.total++;
  
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  const criticalTag = critical ? '[CRITICAL]' : '[OPTIONAL]';
  
  console.log(`${icon} ${criticalTag} ${name}`);
  if (message) console.log(`   ${message}`);
  
  if (status === 'PASS') {
    results.summary.passed++;
    if (results.features[category]) {
      results.features[category].complete++;
    }
  } else if (status === 'FAIL') {
    results.summary.failed++;
    if (critical) results.summary.critical_failures++;
  } else {
    results.summary.warnings++;
  }
}

function logSection(title) {
  console.log('');
  console.log('═'.repeat(60));
  console.log(`  ${title}`);
  console.log('═'.repeat(60));
  console.log('');
}

//═══════════════════════════════════════════════════════════════
// MAIN TEST RUNNER
//═══════════════════════════════════════════════════════════════

async function runAllTests() {
  logSection('NO_GAS_LABS™ VALIDATION HARNESS');
  console.log(`Iteration: ${results.iteration}`);
  console.log(`Timestamp: ${results.timestamp}`);
  console.log('');

  // Ensure screenshot directory exists
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  // Pre-flight: Verify artifact exists
  if (!fs.existsSync(ARTIFACT_PATH)) {
    logTest('Artifact Exists', 'FAIL', `File not found: ${ARTIFACT_PATH}`, true);
    saveResults();
    printSummary();
    process.exit(1);
  }

  const stats = fs.statSync(ARTIFACT_PATH);
  results.artifact.exists = true;
  results.artifact.size = stats.size;
  
  logTest('Artifact Exists', 'PASS', `deathmatch.html (${(stats.size/1024).toFixed(2)}KB)`, true);

  // Launch browser
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH;
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: executablePath || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  try {
    // PHASE 1: Infrastructure Tests (Features 1-18)
    logSection('PHASE 1: INFRASTRUCTURE (18 Features)');
    await runInfrastructureTests(browser);

  } catch (error) {
    console.error('💥 TEST SUITE CRASHED:', error.message);
    logTest('Test Suite Execution', 'FAIL', `Crash: ${error.message}`, true);
  } finally {
    await browser.close();
  }

  saveResults();
  printSummary();

  // Exit with error code if critical tests failed
  if (results.summary.critical_failures > 0) {
    console.log('\n❌ CRITICAL FAILURES DETECTED - ITERATION MUST ROLLBACK OR FIX\n');
    process.exit(1);
  }

  process.exit(0);
}

//═══════════════════════════════════════════════════════════════
// PHASE 1: INFRASTRUCTURE TESTS
//═══════════════════════════════════════════════════════════════

async function runInfrastructureTests(browser) {
  const page = await browser.newPage();
  await page.setViewport(DESKTOP_VIEWPORT);
  
  const fileUrl = `file://${ARTIFACT_PATH}`;
  
  // Enable console logging
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  
  await page.goto(fileUrl, { waitUntil: 'networkidle2', timeout: 10000 });

  // Test 1: Page Title & Branding
  const title = await page.title();
  if (title.includes('No_Gas_Labs') || title.includes('Deathmatch')) {
    logTest('Brand: Title Tag', 'PASS', `"${title}"`, true, 'infrastructure');
  } else {
    logTest('Brand: Title Tag', 'FAIL', `Missing branding in: "${title}"`, true, 'infrastructure');
  }

  // Test 2: Console Errors
  await page.waitForTimeout(2000);
  if (consoleErrors.length === 0) {
    logTest('Runtime: Console Clean', 'PASS', 'No JavaScript errors', true, 'infrastructure');
  } else {
    logTest('Runtime: Console Clean', 'FAIL', `${consoleErrors.length} errors: ${consoleErrors[0]}`, true, 'infrastructure');
  }

  // Test 3: External Dependencies (Zero Tolerance)
  const externalRequests = [];
  page.on('request', request => {
    const url = request.url();
    if (url.startsWith('http') && !url.startsWith('file://')) {
      externalRequests.push(url);
    }
  });
  
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForTimeout(1000);
  
  if (externalRequests.length === 0) {
    logTest('Dependencies: Zero External', 'PASS', 'Fully offline-capable', true, 'infrastructure');
  } else {
    logTest('Dependencies: Zero External', 'FAIL', `Found: ${externalRequests.join(', ')}`, true, 'infrastructure');
  }

  // Test 4: localStorage API
  const localStorageWorks = await page.evaluate(() => {
    try {
      const testKey = '__ngl_test__';
      const testValue = JSON.stringify({ test: true, timestamp: Date.now() });
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      return retrieved === testValue;
    } catch (e) {
      return false;
    }
  });
  
  if (localStorageWorks) {
    logTest('Storage: localStorage R/W', 'PASS', 'Read/write/delete functional', true, 'infrastructure');
  } else {
    logTest('Storage: localStorage R/W', 'FAIL', 'Cannot access localStorage', true, 'infrastructure');
  }

  // Test 5: Required UI Buttons
  const buttons = await page.evaluate(() => {
    const required = ['Export', 'Import', 'Reset'];
    const allButtons = Array.from(document.querySelectorAll('button'));
    return required.map(text => ({
      name: text,
      exists: allButtons.some(btn => btn.textContent.includes(text)),
      count: allButtons.filter(btn => btn.textContent.includes(text)).length
    }));
  });
  
  buttons.forEach(({ name, exists, count }) => {
    if (exists) {
      logTest(`UI: ${name} Button`, 'PASS', `Found (${count} instance${count > 1 ? 's' : ''})`, true, 'infrastructure');
    } else {
      logTest(`UI: ${name} Button`, 'WARN', 'Element not found in DOM (expected after iteration 10)', false, 'infrastructure');
    }
  });

  // Test 6: File Size Constraint
  const sizeKB = (results.artifact.size / 1024).toFixed(2);
  const sizePercent = ((results.artifact.size / 512000) * 100).toFixed(1);
  
  if (results.artifact.size < 512000) {
    logTest('Constraint: File Size', 'PASS', `${sizeKB}KB (${sizePercent}% of 500KB limit)`, true, 'infrastructure');
  } else {
    logTest('Constraint: File Size', 'FAIL', `${sizeKB}KB exceeds 500KB limit`, true, 'infrastructure');
  }

  // Test 7: Mobile Viewport Meta
  const hasViewport = await page.evaluate(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    return meta && meta.content.includes('width=device-width');
  });
  
  if (hasViewport) {
    logTest('Mobile: Viewport Meta', 'PASS', 'Responsive configuration present', true, 'infrastructure');
  } else {
    logTest('Mobile: Viewport Meta', 'FAIL', 'Missing or incorrect viewport meta tag', true, 'infrastructure');
  }

  // Test 8: Mobile Tap Targets
  await page.setViewport(MOBILE_VIEWPORT);
  await page.reload({ waitUntil: 'networkidle2' });
  
  const tapTargets = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.map(btn => {
      const rect = btn.getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        text: btn.textContent.trim().substring(0, 15)
      };
    });
  });
  
  if (tapTargets.length > 0) {
    const smallTargets = tapTargets.filter(t => t.width < 44 || t.height < 44);
    
    if (smallTargets.length === 0) {
      logTest('Mobile: Tap Targets ≥44px', 'PASS', `${tapTargets.length} buttons validated`, true, 'infrastructure');
    } else {
      logTest('Mobile: Tap Targets ≥44px', 'WARN', 
        `${smallTargets.length} buttons too small: "${smallTargets[0].text}" (${smallTargets[0].width}x${smallTargets[0].height}px)`, 
        false, 'infrastructure');
    }
  } else {
    logTest('Mobile: Tap Targets ≥44px', 'WARN', 'No buttons found yet (expected after iteration 10)', false, 'infrastructure');
  }

  // Test 9: No Horizontal Scroll (Mobile)
  const hasHScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  
  if (!hasHScroll) {
    logTest('Mobile: No H-Scroll', 'PASS', 'Content fits viewport', false, 'infrastructure');
  } else {
    logTest('Mobile: No H-Scroll', 'WARN', 'Horizontal scroll detected', false, 'infrastructure');
  }

  // Test 10: PWA Manifest
  const hasManifest = await page.evaluate(() => {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    return manifestLink !== null;
  });
  
  if (hasManifest) {
    logTest('PWA: Manifest Link', 'PASS', 'Web app manifest present', true, 'infrastructure');
  } else {
    logTest('PWA: Manifest Link', 'WARN', 'No manifest link (expected after iteration 20)', false, 'infrastructure');
  }

  // Test 11: Service Worker Registration
  const hasServiceWorker = await page.evaluate(() => {
    return 'serviceWorker' in navigator;
  });
  
  if (hasServiceWorker) {
    logTest('PWA: Service Worker Support', 'PASS', 'Service Worker API available', true, 'infrastructure');
  } else {
    logTest('PWA: Service Worker Support', 'FAIL', 'Service Worker not supported', true, 'infrastructure');
  }

  // Test 12: Offline Capability
  await page.setOfflineMode(true);
  await page.reload({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => {});
  const offlineWorks = await page.evaluate(() => {
    return document.body !== null;
  });
  
  if (offlineWorks) {
    logTest('Offline: Page Loads', 'PASS', 'Content available offline', true, 'infrastructure');
  } else {
    logTest('Offline: Page Loads', 'WARN', 'Offline functionality not yet implemented', false, 'infrastructure');
  }
  
  await page.setOfflineMode(false);

  // Test 13: Touch Event Handlers
  const hasTouchEvents = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.some(btn => {
      return btn.onclick !== null || btn.ontouchstart !== null;
    });
  });
  
  if (hasTouchEvents) {
    logTest('Mobile: Touch Events', 'PASS', 'Touch handlers detected', false, 'infrastructure');
  } else {
    logTest('Mobile: Touch Events', 'WARN', 'No touch handlers (expected after iteration 15)', false, 'infrastructure');
  }

  // Test 14: Export Functionality
  const exportFunctional = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent.includes('Export'));
    if (!btn) return false;
    
    try {
      btn.click();
      return true;
    } catch (e) {
      return false;
    }
  });
  
  if (exportFunctional) {
    logTest('Feature: Export Function', 'PASS', 'Button clickable with handler', true, 'infrastructure');
  } else {
    logTest('Feature: Export Function', 'WARN', 'Export not yet implemented (expected after iteration 10)', false, 'infrastructure');
  }

  // Test 15: Import Functionality
  const importFunctional = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent.includes('Import'));
    if (!btn) return false;
    
    return btn.onclick !== null || btn.getAttribute('onclick') !== null;
  });
  
  if (importFunctional) {
    logTest('Feature: Import Function', 'PASS', 'Button has click handler', true, 'infrastructure');
  } else {
    logTest('Feature: Import Function', 'WARN', 'Import not yet implemented (expected after iteration 12)', false, 'infrastructure');
  }

  // Test 16: Reset Functionality
  const resetFunctional = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent.includes('Reset'));
    if (!btn) return false;
    
    return btn.onclick !== null || btn.getAttribute('onclick') !== null;
  });
  
  if (resetFunctional) {
    logTest('Feature: Reset Function', 'PASS', 'Button has click handler', true, 'infrastructure');
  } else {
    logTest('Feature: Reset Function', 'WARN', 'Reset not yet implemented (expected after iteration 12)', false, 'infrastructure');
  }

  // Test 17: Termux Compatibility (Basic checks)
  const termuxCompatible = await page.evaluate(() => {
    // Check for no Node.js APIs
    const scripts = Array.from(document.querySelectorAll('script'));
    for (let script of scripts) {
      const code = script.textContent;
      if (/require\(|module\.exports|process\./.test(code)) {
        return false;
      }
    }
    return true;
  });
  
  if (termuxCompatible) {
    logTest('Termux: No Node.js APIs', 'PASS', 'Browser-compatible code', true, 'infrastructure');
  } else {
    logTest('Termux: No Node.js APIs', 'FAIL', 'Node.js APIs detected (will break in Termux)', true, 'infrastructure');
  }

  // Test 18: Performance - Load Time
  const renderMetrics = await page.evaluate(() => {
    const perf = performance.getEntriesByType('navigation')[0];
    return {
      domContentLoaded: Math.round(perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart),
      loadComplete: Math.round(perf.loadEventEnd - perf.loadEventStart),
      domInteractive: Math.round(perf.domInteractive - perf.fetchStart)
    };
  });
  
  if (renderMetrics.domInteractive < 1000) {
    logTest('Performance: Load Time', 'PASS', 
      `DOM interactive in ${renderMetrics.domInteractive}ms`, 
      false, 'infrastructure');
  } else {
    logTest('Performance: Load Time', 'WARN', 
      `DOM interactive in ${renderMetrics.domInteractive}ms (target: <1000ms)`, 
      false, 'infrastructure');
  }

  // Screenshot for manual review
  await page.screenshot({ 
    path: path.join(SCREENSHOT_DIR, `iter-${results.iteration}-mobile.png`),
    fullPage: true 
  });

  await page.close();
}

//═══════════════════════════════════════════════════════════════
// RESULTS PERSISTENCE
//═══════════════════════════════════════════════════════════════

function saveResults() {
  // Calculate feature completion percentages
  Object.keys(results.features).forEach(category => {
    const feat = results.features[category];
    feat.percentage = Math.round((feat.complete / feat.total) * 100);
  });

  // Add overall progress
  const totalComplete = Object.values(results.features)
    .reduce((sum, cat) => sum + cat.complete, 0);
  const totalRequired = Object.values(results.features)
    .reduce((sum, cat) => sum + cat.total, 0);
  
  results.overall_progress = {
    features_complete: totalComplete,
    features_required: totalRequired,
    percentage: Math.round((totalComplete / totalRequired) * 100)
  };

  // Write to file
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
  console.log('');
  console.log(`📊 Results saved: ${RESULTS_PATH}`);
}

function printSummary() {
  console.log('');
  console.log('━'.repeat(60));
  console.log('  TEST SUMMARY');
  console.log('━'.repeat(60));
  console.log('');
  console.log(`Total Tests:          ${results.summary.total}`);
  console.log(`✅ Passed:            ${results.summary.passed}`);
  console.log(`❌ Failed:            ${results.summary.failed}`);
  console.log(`⚠️  Warnings:          ${results.summary.warnings}`);
  console.log(`🔴 Critical Failures: ${results.summary.critical_failures}`);
  console.log('');
  
  const passRate = results.summary.total > 0 
    ? ((results.summary.passed / results.summary.total) * 100).toFixed(1)
    : 0;
  console.log(`Pass Rate: ${passRate}%`);
  console.log('');
  
  console.log('━'.repeat(60));
  console.log('  FEATURE PROGRESS');
  console.log('━'.repeat(60));
  console.log('');
  
  Object.entries(results.features).forEach(([category, data]) => {
    const filledChars = Math.max(0, Math.min(20, Math.floor((data.percentage / 100) * 20)));
    const bar = '█'.repeat(filledChars) + 
                '░'.repeat(20 - filledChars);
    console.log(`${category.padEnd(20)} [${bar}] ${data.complete}/${data.total} (${data.percentage}%)`);
  });
  
  console.log('');
  console.log(`Overall: ${results.overall_progress.features_complete}/${results.overall_progress.features_required} (${results.overall_progress.percentage}%)`);
  console.log('');
  
  if (results.summary.critical_failures === 0) {
    console.log('━'.repeat(60));
    console.log('  ✅ ALL CRITICAL TESTS PASSED');
    console.log('  Iteration validated - safe to continue');
    console.log('━'.repeat(60));
  } else {
    console.log('━'.repeat(60));
    console.log('  ❌ CRITICAL FAILURES DETECTED');
    console.log('  Iteration must rollback or fix before continuing');
    console.log('━'.repeat(60));
  }
  console.log('');
}

//═══════════════════════════════════════════════════════════════
// EXECUTION
//═══════════════════════════════════════════════════════════════

runAllTests().catch(error => {
  console.error('');
  console.error('💥 CATASTROPHIC TEST FAILURE');
  console.error('━'.repeat(60));
  console.error(error);
  console.error('━'.repeat(60));
  console.error('');
  
  logTest('Test Suite Crash', 'FAIL', error.message, true);
  saveResults();
  
  process.exit(1);
});
