
import fs from 'node:fs/promises'
import { globby } from 'globby'
import { minify } from 'html-minifier-terser'

// Fonction pour attendre entre les traitements
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Get all HTML files from the output directory
const path = './.vercel/output/static'
const files = await globby(`${path}/**/*.html`)

// Traiter les fichiers par lots pour éviter les erreurs 429
const batchSize = 5  // Traiter 5 fichiers à la fois
const batchDelay = 2000  // Attendre 2 secondes entre chaque lot

for (let i = 0; i < files.length; i += batchSize) {
    console.log(`Traitement du lot ${Math.floor(i/batchSize) + 1}/${Math.ceil(files.length/batchSize)}`)
    
    // Traiter un lot de fichiers
    const batch = files.slice(i, i + batchSize)
    await Promise.all(
        batch.map(async (file) => {
            try {
                console.log('Traitement du fichier:', file)
                let html = await fs.readFile(file, 'utf-8')

                // Minifier le HTML
                html = await minify(html, {
                    removeComments: true,
                    preserveLineBreaks: true,
                    collapseWhitespace: true,
                    minifyJS: true
                })
                await fs.writeFile(file, html)
            } catch (error) {
                console.error(`Erreur lors du traitement de ${file}:`, error)
            }
        })
    )
    
    // Attendre entre chaque lot pour éviter de surcharger l'API
    if (i + batchSize < files.length) {
        console.log(`Pause de ${batchDelay/1000} secondes avant le prochain lot...`)
        await wait(batchDelay)
    }
}

console.log('Traitement des fichiers HTML terminé avec succès')
