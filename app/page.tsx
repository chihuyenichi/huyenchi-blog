import Link from "next/link";
import { HomePostCard } from "@/components/post-card";
import { getAllPosts } from "@/lib/content";

export default function HomePage() {
  const posts = getAllPosts();
  return (
    <>
      <section className="hero shell">
        <div className="hero-copy-block"><p className="kicker">CTF FIELD NOTES</p><h1>Turn solved challenges into durable knowledge.</h1><p className="hero-copy">Writeups for the exploit chains, odd assumptions, and small observations that make challenges fall apart.</p><Link className="hero-archive-link" href="/writeups"><span>Browse {posts.length} writeups</span><span aria-hidden>→</span></Link></div>
      </section>
      <section className="shell latest-section">
        <div className="section-heading"><div><p className="kicker">LATEST</p><h2>Recent writeups</h2></div><Link href="/writeups">View all →</Link></div>
        {posts.length ? <div className="post-deck">{posts.slice(0, 6).map((post, index) => <HomePostCard post={post} priority={index === 0} key={post.slug} />)}</div> : <p className="empty">Your next solve belongs here. Publish a writeup from the admin workspace.</p>}
      </section>
    </>
  );
}
