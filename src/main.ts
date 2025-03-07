import plugin from "../plugin.json";
import completion from "./ai";

acode.setPluginInit(plugin.id, async (baseUrl, page, { cacheFileUrl, cacheFile }) => {
  const { editor } = editorManager;
  let ghostText = "";
  
  const getPrefixSuffix = () => {
    const cursor = editor.getCursorPosition();
    const documentValue = editor.session.getValue();
    const cursorIndex = editor.session.doc.positionToIndex(cursor);

    const prefix = documentValue.substring(0, cursorIndex);
    const suffix = documentValue.substring(cursorIndex);
    const language = editor.session.getMode().$id.replace("ace/mode/", "");

    return { prefix, suffix, language };
  };

  const updateGhostText = async () => {
    const { prefix, suffix, language } = getPrefixSuffix();
    ghostText = await completion(prefix, suffix, language);

    if (ghostText) {
      editor.setGhostText(ghostText);
    }
  };

  const acceptGhostText = () => {
    if (ghostText) {
      const cursor = editor.getCursorPosition();
      editor.session.insert(cursor, ghostText);
      ghostText = "";
      editor.setGhostText("");
    }
  };

  editor.commands.addCommand({
    name: "acceptGhostText",
    bindKey: { win: "Right", mac: "Right" },
    exec: acceptGhostText,
  });
  
  editorManager.on("update", updateGhostText);
  editor.onCursorChange = () => {
    ghostText = "";
    editor.setGhostText("");
  };
});