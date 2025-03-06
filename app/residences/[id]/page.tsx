
'use client';

import { motion } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Residence {
  id: string;
  name: string;
  location: string;
  description: string;
  images: string[];
  capacity: number;
  amenities: string[];
  status: 'current' | 'target';
  estimated_cost: number | null;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function ResidenceDetailsPage() {

  const params = useParams();

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [residence, setResidence] = useState<Residence | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Residence>>({});

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkUserAndLoadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const isAdminUser = user?.email === 'me@stevenzeiler.com';
      setIsAdmin(isAdminUser);

      const { data: residence, error } = await supabase
        .from('residences')
        .select('*')
        .eq('id', params?.id as string)
        .single();

      if (error || !residence) {
        router.push('/residences');
        return;
      }

      if (!isAdminUser && residence.status !== 'current') {
        router.push('/residences');
        return;
      }

      setResidence(residence);
      setEditForm(residence);
      setIsLoading(false);
    };

    checkUserAndLoadData();
  }, [params?.id, router, supabase]);

  const handleUpdate = async () => {
    if (!residence || !editForm) return;

    const { error } = await supabase
      .from('residences')
      .update(editForm)
      .eq('id', residence.id);

    if (error) {
      console.error('Error updating residence:', error);
      return;
    }

    setResidence({ ...residence, ...editForm });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!residence || !confirm('Are you sure you want to delete this residence?')) return;

    const { error } = await supabase
      .from('residences')
      .delete()
      .eq('id', residence.id);

    if (error) {
      console.error('Error deleting residence:', error);
      return;
    }

    router.push('/residences');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!residence) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <motion.div
        initial="initial"
        animate="animate"
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="flex justify-between items-center">
          <Link
            href="/residences"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
          >
            ← Back to Residences
          </Link>
          {isAdmin && (
            <div className="space-x-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              {!isEditing && (
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        <motion.div
          variants={fadeInUp}
          className="bg-gray-900 rounded-lg p-8 space-y-6"
        >
          {isEditing ? (
            // Edit Form
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-gray-800 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={editForm.location || ''}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full bg-gray-800 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-gray-800 rounded p-2 text-white h-32"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Capacity</label>
                <input
                  type="number"
                  value={editForm.capacity || ''}
                  onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) })}
                  className="w-full bg-gray-800 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={editForm.status || 'current'}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'current' | 'target' })}
                  className="w-full bg-gray-800 rounded p-2 text-white"
                >
                  <option value="current">Current</option>
                  <option value="target">Target</option>
                </select>
              </div>
              {editForm.status === 'target' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Estimated Cost</label>
                    <input
                      type="number"
                      value={editForm.estimated_cost || ''}
                      onChange={(e) => setEditForm({ ...editForm, estimated_cost: parseFloat(e.target.value) })}
                      className="w-full bg-gray-800 rounded p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Date</label>
                    <input
                      type="date"
                      value={editForm.target_date || ''}
                      onChange={(e) => setEditForm({ ...editForm, target_date: e.target.value })}
                      className="w-full bg-gray-800 rounded p-2 text-white"
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            // Display View
            <>
              <h1 className="text-3xl font-bold">{residence.name}</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">Location</h2>
                    <p className="text-gray-400">{residence.location}</p>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Description</h2>
                    <p className="text-gray-400">{residence.description}</p>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Capacity</h2>
                    <p className="text-gray-400">{residence.capacity} people</p>
                  </div>
                  {residence.amenities && residence.amenities.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold">Amenities</h2>
                      <ul className="list-disc list-inside text-gray-400">
                        {residence.amenities.map((amenity, index) => (
                          <li key={index}>{amenity}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {residence.status === 'target' && (
                    <>
                      <div>
                        <h2 className="text-xl font-semibold">Estimated Cost</h2>
                        <p className="text-gray-400">
                          ${residence.estimated_cost?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Target Date</h2>
                        <p className="text-gray-400">
                          {new Date(residence.target_date!).toLocaleDateString()}
                        </p>
                      </div>
                    </>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold">Status</h2>
                    <p className={`inline-block px-2 py-1 rounded ${
                      residence.status === 'current'
                        ? 'bg-green-600'
                        : 'bg-blue-600'
                    }`}>
                      {residence.status.charAt(0).toUpperCase() + residence.status.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
} 