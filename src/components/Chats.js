import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { database } from "../firebase/firebaseConfig";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import userProfile from "../images/360_F_171253635_8svqUJc0BnLUtrUOP5yOMEwFwA8SZayX.jpg";
import { closeChat, openChat, setChatId } from "../Redux";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
const userLocal = JSON.parse(localStorage.getItem("user"));
const usersRef = collection(database, "users");
const chatsRef = collection(database, "chats");


async function fetchDataAndRender() {
  const querySnapshot = await getDocs(usersRef);
  const dataArr = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    dataArr.push(data);
  });
  return dataArr;
}

function Chats() {
  const [users, setUsers] = useState([]);
  const [chat, setChat] = useState([])
  const [message, setMessage] = useState([])
  const chatId = useSelector((state) => state.user.chatId);
  const openStates = useSelector((state) => state.user);
  const [name, setname] = useState("")
  const [pp, setpp] = useState("")
  const dispatch = useDispatch();
  const [userChat, setUserChat] = useState([])
  const chatWindowRef = useRef(null);

  useEffect(() => {
    let unsubscribeNotifications;
    let unsubscribeChats;

    const fetchData = async () => {
      if (userLocal) {
        const usersQuery = query(
          usersRef,
          where("Userid", "==", userLocal.user.uid)
        );
        const userSnapshot = await getDocs(usersQuery);
        const userDocSnapshot = userSnapshot.docs[0];
        const userDocId = userDocSnapshot.id;



        // Set up real-time listener for chats
        unsubscribeChats = onSnapshot(
          chatsRef,
          (snapshot) => {
            const filteredChats = snapshot.docs.filter((doc) => {
              const id = doc.data().id;
              return id.includes(userLocal.user.uid);
            });
            const updatedUsersMessages = filteredChats.map(async (chat) => {
              const userId = chat.data().id.replace(userLocal.user.uid, "");
              const usersQuery = query(
                usersRef,
                where("Userid", "==", userId)
              );
              const userSnapshot = await getDocs(usersQuery);
              const userData = userSnapshot.docs[0].data();
              return userData;
            });
            Promise.all(updatedUsersMessages).then((messages) => {
              setUserChat(messages);
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

  const getDocumentById = async () => {
    const documentRef = doc(chatsRef, chatId);
    const documentSnapshot = await getDoc(documentRef);


    if (documentSnapshot.exists()) {
      const documentData = documentSnapshot.data();
      // Process the document data here
      setMessage(documentData.messages);
      const chatQuery = query(
        usersRef,
        where("Userid", "==", documentData.id.replace(userLocal.user.uid, ''))
      );
      try {
        const chatSnapshot = await getDocs(chatQuery);
        chatSnapshot.forEach((doc) => {
          // Access the data inside each document
          const data = doc.data();
          // Do something with the data
          setname(data.Username);
          setpp(data.userImage)

        });
      } catch (error) {
        // Handle any errors that occur during the query
      }
    } else {
    }
  };

  getDocumentById();
  // ---------------------------------- chats --------------------------

  useEffect(() => {
    const fetchChatsData = async () => {
      try {
        const chatsQuery = query(chatsRef);
        const querySnapshot = await getDocs(chatsQuery);

        const newChats = []; // Create a new array to store the fetched chat data

        querySnapshot.forEach((doc) => {
          newChats.push(doc.data()); // Add each chat data to the new array
        });

        setChat(newChats); // Update the state with the new array of chat data
      } catch (error) {
      }
    };

    // Call the fetchChatsData function to retrieve the chats data
    fetchChatsData();

  }, []);



  // Assuming filteredChat is defined and assigned as an array
  const filteredChat = chat.filter((chat) => {
    return chat.id.includes(userLocal.user.uid)
  })


  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };
  useEffect(() => {

    // Call scrollToBottom whenever a new message is added to the chat
    scrollToBottom();
  }, [filteredChat, userLocal.user.uid, message]);


  // Perform any other actions or modifications based on the flattenedUserChatData array



  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = [];

        for (const user of filteredChat) {
          const userId = user.id.replace(userLocal.user.uid, '');
          const q1 = query(usersRef, where("Userid", "==", userId));
          const querySnapshot = await getDocs(q1);

          querySnapshot.forEach((doc) => {
            userData.push(doc.data());
          });
        }

      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [filteredChat, userLocal.user.uid]);
  return (
    <div>
      <div className="chat-section">
        <div className="chat-header">Chats</div>
        {
          userChat.map((chat) => {
            return (
              <div className="chat-block"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  dispatch(openChat())

                  const chatQuery = query(
                    chatsRef,
                    where("id", "==", userLocal.user.uid + chat.Userid)
                  );

                  getDocs(chatQuery)
                    .then((querySnapshot) => {
                      if (querySnapshot && !querySnapshot.empty) {
                        // First scenario is found
                        dispatch(setChatId(querySnapshot.docs[0].id))
                      } else {
                        // First scenario not found, check the opposite scenario
                        const oppositeQuery = query(
                          chatsRef,
                          where("id", "==", chat.Userid + userLocal.user.uid)
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
                <span><img src={chat.userImage != "" ? chat.userImage : userProfile} alt={chat.Username} className="chat-side-image" /></span>  <span>{chat.Username}</span>
              </div>
            )
          })
        }





      </div>
      {openStates.chat != false ?
        <div>
          <div className="chat-info">
            <span>
              <img src={pp != "" ? pp : userProfile} alt={name} />
            </span>
            <span>
              {name}
            </span>
            <span style={{ position: "absolute", left: "90%", cursor: "pointer" }}
              onClick={() => {
                dispatch(closeChat())
              }}>      <FontAwesomeIcon icon={faTimes} />
            </span>

          </div>
          <div className="chat-window"

            ref={chatWindowRef}>

            {message.map((message) => (
              <div className={message.id == userLocal.user.uid ? "sender-div" : "reciver-div"}>
                <span className={message.id == userLocal.user.uid ? "sender" : "reciver"}>
                  {message.content}
                </span>
              </div>
            ))}
            <br></br>
            <input
              className="message-input-sender"
              placeholder="Type a message..."
              type="text"
              onKeyDown={async (e) => {
                if (e.key === "Enter" && e.target.value.trim() !== "") {
                  const documentRef = doc(chatsRef, chatId);
                  const documentSnapshot = await getDoc(documentRef);
                  const messagesData = documentSnapshot.data().messages || []; // Handle case where messages is null or undefined
                  const updatedMessages = [
                    ...messagesData,
                    { content: e.target.value, id: userLocal.user.uid }
                  ];
                  e.target.value = ""; // Clear the input field after pressing Enter
              
                  await updateDoc(documentRef, { messages: updatedMessages });
                }
              }}
            />

          </div>
        </div>
        : null}
    </div>
  );
}

export default Chats;