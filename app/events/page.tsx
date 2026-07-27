import Link from "next/link";
import { getAllPosts } from "@/lib/content";

export const metadata = { title: "Events" };

export default function EventsPage() {
  const groups = Object.entries(Object.groupBy(getAllPosts(), (post) => post.event));
  return <section className="shell archive-page"><p className="crumb">Home / Events</p><p className="kicker">CONTEST LOG</p><h1>Events</h1><div className="event-list">{groups.map(([event, posts]) => <article key={event}><h2>{event}</h2><p>{posts?.length ?? 0} writeup{posts?.length === 1 ? "" : "s"}</p>{posts?.map((post) => <Link href={`/writeups/${post.slug}`} key={post.slug}>{post.title} <span>→</span></Link>)}</article>)}</div></section>;
}
