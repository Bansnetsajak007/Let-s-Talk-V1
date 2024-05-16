import {Routes, Route} from 'react-router-dom'
import LobbyPage from './pages/LobbyPage'
import RoomPage from './pages/Room'


const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<LobbyPage/>} />
        <Route path='/room/:roomId' element={<RoomPage/>} />
      </Routes>
    </div> 
  )
}

export default App