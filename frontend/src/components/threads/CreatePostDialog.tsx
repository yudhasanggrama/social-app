import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { useState } from "react";

const CreatePostDialog = ({ onClose }: { onClose: () => void }) => {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

 const handleSubmit = async () => {
  if (!content.trim()) return;

  try {
    setLoading(true);

    const formData = new FormData();
    formData.append("content", content);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const result = await fetch("http://localhost:9000/api/v1/threads", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!result.ok) {
      const err = await result.json().catch(() => null);
      throw new Error(err?.message || "Failed to create thread");
    }

    setContent("");
    setImageFile(null);
    window.dispatchEvent(new Event("thread:created"));
    onClose(); 
  } catch (e: any) {
    alert(e?.message ?? "Error");
  } finally {
    setLoading(false);
  }
};


  return (
    <DialogContent
      className="max-w-xl border-zinc-800 bg-zinc-950 text-white
      fixed top-10 left-1/2 transform -translate-x-1/2 translate-y-0"
    >
      <DialogHeader>
        <VisuallyHidden>
          <DialogTitle>Create Post</DialogTitle>
        </VisuallyHidden>
      </DialogHeader>
      <form action="" >
        <div className="flex gap-4 border-b w-full">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>

          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            type="text"
            placeholder="What is happening?!"
            className="w-full bg-transparent text-lg placeholder:text-zinc-500 focus:outline-none mb-10"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="cursor-pointer rounded-full p-2 text-green-500 hover:bg-green-500/10">
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setImageFile(file);
              }}
            />
            <ImagePlus className="h-5 w-5" />
          </label>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            className="rounded-full bg-green-500 px-6"
          >
            {loading ? "Posting..." : "Post"}
          </Button>
        </div>

        {/* Optional: info file terpilih */}
        {imageFile && (
          <p className="text-xs text-zinc-400 mt-2">
            Selected: {imageFile.name}
          </p>
        )}
      </form>
    </DialogContent>
  );
};

export default CreatePostDialog;
