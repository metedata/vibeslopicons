#!/usr/bin/env node
/**
 * Vibeslopicons build script.
 *
 * Idempotent. Two phases:
 *   1. Seed — write any missing SVG files from inline data (used for fresh installs).
 *   2. Build — read every SVG in icons/ and regenerate preview/index.html + manifest.json.
 *
 * SVG files in icons/ are the source of truth. Inline seed data only fills in
 * what's missing. Edit a .svg file directly to change an icon — your edits won't
 * be overwritten.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const UTIL_DIR = path.join(ROOT, 'icons/utility');
const BRAND_DIR = path.join(ROOT, 'icons/brands');
const PREVIEW_DIR = path.join(ROOT, 'preview');

const UTIL_ATTRS = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"';
const BRAND_ATTRS = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"';

// ============================================================================
// SEED: new utility icons (added in v0.2)
// ============================================================================
const SEED_UTIL = {
  'menu': '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
  'grid': '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  'list': '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  'more-horizontal': '<circle cx="12" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
  'more-vertical': '<circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="19" r="1.5"/>',
  'chevron-up': '<polyline points="18,15 12,9 6,15"/>',
  'chevron-down': '<polyline points="6,9 12,15 18,9"/>',
  'arrow-up-right': '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="8,7 17,7 17,16"/>',
  'arrow-down-right': '<line x1="7" y1="7" x2="17" y2="17"/><polyline points="17,8 17,17 8,17"/>',
  'arrow-up-left': '<line x1="17" y1="17" x2="7" y2="7"/><polyline points="16,7 7,7 7,16"/>',
  'arrow-down-left': '<line x1="17" y1="7" x2="7" y2="17"/><polyline points="7,8 7,17 16,17"/>',
  'external-link': '<path d="M18 13 V19 A2 2 0 0 1 16 21 H5 A2 2 0 0 1 3 19 V8 A2 2 0 0 1 5 6 H11"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>',
  'refresh': '<polyline points="23,4 23,10 17,10"/><path d="M20.5 15 A9 9 0 1 1 19 6.5 L23 10"/>',
  'rotate-cw': '<polyline points="21,3 21,9 15,9"/><path d="M18 14 A8 8 0 1 1 16 4.5 L21 9"/>',
  'rotate-ccw': '<polyline points="3,3 3,9 9,9"/><path d="M6 14 A8 8 0 1 0 8 4.5 L3 9"/>',
  'corner-up-right': '<polyline points="15,7 20,12 15,17"/><path d="M4 20 V13 A4 4 0 0 1 8 9 H20"/>',
  'circle': '<circle cx="12" cy="12" r="9"/>',
  'square': '<rect x="3" y="3" width="18" height="18"/>',
  'triangle': '<polygon points="12,3 22,20 2,20"/>',
  'hexagon': '<polygon points="12,2 21,7 21,17 12,22 3,17 3,7"/>',
  'octagon': '<polygon points="8,2 16,2 22,8 22,16 16,22 8,22 2,16 2,8"/>',
  'diamond': '<polygon points="12,2 22,12 12,22 2,12"/>',
  'pentagon': '<polygon points="12,2 22,9 18,21 6,21 2,9"/>',
  'parallelogram': '<polygon points="6,4 22,4 18,20 2,20"/>',
  'toggle-on': '<rect x="2" y="6" width="20" height="12" rx="6"/><circle cx="16" cy="12" r="3" fill="currentColor"/>',
  'toggle-off': '<rect x="2" y="6" width="20" height="12" rx="6"/><circle cx="8" cy="12" r="3"/>',
  'sliders': '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  'filter': '<polygon points="22,3 2,3 10,12.5 10,19 14,21 14,12.5"/>',
  'sort-asc': '<path d="M3 6 H21 M6 12 H18 M9 18 H15"/>',
  'sort-desc': '<path d="M3 6 H9 M3 12 H15 M3 18 H21"/>',
  'switch': '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M9 9 V15 M15 9 V15"/>',
  'radio-on': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4" fill="currentColor"/>',
  'timer': '<circle cx="12" cy="13" r="8"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="9" y1="2" x2="15" y2="2"/>',
  'stopwatch': '<circle cx="12" cy="14" r="7"/><polyline points="12,10 12,14 16,14"/><line x1="9" y1="2" x2="15" y2="2"/><line x1="12" y1="2" x2="12" y2="6"/>',
  'alarm-clock': '<circle cx="12" cy="13" r="8"/><polyline points="12,9 12,13 15,15"/><line x1="5" y1="3" x2="2" y2="6"/><line x1="22" y1="6" x2="19" y2="3"/>',
  'hourglass': '<path d="M6 2 H18 V8 L12 12 L18 16 V22 H6 V16 L12 12 L6 8 Z"/>',
  'calendar-plus': '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/>',
  'calendar-check': '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9,16 11,18 15,14"/>',
  'users': '<path d="M17 21 V19 A4 4 0 0 0 13 15 H5 A4 4 0 0 0 1 19 V21"/><circle cx="9" cy="7" r="4"/><path d="M23 21 V19 A4 4 0 0 0 20 15.13"/><path d="M16 3.13 A4 4 0 0 1 16 10.87"/>',
  'user-plus': '<path d="M16 21 V19 A4 4 0 0 0 12 15 H5 A4 4 0 0 0 1 19 V21"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>',
  'user-minus': '<path d="M16 21 V19 A4 4 0 0 0 12 15 H5 A4 4 0 0 0 1 19 V21"/><circle cx="8.5" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/>',
  'user-check': '<path d="M16 21 V19 A4 4 0 0 0 12 15 H5 A4 4 0 0 0 1 19 V21"/><circle cx="8.5" cy="7" r="4"/><polyline points="17,11 19,13 23,9"/>',
  'user-x': '<path d="M16 21 V19 A4 4 0 0 0 12 15 H5 A4 4 0 0 0 1 19 V21"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/>',
  'user-circle': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6 18 C7.5 16 10 15 12 15 C14 15 16.5 16 18 18"/>',
  'avatar': '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="10" r="3"/><path d="M6 19 C7 17 9 16 12 16 C15 16 17 17 18 19"/>',
  'team': '<circle cx="9" cy="9" r="3"/><circle cx="17" cy="11" r="2.5"/><circle cx="5" cy="13" r="2"/><path d="M3 21 C3 17 6 15 9 15 C12 15 15 17 15 21"/><path d="M17 21 C17 19 18.5 17 20 17"/>',
  'message-circle': '<path d="M21 11.5 A8.38 8.38 0 0 1 12.5 20 A8.5 8.5 0 0 1 8 19.05 L3 21 L5 16 A8.5 8.5 0 0 1 4 11.5 A8.38 8.38 0 0 1 12.5 3 A8.38 8.38 0 0 1 21 11.5 Z"/>',
  'message-square': '<path d="M21 15 A2 2 0 0 1 19 17 H7 L3 21 V5 A2 2 0 0 1 5 3 H19 A2 2 0 0 1 21 5 Z"/>',
  'message-dots': '<path d="M21 15 A2 2 0 0 1 19 17 H7 L3 21 V5 A2 2 0 0 1 5 3 H19 A2 2 0 0 1 21 5 Z"/><circle cx="8" cy="10" r="1" fill="currentColor"/><circle cx="12" cy="10" r="1" fill="currentColor"/><circle cx="16" cy="10" r="1" fill="currentColor"/>',
  'inbox': '<polyline points="22,12 16,12 14,15 10,15 8,12 2,12"/><path d="M5.45 5.11 L2 12 V18 A2 2 0 0 0 4 20 H20 A2 2 0 0 0 22 18 V12 L18.55 5.11 A2 2 0 0 0 16.76 4 H7.24 A2 2 0 0 0 5.45 5.11 Z"/>',
  'archive': '<polyline points="21,8 21,21 3,21 3,8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>',
  'reply': '<polyline points="9,17 4,12 9,7"/><path d="M20 18 V16 A4 4 0 0 0 16 12 H4"/>',
  'at-sign': '<circle cx="12" cy="12" r="4"/><path d="M16 8 V13 A3 3 0 0 0 22 13 V12 A10 10 0 1 0 18 20"/>',
  'hash-symbol': '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
  'folder-open': '<path d="M22 12 A2 2 0 0 0 20 10 H12 L10 7 H4 A2 2 0 0 0 2 9 V19 A2 2 0 0 0 4 21 H19 C19.9 21 20.7 20.5 21 19.7 L23 14 Z"/>',
  'folder-plus': '<path d="M22 19 A2 2 0 0 1 20 21 H4 A2 2 0 0 1 2 19 V5 A2 2 0 0 1 4 3 H9 L11 6 H20 A2 2 0 0 1 22 8 Z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>',
  'folder-minus': '<path d="M22 19 A2 2 0 0 1 20 21 H4 A2 2 0 0 1 2 19 V5 A2 2 0 0 1 4 3 H9 L11 6 H20 A2 2 0 0 1 22 8 Z"/><line x1="9" y1="14" x2="15" y2="14"/>',
  'file-text': '<path d="M14 2 H6 A2 2 0 0 0 4 4 V20 A2 2 0 0 0 6 22 H18 A2 2 0 0 0 20 20 V8 Z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>',
  'file-plus': '<path d="M14 2 H6 A2 2 0 0 0 4 4 V20 A2 2 0 0 0 6 22 H18 A2 2 0 0 0 20 20 V8 Z"/><polyline points="14,2 14,8 20,8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>',
  'file-minus': '<path d="M14 2 H6 A2 2 0 0 0 4 4 V20 A2 2 0 0 0 6 22 H18 A2 2 0 0 0 20 20 V8 Z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="15" x2="15" y2="15"/>',
  'file-check': '<path d="M14 2 H6 A2 2 0 0 0 4 4 V20 A2 2 0 0 0 6 22 H18 A2 2 0 0 0 20 20 V8 Z"/><polyline points="14,2 14,8 20,8"/><polyline points="9,15 11,17 15,13"/>',
  'paperclip': '<path d="M21.44 11.05 L12.25 20.24 A6 6 0 0 1 3.76 11.76 L13.07 2.45 A4 4 0 0 1 18.73 8.11 L9.41 17.42 A2 2 0 0 1 6.59 14.59 L15.07 6.12"/>',
  'files': '<rect x="4" y="2" width="13" height="16" rx="1.5"/><rect x="7" y="6" width="13" height="16" rx="1.5"/>',
  'clipboard': '<path d="M16 4 H18 A2 2 0 0 1 20 6 V20 A2 2 0 0 1 18 22 H6 A2 2 0 0 1 4 20 V6 A2 2 0 0 1 6 4 H8"/><rect x="8" y="2" width="8" height="4" rx="1"/>',
  'scissors': '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>',
  'bold': '<path d="M6 4 H14 A4 4 0 0 1 14 12 H6 Z"/><path d="M6 12 H15 A4 4 0 0 1 15 20 H6 Z"/>',
  'italic': '<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>',
  'underline': '<path d="M6 3 V11 A6 6 0 0 0 18 11 V3"/><line x1="4" y1="21" x2="20" y2="21"/>',
  'align-left': '<line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>',
  'align-center': '<line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/>',
  'align-right': '<line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/>',
  'align-justify': '<line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/>',
  'list-bullet': '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/>',
  'list-numbered': '<line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><path d="M3 4 H5 V8"/><path d="M3 11 H5 C5 12 3 12 3 13 H5"/><path d="M3 16 H5 V18 H3 V20 H5"/>',
  'type': '<polyline points="4,7 4,4 20,4 20,7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>',
  'quote': '<path d="M7 11 H4 V8 C4 6 5 5 7 5 V7 C6 7 6 7 6 8 V11 V14 H7 Z" fill="currentColor"/><path d="M17 11 H14 V8 C14 6 15 5 17 5 V7 C16 7 16 7 16 8 V11 V14 H17 Z" fill="currentColor"/>',
  'play': '<polygon points="5,3 19,12 5,21" fill="currentColor"/>',
  'pause': '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
  'stop': '<rect x="5" y="5" width="14" height="14" rx="1"/>',
  'skip-forward': '<polygon points="5,4 15,12 5,20" fill="currentColor"/><line x1="19" y1="5" x2="19" y2="19"/>',
  'skip-back': '<polygon points="19,20 9,12 19,4" fill="currentColor"/><line x1="5" y1="19" x2="5" y2="5"/>',
  'shuffle': '<polyline points="16,3 21,3 21,8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21,16 21,21 16,21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>',
  'repeat': '<polyline points="17,1 21,5 17,9"/><path d="M3 11 V9 A4 4 0 0 1 7 5 H21"/><polyline points="7,23 3,19 7,15"/><path d="M21 13 V15 A4 4 0 0 1 17 19 H3"/>',
  'record': '<circle cx="12" cy="12" r="5" fill="currentColor"/>',
  'chart-bar': '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
  'chart-line': '<polyline points="3,17 9,11 13,15 21,7"/><polyline points="14,7 21,7 21,14"/>',
  'chart-pie': '<path d="M21.21 15.89 A10 10 0 1 1 8 2.83"/><path d="M22 12 A10 10 0 0 0 12 2 V12 Z"/>',
  'trending-up': '<polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/>',
  'trending-down': '<polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/><polyline points="17,18 23,18 23,12"/>',
  'activity': '<polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>',
  'database': '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12 C21 13.66 17 15 12 15 C7 15 3 13.66 3 12"/><path d="M3 5 V19 C3 20.66 7 22 12 22 C17 22 21 20.66 21 19 V5"/>',
  'server': '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
  'layout': '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
  'columns': '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/>',
  'sidebar': '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>',
  'maximize': '<path d="M8 3 H5 A2 2 0 0 0 3 5 V8 M21 8 V5 A2 2 0 0 0 19 3 H16 M16 21 H19 A2 2 0 0 0 21 19 V16 M3 16 V19 A2 2 0 0 0 5 21 H8"/>',
  'minimize': '<path d="M8 3 V5 A2 2 0 0 1 6 7 H4 M21 8 H19 A2 2 0 0 1 17 6 V4 M17 20 V18 A2 2 0 0 1 19 16 H21 M4 16 H6 A2 2 0 0 1 8 18 V20"/>',
  'crop': '<path d="M6 1 V18 H23"/><path d="M1 6 H18 V23"/>',
  'move': '<polyline points="5,9 2,12 5,15"/><polyline points="9,5 12,2 15,5"/><polyline points="15,19 12,22 9,19"/><polyline points="19,9 22,12 19,15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>',
  'resize': '<polyline points="15,3 21,3 21,9"/><polyline points="9,21 3,21 3,15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>',
  'divide': '<circle cx="12" cy="6" r="1.5" fill="currentColor"/><line x1="5" y1="12" x2="19" y2="12"/><circle cx="12" cy="18" r="1.5" fill="currentColor"/>',
  'percent': '<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  'info': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  'question-mark': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9 A3 3 0 0 1 14.83 10 C14.83 12 11.83 13 11.83 13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  'alert-triangle': '<path d="M10.29 3.86 L1.82 18 A2 2 0 0 0 3.55 21 H20.45 A2 2 0 0 0 22.18 18 L13.71 3.86 A2 2 0 0 0 10.29 3.86 Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9 A3 3 0 0 1 14.83 10 C14.83 12 11.83 13 11.83 13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  'check-circle': '<path d="M22 11.08 V12 A10 10 0 1 1 16 2.83"/><polyline points="22,4 12,14.01 9,11.01"/>',
  'cloud-rain': '<line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><path d="M20 16.58 A5 5 0 0 0 18 7 H16.74 A8 8 0 1 0 3 14.25"/>',
  'cloud-snow': '<path d="M20 16.58 A5 5 0 0 0 18 7 H16.74 A8 8 0 1 0 3 14.25"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="8" y1="20" x2="8.01" y2="20"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="12" y1="22" x2="12.01" y2="22"/><line x1="16" y1="16" x2="16.01" y2="16"/><line x1="16" y1="20" x2="16.01" y2="20"/>',
  'cloud-lightning': '<path d="M19 16.9 A5 5 0 0 0 18 7 H16.74 A8 8 0 1 0 3 14.25"/><polyline points="13,11 9,17 13,17 11,23"/>',
  'umbrella': '<path d="M23 12 A11 11 0 0 0 1 12 H23 Z"/><path d="M12 12 V19 A2 2 0 1 1 8 19"/>',
  'thermometer': '<path d="M14 14.76 V3.5 A2.5 2.5 0 0 0 9 3.5 V14.76 A5 5 0 1 0 14 14.76 Z"/>',
  'droplet': '<path d="M12 2.69 L5.64 9.05 A9 9 0 1 0 18.36 9.05 Z"/>',
  'wind': '<path d="M9.59 4.59 A2 2 0 1 1 11 8 H2 M12.59 19.41 A2 2 0 1 0 14 16 H2 M17.73 7.73 A2.5 2.5 0 1 1 19.5 12 H2"/>',
  'snowflake': '<line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/>',
  'car': '<path d="M5 17 H3 V11 L5 6 H19 L21 11 V17 H19"/><path d="M5 17 V19 A1 1 0 0 0 6 20 H8 A1 1 0 0 0 9 19 V17 M15 17 V19 A1 1 0 0 0 16 20 H18 A1 1 0 0 0 19 19 V17"/><circle cx="7.5" cy="13.5" r="1.5"/><circle cx="16.5" cy="13.5" r="1.5"/>',
  'bike': '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5 L8 5 H6 M16 17.5 L13 11 H8.5"/>',
  'airplane': '<path d="M22 16 V18 L14 14 V19 L17 21 V22 L12 21 L7 22 V21 L10 19 V14 L2 18 V16 L10 11 V5 A2 2 0 0 1 14 5 V11 Z"/>',
  'truck': '<rect x="1" y="6" width="13" height="11"/><polyline points="14,9 19,9 22,13 22,17 14,17"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/>',
  'ship': '<path d="M3 14 L12 4 L21 14 M2 21 C2 21 3 19 7 19 C11 19 13 21 17 21 C20 21 22 19 22 19 M5 14 V20 M19 14 V20"/>',
  'train': '<rect x="4" y="3" width="16" height="13" rx="2"/><line x1="4" y1="11" x2="20" y2="11"/><circle cx="8" cy="14" r="1" fill="currentColor"/><circle cx="16" cy="14" r="1" fill="currentColor"/><line x1="6" y1="20" x2="9" y2="17"/><line x1="18" y1="20" x2="15" y2="17"/>',
  'dollar-sign': '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5 H9.5 A3.5 3.5 0 0 0 9.5 12 H14.5 A3.5 3.5 0 0 1 14.5 19 H6"/>',
  'wallet': '<rect x="2" y="6" width="20" height="13" rx="2"/><path d="M22 11 H18 A2 2 0 0 0 18 15 H22"/>',
  'receipt': '<path d="M5 3 H19 V21 L17 19 L15 21 L13 19 L11 21 L9 19 L7 21 L5 19 Z"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/>',
  'piggy-bank': '<path d="M19 5 A2 2 0 1 0 17 7 V8 H15 V6 H11 V8 C7 8 5 11 5 14 V17 H4 V20 H7 V18 H10 V20 H13 V18 C15 18 17 17 19 14 V12 H22 V8 H19 Z"/><circle cx="9" cy="13" r="0.8" fill="currentColor"/>',
  'bug': '<rect x="7" y="9" width="10" height="12" rx="5"/><path d="M7 15 H2 M22 15 H17 M7 11 L4 8 M17 11 L20 8 M7 19 L4 22 M17 19 L20 22 M9 5 L9 9 M15 5 L15 9"/>',
  'git-branch': '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9 A9 9 0 0 1 9 18"/>',
  'git-commit': '<circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17" y1="12" x2="22.96" y2="12"/>',
  'git-merge': '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21 V9 A9 9 0 0 0 15 18 H15"/>',
  'zap': '<polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>',
  'cpu': '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
  'award': '<circle cx="12" cy="8" r="7"/><polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/>',
  'flag': '<path d="M4 15 C5 14 8 14 11 14 C14 14 17 16 20 15 V3 C19 4 16 4 13 4 C10 4 7 2 4 3 Z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  'pin': '<line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17 H19 V9 L17 5 H7 L5 9 Z"/><circle cx="12" cy="11" r="2"/>',
  'leaf': '<path d="M11 20 C5 20 3 16 3 12 C3 7 7 5 12 5 C16 5 18 4 20 3 C21 6 22 14 17 19 C14 21 11 20 11 20 Z"/><path d="M2 22 C8 17 13 12 18 6"/>'
};

// ============================================================================
// SEED: new brand icons (added in v0.2)
// ============================================================================
const SEED_BRANDS = {
  'samsung': '<rect width="24" height="24" rx="5" fill="#1428A0"/><ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#fff" stroke-width="1.5" fill="none"/>',
  'sony': '<rect width="24" height="24" rx="5" fill="#000"/><path d="M16 8 C14 6 10 6 8 7 C6 8 7 11 9 12 C11 13 14 13 14 15 C14 17 11 18 8 16" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>',
  'nvidia': '<rect width="24" height="24" rx="5" fill="#000"/><path d="M11 6 C7 6 4 9 4 12 C4 15 7 18 11 18 V15 C9 15 7 14 7 12 C7 10 9 9 11 9 C13 9 16 10 18 13 V17 C18 17 14 13 11 13" fill="#76B900"/>',
  'intel': '<rect width="24" height="24" rx="5" fill="#0071C5"/><circle cx="12" cy="7" r="1.5" fill="#fff"/><rect x="10.5" y="10" width="3" height="9" fill="#fff"/>',
  'ibm': '<rect width="24" height="24" rx="5" fill="#1F70C1"/><line x1="4" y1="8" x2="20" y2="8" stroke="#fff" stroke-width="1.5"/><line x1="4" y1="11" x2="20" y2="11" stroke="#fff" stroke-width="1.5"/><line x1="4" y1="14" x2="20" y2="14" stroke="#fff" stroke-width="1.5"/><line x1="4" y1="17" x2="20" y2="17" stroke="#fff" stroke-width="1.5"/>',
  'brave': '<rect width="24" height="24" rx="5" fill="#FB542B"/><path d="M12 4 L8 6 L6.5 11 L8 16 L12 20 L16 16 L17.5 11 L16 6 Z" fill="#fff"/><path d="M10 11 L12 13 L14 11" stroke="#FB542B" stroke-width="1" fill="none"/>',
  'duckduckgo': '<rect width="24" height="24" rx="12" fill="#DE5833"/><circle cx="12" cy="13" r="8" fill="#fff"/><circle cx="14" cy="10" r="1.5" fill="#DE5833"/><circle cx="14.3" cy="9.7" r="0.4" fill="#fff"/><path d="M16 14 L19 11 L18 10" stroke="#DE5833" stroke-width="1" fill="none"/>',
  'perplexity': '<rect width="24" height="24" rx="5" fill="#20808D"/><path d="M6 7 V17 L12 21 L18 17 V7 L12 3 Z" fill="none" stroke="#fff" stroke-width="1.5"/><line x1="12" y1="3" x2="12" y2="21" stroke="#fff" stroke-width="1.5"/><line x1="6" y1="12" x2="18" y2="12" stroke="#fff" stroke-width="1.5"/>',
  'midjourney': '<rect width="24" height="24" rx="5" fill="#000"/><path d="M4 17 H20 M7 14 L10 11 L13 14 L16 11" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 11 V6 L12 4 L15 6 V11" stroke="#fff" stroke-width="1.5" fill="none" stroke-linejoin="round"/><line x1="3" y1="20" x2="21" y2="20" stroke="#fff" stroke-width="1.5"/>',
  'gemini': '<defs><linearGradient id="gem" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4796E3"/><stop offset="100%" stop-color="#9168C0"/></linearGradient></defs><rect width="24" height="24" rx="5" fill="url(#gem)"/><path d="M12 3 C12 9 13 11 21 12 C13 13 12 15 12 21 C12 15 11 13 3 12 C11 11 12 9 12 3 Z" fill="#fff"/>',
  'grok': '<rect width="24" height="24" rx="5" fill="#000"/><polygon points="6,4 12,12 18,4 21,4 14,12 21,20 18,20 12,12 6,20 3,20 10,12 3,4" fill="#fff"/>',
  'dropbox': '<rect width="24" height="24" rx="5" fill="#fff"/><polygon points="6,5 12,8 6,11 1,8" fill="#0061FF"/><polygon points="18,5 23,8 18,11 12,8" fill="#0061FF"/><polygon points="6,15 12,18 6,21 1,18" fill="#0061FF"/><polygon points="18,15 23,18 18,21 12,18" fill="#0061FF"/><polygon points="6,11 12,8 18,11 12,14" fill="#0061FF" opacity="0.4"/>',
  'box': '<rect width="24" height="24" rx="5" fill="#0061D5"/><rect x="5" y="9" width="14" height="9" rx="1" stroke="#fff" stroke-width="2" fill="none"/><line x1="5" y1="13" x2="19" y2="13" stroke="#fff" stroke-width="1.5"/>',
  'bitbucket': '<rect width="24" height="24" rx="5" fill="#2684FF"/><path d="M5 5 L7.5 19 H16.5 L19 5 Z" fill="#fff"/><rect x="9.5" y="9" width="5" height="4" fill="#2684FF"/>',
  'gitlab': '<rect width="24" height="24" rx="5" fill="#fff"/><polygon points="12,4 8,11 16,11" fill="#FC6D26"/><polygon points="12,4 4,11 8,11" fill="#FCA326"/><polygon points="12,4 20,11 16,11" fill="#FCA326"/><polygon points="12,21 8,11 4,11" fill="#E24329"/><polygon points="12,21 16,11 20,11" fill="#E24329"/><polygon points="12,21 8,11 16,11" fill="#FC6D26"/>',
  'replit': '<rect width="24" height="24" rx="5" fill="#F26207"/><path d="M6 4 H13 A4 4 0 0 1 13 12 H10 V20 H6 Z" fill="#fff"/><rect x="10" y="12" width="6" height="8" fill="#fff"/>',
  'codepen': '<rect width="24" height="24" rx="5" fill="#fff"/><polygon points="12,3 21,9 21,15 12,21 3,15 3,9" stroke="#000" stroke-width="1.5" fill="none"/><line x1="3" y1="9" x2="12" y2="15" stroke="#000" stroke-width="1.5"/><line x1="21" y1="9" x2="12" y2="15" stroke="#000" stroke-width="1.5"/><line x1="12" y1="3" x2="12" y2="9" stroke="#000" stroke-width="1.5"/><line x1="12" y1="15" x2="12" y2="21" stroke="#000" stroke-width="1.5"/>',
  'heroku': '<rect width="24" height="24" rx="5" fill="#430098"/><path d="M7 4 V20 H10 V13 C11 12 14 11.5 14 13 V20 H17 V12 C17 9 13 8.5 10 10 V4 Z" fill="#fff"/>',
  'render': '<rect width="24" height="24" rx="5" fill="#46E3B7"/><circle cx="12" cy="12" r="6" fill="#fff"/><circle cx="12" cy="12" r="2.5" fill="#46E3B7"/>',
  'paypal': '<rect width="24" height="24" rx="5" fill="#003087"/><path d="M9 6 H15 C17 6 18 8 17 10.5 C16 13 13 14 11 14 H10 L9 19 H7 Z" fill="#fff"/><path d="M12 9 H16 C17 9 18 10.5 17 13 C16 15.5 13 16.5 11 16.5 H10 L9 21 H11 L12 17 C14 17 17 16 18 13 C19 10 17 8 15 8 H12 Z" fill="#009CDE"/>',
  'venmo': '<rect width="24" height="24" rx="5" fill="#3D95CE"/><path d="M6 5 H10 L12 16 L16 5 H20 L14 19 H10 Z" fill="#fff"/>',
  'cashapp': '<rect width="24" height="24" rx="5" fill="#00D632"/><path d="M12 4 V8 M12 16 V20 M16 8 H10 A2 2 0 0 0 10 12 H14 A2 2 0 0 1 14 16 H8" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
  'square': '<rect width="24" height="24" rx="5" fill="#fff"/><rect x="5" y="5" width="14" height="14" rx="3" stroke="#000" stroke-width="2.5" fill="none"/>',
  'disneyplus': '<rect width="24" height="24" rx="5" fill="#01153E"/><path d="M5 10 C8 6 13 6 16 9 C18 12 16 16 13 16 C10 16 7 14 6 12" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/><line x1="18" y1="6" x2="20" y2="6" stroke="#fff" stroke-width="1.5"/><line x1="19" y1="5" x2="19" y2="7" stroke="#fff" stroke-width="1.5"/>',
  'hulu': '<rect width="24" height="24" rx="5" fill="#1CE783"/><path d="M5 4 V20 H8 V12 C8 11.5 8.5 11 9 11 H14 V20 H17 V11 C17 9.5 15.5 8 13 8 H8 V4 Z" fill="#000"/>',
  'hbomax': '<rect width="24" height="24" rx="5" fill="#000"/><path d="M3 7 V17 M3 12 H8 M8 7 V17" stroke="#fff" stroke-width="2" fill="none"/><circle cx="14" cy="12" r="3" stroke="#fff" stroke-width="1.8" fill="none"/><circle cx="19" cy="12" r="2" stroke="#fff" stroke-width="1.5" fill="none"/>',
  'soundcloud': '<rect width="24" height="24" rx="5" fill="#FF5500"/><path d="M5 17 V12 M7 17 V11 M9 17 V10 M11 17 V8 M13 17 V10 C13 8 15 7 17 8 C19 8 20 10 20 12 C20 14 19 16 17 17 Z" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  'applemusic': '<defs><linearGradient id="am" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FA233B"/><stop offset="100%" stop-color="#FB5C74"/></linearGradient></defs><rect width="24" height="24" rx="5" fill="url(#am)"/><path d="M9 17 V7 L17 5 V14" stroke="#fff" stroke-width="1.5" fill="none"/><circle cx="7.5" cy="17" r="2.2" fill="#fff"/><circle cx="15.5" cy="14" r="2.2" fill="#fff"/>',
  'pandora': '<rect width="24" height="24" rx="5" fill="#3668FF"/><path d="M7 5 H14 C17 5 19 7 19 10 C19 13 17 14.5 14 14.5 H10 V20 H7 Z" fill="#fff"/>',
  'vimeo': '<rect width="24" height="24" rx="5" fill="#1AB7EA"/><path d="M5 9 C5 9 6 7 8 7 C10 7 10 10 10 11 C11 13 11 16 13 16 C14 16 16 14 17 11 C18 8 16 6 14 7 C13 7 13 8 14 7 C15 6 17 5 19 6 C21 7 21 11 19 14 C16 18 14 21 12 21 C10 21 9 17 8 14 C7 11 6 10 5 11 Z" fill="#fff"/>',
  'signal': '<rect width="24" height="24" rx="5" fill="#3A76F0"/><path d="M4 20 L5 17 C4 16 4 14 4 12 C4 8 8 4 12 4 C16 4 20 8 20 12 C20 16 16 20 12 20 C10 20 9 19.5 8 19 Z" fill="#fff"/>',
  'messenger': '<defs><linearGradient id="msng" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00B2FF"/><stop offset="100%" stop-color="#006AFF"/></linearGradient></defs><rect width="24" height="24" rx="5" fill="url(#msng)"/><path d="M12 3 C7 3 3 7 3 12 C3 14 4 16 6 17 V21 L9 19 C10 19 11 19 12 19 C17 19 21 16 21 11 C21 7 17 3 12 3 Z" fill="#fff"/><path d="M6 13 L10 9 L13 12 L17 9 L13 14 L10 11 Z" fill="#006AFF"/>',
  'wechat': '<rect width="24" height="24" rx="5" fill="#07C160"/><ellipse cx="9" cy="9" rx="6" ry="5" fill="#fff"/><circle cx="7" cy="9" r="0.7" fill="#07C160"/><circle cx="11" cy="9" r="0.7" fill="#07C160"/><ellipse cx="15" cy="15" rx="5" ry="4" fill="#fff"/><circle cx="13.5" cy="14.5" r="0.6" fill="#07C160"/><circle cx="16.5" cy="14.5" r="0.6" fill="#07C160"/>',
  'airbnb': '<rect width="24" height="24" rx="5" fill="#FF5A5F"/><path d="M12 4 C9 4 7 6 7 9 C7 12 9 15 12 19 C15 15 17 12 17 9 C17 6 15 4 12 4 Z" fill="none" stroke="#fff" stroke-width="2"/><circle cx="12" cy="9" r="2" fill="none" stroke="#fff" stroke-width="1.5"/>',
  'lyft': '<rect width="24" height="24" rx="5" fill="#FF00BF"/><path d="M5 4 V14 C5 16 7 17 9 17" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M10 8 V14 C10 16 12 17 14 16 L16 11" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 7 L19 14" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
  'calendly': '<rect width="24" height="24" rx="5" fill="#006BFF"/><rect x="5" y="6" width="14" height="14" rx="2" fill="#fff"/><line x1="8" y1="4" x2="8" y2="8" stroke="#fff" stroke-width="2"/><line x1="16" y1="4" x2="16" y2="8" stroke="#fff" stroke-width="2"/><circle cx="12" cy="14" r="3" fill="none" stroke="#006BFF" stroke-width="1.5"/>'
};

// ============================================================================
// SEED PHASE
// ============================================================================
fs.mkdirSync(UTIL_DIR, { recursive: true });
fs.mkdirSync(BRAND_DIR, { recursive: true });
fs.mkdirSync(PREVIEW_DIR, { recursive: true });

let seededUtil = 0, seededBrand = 0;

for (const [name, body] of Object.entries(SEED_UTIL)) {
  const file = path.join(UTIL_DIR, name + '.svg');
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, `<svg ${UTIL_ATTRS}>${body}</svg>\n`);
    seededUtil++;
  }
}
for (const [name, body] of Object.entries(SEED_BRANDS)) {
  const file = path.join(BRAND_DIR, name + '.svg');
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, `<svg ${BRAND_ATTRS}>${body}</svg>\n`);
    seededBrand++;
  }
}

// ============================================================================
// BUILD PHASE: read all SVGs, regenerate preview + manifest
// ============================================================================
function listIcons(dir) {
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.svg'))
    .sort()
    .map(f => ({
      name: f.replace(/\.svg$/, ''),
      content: fs.readFileSync(path.join(dir, f), 'utf-8').trim()
    }));
}

const utility = listIcons(UTIL_DIR);
const brands = listIcons(BRAND_DIR);

const manifest = {
  name: 'vibeslopicons',
  version: '0.2.0',
  total: utility.length + brands.length,
  categories: {
    utility: { count: utility.length, icons: utility.map(i => i.name) },
    brands: { count: brands.length, icons: brands.map(i => i.name) }
  }
};
fs.writeFileSync(path.join(ROOT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

const utilCells = utility.map(i => `<div class="cell"><div class="icon util">${i.content}</div><div class="name">${i.name}</div></div>`).join('');
const brandCells = brands.map(i => `<div class="cell"><div class="icon">${i.content}</div><div class="name">${i.name}</div></div>`).join('');

const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vibeslopicons</title>
<style>
* { box-sizing: border-box; }
body { margin: 0; padding: 48px 32px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; background: #fafafa; color: #18181b; }
header { max-width: 1200px; margin: 0 auto 48px; }
h1 { font-size: 32px; margin: 0 0 8px; letter-spacing: -0.02em; }
.subtitle { color: #71717a; margin: 0; max-width: 600px; line-height: 1.5; }
main { max-width: 1200px; margin: 0 auto; }
h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a; margin: 48px 0 16px; font-weight: 600; }
h2 span { color: #a1a1aa; font-weight: 400; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; }
.cell { background: #fff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px 8px; display: flex; flex-direction: column; align-items: center; gap: 12px; transition: all 0.15s; }
.cell:hover { border-color: #a1a1aa; transform: translateY(-1px); }
.icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
.icon svg { width: 100%; height: 100%; display: block; }
.icon.util svg { stroke: #18181b; }
.name { font-size: 10.5px; color: #52525b; font-family: ui-monospace, "SF Mono", Menlo, monospace; word-break: break-all; text-align: center; line-height: 1.4; }
footer { max-width: 1200px; margin: 64px auto 0; padding-top: 24px; border-top: 1px solid #e4e4e7; font-size: 12px; color: #a1a1aa; }
</style>
</head>
<body>
<header>
  <h1>Vibeslopicons</h1>
  <p class="subtitle">${utility.length + brands.length} hand-crafted SVG icons. ${utility.length} utility outlines and ${brands.length} brand favicons.</p>
</header>
<main>
  <h2>Utility <span>&middot; ${utility.length}</span></h2>
  <div class="grid">${utilCells}</div>
  <h2>Brands <span>&middot; ${brands.length}</span></h2>
  <div class="grid">${brandCells}</div>
</main>
<footer>Brand icons are stylized approximations. All trademarks belong to their respective owners.</footer>
</body>
</html>
`;
fs.writeFileSync(path.join(PREVIEW_DIR, 'index.html'), previewHtml);

// ============================================================================
// PNG PHASE: convert each SVG to a 64×64 PNG via rsvg-convert
// ============================================================================
const { execSync } = require('child_process');

function hasCommand(cmd) {
  try { execSync(`command -v ${cmd}`, { stdio: 'pipe' }); return true; }
  catch { return false; }
}

function svgToPng(svgPath, pngPath, size) {
  try {
    execSync(`rsvg-convert -w ${size} -h ${size} "${svgPath}" -o "${pngPath}"`, { stdio: 'pipe' });
    return true;
  } catch { return false; }
}

const hasRsvg = hasCommand('rsvg-convert');
let pngCount = 0;

if (hasRsvg) {
  for (const dir of [UTIL_DIR, BRAND_DIR]) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));
    for (const file of files) {
      const svgPath = path.join(dir, file);
      const pngPath = svgPath.replace(/\.svg$/, '.png');
      if (!fs.existsSync(pngPath)) {
        if (svgToPng(svgPath, pngPath, 64)) pngCount++;
      }
    }
  }
}

// ============================================================================
// SAMPLE GRID PHASE: composite 8×8 grids for the README
// ============================================================================
const ASSETS_DIR = path.join(ROOT, 'assets');
fs.mkdirSync(ASSETS_DIR, { recursive: true });

function extractSvgInner(svgString) {
  const m = svgString.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  return m ? m[1] : '';
}

function makeGrid(iconList, isUtility) {
  const cellSize = 48;
  const cols = 8;
  const totalSize = cellSize * cols;
  const cellOffset = (cellSize - 24) / 2;
  const gAttrs = isUtility
    ? ' stroke="#18181b" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"'
    : '';
  const cells = iconList.slice(0, 64).map((icon, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = col * cellSize;
    const y = row * cellSize;
    const inner = extractSvgInner(icon.content);
    return `<rect x="${x+1}" y="${y+1}" width="${cellSize-2}" height="${cellSize-2}" fill="#fafafa"/><g transform="translate(${x+cellOffset} ${y+cellOffset})"${gAttrs}>${inner}</g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${totalSize}" height="${totalSize}"><rect width="${totalSize}" height="${totalSize}" fill="#d4d4d8"/>${cells}</svg>\n`;
}

fs.writeFileSync(path.join(ASSETS_DIR, 'sample-utility.svg'), makeGrid(utility, true));
fs.writeFileSync(path.join(ASSETS_DIR, 'sample-brands.svg'), makeGrid(brands, false));

if (hasRsvg) {
  svgToPng(path.join(ASSETS_DIR, 'sample-utility.svg'), path.join(ASSETS_DIR, 'sample-utility.png'), 768);
  svgToPng(path.join(ASSETS_DIR, 'sample-brands.svg'), path.join(ASSETS_DIR, 'sample-brands.png'), 768);
}

console.log(`Seeded ${seededUtil} new utility + ${seededBrand} new brand icons.`);
console.log(`OK  ${utility.length} utility + ${brands.length} brand = ${utility.length + brands.length} icons`);
console.log(`    icons/utility/*.svg, icons/brands/*.svg`);
console.log(`    icons/utility/*.png, icons/brands/*.png (${pngCount} new, 64×64)${hasRsvg ? '' : ' — SKIPPED: rsvg-convert not found'}`);
console.log(`    preview/index.html`);
console.log(`    manifest.json`);
console.log(`    assets/sample-utility.{svg,png}, assets/sample-brands.{svg,png}`);
