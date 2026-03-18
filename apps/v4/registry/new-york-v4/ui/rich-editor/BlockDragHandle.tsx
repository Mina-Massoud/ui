"use client"

import React, { useRef, useState } from "react"
import {
  Code,
  GripVertical,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  List,
  ListOrdered,
  Plus,
  Quote,
  Type,
} from "lucide-react"

import { ELEMENT_OPTIONS } from "@/lib/elements"
import { Button } from "@/registry/new-york-v4/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york-v4/ui/popover"

import { TextNode } from "."
import {
  createHandleBlockDragEnd,
  createHandleBlockDragStart,
} from "./handlers/block"
import { useEditorDispatch } from "./store/editor-store"

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Type,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  List,
  ListOrdered,
}

export interface BlockDragHandleProps {
  textNode: TextNode
  isFirstBlock: boolean
  notionBased: boolean
  hasCoverImage: boolean
  onUploadCoverImage?: (file: File) => Promise<string>
  onBlockDragStart?: (nodeId: string) => void
  onSetDragOverNodeId?: (nodeId: string | null) => void
  onSetDropPosition?: (
    position: "before" | "after" | "left" | "right" | null
  ) => void
  onSetDraggingNodeId?: (nodeId: string | null) => void
}

/**
 * BlockDragHandle
 *
 * Renders the absolute-positioned row that appears on hover containing:
 *   - Cover image upload button (first block in Notion mode only)
 *   - Add block popover
 *   - Drag/grip handle (desktop + touch)
 */
export function BlockDragHandle({
  textNode,
  isFirstBlock,
  notionBased,
  hasCoverImage,
  onUploadCoverImage,
  onBlockDragStart,
  onSetDragOverNodeId,
  onSetDropPosition,
  onSetDraggingNodeId,
}: BlockDragHandleProps) {
  const dispatch = useEditorDispatch()
  const coverImageInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [addBlockPopoverOpen, setAddBlockPopoverOpen] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const [isDraggingTouch, setIsDraggingTouch] = useState(false)

  // Cover image upload
  const handleCoverImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file || !onUploadCoverImage) return

    setIsUploadingCover(true)
    try {
      const url = await onUploadCoverImage(file)
      const { EditorActions } = await import("./reducer/actions")
      dispatch(
        EditorActions.setCoverImage({
          url,
          alt: file.name,
          position: 50,
        })
      )
    } catch (error) {
      console.error("Failed to upload cover image:", error)
    } finally {
      setIsUploadingCover(false)
      if (coverImageInputRef.current) {
        coverImageInputRef.current.value = ""
      }
    }
  }

  // Drag handlers
  const handleBlockDragStartFn = createHandleBlockDragStart(
    textNode,
    onBlockDragStart
  )

  const handleBlockDragEndFn = createHandleBlockDragEnd(() => {
    if (onSetDragOverNodeId && onSetDropPosition && onSetDraggingNodeId) {
      onSetDragOverNodeId(null)
      onSetDropPosition(null)
      onSetDraggingNodeId(null)
    }
  })

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    setIsDraggingTouch(true)
    if (onBlockDragStart && textNode?.id) {
      onBlockDragStart(textNode.id)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !isDraggingTouch) return
    e.preventDefault()
    e.stopPropagation()
    const touch = e.touches[0]
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
    const targetBlock = elementBelow?.closest("[data-node-id]")
    if (targetBlock && onSetDragOverNodeId && onSetDropPosition) {
      const targetId = targetBlock.getAttribute("data-node-id")
      if (targetId && targetId !== textNode?.id) {
        onSetDragOverNodeId(targetId)
        onSetDropPosition("after")
      } else {
        onSetDragOverNodeId(null)
        onSetDropPosition(null)
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0]
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
    const targetBlock = elementBelow?.closest("[data-node-id]")
    if (targetBlock && textNode?.id) {
      const targetId = targetBlock.getAttribute("data-node-id")
      if (targetId && targetId !== textNode.id && dispatch) {
        dispatch({
          type: "MOVE_NODE",
          payload: {
            nodeId: textNode.id,
            targetId,
            position: "after",
          },
        })
      }
    }
    touchStartRef.current = null
    setIsDraggingTouch(false)
    if (onSetDragOverNodeId && onSetDropPosition) {
      onSetDragOverNodeId(null)
      onSetDropPosition(null)
    }
  }

  const handleTouchCancel = () => {
    touchStartRef.current = null
    setIsDraggingTouch(false)
    if (onSetDragOverNodeId && onSetDropPosition) {
      onSetDragOverNodeId(null)
      onSetDropPosition(null)
    }
  }

  return (
    <div className="mb-1 flex items-center gap-0.5 transition-opacity duration-200 lg:absolute lg:top-1/2 lg:left-0 lg:mb-0 lg:-ml-[4.5rem] lg:-translate-y-1/2 lg:opacity-0 lg:group-hover:opacity-100">
      {/* Cover image button - first block in Notion mode only */}
      {notionBased && isFirstBlock && !hasCoverImage && onUploadCoverImage && (
        <>
          <input
            ref={coverImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverImageUpload}
          />
          <button
            className="hover:bg-accent rounded p-0.5 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation()
              coverImageInputRef.current?.click()
            }}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={isUploadingCover}
            title="Add Cover"
          >
            {isUploadingCover ? (
              <div className="border-primary h-5 w-5 animate-spin rounded-full border-b-2" />
            ) : (
              <ImageIcon
                className="text-muted-foreground hover:text-foreground h-5 w-5 transition-colors duration-200"
                strokeWidth={1.5}
              />
            )}
          </button>
        </>
      )}

      {/* Add Block Button */}
      <Popover open={addBlockPopoverOpen} onOpenChange={setAddBlockPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            className="hover:bg-accent rounded p-0.5 transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Plus
              className="text-muted-foreground hover:text-foreground h-5 w-5 transition-colors duration-200"
              strokeWidth={1.5}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="start">
          <div className="flex flex-col gap-1">
            {ELEMENT_OPTIONS.map((element) => {
              const IconComponent = element.icon ? iconMap[element.icon] : null
              return (
                <Button
                  key={element.value}
                  variant="ghost"
                  size="sm"
                  className="justify-start gap-2"
                  onClick={() => {
                    dispatch({
                      type: "INSERT_NODE",
                      payload: {
                        node: {
                          id: `${element.value}-${Date.now()}`,
                          type: element.value as TextNode["type"],
                          content: "",
                        },
                        targetId: textNode.id,
                        position: "after",
                      },
                    })
                    setAddBlockPopoverOpen(false)
                  }}
                >
                  {IconComponent && (
                    <IconComponent className={element.iconSize || "h-4 w-4"} />
                  )}
                  <span>{element.label}</span>
                </Button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Drag Handle */}
      <div
        draggable
        onDragStart={handleBlockDragStartFn}
        onDragEnd={handleBlockDragEndFn}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        className={`cursor-grab p-0.5 active:cursor-grabbing ${isDraggingTouch ? "opacity-50" : ""}`}
        style={{ touchAction: "none" }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <GripVertical
          className="text-muted-foreground hover:text-foreground h-5 w-5 transition-colors duration-200"
          strokeWidth={1.5}
        />
      </div>
    </div>
  )
}
