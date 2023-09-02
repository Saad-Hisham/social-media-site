import { useDispatch, useSelector } from "react-redux";
import { openChat, openSettings } from "../Redux";
import { useEffect, useState } from "react";
import Profile from "./Profile";
import { collection, doc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { database } from "../firebase/firebaseConfig";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import userProfile from "../images/360_F_171253635_8svqUJc0BnLUtrUOP5yOMEwFwA8SZayX.jpg";
import { setChatId } from '../Redux';

const usersCollection = collection(database, "users");
const chatCollection = collection(database, "chats");
const userLocal = JSON.parse(localStorage.getItem("user"));

function Settings() {
    const [notificationsArray, setNotificationsArray] = useState([]);
    const [usersMessages, setUsersMessages] = useState([]);

    const openStates = useSelector((state) => state.user.openStates);
    const chatState = useSelector((state) => state.user.chat);
    const anyStateExceptAddPostTrue = Object.keys(openStates).some(
        (key) => key !== "addPost" && openStates[key]
    );
    const dispatch = useDispatch();

    useEffect(() => {
        let unsubscribeNotifications;
        let unsubscribeChats;

        const fetchData = async () => {
            if (userLocal) {
                const usersQuery = query(
                    usersCollection,
                    where("Userid", "==", userLocal.user.uid)
                );
                const userSnapshot = await getDocs(usersQuery);
                const userDocSnapshot = userSnapshot.docs[0];
                const userDocId = userDocSnapshot.id;

                // Set up real-time listener for notifications
                unsubscribeNotifications = onSnapshot(
                    doc(usersCollection, userDocId),
                    (doc) => {
                        const notificationsArray = doc.data().notifications;
                        setNotificationsArray(notificationsArray.reverse());
                    }
                );

                // Set up real-time listener for chats
                unsubscribeChats = onSnapshot(
                    chatCollection,
                    (snapshot) => {
                        const filteredChats = snapshot.docs.filter((doc) => {
                            const id = doc.data().id;
                            return id.includes(userLocal.user.uid);
                        });
                        const updatedUsersMessages = filteredChats.map(async (chat) => {
                            const userId = chat.data().id.replace(userLocal.user.uid, "");
                            const usersQuery = query(
                                usersCollection,
                                where("Userid", "==", userId)
                            );
                            const userSnapshot = await getDocs(usersQuery);
                            const userData = userSnapshot.docs[0].data();
                            return userData;
                        });
                        Promise.all(updatedUsersMessages).then((messages) => {
                            setUsersMessages(messages);
                        });
                    }
                );
            }
        };

        fetchData();

        // Clean up listeners
        return () => {
            if (unsubscribeNotifications) unsubscribeNotifications();
            if (unsubscribeChats) unsubscribeChats();
        };
    }, []);

    return (
        <>
            {anyStateExceptAddPostTrue && (
                <div className="parent-settings">
                    <div className="settings">
                        {openStates.profile && <div><Profile /></div>}
                        {openStates.notification && (
                            <div>
                                {notificationsArray.length > 0 ? (
                                    notificationsArray.map(function (x) {
                                        return (
                                            <div className="notification-block">
                                                <FontAwesomeIcon className="hearts" icon={faHeart} />
                                                {x.message}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="empty-message">You don't have notifications</div>
                                )}
                            </div>
                        )}
                        {openStates.message && (
                            <div>
                                {
                                    usersMessages.length > 0 ?
                                        usersMessages.map(function (x) {
                                            return (

                                                <div className="notification-block" style={{ cursor: "pointer" }} onClick={async () => {
                                                    dispatch(openChat())

                                                    const chatQuery = query(
                                                        chatCollection,
                                                        where("id", "==", userLocal.user.uid + x.Userid)
                                                    );

                                                    getDocs(chatQuery)
                                                        .then((querySnapshot) => {
                                                            if (querySnapshot && !querySnapshot.empty) {
                                                                // First scenario is found
                                                                dispatch(setChatId(querySnapshot.docs[0].id))
                                                            } else {
                                                                // First scenario not found, check the opposite scenario
                                                                const oppositeQuery = query(
                                                                    chatCollection,
                                                                    where("id", "==", x.Userid + userLocal.user.uid)
                                                                );

                                                                return getDocs(oppositeQuery);
                                                            }
                                                        })
                                                        .then((oppositeSnapshot) => {
                                                            if (oppositeSnapshot && !oppositeSnapshot.empty) {
                                                                // Opposite scenario is found
                                                                dispatch(setChatId(oppositeSnapshot.docs[0].id))

                                                            }
                                                        })
                                                        .catch((error) => {
                                                        });
                                                }}>

                                                    <span>
                                                        <img
                                                            src={x.userImage !== "" ? x.userImage : userProfile}
                                                            alt={x.Username}
                                                            className="message-image"
                                                        />
                                                    </span>
                                                    {x.Username}
                                                 
                                                </div>
                                            );
                                        }

                                        ) : (
                                            <div className="empty-message">You don't have messages</div>
                                        )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default Settings;