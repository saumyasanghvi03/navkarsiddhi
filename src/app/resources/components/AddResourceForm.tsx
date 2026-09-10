'use client';

import { FormEvent, useState } from 'react';
import ContributorConfirmation from './ContributorConfirmation';

type SubmitResult = {
  contributorNumber: number;
  contributorName: string;
};

const initialFormState = {
  name: '',
  contributorNumber: '',
  title: '',
  url: '',
  honeypot: '',
};

export default function AddResourceForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<SubmitResult | null>(null);
  const [formState, setFormState] = useState(initialFormState);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/resources/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      const body = (await response.json()) as
        | { contributorNumber: number; contributorName: string }
        | { error: string };

      if ('error' in body) {
        setError(body.error || 'Unable to submit this resource. Please try again.');
        return;
      }

      if (!response.ok) {
        setError('Unable to submit this resource. Please try again.');
        return;
      }

      setSuccess({
        contributorNumber: body.contributorNumber,
        contributorName: body.contributorName,
      });
      setFormState(initialFormState);
    } catch {
      setError('Unable to submit this resource. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-10 border-t border-orange-200 pt-8">
      <h2 className="text-lg font-serif font-semibold text-orange-900">Have a Jain Resource to Share?</h2>
      <p className="mt-1 text-sm text-gray-600">Help us grow the collection.</p>

      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mt-4 inline-flex items-center rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
        >
          Add a Resource
        </button>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 space-y-3 rounded-lg border border-orange-100 bg-white p-4">
          <div>
            <label htmlFor="resource-name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="resource-name"
              type="text"
              placeholder="Your name (optional)"
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
            />
          </div>

          <div>
            <label htmlFor="resource-contributor-number" className="block text-sm font-medium text-gray-700">
              Contributor Number (optional)
            </label>
            <input
              id="resource-contributor-number"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 000127"
              value={formState.contributorNumber}
              onChange={(event) => setFormState((prev) => ({ ...prev, contributorNumber: event.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
            />
          </div>

          <div>
            <label htmlFor="resource-title" className="block text-sm font-medium text-gray-700">
              Resource Title
            </label>
            <input
              id="resource-title"
              type="text"
              placeholder="Enter resource title"
              value={formState.title}
              onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
              required
            />
          </div>

          <div>
            <label htmlFor="resource-link" className="block text-sm font-medium text-gray-700">
              Link
            </label>
            <input
              id="resource-link"
              type="url"
              placeholder="https://..."
              value={formState.url}
              onChange={(event) => setFormState((prev) => ({ ...prev, url: event.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
              required
            />
          </div>

          <div className="hidden" aria-hidden="true">
            <label htmlFor="resource-company">Company</label>
            <input
              id="resource-company"
              type="text"
              autoComplete="off"
              tabIndex={-1}
              value={formState.honeypot}
              onChange={(event) => setFormState((prev) => ({ ...prev, honeypot: event.target.value }))}
            />
          </div>

          <p className="text-xs text-gray-500">
            Your name may be displayed as a contributor if your resource is approved.
          </p>
          <p className="text-xs text-gray-500">
            To help prevent spam and abuse, your IP address may be securely recorded with this submission.
          </p>

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Resource'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setError('');
                setSuccess(null);
              }}
              className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
            >
              Cancel
            </button>
          </div>

          {success && (
            <ContributorConfirmation
              contributorNumber={success.contributorNumber}
              contributorName={success.contributorName}
            />
          )}
        </form>
      )}
    </section>
  );
}
