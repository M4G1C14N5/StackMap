import { Suspense } from 'react';
import StackMapCanvas from '../components/StackMapCanvas';
import FloatingSidebar from '../components/FloatingSidebar';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-0">
      <Suspense fallback={null}>
        <FloatingSidebar />
      </Suspense>
      <div className="ml-80 w-full h-full">
        <StackMapCanvas />
      </div>
    </main>
  );
}