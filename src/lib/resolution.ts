/*
 * resolution.ts — a faithful (bounded) "module-resolution tracer" (M12 engine).
 *
 * Pure logic (no React, no i18n) so the ★ resolution sim renders it and the golden test
 * (scripts/test-resolution.ts) verifies it. It runs a REAL resolver — not a canned trace — over one
 * small fixed virtual file system, and records the ORDERED list of candidate paths TypeScript probes
 * for a given import, ending in a resolve or a failure. That ordering is the whole lesson, so it is
 * modelled directly from the TypeScript Handbook "Modules — Reference" algorithm:
 *   • extension substitution (the master ordering): a would-be `.js` lookup tries
 *     .ts → .tsx → .d.ts → .js → .jsx (and .mjs → .mts → .d.mts, .cjs → .cts → .d.cts) FIRST,
 *   • node16/nodenext gate `import` vs `require` behaviour on the importing file's format — extensionless
 *     paths and directory modules are allowed under `require` but NOT under `import`,
 *   • package.json "exports"/"imports" match conditions in KEY order (types → node → import/require),
 *     and the mere presence of "exports" BLOCKS any unlisted subpath,
 *   • the node_modules walk runs types-first (real package, then @types) before allowing a JS-only hit,
 *   • `bundler` supports exports/imports but, like CommonJS, never requires an extension.
 * Version-sensitive facts web-verified (see the module's sources): node10/node16/nodenext/bundler
 * (bundler added TS 5.0); node → node10 rename (5.0); exports/imports conditions.
 */

// ── Public shapes ───────────────────────────────────────────────────────────────
export type Mode = 'node10' | 'node16' | 'bundler';
export type Format = 'esm' | 'cjs'; // the importing file's module format (drives node16 import vs require)

export type RuleKind =
  | 'ext-sub'        // extension substitution candidate (.ts/.tsx/.d.ts…)
  | 'index'          // directory module → index.*
  | 'esm-needs-ext'  // ESM: extensionless / directory imports are not allowed
  | 'nm'             // enter a node_modules package directory
  | 'field'          // read package.json "types"/"main"
  | 'exports'        // consult package.json "exports"
  | 'imports'        // consult package.json "imports" (#specifier)
  | 'condition'      // test one export/import condition key
  | 'blocked'        // "exports" is present but the subpath is not listed
  | 'remap'          // local-project imports remap (outDir → rootDir, .d.ts → .ts)
  | 'at-types';      // node_modules/@types/<pkg> lookup

export type Probe = { path: string; rule: RuleKind; hit: boolean; note?: string };

export type Scenario = {
  id: string;
  title: string;
  specifier: string;
  mode: Mode;
  format: Format;   // importer format (only meaningful under node16)
  importer: string; // absolute path of the importing file
  teaches: string;  // one-line English hook (localized caption lives in the component)
};

export type Trace = { scenario: Scenario; probes: Probe[]; resolved?: string };

// ── The virtual project (fixed; every scenario resolves against this one tree) ─────────────────────
const FILES = new Set<string>([
  '/proj/src/main.ts',
  '/proj/src/util.ts',
  '/proj/src/utils.ts',
  '/proj/src/shapes/index.ts',
  '/proj/node_modules/lodash/index.js',
  '/proj/node_modules/@types/lodash/index.d.ts',
  '/proj/node_modules/pkg/dist/index.d.ts',
  '/proj/node_modules/pkg/dist/index.js',
  '/proj/node_modules/pkg/dist/index.cjs',
  '/proj/node_modules/pkg/dist/sub.d.ts',
  '/proj/node_modules/pkg/dist/sub.js',
]);

type ExportsVal = string | { [condition: string]: ExportsVal };
type PkgJson = {
  name?: string;
  type?: 'module' | 'commonjs';
  main?: string;
  types?: string;
  rootDir?: string;
  outDir?: string;
  exports?: Record<string, ExportsVal>;
  imports?: Record<string, ExportsVal>;
};

const PKGS: Record<string, PkgJson> = {
  '/proj/package.json': {
    name: 'app',
    type: 'module',
    rootDir: './src',
    outDir: './dist',
    imports: {
      '#utils': { types: './dist/utils.d.ts', import: './dist/utils.js', default: './dist/utils.js' },
    },
  },
  '/proj/node_modules/pkg/package.json': {
    name: 'pkg',
    type: 'module',
    exports: {
      '.': { types: './dist/index.d.ts', import: './dist/index.js', require: './dist/index.cjs' },
      './sub': { types: './dist/sub.d.ts', import: './dist/sub.js' },
    },
  },
  '/proj/node_modules/lodash/package.json': { name: 'lodash', main: './index.js' },
};

