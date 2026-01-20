import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle } from "lucide-react"
import { useState } from "react"

type PostThread = {
  id: number
  username: string
  handle: string
  time: string
  content: string
  replyCount: number
  likeCount: number
  isLiked: boolean
}


const PostItem = () => {
  const [threads, setThreads] = useState<PostThread[]>([
    {
    id: 1,
    username: "Indah Pra Karya",
    handle: "@indahpra",
    time: "4h",
    content:
      "Kalian pernah ga sih bet on saving? Jadi by calculation sebenernya kita ga survive sampe tanggal tertentu...",
    replyCount: 381,
    likeCount: 36,
    isLiked: true,
  },
    {
      id: 2,
      username: "Anin Syahputri",
      handle: "@aninsyah",
      time: "5h",
      content:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio aliquid mollitia.",
      replyCount: 50,
      likeCount: 460,
      isLiked: true
    },
    {
      id: 3,
      username: "Kina Maulina",
      handle: "@aninsyah",
      time: "3h",
      content: "Lorem ipsum dolor sit amet.",
      replyCount: 50,
      likeCount: 36,
      isLiked: true
    },
  ])

  const toggleLike = (id: number) => {
  setThreads((prev) =>
    prev.map((thread) =>
      thread.id === id
        ? {
            ...thread,
            isLiked: !thread.isLiked,
            likeCount: thread.isLiked
              ? thread.likeCount - 1
              : thread.likeCount + 1,
          }
        : thread
    )
  )
}


  return (
    <>
      {threads.map((thread) => (
        <div
          key={thread.id}
          className="flex gap-4 px-4 py-4 border-b border-zinc-800 hover:bg-zinc-900/50"
        >
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>I</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-1 text-sm">
              <span className="font-semibold text-zinc-100">
                {thread.username}
              </span>
              <span className="text-zinc-400">
                {thread.handle} · {thread.time}
              </span>
            </div>

            <p className="mt-1 text-sm text-zinc-200 leading-relaxed">
              {thread.content}
            </p>

            <div className="mt-3 flex items-center gap-8 text-zinc-400 text-sm">
              <button className="flex items-center gap-1 hover:text-zinc-200">
                <MessageCircle className="h-4 w-4" />
                <span>{thread.replyCount}</span>
              </button>

              <button
                onClick={() => toggleLike(thread.id)}
                className={`flex items-center gap-1 ${
                  thread.isLiked ? "text-red-500" : "hover:text-zinc-200"
                }`}
              >
                <Heart
                  className="h-4 w-4"
                  fill={thread.isLiked ? "currentColor" : "none"}
                />
                <span>{thread.likeCount}</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default PostItem
