import { Form, showToast, Toast, Icon, ActionPanel, Action, open, Clipboard } from "@raycast/api";
import { useState } from "react";
import * as wip from "./oauth/wip";


export default function Command() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [media, setMedia] = useState<File[]>([]);

  async function createNewTodo() {
    if (!searchQuery.trim()) {
      showToast({ style: Toast.Style.Failure, title: "Cannot create an empty todo." });
      return;
    }
    try {
      setIsLoading(true);
      await wip.createTodo(searchQuery, media); // Pass media here
      setSearchQuery("");
      setMedia([]); // Clear media after creating todo
      showToast({ style: Toast.Style.Success, title: "Todo created successfully!" });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      showToast({ style: Toast.Style.Failure, title: String(error) });
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save" onSubmit={createNewTodo} />
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
        onChange={setMedia}
        allowMultipleSelection={true}
      />
    </Form>
  );
}

