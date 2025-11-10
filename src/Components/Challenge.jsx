import { useEffect, useState, useMemo, useCallback } from "react";
import "../styles/styles.css";

const validateTargetCoords = (targetCoords) => {
  if (
    targetCoords.x == null ||
    targetCoords.y == null ||
    typeof targetCoords.x !== "number" ||
    typeof targetCoords.y !== "number"
  ) {
    console.error("Target coordinate is not valid (missing or not a number)");
    return false;
  }
  return true;
};

// validate waldo coordinates
const validateWaldoCoords = (waldoCoords) => {
  if (
    typeof waldoCoords.top !== "number" ||
    typeof waldoCoords.bottom !== "number" ||
    typeof waldoCoords.left !== "number" ||
    typeof waldoCoords.right !== "number"
  ) {
    console.error("Waldo coordinate is not a valid number");
    return false;
  }
  return true;
};

// function to check if user click in waldo box
const isTargetWaldo = (targetCoords, waldoCoords) => {
  if (!validateTargetCoords(targetCoords)) {
    // Check the boolean return
    return false;
  }
  if (!validateWaldoCoords(waldoCoords)) {
    return false;
  }
  if (targetCoords.x < waldoCoords.left || targetCoords.x > waldoCoords.right) {
    return false;
  }
  if (targetCoords.y < waldoCoords.top || targetCoords.y > waldoCoords.bottom) {
    return false;
  }
  return true;
};

const getClickCoords = (event) => {
  // find click coordinates based relative to image box
  const xCoord = event.clientX;
  const yCoord = event.clientY;
  const imageRect = event.currentTarget.getBoundingClientRect();
  const relativeX = xCoord - imageRect.left;
  const relativeY = yCoord - imageRect.top;

  // divided by image width and height to handle different resolution
  const targetCoords = {
    x: (relativeX * 1000) / imageRect.width,
    y: (relativeY * 1000) / imageRect.height,
  };
  return { relativeX, relativeY, targetCoords };
};

// function to draw box around user's click position
const drawBox = (x, y, boxSize, setTargetBoxStyle) => {
  setTargetBoxStyle({
    display: "block",
    top: y - boxSize / 2,
    left: x - boxSize / 2,
    width: `${boxSize}px`,
    height: `${boxSize}px`,
  });
};

// fetch waldo data from BE
const useFetchWaldoData = (url) => {
  const [data, setData] = useState({});
  const [imgLoading, setImgLoading] = useState(true);
  const [fetchImgError, setFetchImgError] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching data from BE");
      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorData = await res.json().catch(() => {});
          const errorMsg =
            errorData.message || `HTTP error status ${res.status}`;
          throw new Error(errorMsg);
        }
        const data = await res.json();
        setData(data.data);
      } catch (error) {
        console.error("Fetching data failed ", error);
        setFetchImgError(error.message || "Internal server error");
      } finally {
        setImgLoading(false);
      }
    };
    fetchData();
  }, [url]);
  return [data, imgLoading, fetchImgError];
};

const useCreateUserApi = (url, imgLoading) => {
  const [user, setUser] = useState(null);
  const [createUserError, setCreateUserError] = useState("");
  useEffect(() => {
    const createUser = async () => {
      console.log("Calling BE to create user");
      try {
        const res = await fetch(url, { method: "POST" });
        if (!res.ok) {
          const errorData = await res.json().catch(() => {});
          const errorMsg =
            errorData.message || `HTTP error status ${res.status}`;
          throw new Error(errorMsg);
        }
        const data = await res.json();
        console.log("User ", data.data.user);
        setUser(data.data.user);
      } catch (error) {
        console.error("Create user failed ", error);
        setCreateUserError(error.message || "Internal server error");
      }
    };
    // only create user after image finished loading and there is no user
    if (!imgLoading && !user) {
      createUser();
    }
  }, [imgLoading, url]);
  return [user, createUserError];
};

