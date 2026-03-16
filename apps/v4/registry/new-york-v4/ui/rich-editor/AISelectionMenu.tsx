/**
 * AISelectionMenu Component
 *
 * A Notion-style AI editing menu that appears when clicking the AI button
 * in the SelectionToolbar. Provides preset actions (rephrase, fix grammar,
 * change tone) and custom prompts for AI-powered text replacement.
 *
 * @packageDocumentation
 */

"use client"

import React, { useCallback, useRef, useState } from "react"
import {
  Briefcase,
  Check,
  Loader2,
  Maximize2,
  MessageCircle,
  Minimize2,
  PenLine,
  RefreshCw,
  Sparkles,
  SpellCheck,
  X,
} from "lucide-react"

import { EditorActions, useEditorDispatch } from "."
import type { AIProvider } from "./ai/types"
import { useEditorAI } from "./hooks/useEditorAI"
import type { SelectionInfo } from "./types"

// ─── Preset Actions ──────────────────────────────────────────────────────────

interface PresetAction {
  label: string
  icon: React.ReactNode
  prompt: string
}

const presetActions: PresetAction[] = [
  {
    label: "Rephrase",
    icon: <PenLine className="h-3.5 w-3.5" />,
    prompt: "Rephrase this text differently while keeping the same meaning",
  },
  {
    label: "Fix grammar",
    icon: <SpellCheck className="h-3.5 w-3.5" />,
    prompt: "Fix any grammar and spelling errors in this text",
  },
  {
    label: "Make shorter",
    icon: <Minimize2 className="h-3.5 w-3.5" />,
    prompt: "Make this text shorter while keeping the key message",
  },
  {
    label: "Make longer",
    icon: <Maximize2 className="h-3.5 w-3.5" />,
    prompt: "Expand this text with more detail while maintaining the same tone",
  },
  {
    label: "Professional",
    icon: <Briefcase className="h-3.5 w-3.5" />,
    prompt: "Rewrite this text in a professional, formal tone",
  },
  {
    label: "Casual",
    icon: <MessageCircle className="h-3.5 w-3.5" />,
    prompt: "Rewrite this text in a casual, friendly tone",
  },
]

// ─── Types ───────────────────────────────────────────────────────────────────

type MenuState = "idle" | "generating" | "preview"

