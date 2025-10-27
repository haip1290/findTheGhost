import { useState } from "react";
import "../styles/styles.css";

const Challenge = () => {
  const [clickCoords, setClickCoords] = useState({ x: 0, y: 0 });
  const [message, setMessage] = useState("");
  const [targetBoxStyle, setTargetBoxStyle] = useState({
    display: "none",
    top: 0,
    left: 0,
  });
  const targetBoxSize = 50;
  // data from BE
  const imgSrc =
    "https://i.pinimg.com/736x/86/b9/b1/86b9b1e83140b935031a7c7b0ebf0170.jpg";
  // waldo coordinate 1078 880 - 1120 955
  const waldoCoords = { top: 740, left: 713, right: 760, bottom: 820 };
  // validate coordinate of target
  const validateTargetCoords = (targetCoords) => {
    if (!targetCoords.x || !targetCoords.y) {
      console.error("Target coordinate is not valid");
    }
  };
  // validate waldo coordinates
  const validateWaldoCoords = (waldoCoords) => {
    if (
      !waldoCoords.top ||
      !waldoCoords.bottom ||
      !waldoCoords.left ||
      !waldoCoords.right
    ) {
      console.error("Waldo coordinate is not valid");
    }
  };
  // function to check if user click in waldo box
  const isTargetWaldo = (targetCoords, waldoCoords) => {
    validateTargetCoords(targetCoords);
    validateWaldoCoords(waldoCoords);
    if (
      targetCoords.x < waldoCoords.left ||
      targetCoords.x > waldoCoords.right
    ) {
      return false;
    }
    if (
      targetCoords.y < waldoCoords.top ||
      targetCoords.y > waldoCoords.bottom
    ) {
      return false;
    }
    return true;
  };
  // function to find user click coordinates
  const handleUserClick = (e) => {
    // find click coordinates based relative to image box
    const xCoord = e.clientX;
    const yCoord = e.clientY;
    const imageRect = e.currentTarget.getBoundingClientRect();
    const relativeX = xCoord - imageRect.left;
    const relativeY = yCoord - imageRect.top;
    const targetCoords = { x: relativeX, y: relativeY };

    // handle target box
    setTargetBoxStyle({
      display: "block",
      top: relativeY - targetBoxSize / 2,
      left: relativeX - targetBoxSize / 2,
      width: `${targetBoxSize}px`,
      height: `${targetBoxSize}px`,
    });
    setClickCoords(targetCoords);
    // display message based on user's click
    if (isTargetWaldo(targetCoords, waldoCoords)) {
      setMessage("You found Waldo");
    } else {
      setMessage("That's not Waldo. Try again.");
    }
  };
  return (
    <div>
      <h3>Find Waldo</h3>
      <p>
        User clicked: {clickCoords.x} {clickCoords.y}
      </p>
      <p>{message}</p>
      <div className="img_container">
        <img
          src={imgSrc}
          alt="Waldo image"
          className="img"
          onClick={handleUserClick}
        />
        <div className="target_box" style={targetBoxStyle}></div>
      </div>
    </div>
  );
};

export default Challenge;
