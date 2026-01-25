import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import CreatePostDialog from "./CreatePostDialog";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectMe, selectAvatarVersion } from "@/store/profile";
import { avatarImgSrc } from "@/lib/image";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const CreatePostTrigger = () => {
  const [open, setOpen] = useState(false);

  const me = useSelector(selectMe);
  const v = useSelector(selectAvatarVersion);

  const src = avatarImgSrc(me?.avatar, v);
  const fallback = (me?.name?.[0] ?? "U").toUpperCase();

  const handleClose = async () => {
    await sleep(500);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-4 border-b border-zinc-800 px-4 py-4 hover:bg-zinc-900/50 cursor-pointer">
          <Avatar>
            <AvatarImage src={src} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>

          <div className="flex w-full items-center justify-between gap-3">
            <div className="text-lg text-zinc-500">What is happening?!</div>

            <div className="flex items-center gap-3 pointer-events-none opacity-60">
              <div className="text-green-500">
                <ImagePlus className="h-5 w-5" />
              </div>

              <Button
                type="button"
                className="h-8 rounded-full bg-green-500 px-4 text-sm"
                disabled
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </DialogTrigger>

      <CreatePostDialog onClose={handleClose} />
    </Dialog>
  );
};

export default CreatePostTrigger;
