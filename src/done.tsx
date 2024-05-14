import { Form, showToast, Toast, Icon, ActionPanel, Action, open, Clipboard } from "@raycast/api";
import { useState, useEffect } from "react";
import * as wip from "./oauth/wip";

export default function Command() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [media, setMedia] = useState<string[]>([]);

  useEffect(() => {
    async function authorize() {
      try {
        await wip.authorize();
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        showToast({ style: Toast.Style.Failure, title: String(error) });
        setIsLoading(false);
      }
    }
    authorize();
  }, []);

  async function addFileFromClipboard() {
    const clipboardContent = await Clipboard.read();
    if (clipboardContent.file) {
      console.log("Clipboard file path:", clipboardContent.file);

      let filePath = decodeURIComponent(clipboardContent.file);
      if (filePath.startsWith('file://')) {
        filePath = filePath.replace('file://', '');
      }

      const fs = require('fs');
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error("Error: File does not exist", filePath);
          showToast({ style: Toast.Style.Failure, title: "File does not exist", message: filePath });
        } else {
          setMedia(prevMedia => [...prevMedia, filePath]);
          showToast({ style: Toast.Style.Success, title: "File added from clipboard!" });
        }
      });
    } else {
      showToast({ style: Toast.Style.Failure, title: "No file found in clipboard!" });
    }
  }

  async function createNewTodo() {
    if (!searchQuery.trim()) {
      showToast({ style: Toast.Style.Failure, title: "Cannot create an empty todo." });
      return;
    }
    try {
      setIsLoading(true);
      await wip.createTodo(searchQuery, media);
      setSearchQuery("");
      setMedia([]);
      setIsLoading(false);
      showToast({ style: Toast.Style.Success, title: "Todo created successfully!" });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      showToast({ style: Toast.Style.Failure, title: String(error) });
    }
  }

  if (isLoading) {
    return <Form isLoading={true} />;
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save" onSubmit={createNewTodo} />
          <Action title="Add File from Clipboard" onAction={addFileFromClipboard} shortcut={{ modifiers: ["cmd"], key: "v" }} />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="todoInput"
        title="Text"
        placeholder="What did you do?"
        autoFocus={true}
        value={searchQuery}
        onChange={setSearchQuery}
      />

      <Form.FilePicker
        id="media"
        title="Attachments"
        value={media}
        onChange={setMedia}
        allowMultipleSelection={true}
      />
    </Form>
  );
}

