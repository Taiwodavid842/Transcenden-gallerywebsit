import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { gallery, galleryFilters } from '@/data/portfolio';

export function PortfolioGallery() {
  const [filter, setFilter] = useState('All work');
  const visibleGallery = gallery.filter(
    (item) => filter === 'All work' || item.kind === filter,
  );

  return (
    <>
      <div className="gallery-toolbar" role="group" aria-label="Filter photographs">
        <span className="eyebrow">Browse by</span>
        {galleryFilters.map((item) => (
          <button
            type="button"
            key={item}
            className={`filter-button ${filter === item ? 'active' : ''}`}
            onClick={() => setFilter(item)}
            aria-pressed={filter === item}
            data-testid={`gallery-filter-${item.toLowerCase().replaceAll(' ', '-')}`}
          >
            {item}
          </button>
        ))}
        <span className="gallery-count">{`0${visibleGallery.length} STORIES`}</span>
      </div>
      <div className="gallery-grid" data-testid="photography-gallery">
        {visibleGallery.map((item, index) => (
          <article
            key={item.title}
            className={`gallery-item gallery-${item.size}`}
            data-testid={`gallery-item-${index}`}
          >
            <div className="gallery-image-wrap">
              <img src={item.image} alt={item.title} loading="lazy" />
              <span className="gallery-image-index">{`0${index + 1}`}</span>
              <span className="gallery-open" aria-hidden="true">
                <ArrowUpRight size={19} />
              </span>
            </div>
            <div className="gallery-caption">
              <div>
                <span className="eyebrow">{item.kind}</span>
                <h3 className="font-display">{item.title}</h3>
              </div>
              <span className="caption-arrow" aria-hidden="true">
                <ArrowUpRight size={17} />
              </span>
            </div>
          </article>
        ))}
      </div>
      <div className="gallery-foot">
        <span>Every frame has a story. These are a few of ours.</span>
        <a href="#contact">
          Let’s make yours <ArrowUpRight size={15} />
        </a>
      </div>
    </>
  );
}
