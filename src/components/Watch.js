import PostVideos from "./PostVideos"
import Sidebar from "./Sidebar"
import Chats from "./Chats"

function Watch(){
    return(
        <div>
        <div class="row">
            <div className="col-2 col-md-4 col-lg-3">
                <Sidebar/>
            </div>
            <div className="col-10 col-md-8 col-lg-5">
                <div className="container">

                   
                    <PostVideos/>
                    
                   
                </div>
            </div>
            <div className="col-lg-3">
                <Chats/>
            </div>
        </div>

    </div>
    )
}
export default Watch