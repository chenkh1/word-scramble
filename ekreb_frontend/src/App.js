import React, { useState, useEffect } from 'react';
import axios from 'axios';  // Import Axios for making HTTP requests
import './App.css';
import backgroundMusic from './background music.mp3';

// Define the game instructions as a constant
const GAME_INSTRUCTIONS = `
  Welcome to the Word Scramble Game! Unscramble words within 30 seconds, 
  make accurate guesses, and aim for a high score. But beware, you only 
  have 3 chances to guess incorrectly. Challenge yourself and have fun!
`;

// Define the 'scrambledToOriginal' map to store mappings of scrambled words to original words
const scrambledToOriginal = {};

// Welcome Page Component
function WelcomePage({ onStartGame }) {
  const [playerName, setPlayerName] = useState('');  // Store the player's name
  const [showInstructions, setShowInstructions] = useState(false);

  // Function to handle starting the game
  const handleStartGame = () => {
    if (playerName) {
      onStartGame(playerName);  // Call the parent component's function to start the game
    } else {
      alert("Please enter your name before starting!");  // Show an alert if no name is entered
    }
  };

  return (
    <div className="welcome-container">
      <h1>Let's Play!</h1>
      <input
        type="text"
        placeholder="Enter your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <button className="start-button" onClick={handleStartGame}>
        Start
      </button>
      {/* Add an instructions tab */}
      <button
        className="instructions-button"
        onMouseEnter={() => setShowInstructions(true)}
        onMouseLeave={() => setShowInstructions(false)}
      >
        Instructions
      </button>
      {/* Instructions displayed on hover */}
      {showInstructions && (
        <div className="instructions-tooltip">
          <p>{GAME_INSTRUCTIONS}</p>
        </div>
      )}
    </div>
  );
}

