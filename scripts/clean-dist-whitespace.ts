import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const files = [
  "dist/index.js",
  "dist/sourcemap-register.cjs",
];

type Mode = "code" | "single" | "double" | "template" | "lineComment" | "blockComment" | "regex";

interface TemplateFrame {
  readonly canEscapeTrailingWhitespace: boolean;
}

class JavaScriptScanner {
  private mode: Mode = "code";
  private escaped = false;
  private regexCharClass = false;
  private lastRawChar = "";
  private lastSignificantCodeChar = "";
  private readonly templateFrames: TemplateFrame[] = [];
  private readonly templateExpressionDepths: number[] = [];

  scan(input: string): void {
    for (let index = 0; index < input.length; index += 1) {
      const char = input[index] ?? "";
      const next = input[index + 1] ?? "";

      switch (this.mode) {
        case "single":
        case "double":
          this.scanQuotedString(char);
          break;
        case "template":
          if (this.escaped) {
            this.escaped = false;
          } else if (char === "\\") {
            this.escaped = true;
          } else if (char === "`") {
            this.templateFrames.pop();
            this.mode = "code";
          } else if (char === "$" && next === "{") {
            this.mode = "code";
            this.templateExpressionDepths.push(0);
            index += 1;
            this.lastRawChar = next;
            continue;
          }
          break;
        case "lineComment":
          if (char === "\n" || char === "\r") {
            this.mode = "code";
          }
          break;
        case "blockComment":
          if (char === "*" && next === "/") {
            this.mode = "code";
            index += 1;
            this.lastRawChar = next;
            continue;
          }
          break;
        case "regex":
          this.scanRegex(char);
          break;
        case "code":
          if (char === "'" || char === '"') {
            this.mode = char === "'" ? "single" : "double";
            this.escaped = false;
          } else if (char === "`") {
            this.templateFrames.push({
              canEscapeTrailingWhitespace: !this.isLikelyTaggedTemplate(),
            });
            this.mode = "template";
          } else if (char === "/" && next === "/") {
            this.mode = "lineComment";
            index += 1;
            this.lastRawChar = next;
            continue;
          } else if (char === "/" && next === "*") {
            this.mode = "blockComment";
            index += 1;
            this.lastRawChar = next;
            continue;
          } else if (char === "/" && this.canStartRegex()) {
            this.mode = "regex";
            this.escaped = false;
            this.regexCharClass = false;
          } else if (char === "}" && this.templateExpressionDepths.length > 0) {
            const lastIndex = this.templateExpressionDepths.length - 1;
            const depth = this.templateExpressionDepths[lastIndex] ?? 0;

            if (depth === 0) {
              this.templateExpressionDepths.pop();
              this.mode = "template";
            } else {
              this.templateExpressionDepths[lastIndex] = depth - 1;
            }
          } else if (char === "{" && this.templateExpressionDepths.length > 0) {
            const lastIndex = this.templateExpressionDepths.length - 1;
            this.templateExpressionDepths[lastIndex] = (this.templateExpressionDepths[lastIndex] ?? 0) + 1;
          }

          if (!/\s/.test(char)) {
            this.lastSignificantCodeChar = char;
          }
      }

      this.lastRawChar = char;
    }
  }

  trailingWhitespaceContext(): "template" | "taggedTemplate" | "code" {
    if (this.mode !== "template") {
      return "code";
    }

    return this.currentTemplateCanEscape() ? "template" : "taggedTemplate";
  }

  private scanQuotedString(char: string): void {
    if (this.escaped) {
      this.escaped = false;
      return;
    }

    if (char === "\\") {
      this.escaped = true;
      return;
    }

    if ((this.mode === "single" && char === "'") || (this.mode === "double" && char === '"')) {
      this.mode = "code";
    }
  }

  private scanRegex(char: string): void {
    if (this.escaped) {
      this.escaped = false;
      return;
    }

    if (char === "\\") {
      this.escaped = true;
      return;
    }

    if (char === "[") {
      this.regexCharClass = true;
      return;
    }

    if (char === "]") {
      this.regexCharClass = false;
      return;
    }

    if (char === "/" && !this.regexCharClass) {
      this.mode = "code";
    }
  }

  private isLikelyTaggedTemplate(): boolean {
    return /[A-Za-z0-9_$)\]}]/.test(this.lastSignificantCodeChar);
  }

  private canStartRegex(): boolean {
    return this.lastSignificantCodeChar === "" || /[({[=,:;!&|?+\-*~%^<>]/.test(this.lastSignificantCodeChar);
  }

  private currentTemplateCanEscape(): boolean {
    return this.templateFrames.at(-1)?.canEscapeTrailingWhitespace ?? false;
  }
}

export function cleanJavaScriptTrailingWhitespace(input: string): string {
  const scanner = new JavaScriptScanner();
  let output = "";
  let offset = 0;

  while (offset < input.length) {
    const lineEnd = findLineEnd(input, offset);
    const content = input.slice(offset, lineEnd.contentEnd);
    const trailingWhitespace = content.match(/[ \t]+$/)?.[0] ?? "";
    const body = trailingWhitespace ? content.slice(0, -trailingWhitespace.length) : content;

    scanner.scan(body);
    output += body;

    if (trailingWhitespace) {
      const context = scanner.trailingWhitespaceContext();

      if (context === "template") {
        output += escapeTemplateWhitespace(trailingWhitespace);
      } else if (context === "taggedTemplate") {
        throw new Error("Refusing to rewrite trailing whitespace inside a tagged template literal.");
      }

      scanner.scan(trailingWhitespace);
    }

    output += lineEnd.newline;
    scanner.scan(lineEnd.newline);
    offset = lineEnd.nextOffset;
  }

  return output;
}

async function cleanFile(file: string): Promise<void> {
  const input = await readFile(file, "utf8");
  const output = cleanJavaScriptTrailingWhitespace(input);

  if (output !== input) {
    await writeFile(file, output);
  }
}

function findLineEnd(input: string, offset: number): { contentEnd: number; newline: string; nextOffset: number } {
  for (let index = offset; index < input.length; index += 1) {
    const char = input[index];

    if (char === "\n") {
      return { contentEnd: index, newline: "\n", nextOffset: index + 1 };
    }

    if (char === "\r") {
      const hasLineFeed = input[index + 1] === "\n";
      return {
        contentEnd: index,
        newline: hasLineFeed ? "\r\n" : "\r",
        nextOffset: index + (hasLineFeed ? 2 : 1),
      };
    }
  }

  return { contentEnd: input.length, newline: "", nextOffset: input.length };
}

function escapeTemplateWhitespace(value: string): string {
  return [...value].map((char) => char === "\t" ? "\\t" : "\\x20").join("");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await Promise.all(files.map((file) => cleanFile(file)));
}
