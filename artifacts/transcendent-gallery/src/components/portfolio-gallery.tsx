import { useRef, useState, type KeyboardEvent } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ArrowLeft, ArrowRight, ArrowUpRight, Maximize2, X } from 'lucide-react';
import { gallery, galleryFilters, type Photo } from '@/data/portfolio';

const pad = (n: number) => String(n).padStart(2, '0');
const labelOf = (p: Photo) => p.category ?? p.label ?? '';
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function PortfolioGallery() {
  const [filter, setFilter] = useState<string>('All work');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const visible = gallery.filter((item) => filter === 'All work' || item.category === filter);
  const current = openIndex !== null ? visible[openIndex] : null;

  const step = (dir: number) =>
    setOpenIndex((i) => (i === null ? i : (i + dir + visible.length) % visible.length));

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  };

  return (
    <>
      <div className="gallery-toolbar" role="group" aria-label="Filter photographs by category">
        <span className="eyebrow">Browse by</span>
        {galleryFilters.map((item) => {
          const count = item === 'All work' ? gallery.length : gallery.filter((g) => g.category === item).length;
          return (
            <button
              type="button"
              key={item}
              className={`filter-button ${filter === item ? 'active' : ''} ${count === 0 ? 'is-empty' : ''}`}
              onClick={() => { setFilter(item); setOpenIndex(null); }}
              aria-pressed={filter === item}
              data-testid={`gallery-filter-${slug(item)}`}
            >
              {item}<sup>{count}</sup>
            </button>
          );
        })}
        <span className="gallery-count" aria-live="polite" data-testid="text-gallery-count">
          {`${pad(visible.length)} ${visible.length === 1 ? 'PHOTOGRAPH' : 'PHOTOGRAPHS'}`}
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="gallery-empty" data-testid="gallery-empty">
          <span className="gallery-empty-mark" aria-hidden="true">TG</span>
          <div>
            <p className="eyebrow">{filter}</p>
            <h3 className="font-display">No photographs here <em>yet.</em></h3>
            <p>We haven’t published work in this category on the site. Ask us about it — we’ll gladly talk you through what a session looks like.</p>
            <div className="gallery-empty-actions">
              <a href="#contact" data-testid="link-empty-enquire">Enquire about {filter} <ArrowUpRight size={14} /></a>
              <button type="button" onClick={() => setFilter('All work')} data-testid="button-empty-all">See all work</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="gallery-masonry" data-testid="photography-gallery">
          {visible.map((item, index) => (
            <article key={item.id} className="gallery-item" data-testid={`gallery-item-${item.id}`}>
              <button
                type="button"
                className="gallery-trigger"
                onClick={(event) => { opener.current = event.currentTarget; setOpenIndex(index); }}
                aria-label={`Open photograph ${index + 1} of ${visible.length}: ${item.title}, ${labelOf(item)}`}
                data-testid={`button-open-${item.id}`}
              >
                <span className="gallery-image-wrap" style={{ aspectRatio: `${item.width} / ${item.height}` }}>
                  <img
                    src={item.thumbnail}
                    srcSet={item.srcSet}
                    sizes="(max-width: 700px) 50vw, (max-width: 1100px) 45vw, 30vw"
                    width={item.width}
                    height={item.height}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="gallery-image-index">{pad(index + 1)}</span>
                  <span className="gallery-open" aria-hidden="true"><Maximize2 size={15} /></span>
                </span>
              </button>
              <div className="gallery-caption">
                <div>
                  <span className="eyebrow">{labelOf(item)}</span>
                  <h3 className="font-display">{item.title}</h3>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="gallery-foot">
        <span>Every frame here is a real client, a real day. These are a few of ours.</span>
        <a href="#contact">Let’s make yours <ArrowUpRight size={15} /></a>
      </div>

      <DialogPrimitive.Root open={current !== null} onOpenChange={(o) => !o && setOpenIndex(null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="lightbox-overlay" />
          <DialogPrimitive.Content className="lightbox" onKeyDown={onKey} onCloseAutoFocus={(event) => { event.preventDefault(); opener.current?.focus(); }} aria-describedby={undefined} data-testid="lightbox">
            {current && openIndex !== null && (
              <>
                <div className="lightbox-bar">
                  <span className="lightbox-counter" data-testid="text-lightbox-counter">{pad(openIndex + 1)} / {pad(visible.length)}</span>
                  <div className="lightbox-meta">
                    <span className="eyebrow">{labelOf(current)}</span>
                    <DialogPrimitive.Title className="font-display">{current.title}</DialogPrimitive.Title>
                  </div>
                  <DialogPrimitive.Close className="lightbox-btn" aria-label="Close photograph viewer" data-testid="button-lightbox-close">
                    <X size={20} />
                  </DialogPrimitive.Close>
                </div>
                <figure className="lightbox-stage">
                  <img key={current.id} src={current.image} srcSet={current.srcSet} sizes="92vw" width={current.width} height={current.height} alt={current.alt} />
                </figure>
                {visible.length > 1 && (
                  <div className="lightbox-nav">
                    <button type="button" className="lightbox-btn" onClick={() => step(-1)} aria-label="Previous photograph" data-testid="button-lightbox-prev"><ArrowLeft size={20} /></button>
                    <span className="lightbox-hint">Use arrow keys to browse</span>
                    <button type="button" className="lightbox-btn" onClick={() => step(1)} aria-label="Next photograph" data-testid="button-lightbox-next"><ArrowRight size={20} /></button>
                  </div>
                )}
              </>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
