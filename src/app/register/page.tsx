"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "注册失败");
        return;
      }

      // Automatically sign in after successful registration
      const signInResponse = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (signInResponse?.error) {
        setError("登录失败");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      setError("发生错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      <div className="max-w-sm w-full p-8 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-8">注册</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div>
            <Input
              name="username"
              type="text"
              placeholder="用户名"
              required
              className="rounded-xl h-11"
            />
          </div>
          <div>
            <Input
              name="password"
              type="password"
              placeholder="密码"
              required
              className="rounded-xl h-11"
            />
          </div>
          <div>
            <Input
              name="confirmPassword"
              type="password"
              placeholder="确认密码"
              required
              className="rounded-xl h-11"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-11 rounded-xl bg-[#4086F4] hover:bg-[#3476E3]" 
            disabled={loading}
          >
            {loading ? "注册中..." : "注册"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          已有账号？{" "}
          <a href="/login" className="text-[#4086F4] hover:text-[#3476E3] font-medium">
            立即登录
          </a>
        </p>
      </div>
    </div>
  );
} 