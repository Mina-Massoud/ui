"use client"

import type { ContainerNode } from "../ui/rich-editor"
import { EditorProvider } from "../ui/rich-editor/context/editor-context"
import { createDemoContent } from "../ui/rich-editor/demo-content"
import { Editor } from "../ui/rich-editor/editor"

export default function RichEditorCustomUploadDemo() {
  const initialContainer: ContainerNode = {
    id: "root",
    type: "container",
    children: createDemoContent(),
    attributes: {},
  }

  // Example custom upload handler
  const handleImageUpload = async (file: File): Promise<string> => {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In production, upload to your backend:
    // const formData = new FormData()
    // formData.append('image', file)
    // const response = await fetch('/api/upload', {
    //   method: 'POST',
    //   body: formData
    // })
    // const data = await response.json()
    // return data.url

    // For demo, return data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="mx-auto w-full max-w-4xl overflow-y-auto">
      <EditorProvider initialContainer={initialContainer}>
        <Editor onUploadImage={handleImageUpload} />
      </EditorProvider>
    </div>
  )
}
