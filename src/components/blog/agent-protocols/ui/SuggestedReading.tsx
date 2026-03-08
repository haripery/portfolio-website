"use client";

import { motion } from "framer-motion";
import type { SuggestedReadingProps } from "@/lib/protocols/a2ui";

export function SuggestedReading({ posts }: SuggestedReadingProps) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-[var(--ink)]/50 uppercase tracking-wider mb-3">
        Suggested Reading
      </h4>
      <div className="grid gap-3">
        {posts.map((post, i) => (
          <motion.a
            key={post.slug}
            href={`/blog/${post.slug}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="block rounded-lg border border-[var(--ink)]/10 bg-[var(--ink)]/[0.02] p-4 hover:border-[var(--ink)]/20 hover:bg-[var(--ink)]/[0.04] transition-all group"
          >
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">📖</span>
              <div className="flex-1 min-w-0">
                <h5 className="font-semibold text-[var(--ink)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                  {post.title}
                </h5>
                <p className="text-sm text-[var(--ink)]/60 line-clamp-2 mb-1">
                  {post.excerpt}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 italic">
                  {post.relevance}
                </p>
              </div>
              <span className="text-[var(--ink)]/30 group-hover:text-[var(--ink)]/60 transition-colors shrink-0">
                &rarr;
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
