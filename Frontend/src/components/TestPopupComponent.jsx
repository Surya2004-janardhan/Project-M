import React from "react";

const TestPopupComponent = () => {
  const testPopup = () => {
    console.log("Opening test popup...");

    const popup = window.open(
      "http://localhost:5000/test/popup",
      "test",
      "width=500,height=400,left=100,top=100"
    );

    const messageListener = (event) => {
      console.log("Received test message:", event);

      if (event.origin !== "http://localhost:5000") {
        return;
      }

      if (event.data && event.data.type === "test_success") {
        console.log("Test successful:", event.data.data.message);
        alert("Popup communication working: " + event.data.data.message);
        window.removeEventListener("message", messageListener);
      }
    };

    window.addEventListener("message", messageListener);
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", margin: "20px" }}>
      <h3>Test Popup Communication</h3>
      <button
        onClick={testPopup}
        style={{ padding: "10px", background: "blue", color: "white" }}
      >
        Test Popup
      </button>
    </div>
  );
};

export default TestPopupComponent;
