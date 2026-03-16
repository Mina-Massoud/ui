/**
 * ImageBlock Component
 *
 * Renders an image node with upload state, loading indicator, and error handling
 */

"use client"

import React, { useEffect, useRef, useState } from "react"
import { ImageIcon, Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

import { TextNode } from "."
import { useEditorDispatch } from "./store/editor-store"

interface ImageBlockProps {
  node: TextNode
  isActive: boolean
  onClick: () => void
  onDelete?: () => void
  onDragStart?: (nodeId: string) => void
  isSelected?: boolean
  onToggleSelection?: (nodeId: string) => void
  onClickWithModifier?: (e: React.MouseEvent, nodeId: string) => void
}

export function ImageBlock({
  node,
  isActive,
  onClick,
  onDelete,
  onDragStart,
  isSelected = false,
  onToggleSelection,
  onClickWithModifier,
}: ImageBlockProps) {
  const dispatch = useEditorDispatch()
  const [imageError, setImageError] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeSide, setResizeSide] = useState<"left" | "right" | null>(null)
  const [currentWidth, setCurrentWidth] = useState<number>(100)
  const containerRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(100)

  // Initialize width from node attributes styles
  useEffect(() => {
    const styles = node.attributes?.styles
    if (styles && typeof styles === "object" && !Array.isArray(styles)) {
      const width = (styles as Record<string, string>).width
      if (width && typeof width === "string" && width.endsWith("%")) {
        const widthValue = parseFloat(width)
        if (!isNaN(widthValue)) {
          setCurrentWidth(widthValue)
        }
      }
    }
  }, [node.attributes?.styles])

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger click when resizing
    if (isResizing) return

    // Check for Ctrl/Cmd click first
    if (onClickWithModifier) {
      onClickWithModifier(e, node.id)
    }

    // Only call regular onClick if not a modifier click
    if (!e.ctrlKey && !e.metaKey) {
      onClick()
    }
  }

  const handleResizeStart = (e: React.MouseEvent, side: "left" | "right") => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeSide(side)
    startXRef.current = e.clientX
    startWidthRef.current = currentWidth
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const containerWidth = containerRef.current.offsetWidth
      const deltaX = e.clientX - startXRef.current

      // For left handle, invert the delta (dragging left decreases width)
      const adjustedDelta = resizeSide === "left" ? -deltaX : deltaX
      const deltaPercent = (adjustedDelta / containerWidth) * 100

      // Calculate new width, constrained between 20% and 100%
      let newWidth = startWidthRef.current + deltaPercent
      newWidth = Math.max(20, Math.min(100, newWidth))

      setCurrentWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setResizeSide(null)

      // Update node attributes with new width
      const existingStyles = node.attributes?.styles
      const stylesObj =
        existingStyles &&
        typeof existingStyles === "object" &&
        !Array.isArray(existingStyles)
          ? (existingStyles as Record<string, string>)
          : {}

      const newStyles = {
        ...stylesObj,
        width: `${currentWidth.toFixed(2)}%`,
      }

      dispatch({
        type: "UPDATE_ATTRIBUTES",
        payload: {
          id: node.id,
          attributes: {
            ...node.attributes,
            styles: newStyles,
          },
          merge: false,
        },
      })
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, resizeSide, currentWidth, node.id, node.attributes, dispatch])

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", node.id)
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        nodeId: node.id,
        type: node.type,
        src: node.attributes?.src,
      })
    )
    if (onDragStart) {
      onDragStart(node.id)
    }
  }

  const handleDragEnd = (_e: React.DragEvent) => {}

  const imageUrl = node.attributes?.src as string | undefined
  const altText = node.attributes?.alt as string | undefined
  const caption = node.content || ""
  const isUploading =
    node.attributes?.loading === "true" || node.attributes?.loading === true
  const hasError =
    node.attributes?.error === "true" || node.attributes?.error === true

  const handleImageLoad = () => {
    setImageError(false)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div ref={containerRef} className="relative mb-4" style={{ width: "100%" }}>
      <Card
        draggable={!isResizing}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`group relative !border-0 p-4 duration-200 ${!isResizing ? "cursor-move" : ""} ${isActive ? "ring-primary/[0.05] bg-accent/5 ring-2" : "hover:bg-accent/5"} ${isSelected ? "bg-blue-500/10 ring-2 ring-blue-500" : ""} `}
        style={{ width: `${currentWidth}%`, margin: "0 auto" }}
        onClick={handleClick}
      >
        {/* Selection checkbox */}
        {onToggleSelection && (
          <div
            className={`absolute top-2 left-2 z-10 transition-opacity ${
              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelection(node.id)}
              className="bg-background h-5 w-5 border-2"
            />
          </div>
        )}

        {/* Delete button */}
        {onDelete && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 z-10 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Image container */}
        <div className="relative w-full">
          {/* Uploading state - show spinner overlay */}
          {isUploading && (
            <div className="bg-muted/50 border-primary/50 flex h-64 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed">
              <Loader2 className="text-primary mb-3 h-12 w-12 animate-spin" />
              <p className="text-foreground text-sm font-medium">
                Uploading image...
              </p>
              <p className="text-muted-foreground mt-1 text-xs">Please wait</p>
            </div>
          )}

          {/* Error state (from upload failure) */}
          {!isUploading && hasError && (
            <div className="bg-destructive/10 border-destructive/50 flex h-64 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed">
              <X className="text-destructive mb-2 h-12 w-12" />
              <p className="text-destructive text-sm font-medium">
                Upload Failed
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Please try again
              </p>
            </div>
          )}

          {/* Normal image loading/error states */}
          {!isUploading && !hasError && (
            <>
              {/* Error state */}
              {imageError && (
                <div className="bg-muted border-muted-foreground/25 flex h-64 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed">
                  <ImageIcon className="text-muted-foreground/50 mb-2 h-12 w-12" />
                  <p className="text-muted-foreground text-sm">
                    Failed to load image
                  </p>
                  {imageUrl && (
                    <p className="text-muted-foreground/70 mt-1 max-w-xs truncate text-xs">
                      {imageUrl}
                    </p>
                  )}
                </div>
              )}

              {/* Actual image */}
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={altText || caption || "Uploaded image"}
                  className="h-auto max-h-[600px] rounded-lg object-cover"
                  style={{ width: "auto", margin: "auto" }}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}

              {/* Caption */}
              {caption && (
                <p className="text-muted-foreground mt-3 text-center text-sm italic">
                  {caption}
                </p>
              )}
            </>
          )}
        </div>

        {/* Resize handles */}
        {!isUploading && !hasError && imageUrl && (
          <>
            {/* Left resize handle */}
            <div
              className="absolute top-1/2 left-0 z-20 flex h-16 w-2 -translate-y-1/2 cursor-ew-resize items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 hover:!opacity-100"
              onMouseDown={(e) => handleResizeStart(e, "left")}
            >
              <div className="bg-primary/50 hover:bg-primary h-12 w-1 rounded-full transition-colors" />
            </div>

            {/* Right resize handle */}
            <div
              className="absolute top-1/2 right-0 z-20 flex h-16 w-2 -translate-y-1/2 cursor-ew-resize items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 hover:!opacity-100"
              onMouseDown={(e) => handleResizeStart(e, "right")}
            >
              <div className="bg-primary/50 hover:bg-primary h-12 w-1 rounded-full transition-colors" />
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
