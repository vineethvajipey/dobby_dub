'use client';

import SpeechForm from '@/components/SpeechForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dobby Dub
          </h1>
          <p className="text-lg text-gray-600">
            Enter his domain and hear his illuminating commentary. 
          </p>
        </div>
        <SpeechForm />
      </div>
    </main>
  );
}
