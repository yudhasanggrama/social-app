import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "../ui/card"
import { FaGithub, FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa"



const SidebarRight = () => {
  return (
    <>
      <aside className="space-y-4 px-4 py-6">
        <Card className="bg-zinc-900">
          <div className="rounded-xl p-2">
            <div className="h-20 rounded-lg bg-gradient-to-r from-green-400 to-yellow-300" />

            <div className="-mt-8 flex items-end justify-between">
              <Avatar className="h-16 w-16 border-4 border-zinc-900 ml-2">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>

              <Button variant="whiteOutline" className="rounded-full border border-white px-4 py-1 text-sm mt-10">
                Edit Profile
              </Button>
            </div>

            <div className="mt-2">
              <p className="font-semibold">✨ Stella Audhina ✨</p>
              <p className="text-sm text-zinc-400">@audhinafh</p>
              <p className="mt-2 text-sm text-zinc-300">
                picked over by the worms, and weird fishes
              </p>

              <div className="mt-3 flex gap-4 text-sm">
                <span>
                  <b>291</b>{" "}
                  <span className="text-zinc-400">Following</span>
                </span>
                <span>
                  <b>23</b>{" "}
                  <span className="text-zinc-400">Followers</span>
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900">
          <div className="rounded-xl bg-zinc-900 p-4">
            <h2 className="mb-3 font-semibold">Suggested for you</h2>

            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium">User Name</p>
                    <p className="text-zinc-400">@username</p>
                  </div>
                </div>

                <button className="rounded-full bg-white px-4 py-1 text-sm text-black hover:bg-zinc-200">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-zinc-900">
          <div className="flex">
              <div className="flex flex-col gap-1 px-5 py-4 text-sm text-zinc-300">
                  {/* Top Row */}
                  <div className="flex items-center justify-between">
                    <p>
                      Developed by <span className="font-medium text-white">Yudha S.W </span>
                    </p>

                    <div className="flex items-center gap-3 text-zinc-400">
                      <FaGithub className="h-4 w-4 cursor-pointer hover:text-white" />
                      <FaLinkedin className="h-4 w-4 cursor-pointer hover:text-white" />
                      <FaFacebook className="h-4 w-4 cursor-pointer hover:text-white" />
                      <FaInstagram className="h-4 w-4 cursor-pointer hover:text-white" />
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <p className="text-xs text-zinc-400">
                    Powered by
                    DumbWays Indonesia •  #1 Coding Bootcamp
                  </p>
                </div>
          </div>
        </Card>
      </aside>
    </>

  )
}



export default SidebarRight
