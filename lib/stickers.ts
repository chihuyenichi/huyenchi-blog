import type { Post } from "./content";

export const stickerFiles = [
  "thumbs-up.jpg",
  "drool.jpg",
  "reading.png",
  "lick-screen.jpg",
  "question.jpg",
  "grumpy.jpg",
  "referee.jpg",
] as const;

const difficultyStickers = {
  easy: ["thumbs-up.jpg", "drool.jpg"],
  medium: ["reading.png", "lick-screen.jpg"],
  hard: ["question.jpg", "grumpy.jpg"],
  insane: ["referee.jpg"],
} as const;

export function getSticker(post: Pick<Post, "difficulty" | "slug">) {
  const options = difficultyStickers[post.difficulty];
  const index = [...post.slug].reduce((total, character) => total + character.charCodeAt(0), 0) % options.length;
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/stickers/${options[index]}`;
}

export function getAllStickers() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return stickerFiles.map((file) => `${basePath}/stickers/${file}`);
}

export function displayCategory(category: string) {
  return category === "ai-ml" ? "AI / ML" : category.toUpperCase();
}
