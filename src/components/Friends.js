import { useEffect, useState } from "react";
import Chats from "./Chats"
import SearchBar from "./SearchBar"
import Sidbar from "./Sidebar"
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { database } from "../firebase/firebaseConfig";
import userProfile from "../images/360_F_171253635_8svqUJc0BnLUtrUOP5yOMEwFwA8SZayX.jpg"
import Settings from "./Settings";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
const chatsRef = collection(database, "chats");
const userLocal = JSON.parse(localStorage.getItem("user"));
function Friends() {
    const [user, setUser] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        const usersRef = collection(database, "users");

        const fetchData = async () => {
            const usersSnapshot = await getDocs(usersRef);
            const usersData = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

            setUser(usersData)
        };

        fetchData();
    }, []);

    const handleChatClick = async (userId) => {
        const chatId1 = userLocal.user.uid + userId;
        const chatId2 = userId + userLocal.user.uid;

        // Check if the ID or the reverse ID exists in the "chats" collection
        const q1 = query(chatsRef, where("id", "==", chatId1));
        const q2 = query(chatsRef, where("id", "==", chatId2));
        const querySnapshot1 = await getDocs(q1);
        const querySnapshot2 = await getDocs(q2);
        if (!querySnapshot1.empty || !querySnapshot2.empty) {
            // ID or reverse ID already exists, do nothing
            return;
        }

        // Add the document to the "chats" collection
        await addDoc(chatsRef, {
            id: chatId1,
            messages: [],
        });
    };
    return (
        <div>
            <SearchBar />
            <Settings />
            <div class="row">
                <div className="col-2 col-md-4 col-lg-3">
                    <Sidbar />
                </div>
                <div className="col-10 col-md-8 col-lg-5">
                    <div className="container" style={{ marginTop: "2rem" }}>
                        <div className="row">



                            {user.map((user) => {
                                return (
                                    <div
                                        className="col-lg-4 friend-block">
                                        <div>
                                            <img src={user.userImage != "" ? user.userImage : userProfile} />
                                        </div>
                                        <div className="friend-name">{user.Username}</div>
                                        <div className="options">
                                            <span onClick={() => {
                                                handleChatClick(user.Userid)

                                            }}>Add to Chats </span>
                                            
                                            <span> <Link to={`/${user.Userid}`}>View Profile</Link></span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
                <div className="col-lg-3">
                    <Chats />
                </div>
            </div>

        </div>

    )
}
export default Friends
