import FeedHeader from "./FeedHeader"
import CreatePostTrigger from "./CreatePostTrigger"
import PostList from "../posts/PostList"

const Thread = () => {
  return (
    <div>
      <FeedHeader />
      <CreatePostTrigger />
      <PostList />
    </div>
  )
}

export default Thread
