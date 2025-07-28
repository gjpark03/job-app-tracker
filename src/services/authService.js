import { supabase } from '../supabaseClient';

export const authService = {
    // Check for existing user session
    async checkUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            return user;
        } catch (error) {
            console.error('Error checking user:', error);
            return null;
        }
    },

    // Sign in with email and password
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return { user: data.user, error: null };
        } catch (error) {
            return { user: null, error: error.message };
        }
    },

    // Sign up with email and password
    async signUp(email, password) {
        try {
            // Validate input
            if (!email || !password) {
                return { user: null, error: 'Please fill in all fields' };
            }

            if (password.length < 6) {
                return { user: null, error: 'Password must be at least 6 characters' };
            }

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            return { user: data.user, error: null };
        } catch (error) {
            return { user: null, error: error.message };
        }
    },

    // Sign out user
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Error signing out:', error);
            return { error: error.message };
        }
    },

    // Validate sign up form
    validateSignUp(email, password, confirmPassword) {
        if (!email || !password || !confirmPassword) {
            return 'Please fill in all fields';
        }

        if (password !== confirmPassword) {
            return 'Passwords do not match';
        }

        if (password.length < 6) {
            return 'Password must be at least 6 characters';
        }

        return null;
    }
}; 