// const panelConfig = {
//   tabTitle: "Paste from PDF",
//   settings: [
//     {
//       id: "footnotesHeader",
//       name: "Footnotes header",
//       description: "Text inserted as the parent block of footnotes:",
//       action: {
//         type: "input",
//         onChange: (evt) => {
//           //   footnotesTag = evt.target.value;
//         },
//       },
//     },
//     // SWITCH example
//     {
//       id: "insertLine",
//       name: "Insert a line above footnotes header",
//       description:
//         "Insert a block drawing a line just above the footnotes header, at the bottom of the page:",
//       action: {
//         type: "switch",
//         onChange: (evt) => {
//           // insertLineBeforeFootnotes = !insertLineBeforeFootnotes;
//         },
//       },
//     },
//     // SELECT example
//     {
//       id: "hotkeys",
//       name: "Hotkeys",
//       description: "Hotkeys to insert/delete footnote",
//       action: {
//         type: "select",
//         items: ["Ctrl + Alt + F", "Ctrl + Shift + F"],
//         onChange: (evt) => {
//           // secondHotkey = getHotkeys(evt);
//         },
//       },
//     },
//   ],
// };

var currentPosition = null;

class CursorPosition {
  constructor(elt = document.activeElement) {
    this.elt = elt;
    this.start = elt.selectionStart;
    this.end = elt.selectionEnd;
  }

  // setPos(shift = 0) {
  //   this.elt = document.activeElement;
  //   this.start = this.elt.selectionStart + shift;
  //   this.end = this.elt.selectionEnd + shift;
  // }
  // isEgal(pos) {
  //   if (
  //     this.elt === pos.elt &&
  //     this.start === pos.start &&
  //     this.end === pos.end
  //   )
  //     return true;
  //   else return false;
  // }
  // hasSelection() {
  //   if (this.start != this.end) return true;
  //   else return false;
  // }
}

function onKeyDown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() == "p") {
    currentPosition = new CursorPosition();
  }
}

function getBlockContent(uid) {
  let result = window.roamAlphaAPI.q(`[:find (pull ?page [:block/string])
                      :where [?page :block/uid "${uid}"]  ]`);
  if (result[0][0]) return result[0][0].string;
  else return null;
}

async function pasteFromPDF(uid) {
  const text = await navigator.clipboard.readText();
  return replaceNewLineBySpace(text);
}

function replaceNewLineBySpace(text) {
  return text.replaceAll("\r\n", " ").replaceAll("  ", "\r\n");
}

export default {
  onload: async ({ extensionAPI }) => {
    document.addEventListener("keydown", onKeyDown);
    // extensionAPI.settings.panel.create(panelConfig);

    // get settings from setting panel
    // if (extensionAPI.settings.get("footnotesHeader") === null)
    //   extensionAPI.settings.set("footnotesHeader", "#footnotes");
    // footnotesTag = extensionAPI.settings.get("footnotesHeader");

    extensionAPI.ui.commandPalette.addCommand({
      label: "Paste PDF text from clipboard, removing undue line breaks",
      callback: async () => {
        let startUid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
        if (!currentPosition) currentPosition = new CursorPosition();
        let textFormated;
        if (startUid) {
          // console.log(currentPosition.start);
          // console.log(currentPosition.end);
          textFormated = await pasteFromPDF(startUid);
          let currentText = getBlockContent(startUid);
          let textToInsert =
            currentText.slice(0, currentPosition.start) +
            textFormated +
            currentText.slice(currentPosition.end);
          window.roamAlphaAPI.updateBlock({
            block: { uid: startUid, string: textToInsert },
          });
        }
        currentPosition = null;
      },
    });

    // Add command to block context menu
    // roamAlphaAPI.ui.blockContextMenu.addCommand({
    //   label: "Color Highlighter: Remove color tags",
    //   "display-conditional": (e) => e["block-string"].includes("#c:"),
    //   callback: (e) => removeHighlightsFromBlock(e["block-uid"], removeOption),
    // });

    const sbCmd = {
      text: "REPLACENEWLINEBYSPACE",
      help: "Replace new line by space, to paste text from PDF",
      handler: (context) => (t) => {
        return replaceNewLineBySpace(t);
      },
    };

    if (window.roamjs?.extension?.smartblocks) {
      window.roamjs.extension.smartblocks.registerCommand(sbCmd);
    } else {
      document.body.addEventListener(`roamjs:smartblocks:loaded`, () => {
        window.roamjs?.extension.smartblocks &&
          window.roamjs.extension.smartblocks.registerCommand(sbCmd);
      });
    }

    console.log("Extension loaded.");
    //return;
  },
  onunload: () => {
    document.removeEventListener("keydown", onKeyDown);

    // roamAlphaAPI.ui.blockContextMenu.removeCommand({
    //   label: "Color Highlighter: Remove color tags",
    // });
    console.log("Extension unloaded");
  },
};
