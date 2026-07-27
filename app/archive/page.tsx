import Link from "next/link";
import { getAllPosts } from "@/lib/content";

export const metadata = { title: "Archive" };

export default function ArchivePage() {
  const groups = Object.groupBy(getAllPosts(), (post) => post.year);
  return <section className="shell archive-page"><p className="crumb">Home / Archive</p><p className="kicker">BY THE YEAR</p><h1>Archive</h1>{Object.entries(groups).sort(([a], [b]) => Number(b) - Number(a)).map(([year, posts]) => <section className="year-group" key={year}><h2>{year}</h2>{posts?.map((post) => <Link href={`/writeups/${post.slug}`} key={post.slug}><span>{post.category.toUpperCase()}</span>{post.title}<time>{post.event}</time></Link>)}</section>)}</section>;
}
