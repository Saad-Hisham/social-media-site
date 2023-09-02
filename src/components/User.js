import AddPost from "./AddPost"
import userProfile from "../images/360_F_171253635_8svqUJc0BnLUtrUOP5yOMEwFwA8SZayX.jpg"
import ProfilePost from './ProfilePost';
import EditPost from "./EditPost";
import { useSelector } from "react-redux";
function User(props) {
    const userLocal = JSON.parse(localStorage.getItem("user"))
    const openStates = useSelector((state) => state.user.openStates);


    return (
        <div>
            <div className="col-12">
                <div className="cover">
                    <div></div>
                </div>


            </div>
            <div className="pp-image">
                <span><img src={props.data.userImage != "" ? props.data.userImage : userProfile} /></span>
                <span>{props.data.Username}</span>
            </div>
            <div class="row">
                <div className="col-2 col-md-4 col-lg-3">
                </div>
                <div className="col-10 col-md-8 col-lg-5">
                    <div className="container">
                        {props.data.Userid == userLocal.user.uid ? <AddPost /> : null}
                        {openStates.editPost ? <EditPost /> : null}

                        <ProfilePost data={props.data} />
                    </div>
                </div>

            </div>
        </div>
    )
}
export default User