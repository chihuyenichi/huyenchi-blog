import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { categories, displayCategory, getAllPosts } from "@/lib/content";

export function generateStaticParams() { return categories.map((category) => ({ category })); }

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!categories.includes(category as (typeof categories)[number])) notFound();
  const posts = getAllPosts().filter((post) => post.category === category);
  const years = [...new Set(posts.map((post) => post.year))].sort((a, b) => b - a);
  return <section className="shell archive-page"><p className="crumb">Home / Categories / {displayCategory(category)}</p><h1>{displayCategory(category)}</h1><div className="category-layout"><aside className="filters"><h2>Years</h2>{years.map((year) => <span key={year}>{year}</span>)}<h2>Categories</h2>{categories.map((item) => <a className={item === category ? "active" : ""} href={`/categories/${item}`} key={item}>{displayCategory(item)}</a>)}</aside><div><p className="page-intro">{posts.length} published writeup{posts.length === 1 ? "" : "s"} in this category.</p><div className="post-grid">{posts.map((post) => <PostCard post={post} key={post.slug} />)}</div></div></div></section>;
}
