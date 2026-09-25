import { useState } from "react";

function Assistant() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "assistant",
      text: "Hello! 👋 I'm your MediTwin AI Assistant. I can help you understand your health records and provide information based on your stored health data.",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const patientId = 1;

  // ==========================================
  // SEND MESSAGE TO BACKEND
  // ==========================================

  const handleSend = async () => {
    if (!message.trim() || isLoading) {
      return;
    }

    const userMessage = message.trim();

    const newMessage = {
      id: Date.now(),
      type: "user",
      text: userMessage,
    };

    setMessages((previous) => [
      ...previous,
      newMessage,
    ]);

    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/assistant/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patient_id: patientId,
            message: userMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to get assistant response"
        );
      }

      const data = await response.json();

      const assistantMessage = {
        id: Date.now() + 1,
        type: "assistant",
        text:
          data.response ||
          "Sorry, I couldn't generate a response.",
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "Assistant error:",
        error
      );

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          type: "assistant",
          text: "Sorry, I'm unable to connect to the MediTwin Assistant right now. Please make sure the backend server is running.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // ENTER KEY
  // ==========================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSend();
    }
  };

  // ==========================================
  // SUGGESTED QUESTION
  // ==========================================

  const handleSuggestedQuestion = (question) => {
    setMessage(question);
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="assistant-page">

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <section className="assistant-page-header">

        <div>

          <h1>
            AI Health Assistant
          </h1>

          <p>
            Ask questions and get personalized
            assistance from your MediTwin health
            companion.
          </p>

        </div>

        <div className="assistant-status">

          <span></span>

          {isLoading
            ? "Assistant Thinking..."
            : "Assistant Online"}

        </div>

      </section>


      {/* ====================================== */}
      {/* MAIN ASSISTANT */}
      {/* ====================================== */}

      <section className="assistant-container glass-card">

        {/* CHAT HEADER */}

        <div className="assistant-chat-header">

          <div className="assistant-avatar">
            🤖
          </div>

          <div>

            <h2>
              MediTwin Assistant
            </h2>

            <p>
              Your personalized health companion
            </p>

          </div>

        </div>


        {/* ================================== */}
        {/* MESSAGES */}
        {/* ================================== */}

        <div className="chat-messages">

          {messages.map((item) => (

            <div
              key={item.id}
              className={`chat-message ${
                item.type === "user"
                  ? "user-message"
                  : "assistant-message"
              }`}
            >

              {/* Assistant Avatar */}

              {item.type === "assistant" && (

                <div className="message-avatar">
                  🤖
                </div>

              )}


              {/* Message */}

              <div className="message-bubble">

                {item.text}

              </div>


              {/* User Avatar */}

              {item.type === "user" && (

                <div className="message-avatar user-avatar">
                  👤
                </div>

              )}

            </div>

          ))}


          {/* ================================= */}
          {/* LOADING MESSAGE */}
          {/* ================================= */}

          {isLoading && (

            <div className="chat-message assistant-message">

              <div className="message-avatar">
                🤖
              </div>

              <div className="message-bubble">

                <span>
                  Thinking...
                </span>

              </div>

            </div>

          )}

        </div>


        {/* ================================== */}
        {/* SUGGESTED QUESTIONS */}
        {/* ================================== */}

        <div className="suggested-section">

          <span>
            Try asking:
          </span>

          <div className="suggested-questions">

            <button
              onClick={() =>
                handleSuggestedQuestion(
                  "Can you explain my latest medical report?"
                )
              }
            >
              📄 Explain my latest report
            </button>


            <button
              onClick={() =>
                handleSuggestedQuestion(
                  "What are my upcoming appointments?"
                )
              }
            >
              🗓️ Upcoming appointments
            </button>


            <button
              onClick={() =>
                handleSuggestedQuestion(
                  "Show my current medications"
                )
              }
            >
              💊 My medications
            </button>

          </div>

        </div>


        {/* ================================== */}
        {/* INPUT */}
        {/* ================================== */}

        <div className="assistant-input-area">

          <input
            type="text"
            placeholder="Ask your health assistant..."
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />


          <button
            className="send-message-btn"
            onClick={handleSend}
            disabled={
              isLoading ||
              !message.trim()
            }
          >
            ➤
          </button>

        </div>


        {/* ================================== */}
        {/* DISCLAIMER */}
        {/* ================================== */}

        <small className="assistant-disclaimer">

          MediTwin Assistant provides general
          information and is not a replacement for
          professional medical advice.

        </small>

      </section>


      {/* ====================================== */}
      {/* ASSISTANT FEATURES */}
      {/* ====================================== */}

      <section className="assistant-features">


        {/* REPORTS */}

        <div className="assistant-feature-card glass-card">

          <div>
            📄
          </div>

          <h3>
            Understand Reports
          </h3>

          <p>
            Get simple explanations of medical terms
            and report information.
          </p>

        </div>


        {/* HEALTH INSIGHTS */}

        <div className="assistant-feature-card glass-card">

          <div>
            📊
          </div>

          <h3>
            Health Insights
          </h3>

          <p>
            Understand trends and information from
            your stored health data.
          </p>

        </div>


        {/* MEDICATION */}

        <div className="assistant-feature-card glass-card">

          <div>
            💊
          </div>

          <h3>
            Medication Help
          </h3>

          <p>
            View information about your medication
            schedule and reminders.
          </p>

        </div>

      </section>

    </div>
  );
}

export default Assistant;