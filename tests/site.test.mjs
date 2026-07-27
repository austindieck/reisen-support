import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pages = [
  "public/index.html",
  "public/support/index.html",
  "public/privacy/index.html",
  "public/404.html"
];

async function load(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("all public pages contain accessible document essentials", async () => {
  for (const page of pages) {
    const html = await load(page);
    assert.match(html, /<html lang="en">/);
    assert.match(html, /<meta name="viewport"/);
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, `${page} must have one h1`);
    assert.doesNotMatch(html, /<script\b/i);
  }
});

test("support and privacy routes use the public support address", async () => {
  for (const page of ["public/support/index.html", "public/privacy/index.html"]) {
    const html = await load(page);
    assert.match(html, /support@stratuslens\.com/);
    assert.match(html, /StratusLens LLC/);
    assert.doesNotMatch(html, /omnemoney/i);
  }
});

test("privacy policy names material app data and providers", async () => {
  const html = await load("public/privacy/index.html");
  for (const term of ["Supabase", "Apple", "Google", "trip", "expense", "Documents", "account deletion"]) {
    assert.match(html, new RegExp(term, "i"));
  }
  assert.match(html, /does not contain advertising/);
  assert.match(html, /does not have access to your plaintext password/);
});

test("the website loads only local assets", async () => {
  for (const page of pages) {
    const html = await load(page);
    assert.doesNotMatch(html, /<(?:script|img|link)[^>]+(?:src|href)="https?:/i);
  }
});

test("Render publishes only the static public directory", async () => {
  const blueprint = await load("render.yaml");
  assert.match(blueprint, /runtime:\s*static/);
  assert.match(blueprint, /staticPublishPath:\s*\.\/public/);
  assert.match(blueprint, /Content-Security-Policy/);
});
