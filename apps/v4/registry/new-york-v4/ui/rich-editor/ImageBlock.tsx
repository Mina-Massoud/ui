/**
 * ImageBlock Component
 *
 * Renders an image node with upload state, loading indicator, error handling,
 * and resize functionality via the useImageResize hook.
 */

"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { ImageIcon, Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

import { TextNode } from "."
import { useImageResize } from "./hooks/useImageResize"
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
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse initial width from node attributes
  const getInitialWidth = (): number => {
    const styles = node.attributes?.styles
    if (styles && typeof styles === "object" && !Array.isArray(styles)) {
      const width = (styles as Record<string, string>).width
      if (width && typeof width === "string" && width.endsWith("%")) {
        const v = parseFloat(width)
        if (!isNaN(v)) return v
      }
    }
    return 100
  }

  const getNodeAttributes = useCallback(
    () => (node.attributes || {}) as Record<string, any>,
    [node.attributes]
  )

  const {
    currentWidth,
    isResizing,
    dimensionLabel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    setWidthPreset,
    onKeyDown,
    setCurrentWidth,
  } = useImageResize({
    nodeId: node.id,
    initialWidth: getInitialWidth(),
    unit: "percent",
    minWidth: 20,
    maxWidth: 100,
    containerRef: containerRef as React.RefObject<HTMLElement>,
    dispatch,
    getNodeAttributes,
    aspectRatio,
  })

  // Sync width when node attributes change externally
  useEffect(() => {
    const styles = node.attributes?.styles
    if (styles && typeof styles === "object" && !Array.isArray(styles)) {
      const width = (styles as Record<string, string>).width
      if (width && typeof width === "string" && width.endsWith("%")) {
        const widthValue = parseFloat(width)
        if (!isNaN(widthValue) && !isResizing) {
          setCurrentWidth(widthValue)
        }
      }
    }
  }, [node.attributes?.styles, isResizing, setCurrentWidth])

  const handleClick = (e: React.MouseEvent) => {
    if (isResizing) return

    if (onClickWithModifier) {
      onClickWithModifier(e, node.id)
    }

    if (!e.ctrlKey && !e.metaKey) {
      onClick()
    }
  }

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

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(false)
    const img = e.currentTarget
    if (img.naturalWidth && img.naturalHeight) {
      setAspectRatio(img.naturalWidth / img.naturalHeight)
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const showResizeHandles = !isUploading && !hasError && imageUrl

  return (
    <div
      ref={containerRef}
      className="relative mb-4"
      style={{ width: "100%" }}
      onKeyDown={onKeyDown}
      tabIndex={isActive ? 0 : undefined}
      data-node-id={node.id}
      data-node-type="img"
    >
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
          {/* Dimension overlay during resize */}
          {isResizing && dimensionLabel && (
            <div className="pointer-events-none absolute top-2 left-1/2 z-30 -translate-x-1/2 rounded bg-black/75 px-2 py-1 text-xs text-white">
              {dimensionLabel}
            </div>
          )}

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
        {showResizeHandles && (
          <>
            {/* Left resize handle — large hit area (44px), small visual indicator */}
            <div
              className="absolute top-1/2 left-0 z-20 flex h-11 w-11 -translate-y-1/2 cursor-ew-resize items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 hover:!opacity-100"
              style={{ touchAction: "none" }}
              onPointerDown={(e) => handlePointerDown(e, "left")}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <div className="bg-primary/50 hover:bg-primary h-10 w-1.5 rounded-full transition-colors" />
            </div>

            {/* Right resize handle — large hit area (44px), small visual indicator */}
            <div
              className="absolute top-1/2 right-0 z-20 flex h-11 w-11 -translate-y-1/2 cursor-ew-resize items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 hover:!opacity-100"
              style={{ touchAction: "none" }}
              onPointerDown={(e) => handlePointerDown(e, "right")}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <div className="bg-primary/50 hover:bg-primary h-10 w-1.5 rounded-full transition-colors" />
            </div>
          </>
        )}
      </Card>

      {/* Width preset toolbar — shown when image is active */}
      {isActive && showResizeHandles && (
        <div className="mt-2 flex items-center justify-center gap-1">
          {([25, 50, 75, 100] as const).map((preset) => (
            <Button
              key={preset}
              variant="outline"
              size="sm"
              className={`h-7 px-3 text-xs ${
                Math.round(currentWidth) === preset
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : ""
              }`}
              onClick={(e) => {
                e.stopPropagation()
                setWidthPreset(preset)
              }}
            >
              {preset}%
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
