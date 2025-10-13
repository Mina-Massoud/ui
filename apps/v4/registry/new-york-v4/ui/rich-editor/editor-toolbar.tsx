"use client"

import React from "react"
import {
  Bold,
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  ImagePlus,
  Italic,
  LayoutGrid,
  Link as LinkIcon,
  List,
  ListOrdered,
  Menu,
  Moon,
  Redo,
  Sun,
  Table as TableIcon,
  Type,
  Underline,
  Undo,
} from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "../button"
import { ButtonGroup } from "../button-group"
import { CardContent } from "../card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../dialog"
import { Label } from "../label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select"
import { Separator } from "../separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../sheet"
import { Switch } from "../switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs"
import { ToggleGroup, ToggleGroupItem } from "../toggle-group"
import { ColorPickerComponent } from "./color-picker"
import { FontSizePicker } from "./font-size-picker"
import {
  serializeToHtml,
  type ContainerNode,
  type SelectionInfo,
  type TextNode,
} from "./index"

interface EditorToolbarProps {
  currentNode?: TextNode | null
  currentSelection: SelectionInfo | null
  selectedColor: string
  isUploading: boolean
  enhanceSpaces: boolean
  copiedHtml: boolean
  copiedJson: boolean
  container: ContainerNode
  readOnly: boolean
  canUndo: boolean
  canRedo: boolean
  onReadOnlyChange: (readOnly: boolean) => void
  onTypeChange: (type: TextNode["type"]) => void
  onFormat: (format: "bold" | "italic" | "underline") => void
  onColorSelect: (color: string) => void
  onFontSizeSelect: (fontSize: string) => void
  onImageUploadClick: () => void
  onMultipleImagesUploadClick: () => void
  onCreateList: (listType: "ul" | "ol") => void
  onCreateLink: () => void
  onCreateTable: () => void
  onCopyHtml: () => void
  onCopyJson: () => void
  onEnhanceSpacesChange: (checked: boolean) => void
  onUndo: () => void
  onRedo: () => void
}

