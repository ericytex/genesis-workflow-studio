
import { UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { Workflow, BarChart3, Settings, Zap } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  // Ensure user exists in database
  await prisma.user.upsert({
    where: { clerkId: user.id },
    update: {
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.firstName + ' ' + user.lastName,
      imageUrl: user.imageUrl,
    },
    create: {
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.firstName + ' ' + user.lastName,
      imageUrl: user.imageUrl,
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <Workflow className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-semibold">Workflow AI</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link href="/dashboard" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
              <BarChart3 className="h-5 w-5 mr-3" />
              Dashboard
            </Link>
            <Link href="/dashboard/workflows" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
              <Workflow className="h-5 w-5 mr-3" />
              Workflows
            </Link>
            <Link href="/builder" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
              <Zap className="h-5 w-5 mr-3" />
              Builder
            </Link>
            <Link href="/dashboard/settings" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
              <Settings className="h-5 w-5 mr-3" />
              Settings
            </Link>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <UserButton afterSignOutUrl="/" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user.firstName}</p>
                <p className="text-xs text-gray-500">{user.emailAddresses[0]?.emailAddress}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
