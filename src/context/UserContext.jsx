import React, { createContext, useState, useEffect } from 'react';
import run from '../gemini';

export const datacontext = createContext();

function UserContext({ children }) {
    let [speaking, setSpeaking] = useState(false);
    let [prompt, setPrompt] = useState("listening...");
    let [response, setResponse] = useState(false);
    let [showPopup, setShowPopup] = useState(true);
    let [showSidebar, setShowSidebar] = useState(false);

    function speak(text) {
        let text_speak = new SpeechSynthesisUtterance(text);
        text_speak.volume = 1;
        text_speak.rate = 1;
        text_speak.pitch = 1;
        text_speak.lang = "hi-GB";
        window.speechSynthesis.speak(text_speak);
    }

    async function aiResponse(prompt) {
        let text = await run(prompt);
        let newText = text.split("**") && text.split("*") && text.replace("google", "Batch12") && text.replace("Google", "batch12");
        setPrompt(newText);
        speak(newText);
        setResponse(true);
        setTimeout(() => {
            setSpeaking(false);
        }, 5000);
    }

    let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = new speechRecognition();
    recognition.onresult = (e) => {
        let currentIndex = e.resultIndex;
        let transcript = e.results[currentIndex][0].transcript;
        setPrompt(transcript);
        takeCommand(transcript.toLowerCase());
    };

    async function openCalculator() {
        if (window.electron) {
            window.electron.invoke('open-calculator');
        } else {
            console.error("Electron is not available.");
        }
    }


    async function getWeather(location) {
        const apiKey = "00340038a126100276071aabc3e90714";
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error("Could not fetch weather data");
            }

            const data = await response.json();
            const weatherDescription = data.weather[0].description;
            const temperature = data.main.temp;

            const weatherText = `The current weather in ${location} is ${weatherDescription} with a temperature of ${temperature}°C.`;
            speak(weatherText);
            setPrompt(weatherText);
            setResponse(true);
            setTimeout(() => {
                setSpeaking(false);
            }, 10000);
        } catch (error) {
            console.error(error);
            speak("Sorry, I couldn't fetch the weather information. Please try again.");
            setPrompt("Error fetching weather data.");
            setResponse(true);
        }
    }

    function takeCommand(command) {
        if (command.includes("open") && command.includes("youtube")) {
            window.open("https://www.youtube.com/", "_blank");
            speak("opening Youtube");
            setResponse(true);
            setPrompt("opening Youtube...");
            setTimeout(() => {
                setSpeaking(false);
            }, 5000);
        } else if (command.includes("open") && command.includes("google")) {
            window.open("https://www.google.com/", "_blank");
            speak("opening google");
            setResponse(true);
            setPrompt("opening google...");
            setTimeout(() => {
                setSpeaking(false);
            }, 5000);
        } else if (command.includes("the time")) {
            let time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
            speak(time);
            setResponse(true);
            setPrompt(time);
            setTimeout(() => {
                setSpeaking(false);
            }, 5000);
        } else if (command.includes("date")) {
            let date = new Date().toLocaleString(undefined, { day: "numeric", month: "short" });
            speak(date);
            setResponse(true);
            setPrompt(date);
            setTimeout(() => {
                setSpeaking(false);
            }, 5000);
        } else if (command.includes("weather in")) {
            const location = command.split("in").pop().trim();
            speak(`Fetching weather for ${location}...`);
            setPrompt(`Fetching weather for ${location}...`);
            getWeather(location);
            setTimeout(() => {
                setSpeaking(false);
            }, 10000);
        } else {
            aiResponse(command);
        }
    }

    function togglePopup() {
        setShowPopup(prevState => !prevState); // Toggle the state
    }
    

    function toggleSidebar() {
        setShowSidebar(!showSidebar);
    }

    let value = {
        recognition,
        speaking,
        setSpeaking,
        prompt,
        setPrompt,
        response,
        setResponse,
        takeCommand,
        togglePopup,
        showPopup,
    };

    return (
        <div>
            <datacontext.Provider value={value}>
                {children}
                {showPopup && (
                    <div className="popup">
                        <h3>Available Commands</h3>
                        <ul>
                            <li>"   Open YouTube"</li>
                            <li>"   Open Google"</li>
                            <li>"   What's the weather in [location]?"</li>
                            <li>"   What's the time?"</li>
                            <li>"   Take screenshot(same tab)"</li>
                        </ul>
                        <button onClick={togglePopup}>Close</button>
                    </div>
                )}
                <div className={`sidebar ${showSidebar ? "open" : ""}`}>
                    <button className="toggle-btn" onClick={toggleSidebar}>{showSidebar ? "→" : "←"}</button>
                    {showSidebar && (
                        <ul>
                            <li>Open YouTube</li>
                            <li>Open Google</li>
                            <li>Check Weather</li>
                            <li>Open Calculator</li>
                            <li>Take Screenshot</li>
                        </ul>
                    )}
                </div>
            </datacontext.Provider>
        </div>
    );
}

export default UserContext;
