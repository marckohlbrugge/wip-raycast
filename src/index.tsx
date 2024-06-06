import { List, Detail, Toast, showToast, ActionPanel, Action } from "@raycast/api";
import { useState, useEffect } from "react";
import { Todo } from "./types";
import * as wip from "./oauth/wip";
import { formatDistanceStrict } from "date-fns";
import debounce from "lodash.debounce";

export default function Command() {
  const [isLoading, setIsLoading] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAndSetTodos = async () => {
      try {
        await wip.authorize();
        const fetchedTodos = await wip.fetchTodos(searchQuery);
        setTodos(fetchedTodos);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        showToast({ style: Toast.Style.Failure, title: String(error) });
      }
    };
    const debouncedFetch = debounce(fetchAndSetTodos, 300);
    debouncedFetch();
  }, [searchQuery]);

  // async function createNewTodo(searchQuery: string) {
  //   if (!searchQuery.trim()) {
  //     showToast({ style: Toast.Style.Failure, title: "Cannot create an empty todo." });
  //     return;
  //   }
  //   try {
  //     setIsLoading(true);
  //     await wip.createTodo(searchQuery);
  //     setSearchQuery("");
  //     showToast({ style: Toast.Style.Success, title: "Todo created successfully!" });
  //   } catch (error) {
  //     console.error(error);
  //     setIsLoading(false);
  //     showToast({ style: Toast.Style.Failure, title: String(error) });
  //   }
  // }

  if (isLoading) {
    return <Detail isLoading={isLoading} />;
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search todos..." onSearchTextChange={setSearchQuery}>
      {/* <List.Item
        key="create-new"
        title={searchQuery ? `Add completed todo: ${searchQuery}` : "Add completed todo?"}
        icon={{ source: Icon.PlusCircleFilled, tintColor: "green" }}
        actions={
          <ActionPanel>
            <Action
              title="Create Todo"
              onAction={() => createNewTodo(searchQuery)}
            />
            <Action
              title="Attach File"
              onAction={async () => {
                const file = await open.filePicker();
                // Handle the file, e.g., store the path or upload it
              }}
            />
            <Action
              title="Paste from Clipboard"
              onAction={async () => {
                const content = await Clipboard.readImage();
                if (content) {
                  // Handle the image, e.g., convert to a file or prepare for upload
                } else {
                  showToast({ style: Toast.Style.Failure, title: "No image in clipboard!" });
                }
              }}
            />
          </ActionPanel>
        }
      /> */}
      {todos.map((todo) => (
        <List.Item
          key={todo.id}
          title={todo.body}
          subtitle={formatDistanceStrict(new Date(todo.created_at), new Date(), { addSuffix: true })}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={todo.url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
