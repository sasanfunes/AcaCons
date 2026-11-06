import { describe, expect, it } from "vitest";
import { renderMarkdown } from "@/lib/markdown";

describe("renderMarkdown", () => {
  it("escapa HTML", () => {
    expect(renderMarkdown('<script>alert("x")</script>')).toBe("<p>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;</p>");
  });
  it("títulos, listas y negrita", () => {
    const html = renderMarkdown("## Título\n- uno **dos**\n- tres\n\n1. a\n2. b");
    expect(html).toContain("<h2>Título</h2>");
    expect(html).toContain("<ul>\n<li>uno <strong>dos</strong></li>\n<li>tres</li>\n</ul>");
    expect(html).toContain("<ol>\n<li>a</li>\n<li>b</li>\n</ol>");
  });
  it("solo enlaces http(s)", () => {
    expect(renderMarkdown("[ok](https://a.com) [mal](javascript:alert(1))")).toContain('href="https://a.com"');
    expect(renderMarkdown("[mal](javascript:alert(1))")).not.toContain("href");
  });
});
