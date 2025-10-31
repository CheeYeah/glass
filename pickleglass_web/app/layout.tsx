import './globals.css'
import ClientLayout from '@/components/ClientLayout'

// 临时禁用字体优化以解决网络问题

export const metadata = {
  title: 'pickleglass - AI Assistant',
  description: 'Personalized AI Assistant for various contexts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
} 