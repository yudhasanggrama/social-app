// CreatePostTrigger.tsx
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import CreatePostDialog from "./CreatePostDialog"

const CreatePostTrigger = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex cursor-pointer gap-4 border-b border-zinc-800 px-4 py-4 hover:bg-zinc-900/50">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>

          {/* FAKE INPUT */}
          <div className="flex w-full items-center text-lg text-zinc-500">
            What is happening?!
          </div>
        </div>
      </DialogTrigger>

      <CreatePostDialog />
    </Dialog>
  )
}

export default CreatePostTrigger
