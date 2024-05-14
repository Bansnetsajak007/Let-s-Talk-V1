import { useCallback, useEffect, useState } from "react"
import { useSocket } from "../context/socketProvider";
import { useNavigate } from "react-router-dom";

const LobbyPage = () => {
  const [userName, setUserName] = useState("");
  const [room , setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handelSubmit = useCallback((e) => {
    e.preventDefault();
    socket.emit('room:join', {userName, room})
  }, [userName,room, socket]);

  const handleJoinRoom = useCallback(
    (data) => {
      const { userName, room } = data;
      console.log(userName, room);
      navigate(`/room/${room}`);
    },
    [navigate]
  );


  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div>
      <h1>Lobby Page</h1>
      <form onSubmit={handelSubmit}>
        <label htmlFor="Name">Username: </label>
        <input 
        type="text" 
        id="userName" 
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        />
        <br />
        <label htmlFor="room">RoomNumber: </label>
        <input 
        type="text" 
        id="roomNumber"
        value={room}
        onChange={(e) => setRoom(e.target.value)}

        />
        <br />
        <button>Call</button>
      </form>
    </div>
  )
}

export default LobbyPage