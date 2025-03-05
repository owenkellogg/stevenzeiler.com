'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Formik, Form, Field, FormikErrors, FormikTouched } from 'formik';
import * as Yup from 'yup';
import { Organization } from '@/types/database';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const organizationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  description: Yup.string(),
  website: Yup.string().url('Must be a valid URL'),
});

export default function OrganizationsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkUserAndLoadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.email !== 'me@stevenzeiler.com') {
        router.push('/');
        return;
      }

      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name');

      if (!error && data) {
        setOrganizations(data);
      }

      setIsLoading(false);
    };

    checkUserAndLoadData();
  }, [router, supabase]);

  const handleSubmit = async (values: Partial<Organization>, { resetForm }: any) => {
    if (editingId) {
      const { error } = await supabase
        .from('organizations')
        .update(values)
        .eq('id', editingId);

      if (!error) {
        setOrganizations(organizations.map(org => 
          org.id === editingId ? { ...org, ...values } : org
        ));
        setEditingId(null);
      }
    } else {
      const { data, error } = await supabase
        .from('organizations')
        .insert(values)
        .select()
        .single();

      if (!error && data) {
        setOrganizations([...organizations, data]);
      }
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (organization: Organization) => {
    setEditingId(organization.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this organization?')) return;

    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (!error) {
      setOrganizations(organizations.filter(org => org.id !== id));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-forest-950 to-earth-950 text-earth-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-950 to-earth-950 text-earth-50 p-8">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-4xl mx-auto space-y-8"
      >
        <motion.div variants={fadeInUp} className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-earth-100">Organizations</h1>
          <button
            onClick={() => {
              setEditingId(null);
              setShowForm(!showForm);
            }}
            className="bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-4 py-2 rounded transition-colors"
          >
            {showForm ? 'Cancel' : 'Add Organization'}
          </button>
        </motion.div>

        {/* Form Section */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="initial"
              className="bg-forest-900/50 backdrop-blur-sm rounded-lg p-6 border border-forest-800"
            >
              <Formik
                initialValues={
                  editingId 
                    ? organizations.find(org => org.id === editingId) || {
                        name: '',
                        description: '',
                        website: '',
                      }
                    : {
                        name: '',
                        description: '',
                        website: '',
                      }
                }
                validationSchema={organizationSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched }: { 
                  errors: FormikErrors<Partial<Organization>>;
                  touched: FormikTouched<Partial<Organization>>;
                }) => (
                  <Form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <Field
                        name="name"
                        className="w-full bg-forest-800 rounded p-2 text-earth-50"
                      />
                      {errors.name && touched.name && (
                        <div className="text-red-500 text-sm mt-1">{errors.name}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Field
                        name="description"
                        as="textarea"
                        className="w-full bg-forest-800 rounded p-2 text-earth-50 h-32"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Website</label>
                      <Field
                        name="website"
                        className="w-full bg-forest-800 rounded p-2 text-earth-50"
                      />
                      {errors.website && touched.website && (
                        <div className="text-red-500 text-sm mt-1">{errors.website}</div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-4 py-2 rounded transition-colors"
                      >
                        {editingId ? 'Update' : 'Create'} Organization
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Organizations List */}
        <motion.div variants={fadeInUp} className="space-y-4">
          {organizations.map((organization) => (
            <motion.div
              key={organization.id}
              variants={fadeInUp}
              className="bg-forest-900/50 backdrop-blur-sm rounded-lg p-6 border border-forest-800"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-earth-100">{organization.name}</h2>
                  {organization.website && (
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-leaf-400 hover:text-leaf-300 text-sm"
                    >
                      {organization.website}
                    </a>
                  )}
                  {organization.description && (
                    <p className="text-earth-300 mt-2">{organization.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(organization)}
                    className="text-leaf-400 hover:text-leaf-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(organization.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
} 