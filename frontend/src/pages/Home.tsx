import SidebarLeft from "@/components/sidebars/SidebarLeft"
import SidebarRight from "@/components/sidebars/SidebarRight"
import Thread from "@/components/threads/Thread"

export default function Home() {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <SidebarLeft />

      <div className="ml-64 flex flex-1">
        <main className="flex-1 border-x border-zinc-800">
        <Thread />
        </main>

        <aside className="hidden w-[380px] border-l border-zinc-800 lg:block">
          <SidebarRight />
        </aside>
      </div>
    </div>
  )
}


