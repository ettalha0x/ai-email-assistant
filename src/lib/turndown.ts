import TurndownService from "turndown";
import { Content } from "vaul";

export const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**",
    linkStyle: "inlined",
})

turndown.addRule('linkRemover', {
    filter: 'a',
    replacement: (content) => content,
})

turndown.addRule('imageRemover', {
    filter: 'style',
    replacement: () => '',
})

turndown.addRule('scriptRemover', {
    filter: 'script',
    replacement: () => '',
})