export function EditorToolbar({
  currentNode,
  currentSelection,
  selectedColor,
  isUploading,
  enhanceSpaces,
  copiedHtml,
  copiedJson,
  container,
  readOnly,
  canUndo,
  canRedo,
  onReadOnlyChange,
  onTypeChange,
  onFormat,
  onColorSelect,
  onFontSizeSelect,
  onImageUploadClick,
  onMultipleImagesUploadClick,
  onCreateList,
  onCreateLink,
  onCreateTable,
  onCopyHtml,
  onCopyJson,
  onEnhanceSpacesChange,
  onUndo,
  onRedo,
}: EditorToolbarProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Mobile Toolbar Content (for Sheet)
  const MobileToolbarContent = () => (
    <div className="flex flex-col gap-6 p-4">
      {/* History Actions */}
      <div className="space-y-3">
        <h3 className="text-muted-foreground text-sm font-semibold">History</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={onUndo}
            disabled={!canUndo}
            className="flex-1"
          >
            <Undo className="mr-2 size-4" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onRedo}
            disabled={!canRedo}
            className="flex-1"
          >
            <Redo className="mr-2 size-4" />
            Redo
          </Button>
        </div>
      </div>

      <Separator />

      {/* Text Formatting Section */}
      <div className="space-y-3">
        <h3 className="text-muted-foreground text-sm font-semibold">
          Text Formatting
        </h3>

        {/* Type Selector */}
        <div className="space-y-2">
          <Label className="text-xs">Element Type</Label>
          <Select
            value={
              currentSelection?.elementType !== undefined &&
              currentSelection?.elementType !== null
                ? currentSelection.elementType
                : currentNode?.type || "p"
            }
            onValueChange={(value) => onTypeChange(value as TextNode["type"])}
            disabled={
              !currentNode ||
              currentNode.type === "br" ||
              currentNode.type === "img"
            }
          >
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="Select type">
                {(() => {
                  const type =
                    currentSelection?.elementType !== undefined &&
                    currentSelection?.elementType !== null
                      ? currentSelection.elementType
                      : currentNode?.type || "p"

                  switch (type) {
                    case "h1":
                      return (
                        <span className="text-base font-bold">Heading 1</span>
                      )
                    case "h2":
                      return (
                        <span className="text-sm font-bold">Heading 2</span>
                      )
                    case "h3":
                      return (
                        <span className="text-sm font-semibold">Heading 3</span>
                      )
                    case "h4":
                      return (
                        <span className="text-xs font-semibold">Heading 4</span>
                      )
                    case "h5":
                      return (
                        <span className="text-xs font-semibold">Heading 5</span>
                      )
                    case "h6":
                      return (
                        <span className="text-xs font-semibold">Heading 6</span>
                      )
                    case "li":
                      return <span className="text-sm">List Item</span>
                    case "blockquote":
                      return <span className="text-sm italic">Quote</span>
                    case "code":
                      return <span className="font-mono text-xs">Code</span>
                    default:
                      return <span className="text-sm">Paragraph</span>
                  }
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="p">
                <span className="text-sm">Paragraph</span>
              </SelectItem>
              <SelectItem value="h1">
                <span className="text-base font-bold">Heading 1</span>
              </SelectItem>
              <SelectItem value="h2">
                <span className="text-sm font-bold">Heading 2</span>
              </SelectItem>
              <SelectItem value="h3">
                <span className="text-sm font-semibold">Heading 3</span>
              </SelectItem>
              <SelectItem value="h4">
                <span className="text-xs font-semibold">Heading 4</span>
              </SelectItem>
              <SelectItem value="h5">
                <span className="text-xs font-semibold">Heading 5</span>
              </SelectItem>
              <SelectItem value="h6">
                <span className="text-xs font-semibold">Heading 6</span>
              </SelectItem>
              <SelectItem value="li">
                <span className="text-sm">List Item</span>
              </SelectItem>
              <SelectItem value="blockquote">
                <span className="text-sm italic">Quote</span>
              </SelectItem>
              <SelectItem value="code">
                <span className="font-mono text-xs">Code</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Format Buttons */}
        <div className="space-y-2">
          <Label className="text-xs">Text Style</Label>
          <div className="flex gap-2">
            <Button
              variant={currentSelection?.formats.bold ? "default" : "outline"}
              size="lg"
              onClick={() => onFormat("bold")}
              disabled={!currentSelection}
              className="flex-1"
            >
              <Bold className="mr-2 size-4" />
              Bold
            </Button>
            <Button
              variant={currentSelection?.formats.italic ? "default" : "outline"}
              size="lg"
              onClick={() => onFormat("italic")}
              disabled={!currentSelection}
              className="flex-1"
            >
              <Italic className="mr-2 size-4" />
              Italic
            </Button>
            <Button
              variant={
                currentSelection?.formats.underline ? "default" : "outline"
              }
              size="lg"
              onClick={() => onFormat("underline")}
              disabled={!currentSelection}
              className="flex-1"
            >
              <Underline className="mr-2 size-4" />
              Underline
            </Button>
          </div>
        </div>

        {/* Color & Font Size */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs">Color</Label>
            <ColorPickerComponent
              disabled={!currentSelection}
              onColorSelect={onColorSelect}
              selectedColor={selectedColor}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Font Size</Label>
            <FontSizePicker
              disabled={!currentSelection}
              onFontSizeSelect={onFontSizeSelect}
              currentFontSize={currentSelection?.styles?.fontSize || undefined}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Insert Elements Section */}
      <div className="space-y-3">
        <h3 className="text-muted-foreground text-sm font-semibold">
          Insert Elements
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={onImageUploadClick}
            disabled={isUploading}
            className="h-auto flex-col gap-2 py-4"
          >
            <ImagePlus className="size-5" />
            <span className="text-xs">Single Image</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onMultipleImagesUploadClick}
            disabled={isUploading}
            className="h-auto flex-col gap-2 py-4"
          >
            <LayoutGrid className="size-5" />
            <span className="text-xs">Multiple Images</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => onCreateList("ul")}
            className="h-auto flex-col gap-2 py-4"
          >
            <List className="size-5" />
            <span className="text-xs">Unordered List</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => onCreateList("ol")}
            className="h-auto flex-col gap-2 py-4"
          >
            <ListOrdered className="size-5" />
            <span className="text-xs">Ordered List</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onCreateLink}
            className="h-auto flex-col gap-2 py-4"
          >
            <LinkIcon className="size-5" />
            <span className="text-xs">Link</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onCreateTable}
            className="h-auto flex-col gap-2 py-4"
          >
            <TableIcon className="size-5" />
            <span className="text-xs">Table</span>
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <CardContent className="bg-background/30 sticky top-0 z-40 mx-auto w-full border-b p-2 backdrop-blur-2xl transition-all duration-300 md:p-4">
      {/* Mobile Layout */}
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-1.5 md:hidden">
        {/* Mobile Menu Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Editor Tools</SheetTitle>
            </SheetHeader>
            <MobileToolbarContent />
          </SheetContent>
        </Sheet>

        {/* Quick Actions on Mobile */}
        <div className="flex items-center gap-0.5">
          {/* Undo/Redo */}
          <ButtonGroup>
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-8 w-8"
              title="Undo"
            >
              <Undo className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-8 w-8"
              title="Redo"
            >
              <Redo className="size-3.5" />
            </Button>
          </ButtonGroup>

          <Separator orientation="vertical" className="mx-0.5 h-6" />

          <ToggleGroup
            type="multiple"
            variant="outline"
            size="sm"
            disabled={!currentSelection}
            value={[
              ...(currentSelection?.formats.bold ? ["bold"] : []),
              ...(currentSelection?.formats.italic ? ["italic"] : []),
              ...(currentSelection?.formats.underline ? ["underline"] : []),
            ]}
            className="gap-0.5"
          >
            <ToggleGroupItem
              value="bold"
              aria-label="Toggle bold"
              onClick={() => onFormat("bold")}
              disabled={!currentSelection}
              className="h-8 w-8"
            >
              <Bold className="size-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="italic"
              aria-label="Toggle italic"
              onClick={() => onFormat("italic")}
              disabled={!currentSelection}
              className="h-8 w-8"
            >
              <Italic className="size-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="underline"
              aria-label="Toggle underline"
              onClick={() => onFormat("underline")}
              disabled={!currentSelection}
              className="h-8 w-8"
            >
              <Underline className="size-3.5" />
            </ToggleGroupItem>
          </ToggleGroup>

          <Separator orientation="vertical" className="mx-0.5 h-6" />

          {/* Export Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Export code"
              >
                <Download className="size-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[90vh] max-w-[90vw] min-w-[90vw] flex-col overflow-hidden">
              <DialogHeader>
                <DialogTitle>Export Code</DialogTitle>
                <DialogDescription>
                  Copy the HTML or JSON output of your editor content
                </DialogDescription>
              </DialogHeader>

              <Tabs
                defaultValue="preview"
                className="flex flex-1 flex-col overflow-hidden"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="preview">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="json">JSON</TabsTrigger>
                </TabsList>

                <div className="mt-4 flex items-center justify-between px-1">
                  <p className="text-muted-foreground text-sm">
                    Preview Options
                  </p>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="enhance-spaces-mobile"
                      className="cursor-pointer text-sm"
                    >
                      Enhance Spaces
                    </Label>
                    <Switch
                      id="enhance-spaces-mobile"
                      checked={enhanceSpaces}
                      onCheckedChange={onEnhanceSpacesChange}
                    />
                  </div>
                </div>

                <TabsContent
                  value="preview"
                  className="mt-4 flex flex-1 flex-col overflow-hidden"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                      Live preview of rendered HTML
                    </p>
                  </div>
                  <div
                    className="bg-background flex-1 overflow-auto rounded-lg border p-6"
                    dangerouslySetInnerHTML={{
                      __html: enhanceSpaces
                        ? `<div class="[&>*]:my-3 [&_*]:my-5">${serializeToHtml(
                            container
                          )}</div>`
                        : serializeToHtml(container),
                    }}
                  />
                </TabsContent>

                <TabsContent
                  value="html"
                  className="mt-4 flex flex-1 flex-col overflow-hidden"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                      HTML with Tailwind CSS classes
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onCopyHtml}
                      className="gap-2"
                    >
                      {copiedHtml ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="bg-secondary text-secondary-foreground flex-1 overflow-auto rounded-lg border p-4 text-xs">
                    {enhanceSpaces
                      ? `<div class="[&>*]:my-3 [&_*]:my-5">\n${serializeToHtml(
                          container
                        )}\n</div>`
                      : serializeToHtml(container)}
                  </pre>
                </TabsContent>

                <TabsContent
                  value="json"
                  className="mt-4 flex flex-1 flex-col overflow-hidden"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                      Editor state as JSON
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onCopyJson}
                      className="gap-2"
                    >
                      {copiedJson ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="bg-secondary text-secondary-foreground flex-1 overflow-auto rounded-lg border p-4 text-xs">
                    {JSON.stringify(container.children, null, 2)}
                  </pre>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Button
            variant={readOnly ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => onReadOnlyChange(!readOnly)}
            title={readOnly ? "View Only Mode" : "Edit Mode"}
          >
            {readOnly ? (
              <Eye className="size-3.5" />
            ) : (
              <EyeOff className="size-3.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            <Sun className="size-3.5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-3.5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="mx-auto hidden w-full max-w-4xl flex-wrap items-center gap-2 md:flex md:gap-3">
        {/* Left Section - Text Formatting */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Selector */}
          <div className="bg-muted/50 flex items-center gap-1 rounded-md px-1.5 py-1 md:gap-1.5 md:px-2">
            <Type className="text-muted-foreground hidden size-3 sm:block md:size-3.5" />
            <Select
              value={
                currentSelection?.elementType !== undefined &&
                currentSelection?.elementType !== null
                  ? currentSelection.elementType
                  : currentNode?.type || "p"
              }
              onValueChange={(value) => onTypeChange(value as TextNode["type"])}
              disabled={
                !currentNode ||
                currentNode.type === "br" ||
                currentNode.type === "img"
              }
            >
              <SelectTrigger className="h-7 w-[90px] border-0 bg-transparent text-xs focus:ring-0 sm:w-[120px] sm:text-sm md:h-8 md:w-[140px]">
                <SelectValue placeholder="Select type">
                  {(() => {
                    const type =
                      currentSelection?.elementType !== undefined &&
                      currentSelection?.elementType !== null
                        ? currentSelection.elementType
                        : currentNode?.type || "p"

                    switch (type) {
                      case "h1":
                        return (
                          <span className="text-base font-bold">Heading 1</span>
                        )
                      case "h2":
                        return (
                          <span className="text-sm font-bold">Heading 2</span>
                        )
                      case "h3":
                        return (
                          <span className="text-sm font-semibold">
                            Heading 3
                          </span>
                        )
                      case "h4":
                        return (
                          <span className="text-xs font-semibold">
                            Heading 4
                          </span>
                        )
                      case "h5":
                        return (
                          <span className="text-xs font-semibold">
                            Heading 5
                          </span>
                        )
                      case "h6":
                        return (
                          <span className="text-xs font-semibold">
                            Heading 6
                          </span>
                        )
                      case "li":
                        return <span className="text-sm">List Item</span>
                      case "blockquote":
                        return <span className="text-sm italic">Quote</span>
                      case "code":
                        return <span className="font-mono text-xs">Code</span>
                      default:
                        return <span className="text-sm">Paragraph</span>
                    }
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="p">
                  <span className="text-sm">Paragraph</span>
                </SelectItem>
                <SelectItem value="h1">
                  <span className="text-base font-bold">Heading 1</span>
                </SelectItem>
                <SelectItem value="h2">
                  <span className="text-sm font-bold">Heading 2</span>
                </SelectItem>
                <SelectItem value="h3">
                  <span className="text-sm font-semibold">Heading 3</span>
                </SelectItem>
                <SelectItem value="h4">
                  <span className="text-xs font-semibold">Heading 4</span>
                </SelectItem>
                <SelectItem value="h5">
                  <span className="text-xs font-semibold">Heading 5</span>
                </SelectItem>
                <SelectItem value="h6">
                  <span className="text-xs font-semibold">Heading 6</span>
                </SelectItem>
                <SelectItem value="li">
                  <span className="text-sm">List Item</span>
                </SelectItem>
                <SelectItem value="blockquote">
                  <span className="text-sm italic">Quote</span>
                </SelectItem>
                <SelectItem value="code">
                  <span className="font-mono text-xs">Code</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator
            orientation="vertical"
            className="hidden h-5 sm:block md:h-6"
          />

          {/* Undo/Redo Buttons */}
          <ButtonGroup>
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-7 w-7 md:h-8 md:w-8"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="size-3 md:size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-7 w-7 md:h-8 md:w-8"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="size-3 md:size-3.5" />
            </Button>
          </ButtonGroup>

          <Separator
            orientation="vertical"
            className="hidden h-5 sm:block md:h-6"
          />

          {/* Format Buttons */}
          <ToggleGroup
            type="multiple"
            variant="outline"
            disabled={!currentSelection}
            size="sm"
            value={[
              ...(currentSelection?.formats.bold ? ["bold"] : []),
              ...(currentSelection?.formats.italic ? ["italic"] : []),
              ...(currentSelection?.formats.underline ? ["underline"] : []),
            ]}
          >
            <ToggleGroupItem
              value="bold"
              aria-label="Toggle bold"
              onClick={() => onFormat("bold")}
              disabled={!currentSelection}
              className="h-9 w-9 md:h-9 md:w-9"
            >
              <Bold className="size-4 md:size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="italic"
              aria-label="Toggle italic"
              onClick={() => onFormat("italic")}
              disabled={!currentSelection}
              className="h-9 w-9 md:h-9 md:w-9"
            >
              <Italic className="size-4 md:size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="underline"
              aria-label="Toggle underline"
              onClick={() => onFormat("underline")}
              disabled={!currentSelection}
              className="h-9 w-9 md:h-9 md:w-9"
            >
              <Underline className="size-4 md:size-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Color Picker */}
          <ColorPickerComponent
            disabled={!currentSelection}
            onColorSelect={onColorSelect}
            selectedColor={selectedColor}
          />

          <Separator
            orientation="vertical"
            className="hidden h-5 md:h-6 lg:block"
          />

          {/* Font Size Picker */}
          <FontSizePicker
            disabled={!currentSelection}
            onFontSizeSelect={onFontSizeSelect}
            currentFontSize={currentSelection?.styles?.fontSize || undefined}
          />
        </div>

        {/* Right Section - Insert Elements */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Image Buttons Group */}
          <ButtonGroup>
            <Button
              variant="ghost"
              size="icon"
              onClick={onImageUploadClick}
              disabled={isUploading}
              className="h-9 w-9"
              title="Add single image"
            >
              <ImagePlus className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMultipleImagesUploadClick}
              disabled={isUploading}
              className="h-9 w-9"
              title="Add multiple images"
            >
              <LayoutGrid className="size-4" />
            </Button>
          </ButtonGroup>

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

          {/* Link Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onCreateLink}
            className="h-7 w-7 md:h-8 md:w-8"
            title="Add link"
          >
            <LinkIcon className="size-3 md:size-3.5" />
          </Button>

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

          <Separator
            orientation="vertical"
            className="hidden h-5 sm:block md:h-6"
          />

          {/* View Code Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:h-8 md:w-8"
                title="Export code"
              >
                <Download className="size-3 md:size-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[90vh] max-w-[90vw] min-w-[90vw] flex-col overflow-hidden">
              <DialogHeader>
                <DialogTitle>Export Code</DialogTitle>
                <DialogDescription>
                  Copy the HTML or JSON output of your editor content
                </DialogDescription>
              </DialogHeader>

              <Tabs
                defaultValue="preview"
                className="flex flex-1 flex-col overflow-hidden"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="preview">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="html">HTML Output</TabsTrigger>
                  <TabsTrigger value="json">JSON Data</TabsTrigger>
                </TabsList>

                {/* Enhance Spaces Toggle */}
                <div className="mt-4 flex items-center justify-between px-1">
                  <p className="text-muted-foreground text-sm">
                    Preview Options
                  </p>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="enhance-spaces"
                      className="cursor-pointer text-sm"
                    >
                      Enhance Spaces
                    </Label>
                    <Switch
                      id="enhance-spaces"
                      checked={enhanceSpaces}
                      onCheckedChange={onEnhanceSpacesChange}
                    />
                  </div>
                </div>

                <TabsContent
                  value="preview"
                  className="mt-4 flex flex-1 flex-col overflow-hidden"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                      Live preview of rendered HTML
                    </p>
                  </div>
                  <div
                    className="bg-background flex-1 overflow-auto rounded-lg border p-6"
                    dangerouslySetInnerHTML={{
                      __html: enhanceSpaces
                        ? `<div class="[&>*]:my-3 [&_*]:my-5">${serializeToHtml(
                            container
                          )}</div>`
                        : serializeToHtml(container),
                    }}
                  />
                </TabsContent>

                <TabsContent
                  value="html"
                  className="mt-4 flex flex-1 flex-col overflow-hidden"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                      HTML with Tailwind CSS classes
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onCopyHtml}
                      className="gap-2"
                    >
                      {copiedHtml ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy HTML
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="bg-secondary text-secondary-foreground flex-1 overflow-auto rounded-lg border p-4 text-xs">
                    {enhanceSpaces
                      ? `<div class="[&>*]:my-3 [&_*]:my-5">\n${serializeToHtml(
                          container
                        )}\n</div>`
                      : serializeToHtml(container)}
                  </pre>
                </TabsContent>

                <TabsContent
                  value="json"
                  className="mt-4 flex flex-1 flex-col overflow-hidden"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                      Editor state as JSON
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onCopyJson}
                      className="gap-2"
                    >
                      {copiedJson ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy JSON
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="bg-secondary text-secondary-foreground flex-1 overflow-auto rounded-lg border p-4 text-xs">
                    {JSON.stringify(container.children, null, 2)}
                  </pre>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Separator
            orientation="vertical"
            className="hidden h-5 sm:block md:h-6"
          />

          {/* Read-only toggle */}
          <Button
            variant={readOnly ? "default" : "ghost"}
            size="icon"
            className="h-7 w-7 md:h-8 md:w-8"
            onClick={() => onReadOnlyChange(!readOnly)}
            title={readOnly ? "View Only Mode" : "Edit Mode"}
          >
            {readOnly ? (
              <Eye className="size-3 md:size-3.5" />
            ) : (
              <EyeOff className="size-3 md:size-3.5" />
            )}
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 md:h-8 md:w-8"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            <Sun className="size-3 scale-100 rotate-0 transition-all md:size-3.5 dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-3 scale-0 rotate-90 transition-all md:size-3.5 dark:scale-100 dark:rotate-0" />
          </Button>
        </div>
      </div>
    </CardContent>
  )
}
