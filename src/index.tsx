import { List, Detail, Toast, showToast, Icon, ActionPanel, Action } from "@raycast/api";
import { useState, useEffect } from "react";
import { Todo } from "./types";
import * as wip from "./oauth/wip";

export default function Command() {
  const [isLoading, setIsLoading] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    (async () => {
      try {
        await wip.authorize();
        const fetchedTodos = await wip.fetchTodos();
        setTodos(fetchedTodos);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        showToast({ style: Toast.Style.Failure, title: String(error) });
      }
    })();
  }, []);

  if (isLoading) {
    return <Detail isLoading={isLoading} />;
  }

  return (
    <List isLoading={isLoading}>
      {todos.map((todo) => (
        <List.Item
          key={todo.id}
          title={todo.body}
          icon={{ source: todo.completed_at ? Icon.CheckCircle : Icon.Circle, tintColor: todo.completed_at ? "green" : "gray" }}
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
