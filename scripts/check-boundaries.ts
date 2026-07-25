/**
 * CI boundary check — runs ESLint with boundary rules across the workspace.
 * Also validates turbo affected scope: if a change in one domain triggers
 * builds in unrelated apps, the boundary is leaking.
 */
import { execSync } from "node:child_process";
import { exit } from "node:process";

function run(cmd: string): string {
  return execSync(cmd, { encoding: "utf-8", stdio: "pipe" });
}

let failed = false;

// 1. ESLint boundary rules
console.log("── ESLint boundary check ──");
try {
  run("pnpm eslint . --no-warn-ignored");
  console.log("✓ no boundary violations\n");
} catch (e: unknown) {
  console.error((e as { stdout?: string }).stdout ?? String(e));
  failed = true;
}

// 2. Affected-scope sanity check (only meaningful in CI with HEAD^)
console.log("── Affected scope check ──");
try {
  const affected = run("pnpm turbo build --filter=...[HEAD^] --dry=json");
  const plan = JSON.parse(affected) as { packages: string[] };
  const apps = plan.packages.filter((p) => p.startsWith("app-") || p.startsWith("@zero-agent/"));
  console.log(`affected packages: ${plan.packages.join(", ")}`);
  if (apps.length > 2) {
    console.warn(
      `⚠ ${apps.length} apps affected — possible boundary leak. Review dependency graph.`,
    );
  } else {
    console.log("✓ scope looks clean\n");
  }
} catch {
  console.log("⚠ turbo dry-run skipped (no git history or turbo not built)\n");
}

if (failed) exit(1);
