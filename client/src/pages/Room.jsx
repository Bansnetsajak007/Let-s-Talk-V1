import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/socketProvider"
import ReactPlayer from "react-player";
import peer from "../services/peer";

const Room = () => {

  const socket = useSocket();
  const [remoteSocketId , setRemoteSocketId] = useState(null);
  const [myStream , setMystream] = useState(null);
  const [remoteStream , setRemoteMystream] = useState(null);

  const handelUserJoined = useCallback(({userName, id}) => {
      console.log(`user with name ${userName} joined the room`);
      setRemoteSocketId(id);
  },[])

  const handelCallUser = useCallback(async ()=> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", {to: remoteSocketId, offer});
    setMystream(stream);
  }, [remoteSocketId, socket]);

  const handeIncommingCall = useCallback(async({from, offer}) => {
    setRemoteSocketId(from);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMystream(stream);
    const ans = await peer.getAnswer(offer);
    socket.emit("call:accepted", {to: from, ans});
  },[socket]);

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handelCallAccepted = useCallback(({from , ans}) => {
    peer.setLocalDescription(ans);
    console.log("call Accepted");
    sendStreams();
  }, [sendStreams]);

  
  const handelNegoIncomming = useCallback(async ({from , offer}) => {
    const ans = await peer.getAnswer(offer);
    socket.emit("peer:nego:done", {to: from, ans} );
  },[socket]);
  
  const handelNegoFinal = useCallback(async({ans}) => {
    await peer.setLocalDescription(ans);
  },[]);
  
  const handelNego = useCallback(
    async() => {
      const offer = await peer.getOffer();
      socket.emit("peer:nego:needed", {offer , to:remoteSocketId});
    },[remoteSocketId, socket])

  useEffect (() => {
    peer.peer.addEventListener('negotiationneeded', handelNego )
    
    return () => {
      peer.peer.removeEventListener('negotiationneeded', handelNego )
      
    }
  }, [handelNego])

  useEffect (() => {
    peer.peer.addEventListener('track', async (ev) => {
      const remoteStream = ev.streams;
      // setRemoteMystream(remoteStream);
      console.log("Got ittt babyyy!!!")
      setRemoteMystream(remoteStream[0]);
    })
  }, [])


  useEffect(()=> {
    socket.on('user:joined', handelUserJoined );
    socket.on("incomming:call", handeIncommingCall);
    socket.on('call:accepted', handelCallAccepted);
    socket.on('peer:nego:needed', handelNegoIncomming)
    socket.on('peer:nego:final', handelNegoFinal)
    
    
    return () => {
      socket.off('user:joined', handelUserJoined);
      socket.off('incomming:call', handeIncommingCall);
      socket.off('call:accepted', handelCallAccepted);
      socket.off('peer:nego:needed', handelNegoIncomming)
      socket.off('peer:nego:final', handelNegoFinal)

    }

  },[handelUserJoined, socket, handeIncommingCall, handelCallAccepted, handelNegoIncomming, handelNegoFinal]);


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-4">Room Page</h1>
        <h4 className={`text-xl font-medium text-center mb-4 ${remoteSocketId ? 'text-green-500' : 'text-red-500'}`}>
          {remoteSocketId ? 'Connected' : 'Wait for other to join'}
        </h4>
        <div className="flex justify-center space-x-4 mb-4">
          {myStream && (
            <button
              onClick={sendStreams}
              className="py-2 px-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Send Stream
            </button>
          )}
          {remoteSocketId && (
            <>
            <button
              onClick={handelCallUser}
              className="py-2 px-4 bg-green-600 text-white font-medium rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Call
            </button>
            <button
              // onClick={handelEndCall}
              className="py-2 px-4 bg-red-600 text-white font-medium rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
                End Call
            </button>
            </>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myStream && (
            <div>
              <h2 className="text-2xl font-semibold mb-2 text-center">My Stream</h2>
              <div className="rounded overflow-hidden shadow-lg">
                <ReactPlayer
                  playing
                  height="200px"
                  width="100%"
                  url={myStream}
                  className="rounded"
                />
              </div>
            </div>
          )}
          {remoteStream && (
            <div>
              <h2 className="text-2xl font-semibold mb-2 text-center">Remote Stream</h2>
              <div className="rounded overflow-hidden shadow-lg">
                <ReactPlayer
                  playing
                  height="200px"
                  width="100%"
                  url={remoteStream}
                  className="rounded"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Room