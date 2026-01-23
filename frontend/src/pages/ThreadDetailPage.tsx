import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import type { Thread } from "@/Types/thread";
import type { ReplyItem } from "@/Types/reply";
import api from "@/lib/api";
import SidebarLeft from "@/components/sidebars/SidebarLeft";
import SidebarRight from "@/components/sidebars/SidebarRight";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ImagePlus, Heart, MessageCircle } from "lucide-react";
import { socket } from "@/lib/socket";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export default function ThreadDetailPage() {
  const { id } = useParams();
  const threadId = Number(id);
  const myUserId = useSelector((s: RootState) => s.auth.id);

  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // upload images for reply
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [replyImages, setReplyImages] = useState<File[]>([]);
  const [replyImagePreviews, setReplyImagePreviews] = useState<string[]>([]);

  // ✅ URL helper: handle "uploads/xxx", "/uploads/xxx", "/path", etc.
  const toPublicUrl = (p: string) => {
    if (!p) return "";
    if (p.startsWith("http")) return p;

    // Most common: "uploads/xxx.jpg"
    if (p.startsWith("uploads/")) return `http://localhost:9000/${p}`;
    // Common: "/uploads/xxx.jpg"
    if (p.startsWith("/uploads/")) return `http://localhost:9000${p}`;
    // Common: "/something"
    if (p.startsWith("/")) return `http://localhost:9000${p}`;

    return `http://localhost:9000/${p}`;
  };

  // fetch thread + replies
  useEffect(() => {
    if (!threadId) return;

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);

        const [tRes, rRes] = await Promise.all([
          api.get(`/threads/${threadId}`, { signal: controller.signal }),
          api.get(`/threads/${threadId}/replies`, { signal: controller.signal }),
        ]);

        setThread(tRes.data.data as Thread);
        setReplies((rRes.data.data?.replies ?? []) as ReplyItem[]);
      } catch (e: any) {
        if (e?.name === "CanceledError" || e?.name === "AbortError") return;
        console.error("Failed to fetch detail thread", e);
        setThread(null);
        setReplies([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [threadId]);

  const threadImages = useMemo(
    () => (Array.isArray(thread?.image) ? thread!.image : []),
    [thread]
  );

  // pick images (max 10)
  const onPickReplyImages = (files: FileList | null) => {
    if (!files) return;
    const picked = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (picked.length === 0) return;

    setReplyImages((prev) => [...prev, ...picked].slice(0, 10));
  };

  // generate preview urls
  useEffect(() => {
    const urls = replyImages.map((f) => URL.createObjectURL(f));
    setReplyImagePreviews(urls);

    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [replyImages]);

  const removeReplyImage = (idx: number) => {
    setReplyImages((prev) => prev.filter((_, i) => i !== idx));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearAllReplyImages = () => {
    setReplyImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // submit reply (multipart)
  const handleSubmitReply = async () => {
    if (!replyText.trim() && replyImages.length === 0) return;

    try {
      setReplyLoading(true);

      const fd = new FormData();
      fd.append("thread_id", String(threadId));
      fd.append("content", replyText);

      // backend: upload.array("image", 10) -> field MUST be "image"
      replyImages.forEach((file) => fd.append("image", file));

      // IMPORTANT: do NOT set Content-Type manually
      const res = await api.post("/replies", fd, { withCredentials: true });

      const newReply = res.data.reply as ReplyItem;
      setReplies((prev) => [newReply, ...prev]);

      setReplyText("");
      setReplyImages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to create reply", error);
      alert("Gagal post reply. Cek Network/console ya.");
    } finally {
      setReplyLoading(false);
    }
  };

  // toggle like thread
  const toggleThreadLike = async () => {
    if (!thread || likeLoading) return;

    const prevThread = thread;

    // optimistic
    setThread({
      ...thread,
      isLiked: !thread.isLiked,
      likes: thread.isLiked ? thread.likes - 1 : thread.likes + 1,
    });

    setLikeLoading(true);

    try {
      const res = await api.post(
        "/likes/toggle",
        { thread_id: thread.id },
        { withCredentials: true }
      );

      const { liked, likesCount } = res.data.result;

      setThread((t) =>
        t
          ? {
              ...t,
              isLiked: liked,
              likes: likesCount,
            }
          : t
      );
    } catch (e) {
      console.error("Toggle like failed", e);
      setThread(prevThread); // rollback
    } finally {
      setLikeLoading(false);
    }
  };

  // socket updates for likes
  useEffect(() => {
    if (!thread) return;

    const onThreadLikeUpdated = (p: {
      threadId: number;
      likesCount: number;
      actorUserId: number;
      liked: boolean;
    }) => {
      if (p.threadId !== thread.id) return;

      setThread((prev) =>
        prev
          ? {
              ...prev,
              likes: p.likesCount,
              isLiked: p.actorUserId === myUserId ? p.liked : prev.isLiked,
            }
          : prev
      );
    };

    const onReplyLikeUpdated = (p: {
      replyId: number;
      threadId: number;
      likesCount: number;
      actorUserId: number;
      liked: boolean;
    }) => {
      if (p.threadId !== thread.id) return;

      setReplies((prev) =>
        prev.map((r) =>
          r.id === p.replyId
            ? {
                ...r,
                likes: p.likesCount,
                isLiked: p.actorUserId === myUserId ? p.liked : r.isLiked,
              }
            : r
        )
      );
    };

    socket.on("thread:like_updated", onThreadLikeUpdated);
    socket.on("reply:like_updated", onReplyLikeUpdated);

    return () => {
      socket.off("thread:like_updated", onThreadLikeUpdated);
      socket.off("reply:like_updated", onReplyLikeUpdated);
    };
  }, [thread?.id, myUserId]);

  // toggle like reply
  const toggleReplyLike = async (replyId: number) => {
    // optimistic
    setReplies((prev) =>
      prev.map((r) =>
        r.id === replyId
          ? { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 }
          : r
      )
    );

    try {
      const res = await api.post("/reply-likes/toggle", { reply_id: replyId });

      const likedFromServer: boolean | undefined = res.data?.data?.liked;
      const likesCountFromServer: number | undefined = res.data?.data?.likesCount;

      if (typeof likedFromServer === "boolean" && typeof likesCountFromServer === "number") {
        setReplies((prev) =>
          prev.map((r) =>
            r.id === replyId ? { ...r, isLiked: likedFromServer, likes: likesCountFromServer } : r
          )
        );
      }
    } catch (e) {
      console.error("Toggle reply like failed", e);
      const rRes = await api.get(`/threads/${threadId}/replies`);
      setReplies(rRes.data.data.replies ?? []);
    }
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (!thread) return <div className="p-6 text-white">Thread tidak ditemukan</div>;

  return (
    <div className="flex min-h-screen bg-black text-white">
      <SidebarLeft />

      <div className="ml-64 flex flex-1">
        <main className="flex-1 border-x border-zinc-800">
          {/* Top bar */}
          <div className="sticky top-0 z-10 border-b border-zinc-800 bg-black/80 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                className="rounded-full p-2 hover:bg-zinc-900"
                title="Back"
                onClick={() => history.back()}
              >
                ←
              </button>
              <div className="text-lg font-semibold">Status</div>
            </div>
          </div>

          {/* Thread Card */}
          <section className="border-b border-zinc-800 px-4 py-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={(thread.user as any)?.photo_profile || "https://github.com/shadcn.png"}
                />
                <AvatarFallback>
                  {(thread.user?.name || "U").slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate font-semibold">{thread.user.name}</div>
                  <div className="truncate text-sm text-zinc-500">@{thread.user.username}</div>
                </div>

                <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed">
                  {thread.content}
                </p>

                {/* Thread images */}
                {threadImages.length > 0 && (
                  <div className="mt-3">
                    {threadImages.length === 1 ? (
                      <img
                        src={toPublicUrl(threadImages[0])}
                        className="w-full max-h-[32rem] rounded-xl object-cover border border-zinc-800"
                        alt="thread"
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {threadImages.map((img, i) => (
                          <img
                            key={i}
                            src={toPublicUrl(img)}
                            className="h-48 w-full rounded-xl object-cover border border-zinc-800"
                            alt={`thread-${i}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-3 flex items-center gap-6 text-zinc-500">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleThreadLike();
                    }}
                    disabled={likeLoading}
                    className={`flex items-center gap-2 ${
                      thread.isLiked ? "text-red-500" : "hover:text-zinc-300"
                    } ${likeLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <Heart className="h-4 w-4" fill={thread.isLiked ? "currentColor" : "none"} />
                    <span className="text-xs">{thread.likes}</span>
                  </button>

                  <button className="flex items-center gap-2 hover:text-zinc-300">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">{replies.length}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Reply composer */}
          <section className="border-b border-zinc-800 px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>

              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply!"
                className="w-full bg-transparent text-[15px] placeholder:text-zinc-500 focus:outline-none"
                disabled={replyLoading}
              />

              {/* hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={replyLoading}
                onChange={(e) => {
                  onPickReplyImages(e.target.files);
                  // reset supaya bisa pilih file yang sama lagi
                  e.currentTarget.value = "";
                }}
              />

              <button
                type="button"
                disabled={replyLoading}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full p-2 text-green-500 hover:bg-green-500/10 disabled:opacity-50"
                title="Add image"
              >
                <ImagePlus className="h-5 w-5" />
              </button>

              <Button
                type="button"
                onClick={handleSubmitReply}
                className="h-8 rounded-full bg-green-500 px-5 text-sm"
                disabled={replyLoading || (!replyText.trim() && replyImages.length === 0)}
              >
                {replyLoading ? "Posting..." : "Post"}
              </Button>
            </div>

            {/* previews */}
            {replyImagePreviews.length > 0 && (
              <div className="mt-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs text-zinc-400">
                    {replyImagePreviews.length} image(s)
                  </div>
                  <button
                    type="button"
                    onClick={clearAllReplyImages}
                    className="text-xs text-zinc-400 hover:text-zinc-200"
                    disabled={replyLoading}
                  >
                    Remove all
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {replyImagePreviews.map((src, i) => (
                    <div key={src} className="relative">
                      <img
                        src={src}
                        alt={`preview-${i}`}
                        className="h-24 w-full rounded-lg object-cover border border-zinc-800"
                      />
                      <button
                        type="button"
                        onClick={() => removeReplyImage(i)}
                        className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-1 text-xs hover:bg-black"
                        title="Remove"
                        disabled={replyLoading}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Replies */}
          <section>
            {replies.length === 0 ? (
              <div className="px-4 py-6 text-sm text-zinc-500">Belum ada reply</div>
            ) : (
              replies.map((r) => {
                // assumes ReplyItem has: image?: string[]
                const replyImgs = Array.isArray((r as any).image)
                  ? ((r as any).image as string[])
                  : [];

                return (
                  <div
                    key={r.id}
                    className="border-b border-zinc-800 px-4 py-4 hover:bg-zinc-900/30"
                  >
                    <div className="flex gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={(r.user as any)?.photo_profile || "https://github.com/shadcn.png"}
                        />
                        <AvatarFallback>
                          {(r.user?.name || "U").slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="truncate text-sm font-semibold">{r.user.name}</div>
                          <div className="truncate text-xs text-zinc-500">@{r.user.username}</div>
                        </div>

                        <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">{r.content}</p>

                        {/* reply images */}
                        {replyImgs.length > 0 && (
                          <div className="mt-3">
                            {replyImgs.length === 1 ? (
                              <img
                                src={toPublicUrl(replyImgs[0])}
                                className="w-full max-h-[28rem] rounded-xl object-cover border border-zinc-800"
                                alt="reply"
                              />
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                {replyImgs.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={toPublicUrl(img)}
                                    className="h-40 w-full rounded-xl object-cover border border-zinc-800"
                                    alt={`reply-${r.id}-${idx}`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-2 flex items-center gap-6 text-zinc-500">
                          <button
                            onClick={() => toggleReplyLike(r.id)}
                            className={`flex items-center gap-1 text-sm ${
                              r.isLiked ? "text-red-500" : "text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            <Heart
                              className="h-4 w-4"
                              fill={r.isLiked ? "currentColor" : "none"}
                            />
                            <span>{r.likes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </main>

        <aside className="hidden w-[380px] border-l border-zinc-800 lg:block">
          <SidebarRight />
        </aside>
      </div>
    </div>
  );
}
