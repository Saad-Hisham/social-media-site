
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import  userProfile from "../images/360_F_171253635_8svqUJc0BnLUtrUOP5yOMEwFwA8SZayX.jpg"
import { faVideo  } from '@fortawesome/free-solid-svg-icons';
import { faUserFriends  } from '@fortawesome/free-solid-svg-icons';
import { faStore } from '@fortawesome/free-solid-svg-icons';
import { faGamepad } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

function Sidbar() {

    const user = JSON.parse(localStorage.getItem("user"));

    return (

        <div className='side-bar-parent'>
        <ul>
          <li><Link to="/"><span><FontAwesomeIcon icon={faHome} /></span><span>Home</span></Link></li>
          <li><Link to={`/${user.user.uid}`}><span><img src={user.user.photoURL!=undefined ?user.user.photoURL :userProfile } alt="user profile picture" width={32} height={32} /> </span><span>{user.user.displayName}</span></Link></li>
        </ul>
        <hr></hr>
        <ul>
          <li><Link to="/watch"> <span><FontAwesomeIcon icon={faVideo } /></span><span>Watch</span></Link></li>
          <li><Link to="/users"> <span><FontAwesomeIcon icon={faUserFriends} /> </span><span>Users</span></Link></li>
        </ul>
        <hr></hr>
      </div>

    );
}

export default Sidbar;