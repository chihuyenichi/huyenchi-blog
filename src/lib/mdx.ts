import { remark } from 'remark'
import html from 'remark-html'
import gfm from 'remark-gfm'
import highlight from 'rehype-highlight'

export async function renderMarkdown(content: string): Promise<string> {
  const result = await remark()
    .use(gfm)
    .use(html, { sanitize: false })
    .use(highlight)
    .process(content)

  return result.toString()
}
