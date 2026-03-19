import { promises as fs } from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
    const { src } = getQuery(event)

    const filePath = path.resolve(process.cwd(), 'app/content', `${src}.md`)

    try {
        return await fs.readFile(filePath, 'utf-8')
    } catch (err) {
        throw createError({
            statusCode: 404,
            message: 'Markdown file not found'
        })
    }
})