"use client"

import * as React from "react"
import { Maximize2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/registry/new-york-v4/ui/tabs"

export function ComponentPreviewTabs({
  className,
  align = "center",
  hideCode = false,
  chromeLessOnMobile = false,
  component,
  source,
  ...props
}: React.ComponentProps<"div"> & {
  align?: "center" | "start" | "end"
  hideCode?: boolean
  chromeLessOnMobile?: boolean
  component: React.ReactNode
  source: React.ReactNode
}) {
  const [tab, setTab] = React.useState("preview")
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <>
      <div
        className={cn(
          "group relative mt-4 mb-12 flex flex-col gap-2",
          className
        )}
        {...props}
      >
        <Tabs
          className="relative mr-auto w-full"
          value={tab}
          onValueChange={setTab}
        >
          <div className="flex items-center justify-between">
            {!hideCode && (
              <TabsList className="justify-start gap-4 rounded-none bg-transparent px-2 md:px-0">
                <TabsTrigger
                  value="preview"
                  className="text-muted-foreground data-[state=active]:text-foreground px-0 text-base data-[state=active]:shadow-none dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-transparent"
                >
                  Preview
                </TabsTrigger>
                <TabsTrigger
                  value="code"
                  className="text-muted-foreground data-[state=active]:text-foreground px-0 text-base data-[state=active]:shadow-none dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-transparent"
                >
                  Code
                </TabsTrigger>
              </TabsList>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-7 w-7"
              onClick={() => setIsExpanded(true)}
              title="Expand preview"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="sr-only">Expand</span>
            </Button>
          </div>
        </Tabs>
        <div
          data-tab={tab}
          data-chrome-less-on-mobile={chromeLessOnMobile}
          className="data-[tab=code]:border-code relative rounded-lg border data-[chrome-less-on-mobile=true]:border-0 sm:data-[chrome-less-on-mobile=true]:border md:-mx-1"
        >
          <div
            data-slot="preview"
            data-active={tab === "preview"}
            className="invisible data-[active=true]:visible"
          >
            <div
              data-align={align}
              className={cn(
                "preview flex w-full justify-center data-[align=center]:items-center data-[align=end]:items-end data-[align=start]:items-start",
                chromeLessOnMobile ? "sm:p-10" : "h-[450px] max-h-[450px] overflow-y-auto flex flex-col p-2"
              )}
            >
              {component}
            </div>
          </div>
          <div
            data-slot="code"
            data-active={tab === "code"}
            className="absolute inset-0 hidden overflow-hidden data-[active=true]:block **:[figure]:!m-0 **:[pre]:h-[450px]"
          >
            {source}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[105] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="relative h-[90vh] z-[105] w-[90vw] rounded-lg border bg-background p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 h-8 w-8"
              onClick={() => setIsExpanded(false)}
              title="Close"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
            <div className="flex h-full flex-col w-full items-center justify-center overflow-auto p-8">
              {component}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
