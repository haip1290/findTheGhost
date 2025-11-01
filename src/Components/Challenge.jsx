import { useEffect, useState } from "react";
import "../styles/styles.css";

// fetch waldo data from BE
const useData = (url) => {
  const [data, setData] = useState({});
  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching data from BE");
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.error(`HTTP error status ${res.status}`);
        }
        const data = await res.json();
        setData(data.data);
      } catch (error) {
        console.error("Fetching data failed ", error);
      }
    };
    fetchData(url);
  }, [url]);
  return data;
};

const Challenge = () => {
  const [clickCoords, setClickCoords] = useState({ x: 0, y: 0 });
  const [message, setMessage] = useState("");
  const [targetBoxStyle, setTargetBoxStyle] = useState({
    display: "none",
    top: 0,
    left: 0,
  });

  const targetBoxSize = 50;
  const URL = "http://localhost:3000/challenge/1";
  const data = useData(URL);
  // data from BE
  const imgSrc = data.url;
  // waldo coordinate 1078 880 - 1120 955
  const waldoCoords = {
    top: data.waldo_top,
    left: data.waldo_left,
    right: data.waldo_right,
    bottom: data.waldo_bottom,
  };
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
