/**
 * ChronoTrack Mobile UI Automator & Locator Test Runner
 * 
 * Allows finding and tapping buttons by React Native `testID` or `accessibilityLabel` (content-desc)
 * without hardcoding screen coordinates.
 * 
 * Usage:
 *   node testLocators.js tap "btn-tab-track"
 *   node testLocators.js tap "btn-tab-goals"
 *   node testLocators.js list
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ADB = process.env.LOCALAPPDATA 
  ? `"${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe"`
  : 'adb';

function runAdb(cmd) {
  try {
    return execSync(`${ADB} ${cmd}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (err) {
    return '';
  }
}

function dumpHierarchy() {
  runAdb('shell uiautomator dump /sdcard/view_dump.xml');
  const tempXml = path.join(process.cwd(), 'temp_dump.xml');
  runAdb(`pull /sdcard/view_dump.xml "${tempXml}"`);
  if (!fs.existsSync(tempXml)) return '';
  const xml = fs.readFileSync(tempXml, 'utf8');
  try { fs.unlinkSync(tempXml); } catch (_) {}
  return xml;
}

export function findLocatorBounds(locator) {
  const xml = dumpHierarchy();
  if (!xml) return null;

  // Match node containing resource-id or content-desc matching locator
  // Example node: <node ... resource-id="btn-tab-track" ... bounds="[144,1200][288,1280]" .../>
  const regex = new RegExp(
    `<node[^>]*(?:resource-id=["'][^"']*${locator}[^"']*["']|content-desc=["'][^"']*${locator}[^"']*["'])[^>]*bounds=["']\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]["']`,
    'i'
  );

  const match = xml.match(regex);
  if (match) {
    const x1 = parseInt(match[1], 10);
    const y1 = parseInt(match[2], 10);
    const x2 = parseInt(match[3], 10);
    const y2 = parseInt(match[4], 10);
    return {
      x: Math.round((x1 + x2) / 2),
      y: Math.round((y1 + y2) / 2),
      bounds: [x1, y1, x2, y2]
    };
  }
  return null;
}

export function tapLocator(locator) {
  console.log(`[Locator Test] Searching for element with testID/label: "${locator}"...`);
  const point = findLocatorBounds(locator);
  if (!point) {
    console.error(`[Locator Test] ❌ Element "${locator}" not found in current UI hierarchy.`);
    return false;
  }
  console.log(`[Locator Test] ✅ Found element "${locator}" at (${point.x}, ${point.y}). Tapping...`);
  runAdb(`shell input tap ${point.x} ${point.y}`);
  return true;
}

// CLI Execution
const args = process.argv.slice(2);
const command = args[0];
const targetLocator = args[1];

if (command === 'tap' && targetLocator) {
  const success = tapLocator(targetLocator);
  process.exit(success ? 0 : 1);
} else if (command === 'list') {
  const xml = dumpHierarchy();
  const idMatches = [...xml.matchAll(/resource-id="([^"]+)"/g)].map(m => m[1]);
  const descMatches = [...xml.matchAll(/content-desc="([^"]+)"/g)].map(m => m[1]);
  console.log('--- Available testIDs / Resource IDs ---');
  console.log([...new Set(idMatches)].join('\n'));
  console.log('\n--- Available Accessibility Labels (content-desc) ---');
  console.log([...new Set(descMatches)].join('\n'));
} else {
  console.log('Usage: node testLocators.js tap <locator-id>');
}
