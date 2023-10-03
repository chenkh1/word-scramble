// Import required modules
const express = require('express');
const cors = require('cors');
const fs = require('fs');

// Create an instance of the Express application
const app = express();
const PORT = 3001;

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS)
app.use(express.json()); // Parse incoming JSON requests

// Initialize an array to store words from the file
let words = [];

// Read words from a CSV file and populate the 'words' array
fs.readFile('english-words.csv', 'utf-8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }
    words = data.split('\n').filter(word => word && typeof word === 'string');
    console.log('Words loaded from the file.');
});

// Object to store mappings of scrambled words to their original forms
const scrambledToOriginal = {};

// Function to scramble a word
function scrambleWord(word) {
    const wordArray = word.split('');
    for (let i = wordArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
    }
    return wordArray.join('');
}

// Endpoint to get the original word corresponding to a scrambled word
app.get('/original-word', (req, res) => {
  const { scrambledWord } = req.query;
  const originalWord = scrambledToOriginal[scrambledWord];
  
  if (originalWord) {
    res.json({ originalWord });
  } else {
    res.status(404).json({ error: 'Original word not found for the given scrambled word.' });
  }
});

// Endpoint to generate a scrambled word
app.get('/scrambled-word', (req, res) => {
    const randomWord = words[Math.floor(Math.random() * words.length)].replace(/\s+/g, '');
    const scrambled = scrambleWord(randomWord);
    scrambledToOriginal[scrambled] = randomWord;
    res.json({ scrambledWord: scrambled });
});

// Variables to track correct and total guesses for the game
let correctGuesses = 0;
let totalGuesses = 0;

// Leaderboard array to store player names and scores
let leaderboard = [];

// Endpoint to submit a player's score
app.post('/submit-score', (req, res) => {
    const { name, score, date } = req.body; // Include 'date' in the request body

    // Push the new score to the leaderboard with the date
    leaderboard.push({ name, score, date });

    // Sort the leaderboard based on scores in descending order
    leaderboard.sort((a, b) => b.score - a.score);

    // Limit the leaderboard to the top 10 scores
    if (leaderboard.length > 10) {
        leaderboard.length = 10;
    }

    // Save the updated leaderboard to the CSV file
    const leaderboardCSV = leaderboard.map(entry => `${entry.name},${entry.score},${entry.date}`).join('\n');
    fs.writeFile('leaderboard.csv', leaderboardCSV, (err) => {
        if (err) {
            console.error("Error saving leaderboard to CSV:", err);
        } else {
            console.log("Leaderboard saved to CSV.");
        }
    });

    res.json({ message: 'Score submitted successfully!' });
});

// Handles POST requests to '/guess' endpoint for word guessing.
app.post('/guess', (req, res) => {
  const { guessedWord } = req.body; // Get the guessed word from the request body
  const originalWord = scrambledToOriginal[guessedWord];

  if (originalWord) {
    // If the guessed word exists in the map, it's correct
    correctGuesses++;
    totalGuesses++;
    res.json({ message: 'Correct guess!', correctGuesses, totalGuesses });
  } else {
    // If the guessed word is not in the map, it's incorrect
    totalGuesses++;
    res.json({ message: 'Incorrect guess.', correctGuesses, totalGuesses });
  }
});

// Endpoint to fetch the leaderboard
app.get('/leaderboard', (req, res) => {
    res.json(leaderboard);
});

// Update the clearLeaderboard endpoint to clear the leaderboard CSV file
app.delete('/clear-leaderboard', (req, res) => {
  console.log("Received a request to clear the leaderboard.");
  // Clear the leaderboard CSV file by overwriting it with an empty string
  fs.writeFile('leaderboard.csv', '', (err) => {
    if (err) {
      console.error("Error clearing leaderboard:", err);
      res.status(500).json({ error: "Failed to clear leaderboard" });
    } else {
      console.log("Leaderboard cleared successfully.");
      // Clear the leaderboard in memory
      leaderboard = [];
      res.json({ message: "Leaderboard cleared successfully." });
    }
  });
});

// Start the Express server on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
