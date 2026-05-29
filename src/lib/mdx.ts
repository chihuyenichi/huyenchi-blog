import { remark } from 'remark'
import html from 'remark-html'
import gfm from 'remark-gfm'

export async function renderMarkdown(content: string): Promise<string> {
  const result = await remark()
    .use(gfm)
    .use(html, { sanitize: false })
    .process(content)

  return result.toString()
}
