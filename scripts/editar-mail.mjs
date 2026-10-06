// Servidor local del editor del mail: `npm run edit:mail` → http://localhost:3001
//
// Sirve scripts/editar-mail.html, y en /api/site-copy lee (GET) y guarda (PUT)
// sólo `subject` y `mailContent` de data/site-copy.json; el resto de las claves
// no se tocan. Escucha sólo en 127.0.0.1.
import http from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT) || 3001;
const HTML = fileURLToPath(new URL("./editar-mail.html", import.meta.url));
const JSON_PATH = fileURLToPath(new URL("../data/site-copy.json", import.meta.url));

async function readCopy() {
  const raw = await readFile(JSON_PATH, "utf8");
  return { raw, data: JSON.parse(raw) };
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

http
  .createServer(async (req, res) => {
    try {
      if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
        return send(res, 200, await readFile(HTML, "utf8"), "text/html; charset=utf-8");
      }
      if (req.url === "/api/site-copy" && req.method === "GET") {
        const { data } = await readCopy();
        return send(res, 200, { subject: data.subject, mailContent: data.mailContent });
      }
      if (req.url === "/api/site-copy" && req.method === "PUT") {
        let body = "";
        for await (const chunk of req) body += chunk;
        const { subject, mailContent } = JSON.parse(body);
        if (typeof subject !== "string" || typeof mailContent !== "string") {
          return send(res, 400, { error: "Faltan subject o mailContent" });
        }
        const { raw, data } = await readCopy();
        data.subject = subject;
        data.mailContent = mailContent;
        // Mantener los finales de línea del archivo para no ensuciar el diff.
        const eol = raw.includes("\r\n") ? "\r\n" : "\n";
        await writeFile(JSON_PATH, JSON.stringify(data, null, 2).replace(/\n/g, eol) + eol, "utf8");
        return send(res, 200, { ok: true });
      }
      send(res, 404, { error: "No encontrado" });
    } catch (e) {
      send(res, 500, { error: String(e.message || e) });
    }
  })
  .listen(PORT, "127.0.0.1", () => {
    console.log(`Editor del mail: http://localhost:${PORT}  (Ctrl+C para cerrar)`);
  });
