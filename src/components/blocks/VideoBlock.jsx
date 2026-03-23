import './blocks.css';

export default function VideoBlock({ src, poster, layout }) {
  const cls = layout === 'full' ? ' block--video--full'
    : layout === 'wide' ? ' block--video--wide'
    : '';

  const isEmbed = src?.startsWith('http') || src?.startsWith('//');

  return (
    <section className={`block block--video${cls}`}>
      <div className="block--video__inner">
        <div className="block--video__ratio">
          {isEmbed ? (
            <iframe
              src={src}
              title="video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video src={src} poster={poster} controls playsInline />
          )}
        </div>
      </div>
    </section>
  );
}