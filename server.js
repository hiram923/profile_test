// 개인 프로필 웹사이트를 위한 간단한 정적 파일 서버 (Node.js 내장 모듈만 사용)
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

// 파일 확장자별 Content-Type
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return send(res, 405, "405 Method Not Allowed");
  }

  // 주소에서 경로만 꺼내고, "/"는 index.html로 연결
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    return send(res, 400, "400 Bad Request");
  }
  if (urlPath.endsWith("/")) urlPath += "index.html";

  // 프로젝트 폴더 밖의 파일은 열 수 없도록 막기
  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT + path.sep)) {
    return send(res, 403, "403 Forbidden");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      return send(res, 404, "404 Not Found");
    }
    const type = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(req.method === "HEAD" ? undefined : data);
  });
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`포트 ${PORT}을(를) 이미 다른 프로그램이 사용 중입니다. 그 프로그램을 끄거나 PORT=4000 npm start 처럼 다른 포트로 실행하세요.`);
  } else {
    console.error("서버 오류:", err);
  }
  process.exit(1);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