// Game Results Component
function GameResults({ score, totalGuesses, onRestart, playerName, leaderboard, onClearLeaderboard }) {
  // Calculate accuracy as a percentage
  const accuracy = ((score / totalGuesses) * 100).toFixed(2);

  return (
    <div className="results-container">
      <h1>Game Over!</h1>
      <p>Your Score: {score}</p>
      <p>Accuracy: {accuracy}%</p>
      <div className="leaderboard">
        <h2>Leaderboard</h2>
        <table>
          <thead>
            <tr>
              <th style={{ width: "30%", marginRight: '20px' }}>Name</th>
              <th style={{ width: "30%" }}>Score</th>
              <th style={{ width: "40%" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={index}>
                <td style={{ width: "30%", marginRight: '20px' }}>{entry.name}</td>
                <td style={{ width: "30%" }}>{entry.score}</td>
                <td style={{ width: "40%" }}>{entry.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="buttons-container">
        <button className="start-button" onClick={onRestart}>
          Restart
        </button>
      </div>
      {/* Place the "Clear Leaderboard" button in a separate container */}
      <div className="buttons-container">
        <button className="clear-leaderboard-button" onClick={onClearLeaderboard}>
          Clear Leaderboard
        </button>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  // State variables to manage game data
  const [scrambledWord, setScrambledWord] = useState('');
  const [userGuess, setUserGuess] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [totalGuesses, setTotalGuesses] = useState(1);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Function to toggle music playback
  const toggleMusic = () => {
    const audioElement = document.getElementById('backgroundMusic');

    if (isMusicPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }

    setIsMusicPlaying(!isMusicPlaying);
  };

  // Function to clear the leaderboard
  const clearLeaderboard = () => {
    console.log("Clearing leaderboard...");
    axios
      .delete('http://localhost:3001/clear-leaderboard')
      .then((response) => {
        console.log("Leaderboard cleared successfully.");
        // Clear the leaderboard in the frontend
        setLeaderboard([]);
      })
      .catch(error => {
        console.error("Error clearing leaderboard:", error);
      });
  };


    // Function to start the game
    const startGame = (name) => {
      setPlayerName(name);  // Set the player's name
      setGameStarted(true);  // Mark the game as started
      fetchWord();  // Fetch the initial word to unscramble
    };

  // Function to fetch a new scrambled word
  const fetchWord = () => {
    axios.get('http://localhost:3001/scrambled-word')
      .then((response) => {
        const scrambled = response.data.scrambledWord;
        setUserGuess('');  // Reset user's guess
        setIsCorrect(null);  // Reset correctness state

        // Update the 'scrambledToOriginal' map with the correct mapping
        axios.get('http://localhost:3001/original-word', { params: { scrambledWord: scrambled } })
          .then((response) => {
            const originalWord = response.data.originalWord;
            scrambledToOriginal[scrambled] = originalWord;

            // Set the scrambled word state after updating the map
            setScrambledWord(scrambled);

            // After setting the scrambled word, fetchLeaderboard
            fetchLeaderboard();
          })
          .catch((error) => {
            console.error("Error fetching original word:", error);
          });

        setTimer(30);  // Reset the timer
      })
      .catch((error) => {
        console.error("Error fetching scrambled word:", error);
      });
  };

  const handleGuess = () => {
    if (!gameOver) {
      const guessedWord = userGuess;
      const originalWord = scrambledToOriginal[scrambledWord];

      if (originalWord && guessedWord.toLowerCase() === originalWord.toLowerCase()) {
        // Correct guess
        setIsCorrect(true);
        setScore(score + 1);
      } else {
        // Incorrect guess
        setIsCorrect(false);
        setWrongGuesses(wrongGuesses + 1);

        // Check if the game should end due to wrong guesses
        if (wrongGuesses >= 2) {
          setGameOver(true);
          submitScoreToLeaderboard();
          return; // End the function early
        }
      }

      // Increment totalGuesses on each guess
      setTotalGuesses(totalGuesses + 1);

      // Check if game is over due to timer
      if (timer === 0 && !gameOver) {
        // Game ends when the timer runs out
        setGameOver(true);
        submitScoreToLeaderboard();
      } else {
        setTimeout(() => {
          fetchWord();
        }, 800);
      }

      // Fetch leaderboard after every guess attempt and update the leaderboard state
      fetchLeaderboard();
    }
  };


  // Function to format the current date as MM/DD/YYYY
  const formatDate = () => {
    const currentDate = new Date();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero if needed
    const day = currentDate.getDate().toString().padStart(2, '0'); // Add leading zero if needed
    const year = currentDate.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Function to submit the player's score to the leaderboard with the formatted date
  const submitScoreToLeaderboard = () => {
    const formattedDate = formatDate(); // Get the formatted current date
    const newAccuracy = totalGuesses > 0 ? (((score) / totalGuesses) * 100).toFixed(2) : 0; // Calculate accuracy

    axios.post('http://localhost:3001/submit-score', { name: playerName, score: score, date: formattedDate })
      .then(() => {
        setAccuracy(newAccuracy); // Update accuracy state
        fetchLeaderboard();  // Update the leaderboard after submitting the score
      })
      .catch((error) => {
        console.error("Error submitting score:", error);
      });
  };

    // Function to fetch the leaderboard
    const fetchLeaderboard = () => {
      axios.get('http://localhost:3001/leaderboard')
        .then(response => {
          setLeaderboard(response.data);
        })
        .catch(error => {
          console.error("Error fetching leaderboard:", error);
        });
    };

    useEffect(() => {
    let interval;
    if (timer > 0 && !gameOver && gameStarted) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);  // Decrement the timer every second
      }, 1000);
    } else if (timer === 0 || wrongGuesses === 3) {
      setGameOver(true);  // Mark the game as over when the timer runs out or max wrong guesses
      clearInterval(interval);  // Clear the interval timer

      // Fetch leaderboard after the game is over and update the leaderboard state
      fetchLeaderboard();
    }
    return () => clearInterval(interval);  // Cleanup the interval on unmount
  }, [timer, gameOver, gameStarted, wrongGuesses]);


    // Effect to fetch the leaderboard on component mount
    useEffect(() => {
      fetchLeaderboard();
    }, []);

    // Function to restart the game
  const restartGame = () => {
    setScrambledWord('');
    setUserGuess('');
    setIsCorrect(null);
    setScore(0);
    setTimer(30);
    setGameOver(false);  // Reset game over state
    setAccuracy(null);  // Reset accuracy
    setGameStarted(false);  // Reset game started state
    setWrongGuesses(0);  // Reset wrong guesses
    setTotalGuesses(1);  // Reset totalGuesses to 0
    fetchWord();  // Fetch a new word to start the game
    fetchLeaderboard();  // Fetch the updated leaderboard
  };

  return (
    <div className="App">
      <h1 className="game-title">Word Scramble!</h1>
       <audio id="backgroundMusic" src={backgroundMusic} loop />
        {/* Add a button to toggle music playback */}
        <button className={`music-button ${isMusicPlaying ? 'off' : ''}`} onClick={toggleMusic}>
        </button>
      {gameStarted && !gameOver ? (
        // Display the game interface when the game is in progress
        <div className="game-container">
          <div className="game-info">
            <p>Time Remaining: {timer} seconds</p>
            <p>Score: {score}</p>
            <p>Wrong Guesses: {wrongGuesses} / 3</p>
          </div>
          <div className="word-container">
            <p className={`unscrambled-word ${isCorrect === true ? 'fade-in' : isCorrect === false ? 'incorrect-message' : ''}`}>
              {isCorrect === true ? 'Correct!' : isCorrect === false ? 'Incorrect!' : ''}
            </p>
            <p className="scrambled-word fade-in">Scrambled Word: {scrambledWord}</p>
          </div>
          <div className="input-container">
            <input
              type="text"
              placeholder="Your Guess"
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              disabled={gameOver}  // Disable input when the game is over
            />
            <button className="guess-button" onClick={handleGuess} disabled={gameOver}>
              Guess
            </button>
          </div>
        </div>
      ) : gameOver ? (
        // Display game results when the game is over
        <GameResults 
          score={score} 
          totalGuesses={totalGuesses}
          accuracy={accuracy} 
          onRestart={restartGame} 
          playerName={playerName} 
          leaderboard={leaderboard}
          onClearLeaderboard={clearLeaderboard}
        />
      ) : (
        // Display the welcome page when the game has not started
        <WelcomePage onStartGame={startGame} />
      )}
    </div>
  );
}

export default App;