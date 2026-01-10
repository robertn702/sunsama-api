#!/usr/bin/env node

/**
 * Verify that the built package structure matches package.json declarations.
 * This prevents publishing packages with broken entry points.
 *
 * Checks:
 * - main, module, and types fields point to existing files
 * - All exports paths point to existing files
 * - No unwanted src/ subdirectories in dist/
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    log(`✓ ${description}: ${filePath}`, colors.green);
    return true;
  } else {
    log(`✗ ${description}: ${filePath} (NOT FOUND)`, colors.red);
    return false;
  }
}

function checkDirectoryNotExists(dirPath, description) {
  const fullPath = path.join(__dirname, '..', dirPath);
  if (!fs.existsSync(fullPath)) {
    log(`✓ ${description}: ${dirPath} (correctly absent)`, colors.green);
    return true;
  } else {
    log(`✗ ${description}: ${dirPath} (should not exist!)`, colors.red);
    return false;
  }
}

async function verifyPackage() {
  log('\n📦 Verifying package structure...\n', colors.blue);

  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  let allChecksPass = true;

  // Check main entry points
  log('Checking main entry points:', colors.yellow);
  if (packageJson.main) {
    allChecksPass = checkFileExists(packageJson.main, 'main') && allChecksPass;
  }
  if (packageJson.module) {
    allChecksPass = checkFileExists(packageJson.module, 'module') && allChecksPass;
  }
  if (packageJson.types) {
    allChecksPass = checkFileExists(packageJson.types, 'types') && allChecksPass;
  }

  // Check exports
  if (packageJson.exports) {
    log('\nChecking exports:', colors.yellow);
    for (const [exportName, exportValue] of Object.entries(packageJson.exports)) {
      log(`\n  Export: "${exportName}"`);

      if (typeof exportValue === 'object') {
        if (exportValue.import) {
          allChecksPass = checkFileExists(exportValue.import, '    import') && allChecksPass;
        }
        if (exportValue.require) {
          allChecksPass = checkFileExists(exportValue.require, '    require') && allChecksPass;
        }
        if (exportValue.types) {
          allChecksPass = checkFileExists(exportValue.types, '    types') && allChecksPass;
        }
      } else {
        allChecksPass = checkFileExists(exportValue, `    ${exportName}`) && allChecksPass;
      }
    }
  }

  // Check that problematic src/ directories don't exist in dist/
  log('\nChecking for unwanted src/ subdirectories:', colors.yellow);
  allChecksPass = checkDirectoryNotExists('dist/types/src', 'dist/types/src') && allChecksPass;
  allChecksPass = checkDirectoryNotExists('dist/cjs/src', 'dist/cjs/src') && allChecksPass;
  allChecksPass = checkDirectoryNotExists('dist/esm/src', 'dist/esm/src') && allChecksPass;

  // Check that test files aren't included in dist/
  log('\nChecking for unwanted test files:', colors.yellow);
  allChecksPass = checkDirectoryNotExists('dist/types/__tests__', 'dist/types/__tests__') && allChecksPass;
  allChecksPass = checkDirectoryNotExists('dist/cjs/__tests__', 'dist/cjs/__tests__') && allChecksPass;
  allChecksPass = checkDirectoryNotExists('dist/esm/__tests__', 'dist/esm/__tests__') && allChecksPass;

  // Final result
  console.log();
  if (allChecksPass) {
    log('✅ All package structure checks passed!', colors.green);
    process.exit(0);
  } else {
    log('❌ Package structure verification failed!', colors.red);
    log('   Fix the build configuration before publishing.', colors.red);
    process.exit(1);
  }
}

verifyPackage().catch((error) => {
  log(`\n❌ Error during verification: ${error.message}`, colors.red);
  process.exit(1);
});
