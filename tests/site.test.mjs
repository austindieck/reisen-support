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
    assert.match(html, /<link rel="icon"[^>]+href="\/assets\/favicon\.png">/);
    assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, `${page} must have one h1`);
    assert.doesNotMatch(html, /<script\b/i);
    assert.doesNotMatch(html, /[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/u, `${page} must not use dash punctuation`);
  }
});

test("site header uses the branded Reisen logo and display typeface", async () => {
  const css = await load("public/assets/styles.css");
  assert.match(css, /--display:\s*Didot/);

  for (const page of ["public/index.html", "public/support/index.html", "public/privacy/index.html"]) {
    const html = await load(page);
    assert.match(html, /<img class="brand-mark" src="\/assets\/favicon\.png" width="36" height="36" alt="">/);
    assert.doesNotMatch(html, /<span class="brand-mark"/);
  }
});

test("public styles avoid dash-like punctuation", async () => {
  const css = await load("public/assets/styles.css");
  assert.doesNotMatch(css, /[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/u);
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
  assert.match(html, /Account/);
  assert.match(html, /Delete account/);
  assert.match(html, /Former traveler/);
  assert.match(html, /does not contain advertising/);
  assert.match(html, /does not have access to your plaintext password/);
});

test("support explains in-app account deletion", async () => {
  const html = await load("public/support/index.html");
  assert.match(html, /<details id="account-deletion">/);
  assert.match(html, /Delete account permanently/);
  assert.match(html, /You do not need to contact support/);
  assert.match(html, /Former traveler/);
});

test("privacy contents link to every numbered policy section", async () => {
  const html = await load("public/privacy/index.html");
  for (const id of [
    "who-we-are",
    "information",
    "use",
    "providers",
    "sharing",
    "retention",
    "security",
    "children",
    "international",
    "choices",
    "changes",
    "contact",
  ]) {
    assert.match(html, new RegExp(`href="#${id}"`));
    assert.match(html, new RegExp(`<section id="${id}">`));
  }
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
  assert.match(blueprint, /plan:\s*free/);
  assert.match(blueprint, /buildCommand:\s*npm test/);
  assert.match(blueprint, /staticPublishPath:\s*\.\/public/);
  assert.match(blueprint, /Content-Security-Policy/);
  assert.match(blueprint, /Strict-Transport-Security/);
});
