"use client"

import { EditorProvider } from "../ui/rich-editor"
import { Editor } from "../ui/rich-editor/editor"

export default function RichEditorDemo() {
  return (
    <div className="mx-auto w-full overflow-y-auto">
      <EditorProvider>
        <Editor notionBased />
      </EditorProvider>
    </div>
  )
}
