import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="w-full bg-gray-800/30 backdrop-blur-sm border-t border-gray-700 p-4">
      <div className="container mx-auto flex justify-center items-center">
        <Button
          variant="ghost"
          className="text-gray-300 hover:text-white transition-colors duration-200"
          asChild
        >
          <a
            href="https://www.buymeacoffee.com/sondre"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2"
          >
            <Coffee size={20} />
            <span>Buy me a coffee</span>
          </a>
        </Button>
      </div>
    </footer>
  );
}
