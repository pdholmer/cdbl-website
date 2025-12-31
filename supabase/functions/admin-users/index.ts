import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verify the caller is authenticated and is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      console.error('Role check error:', roleError);
      return new Response(JSON.stringify({ error: 'Unauthorized - Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const userId = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;

    // GET - List all users or get single user
    if (req.method === 'GET') {
      if (userId && userId !== 'admin-users') {
        // Get single user
        const { data: authUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        if (userError || !authUser.user) {
          return new Response(JSON.stringify({ error: 'User not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        const { data: roles } = await supabaseAdmin
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        const { count: feedbackCount } = await supabaseAdmin
          .from('platform_feedback')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        const { data: feedback } = await supabaseAdmin
          .from('platform_feedback')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        return new Response(JSON.stringify({
          user: {
            id: authUser.user.id,
            email: authUser.user.email,
            display_name: profile?.display_name || authUser.user.email?.split('@')[0],
            avatar_url: profile?.avatar_url,
            created_at: authUser.user.created_at,
            last_sign_in_at: authUser.user.last_sign_in_at,
            roles: roles?.map(r => r.role) || [],
            feedback_count: feedbackCount || 0,
            feedback: feedback || [],
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // List all users
      const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error('List users error:', listError);
        return new Response(JSON.stringify({ error: 'Failed to list users' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get all profiles
      const { data: profiles } = await supabaseAdmin.from('profiles').select('*');
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Get all roles
      const { data: allRoles } = await supabaseAdmin.from('user_roles').select('user_id, role');
      const rolesMap = new Map<string, string[]>();
      allRoles?.forEach(r => {
        const existing = rolesMap.get(r.user_id) || [];
        existing.push(r.role);
        rolesMap.set(r.user_id, existing);
      });

      // Get feedback counts
      const { data: feedbackCounts } = await supabaseAdmin
        .from('platform_feedback')
        .select('user_id');
      
      const feedbackCountMap = new Map<string, number>();
      feedbackCounts?.forEach(f => {
        feedbackCountMap.set(f.user_id, (feedbackCountMap.get(f.user_id) || 0) + 1);
      });

      const users = authUsers.users.map(u => {
        const profile = profileMap.get(u.id);
        return {
          id: u.id,
          email: u.email,
          display_name: profile?.display_name || u.email?.split('@')[0],
          avatar_url: profile?.avatar_url,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          roles: rolesMap.get(u.id) || [],
          feedback_count: feedbackCountMap.get(u.id) || 0,
        };
      });

      console.log(`Returning ${users.length} users`);
      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE - Delete a user
    if (req.method === 'DELETE' && userId) {
      // Prevent self-deletion
      if (userId === user.id) {
        return new Response(JSON.stringify({ error: 'Cannot delete your own account' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (deleteError) {
        console.error('Delete user error:', deleteError);
        return new Response(JSON.stringify({ error: 'Failed to delete user' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`User ${userId} deleted by ${user.email}`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST - Invite new user
    if (req.method === 'POST') {
      const body = await req.json();
      const { email, roles: newRoles } = body;

      if (!email) {
        return new Response(JSON.stringify({ error: 'Email is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
      
      if (inviteError) {
        console.error('Invite user error:', inviteError);
        return new Response(JSON.stringify({ error: inviteError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Add roles if specified
      if (newRoles && newRoles.length > 0 && inviteData.user) {
        for (const role of newRoles) {
          await supabaseAdmin.from('user_roles').insert({
            user_id: inviteData.user.id,
            role: role,
          });
        }
      }

      console.log(`User ${email} invited by ${user.email}`);
      return new Response(JSON.stringify({ success: true, user: inviteData.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PATCH - Update user roles
    if (req.method === 'PATCH' && userId) {
      const body = await req.json();
      const { roles: newRoles, display_name } = body;

      // Update profile if display_name provided
      if (display_name !== undefined) {
        await supabaseAdmin
          .from('profiles')
          .update({ display_name, updated_at: new Date().toISOString() })
          .eq('id', userId);
      }

      // Update roles if provided
      if (newRoles !== undefined) {
        // Prevent removing own admin role
        if (userId === user.id && !newRoles.includes('admin')) {
          return new Response(JSON.stringify({ error: 'Cannot remove your own admin role' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Delete existing roles
        await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);
        
        // Insert new roles
        for (const role of newRoles) {
          await supabaseAdmin.from('user_roles').insert({
            user_id: userId,
            role: role,
          });
        }
      }

      console.log(`User ${userId} updated by ${user.email}`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
