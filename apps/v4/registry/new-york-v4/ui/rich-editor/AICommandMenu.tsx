/**
 * AICommandMenu Component
 *
 * A sharp-styled AI prompt modal that appears when selecting
 * "AI Generate" from the CommandMenu. Streams AI-generated content
 * into the editor as live blocks.
 *
 * @packageDocumentation
 */

"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, Sparkles, X } from "lucide-react"

import type { AIProvider } from "./ai/types"
import { useEditorAI } from "./hooks/useEditorAI"

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AICommandMenuProps {
  /** Whether the menu is open. */
  isOpen: boolean
  /** Called when the menu should close (Escape, click-outside, after submit). */
  onClose: () => void
  /** The AI provider to use for generation. */
  provider: AIProvider
  /** Default system prompt for generation. */
  defaultSystemPrompt?: string
  /** ID of the block to insert AI content after. */
  targetNodeId: string
  /** The DOM element to position the menu relative to. */
  anchorElement: HTMLElement | null
}

/**
 * AICommandMenu — a sharp-styled AI prompt input.
 *
 * Activated via the CommandMenu's "AI Generate" option. The user types
 * a prompt, presses Enter (or clicks Generate), and AI content streams
 * in below the current block.
 */
export function AICommandMenu({
  isOpen,
  onClose,
  provider,
  defaultSystemPrompt,
  targetNodeId,
  anchorElement,
}: AICommandMenuProps) {
  const [prompt, setPrompt] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const { generateContent, isGenerating, abort } = useEditorAI({
    provider,
    defaultSystemPrompt,
  })

  // ── Focus input when menu opens ──────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setPrompt("")
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // ── Close on Escape ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault()
        e.stopPropagation()
        if (isGenerating) {
          abort()
        } else {
          onClose()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown, true)
    return () => document.removeEventListener("keydown", handleKeyDown, true)
  }, [isOpen, isGenerating, abort, onClose])

  // ── Close on click outside ───────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        anchorElement &&
        !anchorElement.contains(e.target as Node)
      ) {
        if (isGenerating) {
          abort()
        }
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, isGenerating, abort, onClose, anchorElement])

  // ── Submit handler ───────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const trimmed = prompt.trim()
    if (!trimmed || isGenerating) return

    try {
      await generateContent(trimmed, undefined, targetNodeId)
    } catch {
      // Error is already logged inside useEditorAI
    } finally {
      onClose()
    }
  }, [prompt, isGenerating, generateContent, targetNodeId, onClose])

  // ── Keyboard shortcut: Enter to submit, Shift+Enter for newline ─────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  // ── Position calculation ─────────────────────────────────────────────────
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  })

  useEffect(() => {
    if (!isOpen || !anchorElement) return

    const rect = anchorElement.getBoundingClientRect()
    setPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
    })
  }, [isOpen, anchorElement])

  // ── Don't render when closed ─────────────────────────────────────────────
  if (!isOpen || !anchorElement) return null

  return (
    <div
      ref={menuRef}
      className="border-border bg-background/60 text-foreground dark:bg-background/40 dark:border-border fixed z-50 w-[420px] border p-4 shadow-2xl backdrop-blur-xl backdrop-saturate-150"
      style={{ top: position.top, left: position.left }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2.5">
        <div className="bg-foreground flex h-7 w-7 items-center justify-center">
          <Sparkles className="text-background h-3.5 w-3.5" />
        </div>
        <span className="text-sm font-semibold tracking-wide">AI Generate</span>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:bg-accent hover:text-foreground ml-auto p-1 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Prompt input */}
      <textarea
        ref={inputRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe what you want to write..."
        disabled={isGenerating}
        rows={3}
        className="border-border bg-background/50 placeholder:text-muted-foreground/60 focus-visible:ring-foreground/30 w-full resize-none border px-3.5 py-2.5 text-sm transition-shadow focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />

      {/* Actions */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-muted-foreground/70 text-xs">
          {isGenerating ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              Generating...
            </span>
          ) : (
            "Enter to generate, Esc to cancel"
          )}
        </span>
        <div className="flex gap-2">
          {isGenerating ? (
            <button
              type="button"
              onClick={abort}
              className="inline-flex items-center bg-red-500/20 px-3.5 py-1.5 text-xs font-medium text-red-400 transition-all hover:bg-red-500/30 active:scale-95"
            >
              Stop
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="border-border hover:bg-accent inline-flex items-center border px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!prompt.trim()}
                className="bg-foreground text-background hover:bg-foreground/90 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              >
                <Sparkles className="h-3 w-3" />
                Generate
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
