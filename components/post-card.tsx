import Link from "next/link";
import { Fragment } from "react";
import type { Post } from "@/lib/content";
import { displayCategory, getAllStickers, getSticker } from "@/lib/content";
import { StickerPhoto } from "@/components/sticker-photo";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="post-card">
      <Link className="card-image" data-category={post.category} href={`/writeups/${post.slug}`} aria-label={post.title}>
        <span className="card-image-label">{post.category}</span>
        <img className="card-sticker" src={getSticker(post)} alt="" aria-hidden="true" loading="lazy" />
        <span className="card-image-title">{post.title}</span>
      </Link>
      <div className="post-card-body">
        <p className="eyebrow">{new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(post.date))}</p>
        <p>{post.description}</p>
        <div className="tag-row"><Link href={`/categories/${post.category}`}>{displayCategory(post.category)}</Link>{post.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div>
      </div>
    </article>
  );
}

export function HomePostCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  return (
    <article className={priority ? "deck-item is-primary" : "deck-item"}>
      <Link className="deck-card" data-category={post.category} href={`/writeups/${post.slug}`} aria-label={post.title}>
        <span className="deck-card-spine">
          <img className="deck-spine-sticker" src={getSticker(post)} alt="" aria-hidden="true" loading="lazy" />
          <span className="deck-word" aria-hidden="true" />
          <span className="deck-magic" aria-hidden="true" />
        </span>
        <span className="deck-expanded">
          <span className="ig-portrait">
            <span className="ig-head">
              <img className="ig-avatar" src={getSticker(post)} alt="" aria-hidden="true" loading="lazy" />
              <span className="ig-user">{post.event}</span>
              <span className="ig-difficulty">{post.difficulty}</span>
              <span className="ig-dots" aria-hidden="true">•••</span>
            </span>
            <span className="ig-photo-wrap">
              <StickerPhoto initial={getSticker(post)} pool={getAllStickers()} className="ig-photo" />
              <span className="hitpaw" aria-hidden="true">
                <svg viewBox="0 0 64 64">
                  <ellipse cx="14" cy="25" rx="5.5" ry="7" />
                  <ellipse cx="25.5" cy="17.5" rx="5.5" ry="7" />
                  <ellipse cx="38.5" cy="17.5" rx="5.5" ry="7" />
                  <ellipse cx="50" cy="25" rx="5.5" ry="7" />
                  <ellipse cx="32" cy="42" rx="14" ry="11" />
                </svg>
              </span>
            </span>
            <span className="ig-actions" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="ig-heart"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ig-save"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
            </span>
            <span className="ig-caption"><b>{post.event}</b>{post.description}</span>
            <span className="ig-meta">{post.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}</span>
            <span className="deck-card-link">Open writeup <span aria-hidden>→</span></span>
          </span>
            <span className="deck-side">
              <span className="deck-note">
                <span className="deck-side-title" aria-label={post.title}>
                  {(() => {
                    let ci = 0;
                    return post.title.split(" ").map((word, i, arr) => (
                      <Fragment key={i}>
                      <span className="t-wordwrap" aria-hidden="true">
                        {Array.from(word).map((ch, j) => (
                          <span key={j} className="t-char" style={{ transitionDelay: `${ci++ * 30}ms` }}>
                            {ch}
                          </span>
                        ))}
                      </span>
                      {i < arr.length - 1 ? " " : ""}
                      </Fragment>
                    ));
                  })()}
                </span>
              </span>
            </span>
        </span>
      </Link>
    </article>
  );
}

export function WriteupRow({ post }: { post: Post }) {
  const formattedDate = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(post.date));

  return (
    <article className="writeup-row">
      <Link className="writeup-row-link" href={`/writeups/${post.slug}`}>
        <time className="writeup-row-date" dateTime={post.date}>{formattedDate}</time>
        <span className="writeup-row-main">
          <span className="writeup-row-title">{post.title}</span>
          <span className="writeup-row-description">{post.description}</span>
        </span>
        <span className="writeup-row-labels">
          <span>{displayCategory(post.category)}</span>
          <span>{post.difficulty}</span>
          {post.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}
        </span>
        <span className="writeup-row-arrow" aria-hidden>→</span>
      </Link>
    </article>
  );
}
