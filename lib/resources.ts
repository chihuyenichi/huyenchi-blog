import fs from "node:fs";
import path from "node:path";

const publicDirectory = path.join(process.cwd(), "public");

export const resourceTypes = {
  md: { kind: "markdown", language: "markdown", label: "Markdown" },
  cpp: { kind: "code", language: "cpp", label: "C++" },
  cc: { kind: "code", language: "cpp", label: "C++" },
  cxx: { kind: "code", language: "cpp", label: "C++" },
  c: { kind: "code", language: "c", label: "C" },
  h: { kind: "code", language: "cpp", label: "C/C++ Header" },
  hpp: { kind: "code", language: "cpp", label: "C++ Header" },
  py: { kind: "code", language: "python", label: "Python" },
  js: { kind: "code", language: "javascript", label: "JavaScript" },
  jsx: { kind: "code", language: "jsx", label: "JSX" },
  ts: { kind: "code", language: "typescript", label: "TypeScript" },
  tsx: { kind: "code", language: "tsx", label: "TSX" },
  java: { kind: "code", language: "java", label: "Java" },
  rs: { kind: "code", language: "rust", label: "Rust" },
  go: { kind: "code", language: "go", label: "Go" },
  sh: { kind: "code", language: "shellscript", label: "Shell" },
  sql: { kind: "code", language: "sql", label: "SQL" },
  json: { kind: "code", language: "json", label: "JSON" },
  yaml: { kind: "code", language: "yaml", label: "YAML" },
  yml: { kind: "code", language: "yaml", label: "YAML" },
  toml: { kind: "code", language: "toml", label: "TOML" },
} as const;

type ResourceExtension = keyof typeof resourceTypes;

export type RenderableResource = {
  content: string;
  extension: ResourceExtension;
  fileName: string;
  kind: "markdown" | "code";
  label: string;
  language: string;
  resource: string;
  slug: string;
};

function isResourceExtension(extension: string): extension is ResourceExtension {
  return extension in resourceTypes;
}

function isSafeSegment(value: string) {
  return /^[a-z0-9][a-z0-9_-]*$/.test(value);
}

export function getAllRenderableResources() {
  if (!fs.existsSync(publicDirectory)) return [];
  const resources = new Map<string, { slug: string; resource: string }>();

  for (const entry of fs.readdirSync(publicDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory() || !isSafeSegment(entry.name)) continue;
    const directory = path.join(publicDirectory, entry.name);
    for (const file of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!file.isFile()) continue;
      const extension = path.extname(file.name).slice(1).toLowerCase();
      const resource = path.basename(file.name, path.extname(file.name));
      if (!isResourceExtension(extension) || !isSafeSegment(resource)) continue;
      const key = `${entry.name}/${resource}`;
      if (!resources.has(key)) resources.set(key, { slug: entry.name, resource });
    }
  }

  return [...resources.values()];
}

export function getRenderableResource(slug: string, resource: string): RenderableResource | null {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !isSafeSegment(resource)) return null;

  for (const extension of Object.keys(resourceTypes) as ResourceExtension[]) {
    const fileName = `${resource}.${extension}`;
    const source = path.join(publicDirectory, slug, fileName);
    if (!fs.existsSync(source) || !fs.statSync(source).isFile()) continue;
    const type = resourceTypes[extension];
    return {
      content: fs.readFileSync(source, "utf8"),
      extension,
      fileName,
      kind: type.kind,
      label: type.label,
      language: type.language,
      resource,
      slug,
    };
  }

  return null;
}

const extensionPattern = Object.keys(resourceTypes).join("|");
const absoluteResourceLink = new RegExp(
  `\\]\\(\\/([a-z0-9]+(?:-[a-z0-9]+)*)\\/([a-z0-9][a-z0-9_-]*)\\.(${extensionPattern})\\)`,
  "g",
);
const relativeResourceLink = new RegExp(
  `\\]\\(\\.\\/([a-z0-9][a-z0-9_-]*)\\.(${extensionPattern})\\)`,
  "g",
);

export function rewriteResourceLinks(markdown: string, currentSlug: string) {
  return markdown
    .replace(absoluteResourceLink, "](/writeups/$1/resources/$2/)")
    .replace(relativeResourceLink, `](/writeups/${currentSlug}/resources/$1/)`);
}
