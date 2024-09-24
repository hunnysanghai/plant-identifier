import "./globals.css";
import Image from 'next/image';
import PlantDetectionForm from '../components/PlantDetectionForm';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-400 to-green-700 text-white px-4">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight lg:text-5xl flex items-center justify-center space-x-4">
          <div className="flex-shrink-0">
            <Image src="/Icon.png" alt="Plant Icon" width={100} height={100} />
          </div>
          <span className="flex items-center">Pi Plant Health Monitor</span>
        </h1>
        <p className="mb-8 text-lg font-medium leading-relaxed text-green-200 ">
          Identify and manage plant species effortlessly with our advanced image recognition tool. 
          Perfect for gardening enthusiasts and nature lovers alike!
        </p>
        <PlantDetectionForm />
      </div>
    </main>
  );
}