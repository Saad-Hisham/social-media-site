import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisH, faHeart, faL } from '@fortawesome/free-solid-svg-icons'
import { faComment } from '@fortawesome/free-solid-svg-icons'
import { arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore'
import { database } from '../firebase/firebaseConfig'
import { useEffect, useRef, useState } from 'react'
import userProfile from "../images/360_F_171253635_8svqUJc0BnLUtrUOP5yOMEwFwA8SZayX.jpg"
import { useDispatch } from 'react-redux';
import { getPost, openSettings } from '../Redux';
import { useNavigate } from 'react-router-dom';

const postsCollection = collection(database, "posts");
const usersCollection = collection(database, "users");
const userLocal = JSON.parse(localStorage.getItem("user"))
function Post() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [like, setlike] = useState(false)
    const [profile, setProfile] = useState("")
    const [commnets, setComment] = useState({ content: "", publisher: "", img: "" })
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const input = useRef(null);


    // Use an object to store the menu state for each post
    const [menuState, setMenuState] = useState({});

    // Keep track of the currently open menu
    const [currentOpenMenu, setCurrentOpenMenu] = useState(null);

    useEffect(() => {
        const postsRef = collection(database, "posts");
        const usersRef = collection(database, "users");

        const fetchData = async () => {
            const usersSnapshot = await getDocs(usersRef);
            const usersData = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

            const postsQuery = query(postsCollection, orderBy("createdAt", "desc"));

            const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
                const postsData = querySnapshot.docs.map((doc) => {
                    const postData = { id: doc.id, ...doc.data() };
                    const user = usersData.find((user) => user.Userid === postData.UserId);
                    postData.Username = user.Username;
                    postData.userImage = user.userImage;
                    postData.user = user;

                    // Set the initial menu state for the post to false
                    setMenuState((prevState) => ({
                        ...prevState,
                        [postData.id]: false
                    }));

                    return postData;
                });

                setPosts(postsData);
                setLoading(false);
            });

            return () => {
                unsubscribe();
            };
        };

        fetchData();
    }, []);

    const deletePost = async (id) => {
        const postsQuery = query(postsCollection, where("id", "==", id));
        const postsSnapshot = await getDocs(postsQuery);
        const postDocRef = postsSnapshot.docs[0].ref;

        // Assuming we only expect one document to match the query

        // Delete the document using the document reference
        deleteDoc(postDocRef)
            .then(() => {
            })
            .catch((error) => {
                console.error('Error removing document: ', error);
            });
    }

    const toggleMenu = (postId) => {
        // Close the currently open menu
        if (currentOpenMenu !== null && currentOpenMenu !== postId) {
            setMenuState((prevState) => ({
                ...prevState,
                [currentOpenMenu]: false
            }));
        }

        // Update the menu state for the post
        setMenuState((prevState) => ({
            ...prevState,
            [postId]: !prevState[postId]
        }));

        // Update the currently open menu
        setCurrentOpenMenu(postId);
    };

    const handleImageLoaded = (event) => {
        event.target.classList.add('loaded');
    }

    const LikePost = async (post) => {
        const usersQuery = query(usersCollection, where("Userid", "==", userLocal.user.uid));
        const postsQuery = query(postsCollection, where("id", "==", post.id));
        const querySnapshot = await getDocs(usersQuery);
        const postsSnapshot = await getDocs(postsQuery);
      
        if (!querySnapshot.empty) {
          const docSnapshot = querySnapshot.docs[0];
          const docId = docSnapshot.id;
          const docRef = doc(usersCollection, docId);
          const docData = docSnapshot.data();
          const reacts = docData.reacts || [];
          const postIndex = reacts.indexOf(post.id);
      
          if (postIndex !== -1) {
            reacts.splice(postIndex, 1);
            await updateDoc(postsSnapshot.docs[0].ref, {
              usersReacts: firebase.firestore.FieldValue.arrayRemove(userLocal.user.uid),
            });
          } else {
            reacts.push(post.id);
            await updateDoc(postsSnapshot.docs[0].ref, {
              reacts: firebase.firestore.FieldValue.increment(1),
              usersReacts: firebase.firestore.FieldValue.arrayUnion(userLocal.user.uid),
            });
      
            const notiQuery = query(usersCollection, where("Userid", "==", post.user.Userid));
            const notiSnapshot = await getDocs(notiQuery);
      
            if (!notiSnapshot.empty) {
              const notiDocSnapshot = notiSnapshot.docs[0];
              const notiDocId = notiDocSnapshot.id;
              const notiDocRef = doc(usersCollection, notiDocId);
              const notiData = notiDocSnapshot.data();
              const notifications = notiData.notifications || [];
      
              // Check if the post's user is not the same as the current user
              if (post.user.Userid !== userLocal.user.uid) {
                await updateDoc(notiDocRef, {
                  notifications: arrayUnion({
                    message: `${userLocal.user.displayName} Liked Your Post`,
                    type: "Like",
                    postId: post.id,
                    read: false,
                  }),
                });
              }
            }
          }
      
          await updateDoc(docRef, { reacts });
        }
      };
    const editPost = (id) => {
        dispatch(openSettings("editPost"))
        dispatch(getPost(id))

    }
    const addComment = (e) => {
        { userLocal.user.photoURL != null ? setProfile(userLocal.user.photoURL) : setProfile(userProfile) }
        setComment({ content: e.target.value, publisher: userLocal.user.displayName, img: profile, id: userLocal.user.uid })

    }
    const submitComment = async (e, z) => {
        if (e.keyCode == 13&&e.target.value.trim() !== "") {
            const postsQuery = query(postsCollection, where("id", "==", z.id));
            const postsSnapshot = await getDocs(postsQuery);
            const postDocRef = postsSnapshot.docs[0].ref;
            const docSnap = await getDoc(postDocRef);
            await updateDoc(postDocRef, { commnets: [...docSnap.data().commnets, commnets] });
            e.target.value=""


        }
    }
    return (
        <div className="post-page-container">

            {loading ? (
                <div className="loading-container">
                    <div className="bounce1"></div>
                    <div className="bounce2"></div>
                    <div className="bounce3"></div>
                </div>
            ) : (
                posts.map((post) => {
                    return (
                        <div className="post-container" key={post.id}>

                            <div>
                                <div className="post-info" style={{ cursor: "pointer" }}>
                                    <div onClick={() => {
                                        navigate(`/${post.UserId}`);
                                    }}>
                                        <span> <img src={post.userImage != "" ? post.userImage : userProfile} alt="post publisher profile picture" /></span>
                                        <span className="post-pub-name">{post.Username}</span>
                                    </div>
                                    <div>
                                        {post.UserId == userLocal.user.uid ? (
                                            <span style={{ cursor: 'pointer' }} onClick={() => toggleMenu(post.id)}>
                                                <FontAwesomeIcon icon={faEllipsisH} />
                                            </span>
                                        ) : null}
                                        {menuState[post.id] && (
                                            <div>
                                                <ul>
                                                    <li onClick={() => deletePost(post.id)}>delete</li>
                                                    <li onClick={() => { editPost(post.id) }}>edit</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="post-text">
                                    <p>{post.PostText}</p>
                                </div>
                                <div className="post-content-media">
                                    {post.fileType.split("/")[0] === "video" ? (
                                        <video controls width={640} height={360}>
                                            <source src={post.PostImage} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <img
                                            src={post.PostImage}
                                            alt="Post Image"
                                            onLoad={handleImageLoaded}
                                            className="lazy"
                                        />
                                    )}
                                    <div style={{ marginTop: ".5rem" }}>
                                        <span >  <FontAwesomeIcon icon={faHeart} style={{ color: "rgb(237, 44,73)", marginRight: "0.5rem", fontSize: "1.2rem" }} /> {post.usersReacts.length} </span>
                                    </div>
                                </div>
                                <hr></hr>
                                <div className="post-interactions">
                                    <span onClick={() => { LikePost(post) }} style={{
                                        color: post.usersReacts.includes(userLocal.user.uid) ? "rgb(237, 44, 73)" : "#aca7a7",
                                        marginRight: "0.5rem"
                                    }}> <FontAwesomeIcon
                                            icon={faHeart}

                                        /> Like</span>
                                    <span> <FontAwesomeIcon icon={faComment} style={{ color: "#aca7a7", marginRight: "0.5rem" }} />Comment</span>
                                </div>
                                <hr></hr>
                                <div className='add-comment-input'>
                                    <input type='text' placeholder='Write a comment'
                                        onKeyDown={(e) => {
                                            submitComment(e, post)
                                        }}
                                        onChange={(e) => {
                                            addComment(e)
                                        }} 
                                        ref={input}
                                        />
                                </div>
                                {post.commnets.map((x) => {
                                    return (
                                        <div className='comment' style={{ cursor: "pointer" }}>

                                            <span
                                                onClick={() => {
                                                    navigate(`/${x.id}`);
                                                }}
                                            ><img src={x.img != null ? x.img : userProfile} /></span>
                                            <div className='comment-content'>
                                                <span>{x.publisher}</span>
                                                <p>{x.content}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })
            )}
        </div>
    )
}

export default Post