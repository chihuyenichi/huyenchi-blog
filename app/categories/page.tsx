import Link from "next/link";
import { categories, displayCategory, getAllPosts } from "@/lib/content";

export const metadata = { title: "Categories" };

export default function CategoriesPage() {
  const posts = getAllPosts();
  return <section className="shell archive-page"><p className="crumb">Home / Categories</p><p className="kicker">MAP THE SURFACE</p><h1>Categories</h1><div className="category-directory">{categories.map((category) => { const matches = posts.filter((post) => post.category === category); return <section className="category-block" key={category}><div><h2>{displayCategory(category)}</h2><span>{matches.length} writeup{matches.length === 1 ? "" : "s"}</span></div>{matches.length ? <ol>{matches.slice(0, 5).map((post) => <li key={post.slug}><Link href={`/writeups/${post.slug}`}>{post.title}</Link><time>{new Date(post.date).getFullYear()}</time></li>)}</ol> : <p className="muted">No writeups published yet.</p>}<Link className="text-link" href={`/categories/${category}`}>View category →</Link></section>; })}</div></section>;
}
