import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ImagePlus } from "lucide-react"

const CreatePostDialog = () => {
  return (
    <DialogContent className="max-w-xl border-zinc-800 bg-zinc-950 text-white
             fixed top-10 left-1/2 transform -translate-x-1/2 translate-y-0">
      <DialogHeader>
        <VisuallyHidden>
          <DialogTitle>Create Post</DialogTitle>
        </VisuallyHidden>
      </DialogHeader>

      <div className="flex gap-4 border-b w-full">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>

        <input
          type="text"
          placeholder="What is happening?!"
          className="w-full bg-transparent text-lg placeholder:text-zinc-500 focus:outline-none mb-10"
        />

      </div>

      <div className="flex items-center justify-between">
        <label className="cursor-pointer rounded-full p-2 text-green-500 hover:bg-green-500/10">
          <input type="file" hidden />
          <ImagePlus className="h-5 w-5" />
        </label>

        <Button className="rounded-full bg-green-500 px-6">
          Post
        </Button>
      </div>
    </DialogContent>
  )
}

export default CreatePostDialog
