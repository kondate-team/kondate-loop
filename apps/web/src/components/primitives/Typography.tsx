import * as React from "react"

import { cn } from "@/lib/utils"

type TypographyProps = React.HTMLAttributes<HTMLParagraphElement> & {
  as?: React.ElementType
}

function TextBase({ as: Comp = "p", className, ...props }: TypographyProps) {
  return <Comp className={className} {...props} />
}

export function H1(props: TypographyProps) {
  return (
    <TextBase
      as={props.as ?? "h1"}
      className={cn("text-2xl font-semibold tracking-tight", props.className)}
      {...props}
    />
  )
}

export function H2(props: TypographyProps) {
  return (
    <TextBase
      as={props.as ?? "h2"}
      className={cn("text-xl font-semibold tracking-tight", props.className)}
      {...props}
    />
  )
}

export function H3(props: TypographyProps) {
  return (
    <TextBase
      as={props.as ?? "h3"}
      className={cn("text-base font-semibold", props.className)}
      {...props}
    />
  )
}

export function Body(props: TypographyProps) {
  return (
    <TextBase
      as={props.as ?? "p"}
      className={cn("text-sm text-foreground", props.className)}
      {...props}
    />
  )
}

export function Caption(props: TypographyProps) {
  return (
    <TextBase
      as={props.as ?? "p"}
      className={cn("text-xs text-muted-foreground", props.className)}
      {...props}
    />
  )
}

export function Muted(props: TypographyProps) {
  return (
    <TextBase
      as={props.as ?? "p"}
      className={cn("text-sm text-muted-foreground", props.className)}
      {...props}
    />
  )
}