// ── Path helpers (POSIX, browser-safe — no node:path) ──────────────────────────
function dirOf(p: string): string {
  const i = p.lastIndexOf('/');
  return i <= 0 ? '/' : p.slice(0, i);
}
function resolvePath(baseDir: string, rel: string): string {
  const raw = rel.startsWith('/') ? rel : baseDir + '/' + rel;
  const out: string[] = [];
  for (const seg of raw.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') out.pop();
    else out.push(seg);
  }
  return '/' + out.join('/');
}
function ancestors(dir: string): string[] {
  const out: string[] = [];
  let cur = dir;
  for (;;) {
    out.push(cur);
    if (cur === '/') break;
    cur = dirOf(cur);
  }
  return out;
}

// ── Extension substitution — the master ordering (Handbook, "extension substitution") ───────────────
const EXT_ROWS: Record<string, string[]> = {
  '.js': ['.ts', '.tsx', '.d.ts', '.js', '.jsx'],
  '.jsx': ['.tsx', '.d.ts', '.jsx'],
  '.mjs': ['.mts', '.d.mts', '.mjs'],
  '.cjs': ['.cts', '.d.cts', '.cjs'],
};
const TYPE_EXTS = new Set(['.ts', '.tsx', '.d.ts', '.mts', '.d.mts', '.cts', '.d.cts']);
const TS_INPUT_RE = /\.(d\.ts|d\.mts|d\.cts|ts|tsx|mts|cts)$/;

function runtimeExt(p: string): string {
  if (p.endsWith('.mjs')) return '.mjs';
  if (p.endsWith('.cjs')) return '.cjs';
  if (p.endsWith('.jsx')) return '.jsx';
  return '.js';
}

/** Push extension-substitution probes for a would-be JS path; return the first existing candidate. */
function extSub(jsPath: string, typesOnly: boolean, probes: Probe[], rule: RuleKind = 'ext-sub'): string | undefined {
  const ext = runtimeExt(jsPath);
  const base = jsPath.slice(0, jsPath.length - ext.length);
  for (const cand of EXT_ROWS[ext]) {
    if (typesOnly && !TYPE_EXTS.has(cand)) continue;
    const p = base + cand;
    const hit = FILES.has(p);
    probes.push({ path: p, rule, hit });
    if (hit) return p;
  }
  return undefined;
}

// ── Condition matching for exports/imports (key order; first match in the active set wins) ───────────
function activeConditions(mode: Mode, format: Format): Set<string> {
  // `types` and `default` are always eligible. node16 also offers `node`; both add import|require.
  const set = new Set<string>(['types', 'default']);
  if (mode === 'node16') set.add('node');
  set.add(format === 'esm' ? 'import' : 'require');
  return set;
}

function matchConditions(val: ExportsVal, active: Set<string>, probes: Probe[]): string | undefined {
  if (typeof val === 'string') return val;
  for (const key of Object.keys(val)) {
    const matched = active.has(key);
    probes.push({ path: `"${key}"`, rule: 'condition', hit: matched, note: matched ? 'match' : 'skip' });
    if (matched) {
      const inner = matchConditions(val[key], active, probes);
      if (inner !== undefined) return inner;
    }
  }
  return undefined;
}

