import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import userProfile from '../images/360_F_171253635_8svqUJc0BnLUtrUOP5yOMEwFwA8SZayX.jpg';
import { database, storage } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { openSettings } from '../Redux';

const user = JSON.parse(localStorage.getItem('user'));

function EditPost() {
  const postId = useSelector((state) => state.user.editId);
  const [loading, setLoading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [image, setImage] = useState('');
  const fileInputRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [type, setType] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchPostData() {
      const postsQuery = query(collection(database, 'posts'), where('id', '==', postId));
      const postsSnapshot = await getDocs(postsQuery);
      postsSnapshot.docs.forEach((doc) => {
        setImage(doc.data().PostImage);
        setInputValue(doc.data().PostText);
      });
    }
    fetchPostData();
  }, [postId]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleAddPhotosClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const storageRef = ref(storage, 'userImages/' + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setLoading(true);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setLoading(progress < 100);
        setUploadComplete(progress === 100);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImage(downloadURL);
          setType(file.type);
          setLoading(false);
        });
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const postsQuery = query(collection(database, 'posts'), where('id', '==', postId));
    const postsSnapshot = await getDocs(postsQuery);

    postsSnapshot.docs.forEach(async (doc) => {
      const docRef = doc.ref;
      await updateDoc(docRef, { PostText: inputValue, PostImage: image }).then(
        () => {
          dispatch(openSettings({ profile: false, notification: false, message: false }));
        }
      );
    });
  };

  return (
    <div className="edit-post-form">
      <div className="black-screen-container">
        <div className="black-screen"></div>
        <form className="col-12 col-xl-8 form-post" onSubmit={(event) => handleSubmit(event)}>
          <div>
            <h1>Edit post</h1>
          </div>
          <hr />
          <div className="user-info-container">
            <div>
              <img src={user?.user?.photoURL ?? userProfile} alt="user profile picture" width={32} height={32} />
            </div>
            <div>
              <h2>{user?.user?.displayName}</h2>
            </div>
          </div>
          <div>
            <textarea onChange={handleInputChange} value={inputValue}></textarea>
          </div>
          <div className="Add-photos-container">
            <div>
              <div>
                <FontAwesomeIcon icon={faPlus} />
                <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleFileChange} />
              </div>
              <p>Add photos/Videos</p>
              <img width={640} height={360} src={image} alt="uploaded media" />
            </div>
          </div>
          {loading && <p>Uploading file...</p>}
          {uploadComplete && <p>File uploaded successfully!</p>}
          <button type="submit" className="post-button">
            Edit
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditPost;