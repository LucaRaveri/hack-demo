import React, { useState } from "react";
import axios from "axios";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [emission, setEmission] = useState("");
  const [sessionID, setSessionID] = useState(null);
  const [chatActive, setChatActive] = useState(false); // Stato per attivare/disattivare la chat

  const postData = {
    memoriId: "3e15bb30-d51f-4492-b6f6-bc80d7eb38ff",
    password: "undefined",
    birthDate: "1986-04-24T13:38:07.728Z",
  };

  const startChat = () => {
    axios
      .post("https://backend.memori.ai/memori/v2/session", postData)
      .then((response) => {
        const emissionData = response.data.currentState.emission;
        setEmission(emissionData);
        setSessionID(response.data.sessionID);
        setChatActive(true); // Attiva la chat dopo aver ottenuto il sessionID
  
        // Dopo aver ottenuto il sessionID, invia il primo messaggio
        const requestBody = {
          text: "Ciao, sono Jerry",
        };
  
        axios
          .post(
            `https://backend.memori.ai/memori/v2/TextEnteredEvent/${response.data.sessionID}`,
            requestBody
          )
          .then((response) => {
            const emissionData = response.data.currentState.emission;
            setMessages((prevMessages) => [
              ...prevMessages,
              { text: emissionData, sender: "bot" },
            ]);
          })
          .catch((error) => {
            console.error("Errore nella chiamata API:", error);
          });
      })
      .catch((error) => {
        console.error("Errore nella chiamata API:", error);
      });
  };
  

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() !== "" && sessionID) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: inputMessage, sender: "user" },
      ]);

      const requestBody = {
        text: inputMessage,
      };

      axios
        .post(
          `https://backend.memori.ai/memori/v2/TextEnteredEvent/${sessionID}`,
          requestBody
        )
        .then((response) => {
          const emissionData = response.data.currentState.emission;
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: emissionData, sender: "bot" },
          ]);
        })
        .catch((error) => {
          console.error("Errore nella chiamata API:", error);
        });

      setInputMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {!chatActive ? (
        <div className="flex-grow p-4 border border-gray-300 bg-white">
        <button
          onClick={startChat}
          className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          style={{ maxWidth: "200px" }} // Imposta una larghezza massima
        >
          Avvia la chat
        </button>
        </div>
      ) : (
        <>
          <div className="flex-grow p-4 border border-gray-300 bg-white">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.sender === "user" ? "user" : "bot"
                }`}
              >
                {message.text}
                {index < messages.length - 1 && (
                  <hr className="my-2 border-gray-300" />
                )}
              </div>
            ))}
          </div>
          <div className="p-4">
            <input
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              placeholder="Scrivi un messaggio..."
              className="border rounded px-2 py-1 w-full"
            />
            <button
              onClick={handleSendMessage}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Invia
            </button>
          </div>
        </>
      )}
    </div>
  );
}
