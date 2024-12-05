let content = document.querySelector("#content");
let voiceFeedback = document.getElementById("voiceFeedback");
let micButton = document.querySelector(".mic-button");
let datetimeElement = document.getElementById("datetime");

let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new speechRecognition();

let conversationHistory = [];

// Toggle visibility of mic animation
function toggleMicAnimation(show) {
  voiceFeedback.style.display = show ? "flex" : "none";
}

// Function to trigger speaking
function speak(text) {
  let utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-IN";
  speechSynthesis.speak(utterance);
}

// Start listening with recognition
function startListening() {
  console.log("Microphone button clicked");
  toggleMicAnimation(true);
  recognition.start();
}

// Stop listening
function stopListening() {
  toggleMicAnimation(false);
  recognition.stop();
}

// Handle recognition result
recognition.onresult = (event) => {
  let transcript = event.results[0][0].transcript;
  content.innerText = transcript;
  takeCommand(transcript.toLowerCase());
  stopListening(); // Stop mic after capturing the transcript
};

// Recognition event listeners' handling errors
recognition.onspeechend = stopListening;
recognition.onerror = (event) => {
  console.error("Recognition error:", event.error);
  stopListening();
};

// Command function
async function takeCommand(message) {
  if (message.includes("hello") || message.includes("hi")) {
    let responses = [
      "Hello, how may I help you?",
      "Hi there, what can I assist you with today?",
      "Hello, it's nice to meet you."
    ];
    let randomIndex = Math.floor(Math.random() * responses.length);
    speak(responses[randomIndex]);
  } 
  else if (message.includes("time")) {
    let time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
    speak("The current time is " + time);
  } 
  else if (message.includes("date")) {
    let date = new Date().toLocaleString(undefined, { day: "numeric", month: "short" });
    speak("Today’s date is " + date);
  } 
  else if (message.includes("weather in")) {
    const cityMatch = message.match(/(?:weather.*in\s+|weather\s+in\s+|what's the weather.*in\s+)([\w\s]+)$/i);
    let city = cityMatch ? cityMatch[1].trim() : null;

    if (city) {
      getWeather(city).then(weatherInfo => speak(weatherInfo));
    } else {
      speak("Please specify a city to get the weather information.");
    }
  } 
  else if (message.includes("tell me a joke")) {
    let jokes = [
      "Why don't scientists trust atoms? Because they make up everything!", 
      "Why did the math book look sad? It had too many problems."
    ];
    let randomIndex = Math.floor(Math.random() * jokes.length);
    speak(jokes[randomIndex]);
  }

  else if(message.includes("open calculator")){
    speak("Opening calculator...");
    window.open("calculator://")
  }
  else if (message.includes("open camera")) {
    speak("Opening camera...");
  
    // Create a new video element or use an existing one
    let videoElement = document.getElementById("webcamVideo");
    if (!videoElement) {
      videoElement = document.createElement("video");
      videoElement.id = "webcamVideo";
      videoElement.style.position = "fixed";
      videoElement.style.bottom = "10px";
      videoElement.style.right = "10px";
      videoElement.style.width = "300px";
      videoElement.style.height = "200px";
      videoElement.style.border = "2px solid black";
      videoElement.style.backgroundColor = "black";
      document.body.appendChild(videoElement);
    }
  
    // Add a close button dynamically
    let closeButton = document.getElementById("closeCameraButton");
    if (!closeButton) {
      closeButton = document.createElement("button");
      closeButton.id = "closeCameraButton";
      closeButton.innerText = "Close Camera";
      closeButton.style.position = "fixed";
      closeButton.style.bottom = "220px";
      closeButton.style.right = "10px";
      closeButton.style.padding = "10px 20px";
      closeButton.style.backgroundColor = "#ff4d4d";
      closeButton.style.color = "#fff";
      closeButton.style.border = "none";
      closeButton.style.borderRadius = "5px";
      closeButton.style.cursor = "pointer";
  
      // Close button functionality
      closeButton.onclick = () => {
        let tracks = videoElement.srcObject.getTracks();
        tracks.forEach((track) => track.stop()); // Stop all video tracks
        videoElement.remove(); // Remove video element
        closeButton.remove(); // Remove button
        speak("Camera closed.");
      };
      document.body.appendChild(closeButton);
    }
  
    // Get access to the user's webcam
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoElement.srcObject = stream;
        videoElement.play();
        speak("Camera is now open. You can close it by clicking the Close Camera button.");
      })
      .catch((error) => {
        console.error("Error accessing the camera:", error);
        speak("Sorry, I couldn't access the camera. Please check your browser settings.");
      });
  }
  

  else if (message.includes("open")) {
    if (message.includes("youtube")) {
      speak("Opening YouTube...");
      window.open("https://youtube.com/", "_blank");
    } else if (message.includes("google")) {
      speak("Opening Google...");
      window.open("https://google.com/", "_blank");
    } else {
      let searchQuery = message.replace("open", "").trim();
      speak(`Searching the web for ${searchQuery}`);
      window.open(`https://www.google.com/search?q=${searchQuery}`, "_blank");
    }
  } else if (message.includes("analyse sentiment")) {
    let userInput = message.replace("analyse sentiment", "").trim();
    let sentiment = await analyzeSentiment(userInput);
    speak(`The sentiment of your message seems to be ${sentiment}.`);
  } 
  else if (message.includes("add a reminder") || message.includes("remind me to")) {
    let reminderText = message.replace(/(add a reminder|remind me to)/i, "").trim();
    if (reminderText) {
      addReminder(reminderText);
    } else {
      speak("Please specify what you want me to remind you about.");
    }
  } 
  else if (message.includes("show reminders") || message.includes("what are my reminders")) {
    showReminders();
  }
  else if (message.includes("delete reminder") || message.includes("remove reminder")) {
    deleteReminders();
  }else {
    let searchQuery = message;
    speak(`Searching the web for ${searchQuery}`);
    window.open(`https://www.google.com/search?q=${searchQuery}`, "_blank");
  }
}

