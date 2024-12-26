import Link from 'next/link'
import { Github } from 'lucide-react'

export function Header() {
  return (
    <header className="w-full bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          JEFIT2Hevy
        </Link>
        <a
          href="https://github.com/sondrealf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2"
        >
          <Github size={20} />
          <span className="hidden md:inline">GitHub</span>
        </a>
      </div>
    </header>
  )
}