// ── Resolve a bare specifier inside a located package directory ──────────────────
function splitBare(spec: string): { name: string; sub: string } {
  const parts = spec.split('/');
  const name = spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
  const rest = spec.slice(name.length).replace(/^\//, '');
  return { name, sub: rest === '' ? '.' : rest };
}

function resolveInPackage(
  pkgDir: string,
  sub: string,
  mode: Mode,
  format: Format,
  typesOnly: boolean,
  probes: Probe[],
): string | undefined {
  const pkg = PKGS[pkgDir + '/package.json'];
  if (!pkg) return undefined;
  const respectsExports = (mode === 'node16' || mode === 'bundler') && !!pkg.exports;

  if (respectsExports) {
    const key = sub === '.' ? '.' : './' + sub;
    probes.push({ path: `exports["${key}"]`, rule: 'exports', hit: key in pkg.exports! });
    const entry = pkg.exports![key];
    if (entry === undefined) {
      probes.push({ path: `"${key}" is not listed in "exports" — blocked`, rule: 'blocked', hit: false });
      return undefined; // presence of exports blocks any unlisted subpath (no fallback)
    }
    const target = matchConditions(entry, activeConditions(mode, format), probes);
    if (target === undefined) return undefined;
    const full = resolvePath(pkgDir, target);
    if (TS_INPUT_RE.test(full)) {
      const hit = FILES.has(full);
      probes.push({ path: full, rule: 'ext-sub', hit });
      return hit ? full : undefined;
    }
    return extSub(full, typesOnly, probes);
  }

  // No exports (or node10): package.json "types"/"main" for ".", else a package-relative path.
  if (sub === '.') {
    if (pkg.types) {
      const full = resolvePath(pkgDir, pkg.types);
      const hit = FILES.has(full);
      probes.push({ path: full, rule: 'field', hit, note: 'types' });
      if (hit) return full;
    }
    if (pkg.main) {
      probes.push({ path: `main: "${pkg.main}"`, rule: 'field', hit: true, note: 'main' });
      const found = extSub(resolvePath(pkgDir, pkg.main), typesOnly, probes);
      if (found) return found;
    }
    const idx = extSub(resolvePath(pkgDir, './index.js'), typesOnly, probes);
    if (idx) return idx;
    return undefined;
  }

  // package-relative subpath (only reached when there is no "exports")
  const found = extSub(resolvePath(pkgDir, './' + sub + '.js'), typesOnly, probes);
  if (found) return found;
  return extSub(resolvePath(pkgDir, './' + sub + '/index.js'), typesOnly, probes, 'index');
}

// ── Local-project imports remap: output path → the input .ts the compiler actually reads ────────────
function remapLocal(target: string, pkg: PkgJson, pkgDir: string): string {
  const full = resolvePath(pkgDir, target);
  if (!pkg.outDir || !pkg.rootDir) return full;
  const out = resolvePath(pkgDir, pkg.outDir);
  const root = resolvePath(pkgDir, pkg.rootDir);
  if (!full.startsWith(out + '/')) return full;
  const input = root + full.slice(out.length);
  return input
    .replace(/\.d\.mts$/, '.mts')
    .replace(/\.d\.cts$/, '.cts')
    .replace(/\.d\.ts$/, '.ts')
    .replace(/\.mjs$/, '.mts')
    .replace(/\.cjs$/, '.cts')
    .replace(/\.js$/, '.ts');
}

// ── The resolver ────────────────────────────────────────────────────────────────
export function resolveScenario(id: string): Trace | undefined {
  const scenario = SCENARIOS.find((s) => s.id === id);
  if (!scenario) return undefined;
  const { specifier, mode, format, importer } = scenario;
  const importerDir = dirOf(importer);
  const probes: Probe[] = [];
  const esmImport = mode === 'node16' && format === 'esm'; // the strict ESM algorithm
  const allowExtensionless = !esmImport; // node10, node16-require, bundler allow it

  // ── #imports (self-package internal specifiers) ──────────────────────────────
  if (specifier.startsWith('#')) {
    for (const dir of ancestors(importerDir)) {
      const pkg = PKGS[dir + '/package.json'];
      if (!pkg?.imports) continue;
      probes.push({ path: `imports["${specifier}"] in ${dir}/package.json`, rule: 'imports', hit: specifier in pkg.imports });
      const entry = pkg.imports[specifier];
      if (entry === undefined) break;
      const target = matchConditions(entry, activeConditions(mode, format), probes);
      if (target === undefined) break;
      const isLocal = !dir.includes('/node_modules');
      if (isLocal) {
        const input = remapLocal(target, pkg, dir);
        const hit = FILES.has(input);
        probes.push({ path: input, rule: 'remap', hit, note: 'outDir → rootDir' });
        if (hit) return { scenario, probes, resolved: input };
      }
      const full = resolvePath(dir, target);
      if (TS_INPUT_RE.test(full)) {
        const hit = FILES.has(full);
        probes.push({ path: full, rule: 'ext-sub', hit });
        return { scenario, probes, resolved: hit ? full : undefined };
      }
      return { scenario, probes, resolved: extSub(full, false, probes) };
    }
    return { scenario, probes };
  }

  // ── relative specifiers ──────────────────────────────────────────────────────
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    const target = resolvePath(importerDir, specifier);
    if (/\.(js|mjs|cjs|jsx)$/.test(specifier)) {
      const found = extSub(target, false, probes); // wrote a runtime extension → substitute
      return { scenario, probes, resolved: found };
    }
    if (TS_INPUT_RE.test(specifier)) {
      const hit = FILES.has(target);
      probes.push({ path: target, rule: 'ext-sub', hit });
      return { scenario, probes, resolved: hit ? target : undefined };
    }
    // extensionless
    if (!allowExtensionless) {
      probes.push({ path: `${specifier} — ESM needs an explicit ".js" extension`, rule: 'esm-needs-ext', hit: false });
      return { scenario, probes };
    }
    const asFile = extSub(target + '.js', false, probes);
    if (asFile) return { scenario, probes, resolved: asFile };
    // directory module → index.*
    const idx = extSub(target + '/index.js', false, probes, 'index');
    return { scenario, probes, resolved: idx };
  }

  // ── bare specifiers: node_modules walk, types-first then JS-allowed ───────────
  const { name, sub } = splitBare(specifier);
  for (const typesOnly of [true, false]) {
    for (const dir of ancestors(importerDir)) {
      const nm = dir + '/node_modules';
      const pkgDir = nm + '/' + name;
      if (PKGS[pkgDir + '/package.json']) {
        probes.push({ path: pkgDir, rule: 'nm', hit: true, note: typesOnly ? 'types pass' : 'js pass' });
        const found = resolveInPackage(pkgDir, sub, mode, format, typesOnly, probes);
        if (found) return { scenario, probes, resolved: found };
        // "exports" present but subpath unlisted → hard stop, no further passes or fallbacks.
        if (probes[probes.length - 1]?.rule === 'blocked') return { scenario, probes };
      }
      if (typesOnly && sub === '.') {
        const at = nm + '/@types/' + name.replace('@', '').replace('/', '__') + '/index.d.ts';
        const hit = FILES.has(at);
        probes.push({ path: at, rule: 'at-types', hit });
        if (hit) return { scenario, probes, resolved: at };
      }
    }
  }
  return { scenario, probes };
}

