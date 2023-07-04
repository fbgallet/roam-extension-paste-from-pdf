When some text copied from a PDF is in the clipboard, `Paste PDF text from clipboard, removing undue line breaks` command peplace line breaks by space and paste the text in the current block, at the current cursor position.

Provide also the corresponding SmartBlock command: `REPLACENEWLINEBYSPACE` with the text to paste as first argument.
You can use it with the following SmartBlock (it can also be installed from the SmartBlocks Store).

```
- #SmartBlock Paste text from pdf (replace new line by space)
    - <%SET:cbText,<%CLIPBOARDPASTETEXT%>%><%REPLACENEWLINEBYSPACE:<%GET:cbText%>%>

```

---

### For any question or suggestion, DM me on **Twitter** and follow me to be informed of updates and new extensions : [@fbgallet](https://twitter.com/fbgallet).
