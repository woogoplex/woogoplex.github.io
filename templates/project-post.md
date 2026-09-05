<%*
const input = await tp.system.prompt("Title", "", true);
const title = input.trim() || "Untitled";
const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "untitled";
await tp.file.rename(tp.date.now("YYYY-MM-DD") + "-" + slug);
-%>
---
title: <% title %>
date: <% tp.date.now("YYYY-MM-DD") %>
tags: []
---

