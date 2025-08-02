"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// app/home-response.ts
var home_response_exports = {};
__export(home_response_exports, {
  home: () => home
});
module.exports = __toCommonJS(home_response_exports);
function home(req, res) {
  res.setHeader("Content-Type", "text/html");
  res.send(`
    <!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Basic Meta -->
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="Birthmark API is a lightweight and secure service to store and manage birthdays. Perfect for reminders and celebration tracking."
    />
    <meta
      name="keywords"
      content="birthdays, reminder API, birthday tracker, calendar API, express API, Vercel, Birthmark"
    />
    <meta name="author" content="Your Name or Brand" />
    <title>\u{1F382} Birthmark API</title>

    <!-- Favicon -->
    <link
      rel="icon"
      type="image/png"
      href="/static/logo.png"
    />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${process.env.VERCEL_URL}" />
    <meta property="og:title" content="\u{1F382} Birthmark API" />
    <meta
      property="og:description"
      content="Store and manage birthdays using a secure and modern API service."
    />
    <meta
      property="og:image"
      content="${process.env.VERCEL_URL}/static/large_image.png"
    />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${process.env.VERCEL_URL}" />
    <meta name="twitter:title" content="\u{1F382} Birthmark API" />
    <meta
      name="twitter:description"
      content="Track birthdays of friends, family, and more using the Birthmark API."
    />
    <meta
      name="twitter:image"
      content="${process.env.VERCEL_URL}/static/large_image.png"
    />

    <!-- Styling -->
    <style>
      body {
        font-family: system-ui, sans-serif;
        background: #fefefe;
        color: #333;
        text-align: center;
        padding: 4rem 1rem;
        margin: 0;
      }
      img.icon {
        width: 100px;
        height: 100px;
        margin-bottom: 1rem;
      }
      a {
        color: #0070f3;
        text-decoration: none;
        font-weight: 500;
      }
      a:hover {
        text-decoration: underline;
      }
      h1 {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }
      p {
        font-size: 1.1rem;
      }
    </style>
  </head>
  <body>
    <img
      src="/static/logo.png"
      alt="Birthmark Icon"
      class="icon"
    />
    <h1>Welcome to Birthmark API \u{1F382}</h1>
    <p>A simple, fast, and secure way to store birthdays</p>
    <p><a href="/docs">\u27A1 View API Docs (Swagger UI)</a></p>
  </body>
</html>
  `);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  home
});
