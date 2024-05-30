import { useState } from 'react';

const SignUp = ({ onSignUp }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Perform sign-up API call
        const response = await fetch('http://localhost:3001/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (data.success) {
            onSignUp(data.token); // Pass the token to the parent component
        } else {
            alert('Sign-up failed');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Sign Up</h3>
            <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
            />
            <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
            <button type="submit">Sign Up</button>
        </form>
    );
};

export default SignUp;
