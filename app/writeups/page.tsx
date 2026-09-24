import { WriteupRow } from "@/components/post-card";
import { getAllPosts } from "@/lib/content";

export const metadata = { title: "Writeups" };

export default function WriteupsPage() {
  const posts = getAllPosts();
  return <section className="shell archive-page"><p className="crumb">Home / Writeups</p><p className="kicker">THE ARCHIVE</p><h1>All writeups</h1><p className="page-intro">Exploitation notes organized by discipline, event, and technique. Newest updates appear first.</p><div className="writeup-list">{posts.map((post) => <WriteupRow post={post} key={post.slug} />)}</div></section>;
}
