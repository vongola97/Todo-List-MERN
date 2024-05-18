import { useEffect, useState, useRef } from 'react';
import Masonry from 'masonry-layout'
const api_base = 'http://localhost:3001';

function App() {
	const [todos, setTodos] = useState([]);
	const [popupActive, setPopupActive] = useState(false);
	const [newTodo, setNewTodo] = useState("");
	const [viewTodo, setViewTodo] = useState(null);  // State for tracking the viewed todo
	const gridRef = useRef(null);  // Reference to the grid container

	useEffect(() => {
		GetTodos();
	}, []);

	useEffect(() => {
        if (gridRef.current) {
			new Masonry(gridRef.current, {
				itemSelector: '.todo',
				//columnWidth: '.todo', // Assuming each todo item dictates the column width
				gutter: 9, // Adjust the gutter for more space between rows
			});
		}
    }, [todos]);  // Initialize Masonry whenever todos change

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
		const data = await fetch(api_base + '/todo/delete/' + id, {
			method: "DELETE"
		}).then(res => res.json());

		setTodos(todos => todos.filter(todo => todo._id !== data.result._id));
	}

	const addTodo = async () => {
		const data = await fetch(api_base + "/todo/new", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				text: newTodo
			})
		}).then(res => res.json());

		setTodos([...todos, data]);

		setPopupActive(false);
		setNewTodo("");
	}

	const openViewTodo = (todo) => {
        setViewTodo(todo);
        setPopupActive(true);
    }

    const closeViewTodo = () => {
        setViewTodo(null);
        setPopupActive(false);
    }



	return (
		<div className="App">
			{popupActive && <div className="overlay" onClick={closeViewTodo}></div>}
			<h1>Welcome</h1>
			<h4>Your Tasks</h4>
			<div ref={gridRef} className="todos">
				{todos.map(todo => (
					<div className={
						"todo " + (todo.complete ? "is-complete" : "")
					} key={todo._id}
					onClick={() => openViewTodo(todo)} // Open the popup on click
					>
						<input
							type="checkbox"
							checked={todo.complete}
							onChange={() => completeTodo(todo._id)}
							className="custom-checkbox"
						/>
						<div className="text">{todo.text}</div>
						<div className="delete-todo" onClick={(e) => {
							e.stopPropagation(); //Prevents the completeTodo from firing
							deleteTodo(todo._id);}}>x</div>
						{/*<div className="delete-todo" onClick={() => deleteTodo(todo._id)}>x</div>*/}
					</div>
				))}
			</div>

			<div className='addPopup' onClick={() => setPopupActive(true)}>+</div>

			{popupActive && viewTodo && (
                <div className="popup">
                    <div className="closePopup" onClick={closeViewTodo}>X</div>
                    <div className="content">
                        <h3>Task Details</h3>
                        <div className="todo-text">{viewTodo.text}</div>
                    </div>
                </div>
            )}

            {popupActive && !viewTodo && (
                <div className="popup">
                    <div className="closePopup" onClick={() => setPopupActive(false)}>X</div>
                    <div className="content">
                        <h3>Add Task</h3>
                        <input
                            type="text"
                            className="add-todo-input"
                            onChange={e => setNewTodo(e.target.value)}
                            value={newTodo} />
                        <div className="button" onClick={addTodo}>Create Task</div>
                    </div>
                </div>
            )}
		</div>
	);
}

export default App;