// ── The curated scenarios (each verified in scripts/test-resolution.ts) ────────────────────────────
export const SCENARIOS: Scenario[] = [
  {
    id: 'rel-node10',
    title: 'Relative, no extension (node10)',
    specifier: './util',
    mode: 'node10',
    format: 'cjs',
    importer: '/proj/src/main.ts',
    teaches: 'Extension substitution: a ".js" lookup tries .ts, .tsx, .d.ts first.',
  },
  {
    id: 'rel-esm-js',
    title: 'Relative ".js" (node16, ESM)',
    specifier: './util.js',
    mode: 'node16',
    format: 'esm',
    importer: '/proj/src/main.ts',
    teaches: 'You WRITE the runtime ".js"; TypeScript READS the ".ts".',
  },
  {
    id: 'rel-esm-noext',
    title: 'Relative, no extension (node16, ESM)',
    specifier: './util',
    mode: 'node16',
    format: 'esm',
    importer: '/proj/src/main.ts',
    teaches: 'Under ESM, an extensionless relative import is an error — add ".js".',
  },
  {
    id: 'rel-bundler-noext',
    title: 'Relative, no extension (bundler)',
    specifier: './util',
    mode: 'bundler',
    format: 'esm',
    importer: '/proj/src/main.ts',
    teaches: 'Same import as ESM — but bundler never requires an extension.',
  },
  {
    id: 'dir-node10',
    title: 'Directory module (node10)',
    specifier: './shapes',
    mode: 'node10',
    format: 'cjs',
    importer: '/proj/src/main.ts',
    teaches: 'A folder resolves to its index.* — only where directory modules are allowed.',
  },
  {
    id: 'bare-exports',
    title: 'Package via "exports" (node16, ESM)',
    specifier: 'pkg',
    mode: 'node16',
    format: 'esm',
    importer: '/proj/src/main.ts',
    teaches: 'Conditions match in key order: types wins over import here.',
  },
  {
    id: 'bare-blocked',
    title: 'Unlisted subpath (node16, ESM)',
    specifier: 'pkg/secret',
    mode: 'node16',
    format: 'esm',
    importer: '/proj/src/main.ts',
    teaches: 'The presence of "exports" BLOCKS any subpath it does not list.',
  },
  {
    id: 'bare-attypes',
    title: 'JS package + @types (node10)',
    specifier: 'lodash',
    mode: 'node10',
    format: 'cjs',
    importer: '/proj/src/main.ts',
    teaches: 'Types-first: the real package has no .d.ts, so @types/lodash wins.',
  },
  {
    id: 'imports-remap',
    title: 'Internal "#imports" (node16, ESM)',
    specifier: '#utils',
    mode: 'node16',
    format: 'esm',
    importer: '/proj/src/main.ts',
    teaches: 'A local "#imports" target is remapped from outDir back to the rootDir source.',
  },
];

export const MODES: Mode[] = ['node10', 'node16', 'bundler'];
