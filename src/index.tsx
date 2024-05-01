import { Action, ActionPanel, Icon, List, showToast, Toast } from "@raycast/api";
import { useFetch } from "@raycast/utils";

interface Todo {
  body: string;
  completed_at: string | null;
  url: string;
}

interface TodoResponse {
  todos: Todo[];
}

export default function Command() {

  const { data, error, isLoading } = useFetch<TodoResponse>("https://wip.co/api/v1/users/marc/todos.json");

  if (error) {
    showToast(Toast.Style.Failure, "Failed to load todos");
    console.error(error);
  }

  return (
    <List isLoading={isLoading}>
      {data?.todos.map((todo, index) => (
        <List.Item
          key={index}
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

