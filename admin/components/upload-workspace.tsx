"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Fields = { title: string; slug: string; date: string; description: string; category: string; event: string; year: string; difficulty: string; author: string; tags: string; sourceUrl: string };
const blank: Fields = { title: "", slug: "", date: new Date().toISOString().slice(0, 10), description: "", category: "pwn", event: "", year: String(new Date().getFullYear()), difficulty: "medium", author: "Huyen Chi", tags: "", sourceUrl: "" };
const kinds = ["pwn", "web", "crypto", "reverse", "forensics", "osint", "misc", "blockchain", "hardware", "ai-ml"];
const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function parse(markdown: string) {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/); if (!match) return { data: {} as Record<string, string>, body: markdown };
  const data: Record<string, string> = {};
  match[1].split("\n").forEach((line) => { const result = line.match(/^([^:]+):\s*["']?(.*?)["']?$/); if (result) data[result[1].trim()] = result[2].trim(); });
  return { data, body: markdown.slice(match[0].length) };
}

export function UploadWorkspace() {
  const markdownFolder = useRef<HTMLInputElement>(null); const imageFolder = useRef<HTMLInputElement>(null);
  const [markdown, setMarkdown] = useState<File | null>(null); const [assets, setAssets] = useState<File[]>([]); const [body, setBody] = useState(""); const [fields, setFields] = useState(blank); const [notice, setNotice] = useState("");
  useEffect(() => { markdownFolder.current?.setAttribute("webkitdirectory", ""); imageFolder.current?.setAttribute("webkitdirectory", ""); }, []);
  const loadMarkdown = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])].filter((file) => file.name.endsWith(".md")); if (files.length !== 1) return setNotice("Select a folder containing exactly one Markdown file.");
    const file = files[0]; const parsed = parse(await file.text()); const title = parsed.data.title ?? file.name.replace(/\.md$/, "");
    setMarkdown(file); setBody(parsed.body); setFields((old) => ({ ...old, title, slug: slugify(title), date: parsed.data.date ?? old.date, description: parsed.data.description ?? parsed.data.excerpt ?? "", category: (parsed.data.category ?? "pwn").toLowerCase(), event: parsed.data.event ?? old.event, tags: parsed.data.tags?.replace(/^\[|\]$/g, "").replace(/['"]/g, "") ?? "" })); setNotice(`Loaded ${file.name}.`);
  };
  const update = (key: keyof Fields, value: string) => setFields((old) => ({ ...old, [key]: value }));
  const publish = async (event: FormEvent) => { event.preventDefault(); if (!markdown) return setNotice("Select Markdown first."); setNotice("Publishing..."); const form = new FormData(); form.append("markdown", markdown); assets.forEach((asset) => form.append("assets", asset)); form.append("metadata", JSON.stringify({ ...fields, tags: fields.tags.split(",").map((tag) => tag.trim()).filter(Boolean) })); const response = await fetch("/api/publish", { method: "POST", body: form }); const result = await response.json(); setNotice(response.ok ? `Published commit ${result.commit}. GitHub Pages will redeploy.` : result.error ?? "Publishing failed."); };
  return <form className="workspace" onSubmit={publish}><section className="panel files"><h2>1. Source files</h2><label className="drop">Markdown folder<input ref={markdownFolder} type="file" accept=".md,text/markdown" multiple onChange={loadMarkdown}/><small>Select the folder containing one `.md` file.</small></label><label className="drop">Images folder<input ref={imageFolder} type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml" multiple onChange={(event) => setAssets([...event.target.files ?? []])}/><small>{assets.length ? `${assets.length} image(s) selected.` : "Select the corresponding images folder."}</small></label></section><section className="panel"><h2>2. Metadata</h2><div className="fields"><label>Title<input required value={fields.title} onChange={(e) => update("title", e.target.value)}/></label><label>Slug<input required value={fields.slug} pattern="[a-z0-9-]+" onChange={(e) => update("slug", slugify(e.target.value))}/></label><label>Date<input required type="date" value={fields.date} onChange={(e) => update("date", e.target.value)}/></label><label>Author<input required value={fields.author} onChange={(e) => update("author", e.target.value)}/></label><label>Category<select value={fields.category} onChange={(e) => update("category", e.target.value)}>{kinds.map((kind) => <option key={kind}>{kind}</option>)}</select></label><label>Difficulty<select value={fields.difficulty} onChange={(e) => update("difficulty", e.target.value)}>{["easy", "medium", "hard", "insane"].map((item) => <option key={item}>{item}</option>)}</select></label><label>Event<input required value={fields.event} onChange={(e) => update("event", e.target.value)}/></label><label>Year<input required type="number" value={fields.year} onChange={(e) => update("year", e.target.value)}/></label><label className="wide">Description<textarea required value={fields.description} onChange={(e) => update("description", e.target.value)}/></label><label className="wide">Tags<input required value={fields.tags} onChange={(e) => update("tags", e.target.value)} placeholder="ROP, buffer overflow"/></label><label className="wide">Challenge URL<input type="url" value={fields.sourceUrl} onChange={(e) => update("sourceUrl", e.target.value)}/></label></div></section><section className="panel"><h2>3. Preview</h2><div className="preview"><ReactMarkdown remarkPlugins={[remarkGfm]}>{body || "Select Markdown to render its preview."}</ReactMarkdown></div><p><button className="button" type="submit">Publish to GitHub →</button></p><p className="notice" role="status">{notice}</p></section></form>;
}
