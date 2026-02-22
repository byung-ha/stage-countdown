import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const distDir = path.resolve(projectRoot, 'dist')
const inputHtmlPath = path.resolve(distDir, 'index.html')
const outputHtmlPath = path.resolve(projectRoot, 'docs', 'index-v2.html')

if (!fs.existsSync(inputHtmlPath)) {
  throw new Error(`Build file not found: ${inputHtmlPath}`)
}

const readAssetFile = (assetRef) => {
  const normalizedRef = assetRef.split('?')[0].split('#')[0].replace(/^\//, '')
  const filePath = path.resolve(distDir, normalizedRef)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Asset not found: ${filePath}`)
  }

  return fs.readFileSync(filePath, 'utf8')
}

let html = fs.readFileSync(inputHtmlPath, 'utf8')

// Remove external icon and stale preload links from the single-file output.
html = html.replace(/<link[^>]*rel=["'](?:icon|modulepreload)["'][^>]*>\s*/g, '')

html = html.replace(
  /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>\s*/g,
  (_, href) => `<style>\n${readAssetFile(href)}\n</style>\n`,
)

html = html.replace(
  /<script[^>]*src=["']([^"']+)["'][^>]*><\/script>\s*/g,
  (_, src) => `<script type="module">\n${readAssetFile(src).replace(/<\/script>/gi, '<\\/script>')}\n</script>\n`,
)

fs.mkdirSync(path.dirname(outputHtmlPath), { recursive: true })
fs.writeFileSync(outputHtmlPath, html)

console.log(`Wrote ${outputHtmlPath}`)
