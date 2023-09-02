import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Home from './components/Home';
import { useSelector } from 'react-redux';
import { collection, getDocs } from 'firebase/firestore';
import { database } from './firebase/firebaseConfig';
import { useEffect, useState } from 'react';
import User from './components/User';
import Marketplace from "./components/Marketplace"
import Watch from "./components/Watch"
import Gaming from "./components/Gaming"
import Friends from "./components/Friends"
function App() {
  const user = JSON.parse(localStorage.getItem("user"))
  const users = collection(database, "users")
  const [routes, setRoutes] = useState([])

  function logAllUsers() {
    const usersCollection = collection(database, "users");

    getDocs(usersCollection).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const newRoutes = querySnapshot.docs.map((doc) => (
          <Route path={`/${doc.data().Userid}`} element={<User data={doc.data()} />} />
        ));
        setRoutes([...routes, ...newRoutes]);
      });
    }).catch((error) => {
    });
  }
  useEffect(() => {
    logAllUsers()
  }, []);

  return (
    <div className="App" onClick={() => {
    }}>
      <Router>
        <Routes>
          {routes.map((x) => {
            return x
          })}

          <Route path="/profile" element={<User />} />
          <Route path="/watch" element={<Watch/>} />
          <Route path="/users" element={<Friends/>} />
          <Route path="/marketplace" element={<Marketplace/>} />

          {user ? (
            <Route path="/signup" element={<Navigate to="/" />} />
          ) : (
            <Route path="/signup" element={<SignUp />} />
          )}
          {user ? (
            <Route path="/signin" element={<Navigate to="/" />} />
          ) : (
            <Route path="/signin" element={<SignIn />} />
          )}
          {user ? (
            <Route path="/" element={<Home />} />
          ) : (
            <Route path="*" element={<Navigate to="/signin" />} />
          )}
        </Routes>
      </Router>

    </div>
  );
}

export default App;