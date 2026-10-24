import { useState, type FormEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
  useCreateContactMessage,
  type ContactMessageInput,
} from '@workspace/api-client-react';

export function ContactForm() {
  const createContactMessage = useCreateContactMessage();
  const [feedback, setFeedback] = useState<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (createContactMessage.isPending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const projectType = String(formData.get('project') ?? '') as ContactMessageInput['projectType'];
    const data: ContactMessageInput = {
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      projectType,
      message: String(formData.get('message') ?? '').trim(),
    };

    setFeedback(null);
    createContactMessage.mutate(
      { data },
      {
        onSuccess: () => {
          setFeedback({
            kind: 'success',
            message: 'Thanks — your message was saved. We have your inquiry.',
          });
          form.reset();
        },
        onError: () => {
          setFeedback({
            kind: 'error',
            message:
              'We could not save your message. Please check your details and try again shortly. Your message has not been saved.',
          });
        },
      },
    );
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
      <button
        className="button-dark form-submit"
        type="submit"
        disabled={createContactMessage.isPending}
        data-testid="contact-submit"
      >
        {createContactMessage.isPending ? 'Saving your note…' : 'Prepare your note'}
        <ArrowUpRight size={16} />
      </button>
      {feedback && (
        <p
          className={`form-feedback ${feedback.kind === 'error' ? 'is-error' : ''}`}
          role={feedback.kind === 'error' ? 'alert' : 'status'}
          data-testid={`contact-form-${feedback.kind}`}
          aria-live={feedback.kind === 'error' ? 'assertive' : 'polite'}
        >
          {feedback.message}
        </p>
      )}
    </form>
  );
}
