import { Coffee, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="w-full bg-gray-800/30 backdrop-blur-sm border-t border-gray-700 p-4">
      <div className="container mx-auto flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
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
        <div className="text-gray-400">or</div>
        <Button
          variant="ghost"
          className="text-gray-300 hover:text-white transition-colors duration-200"
          asChild
        >
          <a
            href="https://www.reddit.com/r/Hevy/comments/1hkausb/convert_your_jefit_data_to_hevy_with_this/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2"
          >
            <ThumbsUp size={20} />
            <span>Upvote on Reddit</span>
          </a>
        </Button>
      </div>
    </footer>
  );
}
