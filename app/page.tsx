import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { getAllPosts } from "@/lib/content";
import { getSiteBackground } from "@/lib/content";

export default function HomePage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;
  return (
    <>
      <section className="hero shell">
        <div className="hero-copy-block"><p className="kicker">CTF FIELD NOTES</p><h1>Turn solved challenges into durable knowledge.</h1><p className="hero-copy">Writeups for the exploit chains, odd assumptions, and small observations that make challenges fall apart.</p><Link className="button" href="/writeups">Explore writeups <span aria-hidden>→</span></Link></div>
        <div className="hero-illustration site-image-bg" style={{ backgroundImage: `url(${getSiteBackground("home")})` }} aria-hidden="true" />
      </section>
      {featured && <section className="shell feature-section">
        <div className="section-heading"><p className="kicker">FEATURED</p><Link href={`/writeups/${featured.slug}`}>Read full writeup →</Link></div>
        <article className="feature-post">
          <div className="feature-art site-image-bg" style={{ backgroundImage: `url(${getSiteBackground("featured")})` }} aria-hidden="true" />
          <div className="feature-copy"><p className="eyebrow">{featured.event} / {featured.difficulty}</p><h2>{featured.title}</h2><p>{featured.description}</p><Link href={`/writeups/${featured.slug}`}>Open writeup <span aria-hidden>→</span></Link></div>
        </article>
      </section>}
      <section className="shell latest-section">
        <div className="section-heading"><div><p className="kicker">LATEST</p><h2>Recent writeups</h2></div><Link href="/writeups">View all →</Link></div>
        {rest.length ? <div className="post-grid">{rest.map((post) => <PostCard post={post} key={post.slug} />)}</div> : <p className="empty">Your next solve belongs here. Publish a writeup from the admin workspace.</p>}
      </section>
    </>
  );
}
