import http from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distDir = path.join(__dirname, 'dist')
const port = Number(process.env.PORT || 4173)
const host = '0.0.0.0'

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}

function getContentType(filePath) {
  return contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
}

async function resolveAsset(requestPath) {
  const normalizedPath = requestPath === '/' ? '/index.html' : requestPath
  const safePath = path.normalize(normalizedPath).replace(/^([.]{2}[/])+/, '')
  const filePath = path.join(distDir, safePath)

  try {
    const fileStats = await stat(filePath)
    if (fileStats.isFile()) {
      return filePath
    }
  } catch {
    // Fall back to the SPA entry point.
  }

  return path.join(distDir, 'index.html')
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host || host}`)
    const filePath = await resolveAsset(url.pathname)
    const fileBuffer = await readFile(filePath)

    response.writeHead(200, {
      'Cache-Control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
      'Content-Type': getContentType(filePath),
    })
    response.end(fileBuffer)
  } catch (error) {
    response.statusCode = 500
    response.setHeader('Content-Type', 'text/plain; charset=utf-8')
    response.end(`Server error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
})

server.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}`)
})