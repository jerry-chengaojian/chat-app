"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { signOut } from "next-auth/react"

interface UserProfileProps {
  user: {
    username: string
    userId: string
  }
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold tracking-tight">欢迎, {user.username}</h3>
          <p className="text-sm text-muted-foreground">
            这是您的个人信息页面
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <p className="text-sm font-medium w-20">用户 ID</p>
            <p className="text-sm text-muted-foreground">{user.userId}</p>
          </div>
          <div className="flex items-center">
            <p className="text-sm font-medium w-20">用户名</p>
            <p className="text-sm text-muted-foreground">{user.username}</p>
          </div>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            退出登录
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 