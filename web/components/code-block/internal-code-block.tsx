import type * as React from "react";
import {
  CodeBlock,
  CodeBlockCode,
  CodeBlockHeader,
  CodeBlockPre,
} from "./code-block";

interface InternalCodeBlockProps
  extends Omit<React.ComponentProps<typeof CodeBlock>, "children"> {
  filename?: string;
  copyEventName?: string;
  copyEventProperties?: Record<string, string | number | boolean | null>;
}

export function InternalCodeBlock({
  code,
  language,
  filename,
  copyEventName,
  copyEventProperties,
  ...props
}: InternalCodeBlockProps) {
  return (
    <CodeBlock code={code} language={language} {...props}>
      <CodeBlockHeader
        filename={filename}
        copyEventName={copyEventName}
        copyEventProperties={copyEventProperties}
      />
      <CodeBlockPre>
        <CodeBlockCode />
      </CodeBlockPre>
    </CodeBlock>
  );
}
