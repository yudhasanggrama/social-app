import SidebarLeft from '@/components/sidebars/SidebarLeft'
import React from 'react'

const Profile = () => {
  return (
    <div className="flex min-h-screen bg-black text-white">
        <SidebarLeft />
        <div className="ml-64 flex flex-1">
            <main className="flex-1 border-x border-zinc-800">
                
            </main>

            <aside className="hidden w-[380px] border-l border-zinc-800 lg:block">
                
            </aside>
      </div>
    </div>
  )
}

export default Profile