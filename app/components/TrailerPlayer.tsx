export default function TrailerPlayer({ videoKey, title }: { videoKey: string; title: string }) {
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Trailer</h2>
      <div className="aspect-video overflow-hidden rounded-xl">
        <iframe
          src={`https://www.youtube.com/embed/${videoKey}?autoplay=0&rel=0`}
          title={title}
          className="h-full w-full"
          allowFullScreen
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          loading="lazy"
        />
      </div>
    </section>
  );
}
