"use client"

import React, { useEffect, useRef } from "react"
import { List, ListOrdered, Plus, Table as TableIcon } from "lucide-react"

import { Button } from "../button"
import { ButtonGroup } from "../button-group"
import { CardContent } from "../card"
import { Separator } from "../separator"
import { MediaUploadPopover } from "./media-upload-popover"

interface EditorToolbarProps {
  isUploading: boolean
  onImageUploadClick: () => void
  onMultipleImagesUploadClick: () => void
  onVideoUploadClick: () => void
  onInsertComponentClick: () => void
  onCreateList: (listType: "ul" | "ol" | "li") => void
  onCreateTable: () => void
}

export function EditorToolbar({
  isUploading,
  onImageUploadClick,
  onMultipleImagesUploadClick,
  onVideoUploadClick,
  onInsertComponentClick,
  onCreateList,
  onCreateTable,
}: EditorToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Measure toolbar height and set it as CSS variable
    const updateToolbarHeight = () => {
      if (toolbarRef.current) {
        const height = toolbarRef.current.offsetHeight
        document.documentElement.style.setProperty(
          "--toolbar-height",
          `${height + 4}px`
        )
      }
    }

    // Update on mount and when window resizes
    updateToolbarHeight()
    window.addEventListener("resize", updateToolbarHeight)

    return () => {
      window.removeEventListener("resize", updateToolbarHeight)
    }
  }, [])

  return (
    <CardContent
      ref={toolbarRef}
      className="bg-background/30 sticky top-0 z-[100] mx-auto w-full border-b p-2 backdrop-blur-2xl transition-all duration-300 md:p-3"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-stretch justify-center gap-2 md:flex-row md:items-center md:gap-3 lg:px-6">
        {/* Insert Elements */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
          {/* Media Upload Popover - combines image and video uploads */}
          <MediaUploadPopover
            isUploading={isUploading}
            onImageUploadClick={onImageUploadClick}
            onMultipleImagesUploadClick={onMultipleImagesUploadClick}
            onVideoUploadClick={onVideoUploadClick}
          />

          <Separator
            orientation="vertical"
            className="hidden h-5 sm:block md:h-6"
          />

          {/* Insert Component Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onInsertComponentClick}
            className="h-7 w-7 md:h-8 md:w-8"
            title="Insert component"
            disabled={isUploading}
          >
            <Plus className="size-3 md:size-3.5" />
          </Button>

          <Separator
            orientation="vertical"
            className="hidden h-5 sm:block md:h-6"
          />

          {/* List Button Group */}
          <ButtonGroup>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCreateList("ul")}
              className="h-7 w-7 md:h-8 md:w-8"
              title="Add unordered list"
            >
              <List className="size-3 md:size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCreateList("ol")}
              className="h-7 w-7 md:h-8 md:w-8"
              title="Add ordered list"
            >
              <ListOrdered className="size-3 md:size-3.5" />
            </Button>
          </ButtonGroup>

          {/* Table Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onCreateTable}
            className="h-7 w-7 md:h-8 md:w-8"
            title="Add table"
          >
            <TableIcon className="size-3 md:size-3.5" />
          </Button>
        </div>
      </div>
    </CardContent>
  )
}