export interface AISelectionMenuProps {
  selection: SelectionInfo
  provider: AIProvider
  defaultSystemPrompt?: string
  onClose: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AISelectionMenu({
  selection,
  provider,
  defaultSystemPrompt,
  onClose,
}: AISelectionMenuProps) {
  const [menuState, setMenuState] = useState<MenuState>("idle")
  const [customPrompt, setCustomPrompt] = useState("")
  const [lastPrompt, setLastPrompt] = useState("")
  const [result, setResult] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const dispatch = useEditorDispatch()

  const {
    replaceSelectionWithAI,
    isGenerating,
    streamingPreview,
    resetPreview,
    abort,
  } = useEditorAI({ provider, defaultSystemPrompt })

  // ── Run AI ─────────────────────────────────────────────────────────────────
  const runAI = useCallback(
    async (prompt: string) => {
      setLastPrompt(prompt)
      setMenuState("generating")
      resetPreview()

      try {
        const text = await replaceSelectionWithAI(prompt, selection)
        if (text) {
          setResult(text)
          setMenuState("preview")
        } else {
          setMenuState("idle")
        }
      } catch {
        setMenuState("idle")
      }
    },
    [replaceSelectionWithAI, selection, resetPreview]
  )

  // ── Accept result ──────────────────────────────────────────────────────────
  const handleAccept = useCallback(() => {
    if (!result) return
    dispatch(
      EditorActions.replaceSelectionText(
        selection.nodeId,
        selection.start,
        selection.end,
        result
      )
    )
    onClose()
  }, [result, dispatch, selection, onClose])

  // ── Discard ────────────────────────────────────────────────────────────────
  const handleDiscard = useCallback(() => {
    setResult("")
    resetPreview()
    setMenuState("idle")
  }, [resetPreview])

  // ── Retry ──────────────────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    if (lastPrompt) {
      runAI(lastPrompt)
    }
  }, [lastPrompt, runAI])

  // ── Custom prompt submit ───────────────────────────────────────────────────
  const handleCustomSubmit = useCallback(() => {
    const trimmed = customPrompt.trim()
    if (!trimmed) return
    runAI(trimmed)
    setCustomPrompt("")
  }, [customPrompt, runAI])

  const handleCustomKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleCustomSubmit()
      }
      if (e.key === "Escape") {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
    },
    [handleCustomSubmit, onClose]
  )

  // ── Idle State ─────────────────────────────────────────────────────────────
  if (menuState === "idle") {
    return (
      <div className="border-border bg-background/60 dark:bg-background/40 w-[280px] border shadow-2xl backdrop-blur-xl backdrop-saturate-150">
        {/* Header */}
        <div className="border-border flex items-center gap-2 border-b px-3 py-2">
          <Sparkles className="text-muted-foreground h-3.5 w-3.5" />
          <span className="text-muted-foreground text-xs font-medium tracking-wide">
            AI Edit
          </span>
        </div>

        {/* Selected text preview */}
        <div className="border-border border-b px-3 py-2">
          <p className="text-muted-foreground/60 mb-1 text-xs">
            Selected text:
          </p>
          <p className="text-foreground/80 line-clamp-2 text-xs">
            &ldquo;{selection.text}&rdquo;
          </p>
        </div>

        {/* Preset actions */}
        <div className="py-1">
          {presetActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => runAI(action.prompt)}
              className="text-foreground hover:bg-accent flex w-full items-center gap-2.5 px-3 py-1.5 text-xs transition-colors"
            >
              <span className="text-muted-foreground">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>

        {/* Custom prompt */}
        <div className="border-border border-t px-3 py-2">
          <input
            ref={inputRef}
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={handleCustomKeyDown}
            placeholder="Custom instruction..."
            className="placeholder:text-muted-foreground/50 w-full bg-transparent text-xs focus:outline-none"
            autoFocus
          />
        </div>
      </div>
    )
  }

  // ── Generating State ───────────────────────────────────────────────────────
  if (menuState === "generating") {
    return (
      <div className="border-border bg-background/60 dark:bg-background/40 w-[320px] border shadow-2xl backdrop-blur-xl backdrop-saturate-150">
        {/* Header */}
        <div className="border-border flex items-center gap-2 border-b px-3 py-2">
          <Loader2 className="text-muted-foreground h-3.5 w-3.5 animate-spin" />
          <span className="text-muted-foreground text-xs font-medium tracking-wide">
            Generating...
          </span>
          <button
            type="button"
            onClick={() => {
              abort()
              setMenuState("idle")
            }}
            className="ml-auto text-xs text-red-400 transition-colors hover:text-red-300"
          >
            Stop
          </button>
        </div>

        {/* Live preview */}
        <div className="max-h-[200px] overflow-y-auto px-3 py-3">
          <p className="text-foreground/80 text-xs whitespace-pre-wrap">
            {streamingPreview || "..."}
          </p>
        </div>
      </div>
    )
  }

  // ── Preview State ──────────────────────────────────────────────────────────
  return (
    <div className="border-border bg-background/60 dark:bg-background/40 w-[340px] border shadow-2xl backdrop-blur-xl backdrop-saturate-150">
      {/* Header */}
      <div className="border-border flex items-center gap-2 border-b px-3 py-2">
        <Sparkles className="text-muted-foreground h-3.5 w-3.5" />
        <span className="text-muted-foreground text-xs font-medium tracking-wide">
          AI Result
        </span>
      </div>

      {/* Original */}
      <div className="border-border border-b px-3 py-2">
        <p className="text-muted-foreground/50 mb-1 text-[10px] font-medium tracking-wider uppercase">
          Original
        </p>
        <p className="text-foreground/50 line-clamp-2 text-xs line-through">
          {selection.text}
        </p>
      </div>

      {/* Result */}
      <div className="border-border border-b px-3 py-2">
        <p className="text-muted-foreground/50 mb-1 text-[10px] font-medium tracking-wider uppercase">
          Replacement
        </p>
        <p className="text-foreground text-xs">{result}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 px-3 py-2">
        <button
          type="button"
          onClick={handleAccept}
          className="bg-foreground text-background hover:bg-foreground/90 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium transition-all active:scale-95"
        >
          <Check className="h-3 w-3" />
          Accept
        </button>
        <button
          type="button"
          onClick={handleDiscard}
          className="border-border text-muted-foreground hover:bg-accent inline-flex items-center gap-1 border px-2.5 py-1 text-[11px] font-medium transition-all active:scale-95"
        >
          <X className="h-3 w-3" />
          Discard
        </button>
        <button
          type="button"
          onClick={handleRetry}
          className="border-border text-muted-foreground hover:bg-accent inline-flex items-center gap-1 border px-2.5 py-1 text-[11px] font-medium transition-all active:scale-95"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      </div>
    </div>
  )
}
