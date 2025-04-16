
import { supabase } from "@/integrations/supabase/client";
import { Session, Registration, Payment, Package, UserPackage } from "@/types/rowing";
import { toast } from "sonner";

// Session functions
export async function getSessions() {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('start_time', { ascending: true });
      
    if (error) throw error;
    return data as Session[];
  } catch (error) {
    console.error("Error fetching sessions:", error);
    toast.error("Failed to load sessions");
    return [];
  }
}

export async function getUpcomingSessions() {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });
      
    if (error) throw error;
    return data as Session[];
  } catch (error) {
    console.error("Error fetching upcoming sessions:", error);
    toast.error("Failed to load upcoming sessions");
    return [];
  }
}

export async function registerForSession(sessionId: string) {
  try {
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
      
    if (sessionError) throw sessionError;
    
    const { data, error } = await supabase
      .from('registrations')
      .insert({
        session_id: sessionId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        status: 'registered'
      })
      .select()
      .single();
      
    if (error) throw error;
    
    toast.success("Successfully registered for session");
    return data as Registration;
  } catch (error: any) {
    console.error("Error registering for session:", error);
    if (error.code === '23505') {
      toast.error("You are already registered for this session");
    } else {
      toast.error("Failed to register for session");
    }
    throw error;
  }
}

export async function getUserRegistrations() {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        sessions:session_id(*)
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user registrations:", error);
    toast.error("Failed to load your registrations");
    return [];
  }
}

export async function cancelRegistration(registrationId: string) {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .update({ status: 'cancelled' })
      .eq('id', registrationId)
      .select()
      .single();
      
    if (error) throw error;
    
    toast.success("Successfully cancelled registration");
    return data as Registration;
  } catch (error) {
    console.error("Error cancelling registration:", error);
    toast.error("Failed to cancel registration");
    throw error;
  }
}

// Package functions
export async function getPackages() {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('price_cents', { ascending: true });
      
    if (error) throw error;
    return data as Package[];
  } catch (error) {
    console.error("Error fetching packages:", error);
    toast.error("Failed to load packages");
    return [];
  }
}

export async function getUserPackages() {
  try {
    const { data, error } = await supabase
      .from('user_packages')
      .select(`
        *,
        packages:package_id(*)
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user packages:", error);
    toast.error("Failed to load your packages");
    return [];
  }
}

// Payment functions
export async function createPayment(amount: number, type: Payment['payment_type'], metadata: any = {}) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        amount_cents: amount * 100,
        payment_type: type,
        status: 'pending',
        metadata
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return data as Payment;
  } catch (error) {
    console.error("Error creating payment:", error);
    toast.error("Failed to create payment");
    throw error;
  }
}

export async function purchasePackage(packageId: string) {
  try {
    // Get the package details
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single();
      
    if (packageError) throw packageError;
    const pkg = packageData as Package;
    
    // Create a payment
    const payment = await createPayment(
      pkg.price_cents / 100,
      'membership',
      { package_id: pkg.id }
    );
    
    // For demo purposes, we'll automatically set the payment to completed
    // In a real app, you would integrate with a payment processor
    await supabase
      .from('payments')
      .update({ status: 'completed' })
      .eq('id', payment.id);
    
    // Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + pkg.duration_weeks * 7);
    
    // Create user package
    const { data, error } = await supabase
      .from('user_packages')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        package_id: pkg.id,
        payment_id: payment.id,
        sessions_remaining: pkg.sessions_included,
        end_date: endDate.toISOString(),
        status: 'active'
      })
      .select()
      .single();
      
    if (error) throw error;
    
    toast.success(`Successfully purchased ${pkg.name}`);
    return data as UserPackage;
  } catch (error) {
    console.error("Error purchasing package:", error);
    toast.error("Failed to purchase package");
    throw error;
  }
}

export async function makeDonation(amount: number) {
  try {
    // Create a payment
    const payment = await createPayment(
      amount,
      'donation',
      { donation_amount: amount }
    );
    
    // For demo purposes, we'll automatically set the payment to completed
    // In a real app, you would integrate with a payment processor
    const { data, error } = await supabase
      .from('payments')
      .update({ status: 'completed' })
      .eq('id', payment.id)
      .select()
      .single();
      
    if (error) throw error;
    
    toast.success(`Thank you for your donation of $${amount}!`);
    return data as Payment;
  } catch (error) {
    console.error("Error making donation:", error);
    toast.error("Failed to process donation");
    throw error;
  }
}

// Utility functions
export function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
