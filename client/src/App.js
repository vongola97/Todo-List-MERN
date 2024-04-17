import { useEffect, useState } from 'react';
const api_base = 'http://localhost:3001';

function App() {
  const [todos, setTodos] = useState([]);
	const [popupActive, setPopupActive] = useState(false);
	const [newTodo, setNewTodo] = useState("");

	useEffect(() => {
		GetTodos();
	}, []);

	const GetTodos = () => {
		fetch(api_base + '/todos')
			.then(res => res.json())
			.then(data => setTodos(data))
			.catch((err) => console.error("Error: ", err));
	}

  const completeTodo = async id => {
		const data = await fetch(api_base + '/todo/complete/' + id).then(res => res.json());

		setTodos(todos => todos.map(todo => {
			if (todo._id === data._id) {
				todo.complete = data.complete;
			}

			return todo;
		}));
		
	}

  const deleteTodo = async id => {
		const data = await fetch(api_base + '/todo/delete/' + id, { method: "DELETE" 
  }).then(res => res.json());

		setTodos(todos => todos.filter(todo => todo._id !== data.result._id));
	}

  return (
    <div className="App">
      <h1>Welcome</h1>
      <h4>Your Tasks</h4>
      <div className="todos">
        {todos.map(todo => (
          <div className={
            "todo " + (todo.complete ? "is-complete" : "")
            } key={todo._id} onClick={() => completeTodo(todo._id)}>
          <div className="checkbox"></div>

          <div className="text">{ todo.text }</div>
          <div className="delete-todo" onClick={() => deleteTodo(todo._id)}>x</div>
        </div>
        ))}
        

      </div>
    </div>
  );
}

export default App;
