import { List, Detail, Toast, showToast, Icon, ActionPanel, Action } from "@raycast/api";
import { useState, useEffect } from "react";
import { Todo } from "./types";
import * as wip from "./oauth/wip";
import { getPreferenceValues, open, Clipboard } from "@raycast/api";
import { formatDistanceStrict } from 'date-fns';

function debounce(func, wait) {
  console.log("Debouncing")
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default function Command() {
  const [isLoading, setIsLoading] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");  // State to hold the search query

  useEffect(() => {
    const fetchAndSetTodos = async () => {
      try {
        await wip.authorize();
        const fetchedTodos = await wip.fetchTodos(searchQuery);  // Pass the search query to fetchTodos
        setTodos(fetchedTodos);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        showToast({ style: Toast.Style.Failure, title: String(error) });
      }
    };
    const debouncedFetch = debounce(fetchAndSetTodos, 300);  // Debounce the API call
    debouncedFetch();
  }, [searchQuery]);  // Depend on searchQuery to refetch when it changes

  if (isLoading) {
    return <Detail isLoading={isLoading} />;
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search todos..." onSearchTextChange={setSearchQuery}>
      {/*<List.Item
        key="create-new"
        title={`Create new Todo: "${searchQuery}"`}
        icon={{ source: Icon.Plus, tintColor: "blue" }}
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
      />*/}
      {todos.map((todo) => (
        <List.Item
          key={todo.id}
          title={todo.body}
          subtitle={formatDistanceStrict(new Date(todo.completed_at), new Date(), { addSuffix: true })}
          icon={{ source: Icon.CheckCircle, tintColor: "green" }}
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

async function createNewTodo(searchQuery: string) {
  if (!searchQuery.trim()) {
    showToast({ style: Toast.Style.Failure, title: "Cannot create an empty todo." });
    return;
  }
  try {
    setIsLoading(true);
    await wip.createTodo(searchQuery);  // Assuming you have a function to create a todo
    setSearchQuery("");  // Optionally clear the search query after creation
    showToast({ style: Toast.Style.Success, title: "Todo created successfully!" });
  } catch (error) {
    console.error(error);
    setIsLoading(false);
    showToast({ style: Toast.Style.Failure, title: String(error) });
  }
}
