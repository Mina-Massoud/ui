"use client"

import { EditorProvider } from "../ui/rich-editor"
import type { ContainerNode } from "../ui/rich-editor"
import { createDemoContent } from "../ui/rich-editor/demo-content"
import { Editor } from "../ui/rich-editor/editor"

export default function RichEditorWithContentDemo() {
  const initialContainer: ContainerNode = {
    id: "root",
    type: "container",
    children: createDemoContent(),
    attributes: {},
  }

  return (
    <div className="mx-auto w-full overflow-y-auto">
      <EditorProvider initialContainer={initialContainer}>
        <Editor notionBased />
      </EditorProvider>
    </div>
  )
}
