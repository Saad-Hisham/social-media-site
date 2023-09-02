import { useSelector } from "react-redux";
import AddPost from "./AddPost";
import EditPost from "./EditPost";
import Post from "./Post";
import Sidbar from "./Sidebar";
import Chats from "./Chats";



function HomeBody() {
    const openStates = useSelector((state) => state.user.openStates);
    return (

        <div>
            <div class="row">
                <div className="col-2 col-md-4 col-lg-3">
                    <Sidbar />
                </div>
                <div className="col-10 col-md-8 col-lg-5">
                    <div className="container">

                        <AddPost />
                        <Post />
                        {openStates.editPost ? <EditPost /> : null}
                    </div>
                </div>
                <div className="col-lg-3">
                    <Chats/>
                </div>
            </div>

        </div>

    );
}

export default HomeBody;