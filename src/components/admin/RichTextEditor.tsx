"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  Code,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
} from "lucide-react";

interface RichTextEditorProps {
  content?: string;
  onChange: (html: string, json: string) => void;
}

export function RichTextEditor({ content = "", onChange }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Start writing your post…" }),
    ],
    content: content || "",
    onUpdate({ editor }) {
      onChange(editor.getHTML(), JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-site max-w-none min-h-[320px] focus:outline-none px-4 py-4 text-[rgba(58,58,56,0.75)] leading-relaxed",
      },
    },
  });

  // Sync external content (used when initialData loads on edit page)
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only run on mount

  if (!editor) return <div className="h-64 animate-pulse bg-[rgba(58,58,56,0.06)]" style={{ borderRadius: "2px" }} />;

  const TOOLBAR_ITEMS = [
    {
      label: "Bold",
      Icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      label: "Italic",
      Icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      label: "Code",
      Icon: Code,
      action: () => editor.chain().focus().toggleCode().run(),
      active: editor.isActive("code"),
    },
    null, // separator
    {
      label: "Heading 2",
      Icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      label: "Heading 3",
      Icon: Heading3,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
    null,
    {
      label: "Bullet List",
      Icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      label: "Ordered List",
      Icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      label: "Blockquote",
      Icon: Quote,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },
    {
      label: "Divider",
      Icon: Minus,
      action: () => editor.chain().focus().setHorizontalRule().run(),
      active: false,
    },
    null,
    {
      label: "Link",
      Icon: LinkIcon,
      action: () => {
        const url = window.prompt("Enter URL:");
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        } else {
          editor.chain().focus().unsetLink().run();
        }
      },
      active: editor.isActive("link"),
    },
  ];

  return (
    <div className="overflow-hidden border border-[rgba(58,58,56,0.2)]" style={{ borderRadius: "2px" }}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[rgba(58,58,56,0.15)] bg-[rgba(58,58,56,0.04)] px-2 py-1.5">
        {TOOLBAR_ITEMS.map((item, i) =>
          item === null ? (
            <span
              key={`sep-${i}`}
              className="mx-1 h-4 w-px bg-[rgba(58,58,56,0.2)]"
            />
          ) : (
            <button
              key={item.label}
              type="button"
              title={item.label}
              onClick={item.action}
              className={`p-1.5 transition-colors ${
                item.active
                  ? "bg-[rgba(26,60,43,0.12)] text-[#1A3C2B]"
                  : "text-[rgba(58,58,56,0.5)] hover:bg-[rgba(58,58,56,0.08)] hover:text-[#1A3C2B]"
              }`}
              style={{ borderRadius: "2px" }}
            >
              <item.Icon className="h-4 w-4" />
            </button>
          )
        )}
      </div>
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
