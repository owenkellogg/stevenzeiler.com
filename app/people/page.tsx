'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Formik, Form, Field, FormikErrors, FormikTouched } from 'formik';
import * as Yup from 'yup';
import { Person, Organization } from '@/types/database';

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

const personSchema = Yup.object().shape({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string(),
  email: Yup.string().email('Invalid email').nullable(),
  phone: Yup.string(),
  title: Yup.string(),
  organization_id: Yup.string().nullable(),
  avatar_url: Yup.string().url('Must be a valid URL').nullable(),
  social_media: Yup.object(),
  relationship_type: Yup.array().of(Yup.string()),
});

export default function PeoplePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [people, setPeople] = useState<Person[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const [peopleResponse, orgsResponse] = await Promise.all([
        supabase
          .from('people')
          .select(`
            *,
            organization:organizations (
              id,
              name
            )
          `)
          .order('last_name'),
        supabase
          .from('organizations')
          .select('*')
          .order('name')
      ]);

      if (!peopleResponse.error && peopleResponse.data) {
        setPeople(peopleResponse.data);
      }

      if (!orgsResponse.error && orgsResponse.data) {
        setOrganizations(orgsResponse.data);
      }

      setIsLoading(false);
    };

    checkUserAndLoadData();
  }, [router, supabase]);

  const handleSubmit = async (values: Partial<Person>, { resetForm, setSubmitting }: any) => {
    console.log('Form submitted with values:', values);
    setError(null);
    setSubmitting(true);

    try {
      // Ensure relationship_type is an array and remove undefined values
      const formattedValues = Object.entries({
        ...values,
        relationship_type: values.relationship_type || [],
        social_media: values.social_media || {}
      }).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      console.log('Formatted values:', formattedValues);

      if (editingId) {
        console.log('Updating person with ID:', editingId);
        const { error: updateError } = await supabase
          .from('people')
          .update(formattedValues)
          .eq('id', editingId);

        if (updateError) {
          console.error('Error updating person:', updateError);
          setError(updateError.message);
          setSubmitting(false);
          return;
        }

        console.log('Update successful, fetching updated record');
        // Fetch the updated record with organization details
        const { data: updatedPerson, error: fetchError } = await supabase
          .from('people')
          .select(`
            *,
            organization:organizations (
              id,
              name
            )
          `)
          .eq('id', editingId)
          .single();

        if (fetchError) {
          console.error('Error fetching updated person:', fetchError);
          setError(fetchError.message);
          setSubmitting(false);
          return;
        }

        console.log('Updated person data:', updatedPerson);
        if (updatedPerson) {
          setPeople(prevPeople => 
            prevPeople.map(person => 
              person.id === editingId ? updatedPerson : person
            )
          );
          setEditingId(null);
          setShowForm(false);
          resetForm();
        }
      } else {
        const { data: newPerson, error: insertError } = await supabase
          .from('people')
          .insert(formattedValues)
          .select(`
            *,
            organization:organizations (
              id,
              name
            )
          `)
          .single();

        if (insertError) {
          console.error('Error creating person:', insertError);
          setError(insertError.message);
          return;
        }

        if (newPerson) {
          setPeople([...people, newPerson]);
          resetForm();
          setShowForm(false);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (person: Person) => {
    setEditingId(person.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this person?')) return;

    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', id);

    if (!error) {
      setPeople(people.filter(person => person.id !== id));
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
        {error && (
          <motion.div
            variants={fadeInUp}
            className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded"
          >
            {error}
          </motion.div>
        )}
        <motion.div variants={fadeInUp} className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-earth-100">People</h1>
          <button
            onClick={() => {
              setEditingId(null);
              setShowForm(!showForm);
            }}
            className="bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-4 py-2 rounded transition-colors"
          >
            {showForm ? 'Cancel' : 'Add Person'}
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
                    ? people.find(person => person.id === editingId) || {
                        first_name: '',
                        last_name: '',
                        email: '',
                        phone: '',
                        title: '',
                        organization_id: '',
                        avatar_url: '',
                        social_media: {},
                        relationship_type: [],
                      }
                    : {
                        first_name: '',
                        last_name: '',
                        email: '',
                        phone: '',
                        title: '',
                        organization_id: '',
                        avatar_url: '',
                        social_media: {},
                        relationship_type: [],
                      }
                }
                validationSchema={personSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name</label>
                        <Field
                          name="first_name"
                          className="w-full bg-forest-800 rounded p-2 text-earth-50"
                        />
                        {errors.first_name && touched.first_name && (
                          <div className="text-red-500 text-sm mt-1">{errors.first_name}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name</label>
                        <Field
                          name="last_name"
                          className="w-full bg-forest-800 rounded p-2 text-earth-50"
                        />
                        {errors.last_name && touched.last_name && (
                          <div className="text-red-500 text-sm mt-1">{errors.last_name}</div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <Field
                          name="email"
                          type="email"
                          className="w-full bg-forest-800 rounded p-2 text-earth-50"
                        />
                        {errors.email && touched.email && (
                          <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <Field
                          name="phone"
                          className="w-full bg-forest-800 rounded p-2 text-earth-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Title</label>
                        <Field
                          name="title"
                          className="w-full bg-forest-800 rounded p-2 text-earth-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Organization</label>
                        <Field
                          as="select"
                          name="organization_id"
                          className="w-full bg-forest-800 rounded p-2 text-earth-50"
                        >
                          <option value="">No Organization</option>
                          {organizations.map((org) => (
                            <option key={org.id} value={org.id}>
                              {org.name}
                            </option>
                          ))}
                        </Field>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Avatar URL</label>
                      <Field
                        name="avatar_url"
                        className="w-full bg-forest-800 rounded p-2 text-earth-50"
                      />
                      {errors.avatar_url && touched.avatar_url && (
                        <div className="text-red-500 text-sm mt-1">{errors.avatar_url}</div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        onClick={() => {
                          if (isSubmitting) {
                            return;
                          }
                        }}
                        className={`bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-4 py-2 rounded transition-colors ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmitting 
                          ? (editingId ? 'Updating...' : 'Creating...') 
                          : (editingId ? 'Update Person' : 'Create Person')
                        }
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </motion.div>
          )}
        </AnimatePresence>

        {/* People List */}
        <motion.div variants={fadeInUp} className="space-y-4">
          {people.map((person) => (
            <motion.div
              key={person.id}
              variants={fadeInUp}
              className="bg-forest-900/50 backdrop-blur-sm rounded-lg p-6 border border-forest-800"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  {person.avatar_url && (
                    <img
                      src={person.avatar_url}
                      alt={`${person.first_name} ${person.last_name}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-earth-100">
                      {person.first_name} {person.last_name}
                    </h2>
                    {person.title && (
                      <p className="text-earth-300">{person.title}</p>
                    )}
                    {person.organization && (
                      <p className="text-leaf-400">{person.organization.name}</p>
                    )}
                    <div className="mt-2 space-y-1">
                      <p className="text-earth-300 text-sm">{person.email}</p>
                      {person.phone && (
                        <p className="text-earth-300 text-sm">{person.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(person)}
                    className="text-leaf-400 hover:text-leaf-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(person.id)}
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