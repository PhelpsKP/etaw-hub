/**
 * UI Smoke Test: Membership Display
 *
 * Tests:
 * 1. Login redirects to /app/book
 * 2. Membership status card is visible on /app/book
 * 3. "View Details" navigates to /app/membership
 */

import { chromium } from 'playwright';

const FRONTEND_URL = 'http://localhost:5182';
const TEST_EMAIL = 'legacytest@test.com';
const TEST_PASSWORD = 'Password123!';

async function runTest() {
  console.log('🧪 Starting UI Smoke Test: Membership Display\n');

  const results = {
    loginRedirect: { pass: false, error: null },
    membershipCard: { pass: false, error: null },
    viewDetailsNavigation: { pass: false, error: null }
  };

  const consoleErrors = [];
  const pageErrors = [];

  let browser;
  let page;

  try {
    // Launch browser
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    page = await context.newPage();

    // Capture console errors and logs
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
      if (msg.type() === 'log') {
        console.log('[BROWSER LOG]', msg.text());
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    console.log('📍 Test 1: Login redirects to /app/book');
    console.log(`   Navigating to ${FRONTEND_URL}/login...`);

    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle' });

    // Fill login form
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);

    // Submit and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button[type="submit"]')
    ]);

    // Check final URL
    const currentUrl = new URL(page.url());
    const pathname = currentUrl.pathname;

    console.log(`   Landed on: ${pathname}`);

    if (pathname === '/app/book' || pathname === '/waiver') {
      results.loginRedirect.pass = true;
      console.log('   ✅ PASS: Redirected to /app/book (or /waiver)\n');
    } else {
      results.loginRedirect.error = `Expected /app/book or /waiver, got ${pathname}`;
      console.log(`   ❌ FAIL: ${results.loginRedirect.error}\n`);
    }

    // Wait for any client-side redirects (WaiverGate)
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Handle WaiverGate redirect
    let currentPathname = new URL(page.url()).pathname;
    if (currentPathname === '/waiver') {
      console.log('📝 Waiver Handling:');
      console.log('   Detected /waiver redirect, completing waiver form...');

      // Fill waiver form
      await page.getByPlaceholder('Type your full legal name').fill('Test User');
      console.log('   Filled name field');

      // Submit and wait for navigation
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
        page.getByRole('button', { name: 'I Agree and Sign' }).click()
      ]);
      console.log('   Submitted waiver');

      // Wait for redirect to /app route (not /waiver)
      const startTime = Date.now();
      const timeout = 15000;
      while (Date.now() - startTime < timeout) {
        currentPathname = new URL(page.url()).pathname;
        if (currentPathname.startsWith('/app') && currentPathname !== '/waiver') {
          console.log(`   ✅ Landed on: ${currentPathname}`);
          break;
        }
        await page.waitForTimeout(250);
      }

      if (currentPathname === '/waiver' || !currentPathname.startsWith('/app')) {
        console.log(`   ⚠️  Still on ${currentPathname} after ${timeout}ms`);
      } else {
        // Wait for React to fully render the Book component
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);
      }
      console.log('');
    }

    // DOM Evidence Dump
    console.log('📋 DOM Evidence Dump:');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    console.log(`   URL: ${page.url()}`);
    const title = await page.title();
    console.log(`   Title: ${title}`);

    const bodySnippet = await page.evaluate(() => {
      return document.body.innerHTML.substring(0, 300);
    });
    console.log(`   Body snippet (first 300 chars):\n   ${bodySnippet.replace(/\n/g, ' ')}`);

    const membershipLoadedCount = await page.locator('[data-testid="membership-loaded"]').count();
    const membershipCardCount = await page.locator('[data-testid="membership-card"]').count();
    const bookSessionCount = await page.locator('text=Book a Session').count();

    console.log(`   Selector counts:`);
    console.log(`     [data-testid="membership-loaded"]: ${membershipLoadedCount}`);
    console.log(`     [data-testid="membership-card"]: ${membershipCardCount}`);
    console.log(`     text=Book a Session: ${bookSessionCount}`);

    const headings = await page.evaluate(() => {
      const h1s = Array.from(document.querySelectorAll('h1')).map(el => el.textContent);
      const h2s = Array.from(document.querySelectorAll('h2')).map(el => el.textContent);
      return { h1s, h2s };
    });
    console.log(`   Headings: h1=${JSON.stringify(headings.h1s)}, h2=${JSON.stringify(headings.h2s)}`);

    if (membershipLoadedCount === 0) {
      console.log(`   ⚠️  membership-loaded NOT FOUND, saving debug files...`);
      const html = await page.content();
      const fs = await import('fs');
      fs.writeFileSync('scripts/_debug-book.html', html);
      await page.screenshot({ path: 'scripts/_debug-book.png', fullPage: true });
      console.log(`   📁 Saved: scripts/_debug-book.html`);
      console.log(`   📸 Saved: scripts/_debug-book.png`);
    }
    console.log('');

    // Test 2: Membership card visible
    console.log('📍 Test 2: Membership status card is visible');

    try {
      // Wait for membership fetch to complete (element exists but is hidden)
      await page.waitForSelector('[data-testid="membership-loaded"]', { state: 'attached', timeout: 10000 });
      console.log('   Membership data loaded');

      // Wait for membership card to render
      await page.waitForSelector('[data-testid="membership-card"]', { timeout: 5000 });
      console.log('   Membership card found');

      results.membershipCard.pass = true;
      console.log('   ✅ PASS: Membership card is visible\n');
    } catch (error) {
      results.membershipCard.error = `Selector not found: ${error.message}`;
      console.log(`   ❌ FAIL: ${results.membershipCard.error}\n`);

      // Debug: take screenshot
      await page.screenshot({ path: 'frontend/scripts/debug-membership-card.png' });
      console.log('   📸 Screenshot saved to frontend/scripts/debug-membership-card.png\n');
    }

    // Test 3: View Details navigation
    console.log('📍 Test 3: "View Details" navigates to /app/membership');

    try {
      // Find whichever link exists (details or learnmore)
      const detailsLink = page.locator('[data-testid="membership-details-link"]');
      const learnmoreLink = page.locator('[data-testid="membership-learnmore-link"]');

      let linkToClick;
      if (await detailsLink.isVisible().catch(() => false)) {
        linkToClick = detailsLink;
        console.log('   Found "View Details" link');
      } else if (await learnmoreLink.isVisible().catch(() => false)) {
        linkToClick = learnmoreLink;
        console.log('   Found "Learn More" link');
      } else {
        throw new Error('Neither details nor learnmore link found');
      }

      // Click and wait for navigation
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        linkToClick.click()
      ]);

      const membershipUrl = new URL(page.url());
      const membershipPathname = membershipUrl.pathname;

      console.log(`   Navigated to: ${membershipPathname}`);

      if (membershipPathname === '/app/membership') {
        // Check that page loaded (not 404 or redirected to login)
        const is404 = await page.getByText('404', { exact: false }).isVisible().catch(() => false);
        const isLogin = membershipPathname === '/login';

        if (!is404 && !isLogin) {
          results.viewDetailsNavigation.pass = true;
          console.log('   ✅ PASS: Successfully navigated to /app/membership\n');
        } else {
          results.viewDetailsNavigation.error = is404 ? 'Page shows 404' : 'Redirected to login';
          console.log(`   ❌ FAIL: ${results.viewDetailsNavigation.error}\n`);
        }
      } else {
        results.viewDetailsNavigation.error = `Expected /app/membership, got ${membershipPathname}`;
        console.log(`   ❌ FAIL: ${results.viewDetailsNavigation.error}\n`);
      }
    } catch (error) {
      results.viewDetailsNavigation.error = error.message;
      console.log(`   ❌ FAIL: ${error.message}\n`);
    }

  } catch (error) {
    console.error('❌ Test execution error:', error.message);
    console.error(error.stack);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Print summary
  console.log('═══════════════════════════════════════');
  console.log('TEST SUMMARY');
  console.log('═══════════════════════════════════════');

  const allTests = [
    { name: 'Login redirect to /app/book', result: results.loginRedirect },
    { name: 'Membership card visible', result: results.membershipCard },
    { name: 'View Details navigation', result: results.viewDetailsNavigation }
  ];

  allTests.forEach(({ name, result }) => {
    const status = result.pass ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${name}`);
    if (result.error) {
      console.log(`         ${result.error}`);
    }
  });

  console.log('═══════════════════════════════════════');

  // Console errors
  if (consoleErrors.length > 0) {
    console.log('\n⚠️  CONSOLE ERRORS:');
    consoleErrors.forEach(err => console.log(`   - ${err}`));
  } else {
    console.log('\n✓ No console errors');
  }

  // Page errors
  if (pageErrors.length > 0) {
    console.log('\n⚠️  PAGE ERRORS:');
    pageErrors.forEach(err => console.log(`   - ${err}`));
  } else {
    console.log('✓ No page errors');
  }

  // Exit code
  const allPassed = allTests.every(({ result }) => result.pass);
  const exitCode = allPassed && consoleErrors.length === 0 && pageErrors.length === 0 ? 0 : 1;

  console.log(`\n${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  process.exit(exitCode);
}

runTest();
