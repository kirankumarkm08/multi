"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  disabled?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  disabled = false,
}: RichTextEditorProps) {
  const editorRef = useRef<any>(null);

  return (
    <div className="w-full">
      <Editor
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY} // Optional: Add to .env.local if needed
        onInit={(evt, editor) => (editorRef.current = editor)}
        value={value}
        onEditorChange={onChange}
        disabled={disabled}
        init={{
          height: 500,
          menubar: true,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        }}
      />
    </div>
  );
}
