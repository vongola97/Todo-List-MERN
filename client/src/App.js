import { useEffect, useState, useRef } from 'react';
import Masonry from 'masonry-layout';
import LoginPopup from './components/LoginPopup';
import SignUpPopup from './components/SignUpPopup';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete'

const api_base = 'http://localhost:3001';

function App() {
    const [todos, setTodos] = useState([]);
    const [popupActive, setPopupActive] = useState(false);
    const [newTodo, setNewTodo] = useState("");
    const [viewTodo, setViewTodo] = useState(null);  // State for tracking the viewed todo
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    const [username, setUsername] = useState(""); // State for username
    const [editingTodo, setEditingTodo] = useState(null); // State for the todo being edited
    const gridRef = useRef(null);  // Reference to the grid container

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const userInfo = parseJwt(token);
            setUsername(userInfo.username);
            setIsAuthenticated(true);
            GetTodos(token);
        }
    }, []);

    useEffect(() => {
        if (gridRef.current && todos.length > 0) {
            new Masonry(gridRef.current, {
                itemSelector: '.todo',
                gutter: 9,
            });
        }
    }, [todos]);

    const GetTodos = (token) => {
        fetch(api_base + '/todos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                setTodos(data);
            } else {
                console.error('Received non-array response:', data);
                setTodos([]);
            }
        })
        .catch((err) => {
            console.error("Error: ", err);
            setTodos([]); // Set todos to an empty array on error
        });
    }

    const completeTodo = async id => {
        const token = localStorage.getItem('token');
        const data = await fetch(api_base + '/todo/complete/' + id, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json());

        setTodos(todos => todos.map(todo => {
            if (todo._id === data._id) {
                todo.complete = data.complete;
            }
            return todo;
        }));
    }

    const deleteTodo = async id => {
        const token = localStorage.getItem('token');
        const data = await fetch(api_base + '/todo/delete/' + id, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json());

        setTodos(todos => todos.filter(todo => todo._id !== data.result._id));
    }

    const addTodo = async () => {
        const token = localStorage.getItem('token');
        const data = await fetch(api_base + "/todo/new", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
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
        setEditingTodo(null);
        setPopupActive(false);
    }

    const handleLogin = (token) => {
        localStorage.setItem('token', token);
        const userInfo = parseJwt(token);
        setUsername(userInfo.username);
        console.log('username: ', userInfo.username);
        setIsAuthenticated(true);
        setShowLogin(false);
        GetTodos(token);
    }

    const handleSignUp = (token) => {
        localStorage.setItem('token', token);
        const userInfo = parseJwt(token);
        setUsername(userInfo.username);
        setIsAuthenticated(true);
        setShowSignUp(false);
        GetTodos(token);
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUsername(""); // Clear username on logout
        setTodos([]); // Clear todos on logout
    }

    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    }

    const updateTodo = async () => {
        if (!editingTodo) return;

        const token = localStorage.getItem('token');
        const data = await fetch(api_base + "/todo/update/" + editingTodo._id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text: editingTodo.text })
        }).then(res => res.json());

        setTodos(todos.map(todo => (todo._id === data._id ? data : todo)));
        setEditingTodo(null);
        setPopupActive(false);
    }

    return (
        <div className="App">
            <div className="auth-buttons">
                {isAuthenticated ? (
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                ) : (
                    <>
                        <button className="login-button" onClick={() => setShowLogin(true)}>Login</button>
                        <button className="signup-button" onClick={() => setShowSignUp(true)}>Sign Up</button>
                    </>
                )}
            </div>
            {showLogin && <LoginPopup onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
            {showSignUp && <SignUpPopup onSignUp={handleSignUp} onClose={() => setShowSignUp(false)} />}
            {popupActive && <div className="overlay" onClick={closeViewTodo}></div>}
            <h1>{isAuthenticated ? `Welcome, ${username}` : 'Todo Web-App'}</h1>
            <h4>{isAuthenticated ? 'Your Tasks:' : 'Create your Tasks'}</h4>
            {isAuthenticated && (
                <div ref={gridRef} className="todos">
                    {todos.map(todo => (
                        <div
                            className={"todo " + (todo.complete ? "is-complete" : "")}
                            key={todo._id}
                            onClick={() => openViewTodo(todo)} // Open the popup on click
                        >
                            <input
                                type="checkbox"
                                checked={todo.complete}
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevents the popup from opening
                                    completeTodo(todo._id);
                                }}
                                className="custom-checkbox"
                            />
                            <div className="text">{todo.text}</div>
                            <div className="delete-todo" onClick={(e) => {
                                e.stopPropagation(); // Prevents the completeTodo from firing
                                deleteTodo(todo._id);
                            }}><DeleteIcon /></div>
                            <div className="edit-todo" onClick={(e) => {
                                e.stopPropagation();
                                setEditingTodo(todo);
                                setPopupActive(true);
                            }}><EditIcon /></div>
                        </div>
                    ))}
                </div>
            )}

            {isAuthenticated && (
                <div className='addPopup' onClick={() => { setNewTodo(""); setPopupActive(true); }}>+</div>
            )}
            
            {popupActive && viewTodo && !editingTodo && (
                <div className="popup">
                    <div className="closePopup" onClick={closeViewTodo}>X</div>
                    <div className="content">
                        <h3>Task Details</h3>
                        <div className="todo-text">{viewTodo.text}</div>
                    </div>
                </div>
            )}

            {popupActive && !viewTodo && !editingTodo && (
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

            {popupActive && editingTodo && (
                <div className="popup">
                    <div className="closePopup" onClick={closeViewTodo}>X</div>
                    <div className="content">
                        <h3>Edit Task</h3>
                        <textarea
                            className="add-todo-textarea"
                            onChange={e => {
                                setEditingTodo({ ...editingTodo, text: e.target.value });
                                e.target.style.height = 'auto';
                                e.target.style.height = (e.target.scrollHeight) + 'px';
                            }}
                            value={editingTodo.text}
                            style={{ overflow: 'hidden' }}
                        />
                        <div className="button" onClick={updateTodo}>Update Task</div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
