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

  //testingg
  // useEffect(() => {
  //   socket.on("room:join", (data) => {
  //     console.log(`Data from backend: ${data}`);
  //   });
  // }, [socket])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
      <h1 className="text-4xl font-bold text-center mb-6">Welcome</h1>
        <form onSubmit={handelSubmit} className="space-y-6">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700">
              Room Number
            </label>
            <input
              type="text"
              id="roomNumber"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Join Room
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LobbyPage