import { FileUploader } from "@/components/file-uploader";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <div className="max-w-3xl w-full text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            JEFIT to Hevy Converter
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Seamlessly transform your JEFIT workout data into Hevy format.
            Simply drag and drop your CSV file to begin the conversion process.
          </p>
          <FileUploader />
        </div>
      </main>
      <Footer />
    </div>
  );
}
