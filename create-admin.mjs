import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSuperAdmin() {
  console.log('Registering admin@adyel.com...');
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@adyel.com',
    password: 'SuperAdmin123!',
    options: {
      data: {
        firstName: 'Super',
        lastName: 'Admin',
        classYear: '2016',
        profession: 'System Administrator'
      }
    }
  });

  if (error) {
    console.error('Failed to sign up:', error.message);
    // If it says user already exists, let's try to log in and upgrade them anyway
    if (error.message.includes('already registered')) {
        const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
            email: 'admin@adyel.com',
            password: 'SuperAdmin123!'
        });
        if (loginErr) {
            console.error('Failed to login:', loginErr.message);
            return;
        }
        await upgradeUser(loginData.user.id);
    }
    return;
  }

  console.log('User registered! ID:', data.user.id);
  
  // Wait a second for the Postgres trigger to create the row in public.users
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await upgradeUser(data.user.id);
}

async function upgradeUser(userId) {
  console.log('Upgrading role to SUPER_ADMIN...');
  const { data: updateData, error: updateError } = await supabase
    .from('users')
    .update({ role: 'SUPER_ADMIN' })
    .eq('id', userId)
    .select();

  if (updateError) {
    console.error('Failed to update role:', updateError.message);
  } else {
    console.log('Successfully upgraded user to SUPER_ADMIN!');
    console.log(updateData);
  }
}

createSuperAdmin();