const useUpdateEndTime = (url) => {
  const [updateEndTimeLoading, setUpdateEndTimeLoading] = useState(false);
  const [updateEndTimeError, setUpdateEndTimeError] = useState(null);
  const [userTime, setUserTime] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  // function to update user endtime
  const updateEndTime = useCallback(async () => {
    if (isFinished) return;
    try {
      console.log("Calling BE to update user end time");
      const res = await fetch(url, { method: "PUT" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => {});
        const errorMsg = errorData || `HTTP error status ${res.status}`;
        throw new Error(errorMsg);
      }
      const data = await res.json();
      const user = data.data.user;

      // calculate time taken
      const startTime = new Date(user.startTime);
      const endTime = new Date(user.endTime);
      const timeDiff = startTime.getTime() - endTime.getTime();
      const calculatedUserTime = (timeDiff / 1000).toFixed(2);

      setUserTime(calculatedUserTime);
      setIsFinished(true);
    } catch (error) {
      console.error("Error updating user end time ", error);
      setUpdateEndTimeError(error.message || "Internal Server Error");
    } finally {
      setUpdateEndTimeLoading(false);
    }
  }, [url, isFinished]);

  return [
    updateEndTimeLoading,
    updateEndTimeError,
    userTime,
    isFinished,
    updateEndTime,
  ];
};

const Challenge = () => {
  const [clickCoords, setClickCoords] = useState({ x: 0, y: 0 });
  const [message, setMessage] = useState("Let's find Waldo");
  const [targetBoxStyle, setTargetBoxStyle] = useState({
    display: "none",
    top: 0,
    left: 0,
  });
  const [username, setUsername] = useState("");
  const targetBoxSize = 50;
  const getWaldoDataURL = "http://localhost:3000/challenge/first";
  const createUserURL = "http://localhost:3000/user";

  // get data from BE
  const [data, imgLoading, fetchImgError] = useFetchWaldoData(getWaldoDataURL);
  const [user, createUserError] = useCreateUserApi(createUserURL, imgLoading);
  const userId = user?.id;
  const userStartTime = user?.startTime;

  // format time to cleaner string
  const formattedStartTime = useMemo(() => {
    if (!userStartTime) return "N/A";
    return new Date(userStartTime).toLocaleDateString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, [userStartTime]);

  const updateUserURL = userId ? `http://localhost:3000/user/${userId}` : "";

  const [
    updateEndTimeLoading,
    updateEndTimeError,
    userTime,
    isFinished,
    updateEndTime,
  ] = useUpdateEndTime(updateUserURL);

  // process data from BE
  const imgSrc = data.url;
  // waldo coordinate 1078 880 - 1120 955
  const waldoCoords = useMemo(
    () => ({
      top: data.waldo_top,
      left: data.waldo_left,
      right: data.waldo_right,
      bottom: data.waldo_bottom,
    }),
    [data]
  );

  // function to handle user click
  const handleUserClick = (e) => {
    // get click coordinate
    const { relativeX, relativeY, targetCoords } = getClickCoords(e);
    // handle target box
    drawBox(relativeX, relativeY, targetBoxSize, setTargetBoxStyle);
    setClickCoords(targetCoords);
    // display message based on user's click
    if (isTargetWaldo(targetCoords, waldoCoords)) {
      setMessage("You found Waldo");
      updateEndTime(updateUserURL);
    } else {
      setMessage("That's not Waldo. Try again.");
    }
  };

  const handleUpdateUsername = () => {};

  if (imgLoading) {
    return <div>Loading Challenge...</div>;
  }
  if (fetchImgError) {
    return <div>Error loading challenge: {fetchImgError}</div>;
  }

  return (
    <div>
      <h3>Find Waldo</h3>
      <p>
        User clicked: {clickCoords.x} {clickCoords.y}
      </p>
      <p>Start Time : {formattedStartTime}</p>
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

      {updateEndTimeLoading && <div>...Saving your time</div>}
      {updateEndTimeError && <div>Error saving score</div>}
      {createUserError && <div>Sorry, this feature is not available atm</div>}

      {isFinished && userTime && <div>Your time: {userTime} second!</div>}
      {isFinished && (
        <div>
          <p>Let's get your name on the leader board</p>
          <form onClick={handleUpdateUsername}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              required
              onChange={(e) => {
                setUsername(e.target.value);
              }}
            />
            <button type="submit">Submit Score</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Challenge;
