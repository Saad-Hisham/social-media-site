
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { getAuth, signOut } from "firebase/auth";
import { useDispatch } from 'react-redux';
import { clearUser } from '../Redux';
import { useNavigate } from 'react-router-dom';
import userProfile from "../images/360_F_171253635_8svqUJc0BnLUtrUOP5yOMEwFwA8SZayX.jpg"
const auth = getAuth();
const user = JSON.parse(localStorage.getItem("user"))
function Profile() {
    const Navigate = useNavigate()

    const dispatch = useDispatch()

    return (
        <div>
            <div className="profile-photo" onClick={()=>{
                Navigate(`/${user.user.uid}`)
            }}>
                <span><img src={user.user.photoURL!=undefined ?user.user.photoURL :userProfile } alt="user profile picture" /></span> <span>{user.user.displayName}</span>
                <hr></hr>
            </div>

            <div className="profile-photo" onClick={() => {
                signOut(auth).then(() => {
                    dispatch(clearUser())
                }).catch((error) => {
                    dispatch(clearUser())

                });
            }}>
                <span className='log-out-span'><FontAwesomeIcon icon={faSignOutAlt} /></span> <span>Log out</span>
            </div>

        </div>

    );
}

export default Profile;