// Background change functionality
function setBackground() {
  const fileInput = document.getElementById('backgroundUpload');
  const reader = new FileReader();
  reader.onload = function (e) {
    document.body.style.backgroundImage = `url(${e.target.result})`;
  };
  reader.readAsDataURL(fileInput.files[0]);
}

// Update the date and time dynamically
function updateDateTime() {
  const now = new Date();
  datetimeElement.innerText = now.toLocaleString();
}
setInterval(updateDateTime, 1000);
window.onload = function () {
  updateDateTime();
};

// Reminder functionality
function addReminder(reminderText) {
  let reminders = JSON.parse(localStorage.getItem("reminders")) || [];
  reminders.push(reminderText);
  localStorage.setItem("reminders", JSON.stringify(reminders));
  speak("Reminder added!");
}
function showReminders() {
  let reminders = JSON.parse(localStorage.getItem("reminders")) || [];
  reminders.forEach((reminder, index) => {
    speak(`Reminder ${index + 1}: ${reminder}`);
  });
  if (reminders.length === 0) {
    speak("You have no reminders.");
  }
}
function deleteReminders() {
  speak(`Reminders deleted`);
  localStorage.removeItem("reminders");
};

// Sentiment analysis function
async function analyzeSentiment(text) {
  const threshold = 0.9;
  const model = await toxicity.load(threshold);
  const predictions = await model.classify([text]);
  let sentiment = "neutral";

  predictions.forEach(prediction => {
    if (prediction.results[0].match) {
      sentiment = prediction.label;
    }
  });

  return sentiment;
}

async function getWeather(city) {
  const apiKey = "7ca330e906364586a9794916240212"; 
  const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;

  try {
    let response = await fetch(weatherUrl);
    if (!response.ok) throw new Error("Unable to fetch weather information.");
    let data = await response.json();
    let weatherInfo = `The weather in ${city} is currently ${data.current.condition.text} with a temperature of ${data.current.temp_c}°C and a humidity level of ${data.current.humidity}%.`;
    return weatherInfo;
  } catch (error) {
    console.error(error);
    return "Sorry, I couldn't retrieve the weather information.";
  }
}