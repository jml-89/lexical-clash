export default function Loading() {
  return (
    <main className="flex-1 flex flex-col bg-[url('/bg/main.jpg')] bg-center bg-cover">
      <div className="flex-1 flex flex-col self-stretch justify-center items-center gap-4 backdrop-brightness-50">
        <div className="tracking-tight font-light text-4xl">Loading...</div>
      </div>
    </main>
  );
}
