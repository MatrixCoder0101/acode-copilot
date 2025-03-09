import plugin from "../plugin.json";
import completion from "@/ai";

acode.setPluginInit(plugin.id, async (baseUrl: string, page: WCPage, { cacheFileUrl, cacheFile }: any) => {
  const { editor } = editorManager;
  let ghostText;

  function getPrefixSuffix() {
    const cursor = editor.getCursorPosition();
    const documentValue = editor.session.getValue();
    const cursorIndex = editor.session.doc.positionToIndex(cursor);
    const prefix = documentValue.substring(0, cursorIndex);
    const suffix = documentValue.substring(cursorIndex);
    const language = editor.session.getMode().$id.replace("ace/mode/", "");
    return { prefix, suffix, language };
  }

  const updateGhostText = async () => {
    const { prefix, suffix, language } = getPrefixSuffix();
    ghostText = await completion(prefix, suffix, language);
    ghostText && editor.setGhostText(ghostText, editor.getCursorPosition());
  };

  const acceptGhostText = () => {
    if (!ghostText) return;
    editor.session.insert(editor.getCursorPosition(), ghostText);
    ghostText = "";
    editor.setGhostText("");
  };

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }
  
  editor.commands.addCommand({
    name: "acceptGhostText",
    bindKey: { win: "Right", mac: "Right" },
    exec: () => (ghostText ? acceptGhostText() : false),
  });
  
  editorManager.on("update", debounce(updateGhostText, 1000));
  
  editor.selection.on("changeCursor", () => {
    setTimeout(() => {
      ghostText = "";
      editor.setGhostText("");
    }, 10);
  });
});