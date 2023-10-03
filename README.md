## Contact

Kevin Chen: [kevin.h.chen@vanderbilt.edu](mailto:kevin.h.chen@vanderbilt.edu)

# ekreb

<img width="1512" alt="Screenshot 2023-09-22 at 3 25 28 PM" src="https://github.com/ChangePlusPlusVandy/change-coding-challenge-2023-chenkh1/assets/94060565/d0939c79-de99-43c9-8ed0-3aef2937283d">

## Introduction

Welcome to ekreb! Inspired by former ChangePlusPlus president, this web-based game challenges you to unscramble words within 30 seconds. You have up to 3 incorrect guesses, so see if you can top the leaderboard!

## Instructions

Follow these steps to start playing the Word Scramble Game:

### Prerequisites

- [Node.js](https://nodejs.org/): Make sure you have Node.js installed. You can download it from the official website or with the following command:
  ```bash
  brew install node
  ```
- [React](https://reactjs.org/): This project uses React for the frontend. You can install React globally using npm with the following command:
  ```bash
  npm install -g create-react-app
  ```

**Additional Packages**

- This app also utilizes express, axios, and cors, which can be installed using the commands below
  ```bash
  npm install express
  npm install axios
  npm install cors
  ```

1. Clone the ekreb project files to your computer using:

   ```bash
   git clone https://github.com/ChangePlusPlusVandy/change-coding-challenge-2023-chenkh1.git

   ```

2. Open a terminal or command prompt and navigate to the project folder using the `cd` command.

3. Enter the "ekreb_backend" folder and start the server by running the following command:
   ```bash
   node server.js
   ```
4. Enter the "ekreb_frontend" folder and start the react app by running the following command:
   ```bash
   npm start
   ```

## Reflection

This web app accomplishes basic functions as well as additional features that I believe would improve the look and feel of the final product. React stood out to me as a strong option for the front end for its component-based architecture and virtual DOM, which was useful when designing the user interface. I used CSS and keyframes to animate certain elements to provide a more engaging and intuitive user experience. I included additional functionality on the backend to create/clear a leaderboard for users to keep track of scores. The main challenge with this project was debugging errors, although I found console.log() statements useful in clarifying and resolving issues effectively.
