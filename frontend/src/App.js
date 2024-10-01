import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div style={styles.container}>
      <h1>Bienvenue sur l'application Sucafina</h1>
      <p>Testez React en cliquant sur le bouton ci-dessous !</p>
      <button onClick={handleClick} style={styles.button}>
        Cliquez-moi
      </button>
      <p>Vous avez cliqué {count} fois.</p>
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    marginTop: '50px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
  }
};

export default App;
