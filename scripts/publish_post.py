#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
POST_QUEUE = ROOT / "post-queue"
CONTENT_POSTS = ROOT / "content" / "posts"
PUBLIC = ROOT / "public"
PUBLIC_IMAGES = PUBLIC / "images" / "posts"
ALLOWED_QUEUE_NAMES = {"index.md", "images", "resources"}
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class PublishError(Exception):
    pass


def run(cmd: list[str], *, dry_run: bool) -> None:
    print("+", " ".join(cmd))
    if not dry_run:
        subprocess.run(cmd, cwd=ROOT, check=True)


def existing_git_paths(slug: str) -> list[str]:
    paths = [
        CONTENT_POSTS / slug,
        PUBLIC_IMAGES / slug,
        PUBLIC / slug,
    ]
    return [str(path.relative_to(ROOT)) for path in paths if path.exists()]


def copy_tree_contents(source: Path, target: Path, *, dry_run: bool) -> None:
    if not source.exists():
        return
    if dry_run:
        print(f"+ copy {source.relative_to(ROOT)} -> {target.relative_to(ROOT)}")
        return
    target.mkdir(parents=True, exist_ok=True)
    for item in source.iterdir():
        destination = target / item.name
        if item.is_dir():
            if destination.exists():
                shutil.rmtree(destination)
            shutil.copytree(item, destination)
        else:
            shutil.copy2(item, destination)


def ensure_gitkeep(directory: Path, *, dry_run: bool) -> None:
    if dry_run:
        print(f"+ ensure {directory.relative_to(ROOT)}/.gitkeep")
        return
    directory.mkdir(parents=True, exist_ok=True)
    gitkeep = directory / ".gitkeep"
    if not any(directory.iterdir()):
        gitkeep.touch()


def validate_slug(slug: str) -> None:
    if not SLUG_RE.fullmatch(slug):
        raise PublishError("Slug must use lowercase letters, numbers, and hyphens only.")


def validate_queue(slug: str) -> Path:
    queue_dir = POST_QUEUE / slug
    if not queue_dir.is_dir():
        raise PublishError(f"Missing queue folder: {queue_dir.relative_to(ROOT)}")

    names = {item.name for item in queue_dir.iterdir()}
    unknown = names - ALLOWED_QUEUE_NAMES
    if unknown:
        unknown_list = ", ".join(sorted(unknown))
        raise PublishError(f"Unexpected item(s) in queue folder: {unknown_list}")

    index = queue_dir / "index.md"
    if not index.is_file():
        raise PublishError(f"Missing required file: {index.relative_to(ROOT)}")

    for folder_name in ("images", "resources"):
        folder = queue_dir / folder_name
        if folder.exists() and not folder.is_dir():
            raise PublishError(f"{folder.relative_to(ROOT)} must be a folder.")

    return queue_dir


def validate_targets(slug: str, *, overwrite: bool) -> None:
    targets = [
        CONTENT_POSTS / slug,
        PUBLIC / slug,
        PUBLIC_IMAGES / slug,
    ]
    existing = [path.relative_to(ROOT) for path in targets if path.exists()]
    if existing and not overwrite:
        existing_list = ", ".join(str(path) for path in existing)
        raise PublishError(f"Target already exists: {existing_list}. Use --overwrite to replace.")


def clear_targets(slug: str, *, dry_run: bool) -> None:
    for target in (CONTENT_POSTS / slug, PUBLIC / slug, PUBLIC_IMAGES / slug):
        if not target.exists():
            continue
        if dry_run:
            print(f"+ remove {target.relative_to(ROOT)}")
        else:
            shutil.rmtree(target)


def publish(slug: str, *, overwrite: bool, dry_run: bool) -> None:
    validate_slug(slug)
    queue_dir = validate_queue(slug)
    validate_targets(slug, overwrite=overwrite)

    content_dir = CONTENT_POSTS / slug
    content_images_dir = content_dir / "images"
    public_images_dir = PUBLIC_IMAGES / slug
    public_resources_dir = PUBLIC / slug

    if overwrite:
        clear_targets(slug, dry_run=dry_run)

    if dry_run:
        print(f"+ create {content_dir.relative_to(ROOT)}")
    else:
        content_images_dir.mkdir(parents=True, exist_ok=True)

    if dry_run:
        print(f"+ copy {(queue_dir / 'index.md').relative_to(ROOT)} -> {(content_dir / 'index.md').relative_to(ROOT)}")
    else:
        shutil.copy2(queue_dir / "index.md", content_dir / "index.md")

    copy_tree_contents(queue_dir / "images", content_images_dir, dry_run=dry_run)
    ensure_gitkeep(content_images_dir, dry_run=dry_run)

    if (queue_dir / "images").exists():
        copy_tree_contents(queue_dir / "images", public_images_dir, dry_run=dry_run)

    copy_tree_contents(queue_dir / "resources", public_resources_dir, dry_run=dry_run)

    print(f"Published queue folder: post-queue/{slug}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Publish a queued post into content/posts and public assets.")
    parser.add_argument("slug", help="Post slug. Must match post-queue/<slug>.")
    parser.add_argument("--overwrite", action="store_true", help="Replace existing target folders for this slug.")
    parser.add_argument("--dry-run", action="store_true", help="Show planned file operations without changing files.")
    parser.add_argument("--build", action="store_true", help="Run npm run build:pages before committing.")
    parser.add_argument("--commit", action="store_true", help="Create a git commit after publishing files.")
    parser.add_argument("--push", action="store_true", help="Push HEAD to GitHub main. Implies --commit.")
    args = parser.parse_args()

    commit = args.commit or args.push
    if (args.build or commit or args.push) and args.dry_run:
        raise PublishError("--dry-run cannot be combined with --build, --commit, or --push.")

    publish(args.slug, overwrite=args.overwrite, dry_run=args.dry_run)

    if args.build:
        run(["npm", "run", "build:pages"], dry_run=False)

    if commit:
        run(["git", "add", *existing_git_paths(args.slug)], dry_run=False)
        run(["git", "commit", "-m", f"content: publish {args.slug}"], dry_run=False)

    if args.push:
        run(["git", "push", "git@github.com:chihuyenichi/huyenchi-blog.git", "HEAD:main"], dry_run=False)

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except PublishError as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(1)
    except subprocess.CalledProcessError as exc:
        print(f"error: command failed with exit code {exc.returncode}", file=sys.stderr)
        raise SystemExit(exc.returncode)
