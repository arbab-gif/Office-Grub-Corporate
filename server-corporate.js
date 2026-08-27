// Office Grubb — Corporate Portal · zero-dependency static server
// Serves the project root (so /assets and shared CSS resolve) but lands on /corporate/.
const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3001;
const root = __dirname;
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2"
};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  // redirect (not rewrite) so relative asset paths resolve against /corporate/
  if (p === "/" || p === "/corporate") {
    res.writeHead(302, { Location: "/corporate/" });
    return res.end();
  }
  if (p === "/corporate/") p = "/corporate/index.html";
  const fp = path.normalize(path.join(root, p));
  if (!fp.startsWith(root)) { res.writeHead(403); return res.end("403 Forbidden"); }
  fs.readFile(fp, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      return res.end("<h1>404 — Not found</h1>");
    }
    res.writeHead(200, {
      "Content-Type": mime[path.extname(fp).toLowerCase()] || "application/octet-stream",
      // prototypes change constantly — never let a browser serve a stale CSS/JS copy
      "Cache-Control": "no-store, must-revalidate"
    });
    res.end(data);
  });
}).listen(port, () => {
  console.log("🏢  Office Grubb — Corporate Portal");
  console.log("    running at  http://localhost:" + port);
});
