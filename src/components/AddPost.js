import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openSettings } from "../Redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { database, storage } from "../firebase/firebaseConfig";
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import userProfile from "../images/360_F_171253635_8svqUJc0BnLUtrUOP5yOMEwFwA8SZayX.jpg"
import { v4 as uuidv4 } from "uuid";
import Emoji from "react-emoji-render";
const posts = collection(database, "posts")
const users = collection(database, "users")
const user = JSON.parse(localStorage.getItem("user"))
const usersCollection = collection(database, "users");
const userId = user && user.user ? user.user.uid : "";
const usersQuery = query(usersCollection, where("Userid", "==", userId));
const postId = uuidv4();

function AddPost() {
    const firstName = user.user.displayName.split(" ")[0]
    const openStates = useSelector((state) => state.user.openStates);
    const anyStateTrue = Object.values(openStates).some(state => state);
    const dispatch = useDispatch()
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState("")
    const [uploadComplete, setUploadComplete] = useState(true);
    const [image, setImage] = useState('');
    const [inputValue, setInputValue] = useState("");
    const [type, setType] = useState("");
    const [docId, setDocId] = useState("")
    const [privatePosts, setprivatePosts] = useState([])
    const fileType = type.split("/")[0];
    const textAreaRef = useRef(null);


    const updateDocument = async (docId, dataToUpdate) => {
        try {
            const docRef = doc(database, "users", docId);
            await updateDoc(docRef, dataToUpdate);
        } catch (error) {
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            const usersSnapshot = await getDocs(usersQuery);
            if (!usersSnapshot.empty) {
                const userDoc = usersSnapshot.docs[0];
                setDocId(userDoc.id)
                const userData = userDoc.data();
                const userPosts = userData.posts;
                setprivatePosts(userPosts);


            } else {
            }
        };
        fetchData();
    }, []);
    const handleAddClick = () => {
        fileInputRef.current.click();
    };

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const handePostClick = async (event) => {
        if (!uploadComplete) {
            alert("Please wait until the file upload is complete.");
            return;
        }

        if (inputValue.trim().length === 0 && !image) {
            // Validate that post contains either text or image
            alert("Post cannot be empty");
            return;
        }

        try {
            const postId = uuidv4();
            const now = new Date();
            const docRef = await addDoc(posts, {
                UserId: user.user.uid,
                name: user.user.displayName,
                PostImage: image || null,
                PostText: inputValue.trim() || null,
                fileType: type,
                id: postId,
                reacts: 0,
                usersReacts: [],
                commnets: [],
                createdAt: now.toLocaleString()

            }).then(() => {
                updateDocument(docId, {
                    posts: [...privatePosts, {
                        UserId: user.user.uid,
                        name: user.user.displayName,
                        PostImage: image || null,
                        PostText: inputValue.trim() || null,
                        fileType: type,
                        id: postId,
                        reacts: 0,
                        usersReacts: [],
                        commnets: [],
                        createdAt: now.toLocaleString()


                    }]
                }).then(
                    openStates.AddPost = false,
                    setUploadComplete(true)

                )

            });

        } catch (e) {
        }
        setInputValue("");
        setImage("");
        dispatch(openSettings({ profile: false, notification: false, message: false }));
    };


    const handleFileChange = (event) => {
        const file = event.target.files[0];
        const storageRef = ref(storage, "userImages/" + file.name);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setLoading(`Upload is ${progress}% done`);
                setUploadComplete(false)
                if (progress === 100) {
                    setTimeout(() => {
                        setUploadComplete(true);
                    }, 500);
                }
            },
            (error) => {
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setImage(downloadURL);
                    setType(file.type);
                });
            }
        );
    };



    const handleClickOutside = (event) => {
        const formPost = document.querySelector(".form-post");
        const parentSettings = document.querySelector(".parent-settings");
        const isFormPostClicked = formPost && formPost.contains(event.target);
        const isParentSettingsClicked = parentSettings && parentSettings.contains(event.target);

        if (!isFormPostClicked && !isParentSettingsClicked) {
            dispatch(openSettings({ profile: false, notification: false, message: false }));
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div>
            <div className="Add-post-container col-12">
                <div onClick={() => {
                    dispatch(openSettings("addPost"))
                }}>
                    <span><img src={user.user.photoURL != undefined ? user.user.photoURL : userProfile} /></span> 
                        <span className="what-in">What's on your mind, {firstName}?</span>
                       </div>
            </div>
            {openStates.addPost ?
                <div className="black-screen-container">
                    <div className="black-screen"></div>
                    <form className="col-12 col-xl-8 form-post">
                        <div>
                            <h1>Create post</h1>
                        </div>
                        <hr></hr>
                        <div className="user-info-container">
                            <div><img src={user.user.photoURL != undefined ? user.user.photoURL : userProfile} alt="user profile picture" width={32} height={32} /></div>
                            <div>
                                <h2>{user.user.displayName}</h2>
                            </div>
                        </div>
                        <div>
                            <textarea placeholder={`What's on your mind, ${firstName}?`} onChange={handleInputChange} value={inputValue}></textarea>
                        </div>
                        <div className="Add-photos-container">
                            <div>
                                <div>
                                    <FontAwesomeIcon icon={faPlus} onClick={handleAddClick} />
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: "none" }}
                                        onChange={handleFileChange}
                                        accept="image/*,video/*"
                                    />
                                </div>
                                <p>Add photos/Videos</p>
                                {fileType === "video" ? (
                                    <video controls width={640} height={360}>
                                        <source src={image} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    image && <img src={image} onClick={handleAddClick} width={640} height={360} />
                                )}
                            </div>
                        </div>
                        {uploadComplete ? <p></p> : <p>{loading}</p>}
                        <div onClick={handePostClick} className="post-button"> Post</div>
                        {!image && <p className="upload-state">No file uploaded</p>}
                    </form>
                </div> : null}
        </div>
    )
}

export default AddPost