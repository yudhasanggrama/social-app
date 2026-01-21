import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type QueueItem = {
  id: string;
  type: "info" | "success" | "error";
  text: string;
};

const CreatePostDialog = ({ onClose }: { onClose: () => void }) => {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const pushMsg = (type: QueueItem["type"], text: string) => {
    const id = crypto.randomUUID();
    setQueue((q) => [...q, { id, type, text }]);
    setTimeout(() => {
      setQueue((q) => q.filter((m) => m.id !== id));
    }, 3500);
  };

  const previewUrl = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const removeImage = () => {
    setImageFile(null);
    pushMsg("info", "Image removed.");
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("content", content);

      if (imageFile) {
        pushMsg("info", "Uploading image...");
        formData.append("image", imageFile);
      } else {
        pushMsg("info", "Posting...");
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

      pushMsg("success", "Posted!");

      setContent("");
      setImageFile(null);
      onClose();
    } catch (e: any) {
      pushMsg("error", e?.message ?? "Error");
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

      {queue.length > 0 && (
        <div className="mb-4 space-y-2">
          {queue.map((m) => (
            <div
              key={m.id}
              className={`
                flex items-center gap-2 rounded-md px-3 py-2 text-sm
                border
                ${
                  m.type === "success"
                    ? "border-green-600/40 bg-green-600/10 text-green-400"
                    : m.type === "error"
                    ? "border-red-600/40 bg-red-600/10 text-red-400"
                    : "border-blue-600/40 bg-blue-600/10 text-blue-400"
                }
              `}
            >
              <span className="font-medium">{m.text}</span>
            </div>
          ))}
        </div>
      )}

      <form>
        <div className="flex gap-4 border-b w-full pb-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>

          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            type="text"
            placeholder="What is happening?!"
            className="w-full bg-transparent text-lg placeholder:text-zinc-500 focus:outline-none"
          />
        </div>

        {previewUrl && (
          <div className="relative mt-4">
            <img
              src={previewUrl}
              alt="preview"
              className="w-full max-h-80 rounded-lg object-cover border border-zinc-800"
            />

            <button
              type="button"
              onClick={removeImage}
              className="
                absolute top-2 right-2
                flex items-center justify-center
                rounded-full
                p-2
                text-white
              "
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <label className="cursor-pointer rounded-full p-2 text-green-500 hover:bg-green-500/10">
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setImageFile(file);
                if (file) pushMsg("info", `Image selected: ${file.name}`);
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
      </form>
    </DialogContent>
  );
};

export default CreatePostDialog;
