"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useUserStore } from "@/lib/store/user-store"
import { useThemeStore } from "@/lib/store/theme-store"
import { toast } from "sonner"
import { Save, User, Bell, Shield, Palette, Code2 } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const { theme, setTheme } = useThemeStore()

  const [username, setUsername] = useState(user?.username || "")
  const [email, setEmail] = useState(user?.email || "")
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [apiKey, setApiKey] = useState("sk-••••••••••••••••")

  if (!user) {
    router.push("/login")
    return null
  }

  const handleSaveProfile = () => {
    toast.success("프로필이 저장되었습니다")
  }

  const handleSavePreferences = () => {
    toast.success("환경 설정이 저장되었습니다")
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">설정</h1>
            <p className="text-muted-foreground">계정 및 애플리케이션 설정을 관리하세요</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>프로필</CardTitle>
              </div>
              <CardDescription>개인 정보를 업데이트하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">사용자 이름</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="사용자 이름을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                />
              </div>

              <Button onClick={handleSaveProfile}>
                <Save className="mr-2 h-4 w-4" />
                프로필 저장
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <CardTitle>테마</CardTitle>
              </div>
              <CardDescription>애플리케이션 테마를 선택하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setTheme("light")}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    theme === "light" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="w-full h-20 bg-white rounded mb-2 border" />
                  <p className="text-sm font-medium">라이트</p>
                </button>

                <button
                  onClick={() => setTheme("dark")}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    theme === "dark" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="w-full h-20 bg-gray-900 rounded mb-2 border" />
                  <p className="text-sm font-medium">다크</p>
                </button>

                <button
                  onClick={() => setTheme("system")}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    theme === "system" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="w-full h-20 bg-gradient-to-r from-white to-gray-900 rounded mb-2 border" />
                  <p className="text-sm font-medium">시스템</p>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>알림</CardTitle>
              </div>
              <CardDescription>알림 설정을 관리하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>퀴즈 완료 알림</Label>
                  <p className="text-sm text-muted-foreground">퀴즈를 완료하면 알림을 받습니다</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>레벨업 알림</Label>
                  <p className="text-sm text-muted-foreground">레벨이 올라가면 알림을 받습니다</p>
                </div>
                <Switch checked={true} onCheckedChange={() => {}} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>배지 획득 알림</Label>
                  <p className="text-sm text-muted-foreground">새로운 배지를 획득하면 알림을 받습니다</p>
                </div>
                <Switch checked={true} onCheckedChange={() => {}} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                <CardTitle>에이전트 설정</CardTitle>
              </div>
              <CardDescription>AI 에이전트 동작을 커스터마이징하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>자동 저장</Label>
                  <p className="text-sm text-muted-foreground">생성된 코드를 자동으로 저장합니다</p>
                </div>
                <Switch checked={autoSave} onCheckedChange={setAutoSave} />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="API Key를 입력하세요"
                />
                <p className="text-xs text-muted-foreground">
                  OpenAI API Key를 입력하면 더 강력한 모델을 사용할 수 있습니다
                </p>
              </div>

              <Button onClick={handleSavePreferences}>
                <Save className="mr-2 h-4 w-4" />
                설정 저장
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">위험 구역</CardTitle>
              </div>
              <CardDescription>계정 삭제 및 데이터 초기화</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button variant="outline" className="w-full bg-transparent">
                  모든 데이터 초기화
                </Button>
                <Button variant="destructive" className="w-full">
                  계정 삭제
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
