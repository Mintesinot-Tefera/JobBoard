import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/useAuth';

function ProfileRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="profile-row">
      <span className="profile-label">{label}</span>
      {value ? (
        <span className="profile-value">{value}</span>
      ) : (
        <span className="profile-empty">Not set</span>
      )}
    </div>
  );
}

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: user?.name ?? '',
    headline: user?.headline ?? '',
    bio: user?.bio ?? '',
    location: user?.location ?? '',
    website: user?.website ?? '',
  });

  if (!user) return null;

  const startEditing = () => {
    setForm({
      name: user.name,
      headline: user.headline ?? '',
      bio: user.bio ?? '',
      location: user.location ?? '',
      website: user.website ?? '',
    });
    setError(null);
    setSuccess(false);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await updateProfile(form);
      setIsEditing(false);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <h1 style={{ margin: 0 }}>Profile</h1>
          {!isEditing && <button onClick={startEditing}>Edit</button>}
        </div>

        {success && !isEditing && (
          <div className="alert-success" style={{ marginBottom: '1rem' }}>
            Profile updated successfully.
          </div>
        )}

        {isEditing ? (
          <form className="form" onSubmit={handleSubmit}>
            {error && (
              <div className="alert-error" role="alert">
                {error}
              </div>
            )}

            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange('name')}
              />
            </div>

            <div className="form-field">
              <label htmlFor="headline">Headline</label>
              <input
                id="headline"
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                value={form.headline}
                onChange={handleChange('headline')}
              />
            </div>

            <div className="form-field">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                rows={4}
                value={form.bio}
                onChange={handleChange('bio')}
              />
            </div>

            <div className="form-field">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                value={form.location}
                onChange={handleChange('location')}
              />
            </div>

            <div className="form-field">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                type="url"
                placeholder="https://example.com"
                value={form.website}
                onChange={handleChange('website')}
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                className="secondary"
                onClick={cancelEditing}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-section">
            <ProfileRow label="Email" value={user.email} />
            <ProfileRow label="Name" value={user.name} />
            <ProfileRow label="Headline" value={user.headline} />
            <ProfileRow label="Bio" value={user.bio} />
            <ProfileRow label="Location" value={user.location} />
            <ProfileRow label="Website" value={user.website} />
          </div>
        )}
      </div>
    </div>
  );
}
