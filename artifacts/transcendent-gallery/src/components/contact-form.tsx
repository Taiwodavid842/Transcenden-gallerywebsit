import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';

export function ContactForm() {
  const [formNotice, setFormNotice] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormNotice(true);
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit} data-testid="contact-form">
      <p className="form-note">
        <span className="form-dot" />
        A good first hello is all we need.
      </p>
      <label>
        Your name
        <input
          name="name"
          type="text"
          placeholder="What should we call you?"
          required
          data-testid="contact-name"
        />
      </label>
      <label>
        Email address
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          data-testid="contact-email"
        />
      </label>
      <label>
        What are you thinking about?
        <select name="project" defaultValue="" required data-testid="contact-project">
          <option value="" disabled>
            Choose what feels closest
          </option>
          <option>Portrait session</option>
          <option>Wedding or engagement</option>
          <option>Event photography</option>
          <option>Something else</option>
        </select>
      </label>
      <label>
        A little more about it
        <textarea
          name="message"
          rows={3}
          placeholder="A date, a feeling, a question — anything goes."
          required
          data-testid="contact-message"
        />
      </label>
      <button className="button-dark form-submit" type="submit" data-testid="contact-submit">
        Prepare your note <ArrowUpRight size={16} />
      </button>
      <p className="form-disclaimer" role="note">
        <Check size={13} />
        This form is a preview and is not connected yet. It won’t send or save your message.
      </p>
      {formNotice && (
        <p className="form-feedback" role="status" data-testid="contact-form-notice">
          Thanks for sharing your details. The contact form is not connected, so your message
          has not been sent or saved. Please contact Transcendent Gallery directly.
        </p>
      )}
    </form>
  );
}
