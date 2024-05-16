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
    <div>
        <h1>Room Page</h1>
        <h4>{remoteSocketId ? 'Connected' : 'No one in Room' }</h4>
        {myStream && <button onClick={sendStreams}>Send Stream</button>}
        {
          remoteSocketId && <button onClick={handelCallUser}>Call</button>
        }
        {
          myStream && (
            <>
            <h2>My Stream</h2>
            <ReactPlayer 
              muted
              playing
              height="200px"
              width="300px"
            url={myStream} 
            />
            </>
          )
        }

        {
          remoteStream && (
            <>
            <h2>Remote Stream</h2>
            <ReactPlayer 
              muted
              playing
              height="200px"
              width="300px"
            url={remoteStream} 
            />
            </>
          )
        }
        
    </div>
  )
}

export default Room