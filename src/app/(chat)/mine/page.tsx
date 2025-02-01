import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { UserProfile } from "@/components/user/user-profile"

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-14 border-b flex items-center px-6 bg-white">
        <h2 className="text-lg font-medium">个人信息</h2>
      </div>
      
      <div className="flex-1 p-6 mt-20">
        <UserProfile user={session.user} />
      </div>
    </div>
  )
}
