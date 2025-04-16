import { supabase } from './supabase';
import type { Session, Registration, Payment, Message, Conversation, Profile, Crew, CrewAssignment } from './types';

export async function fetchSessions() {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('start_date', { ascending: true });

  if (error) throw error;
  return data as Session[];
}

export async function fetchUserRegistrations(userId: string) {
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      session:sessions(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as (Registration & { session: Session })[];
}

export async function createRegistration(sessionId: string, userId: string) {
  const { data, error } = await supabase
    .from('registrations')
    .insert([
      { session_id: sessionId, user_id: userId }
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Registration;
}

export async function createPayment(registrationId: string, amount: number) {
  const { data, error } = await supabase
    .from('payments')
    .insert([
      { registration_id: registrationId, amount }
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Payment;
}

export async function updatePaymentStatus(
  paymentId: string,
  status: Payment['status'],
  stripePaymentIntentId?: string
) {
  const { data, error } = await supabase
    .from('payments')
    .update({
      status,
      stripe_payment_intent_id: stripePaymentIntentId
    })
    .eq('id', paymentId)
    .select()
    .single();

  if (error) throw error;
  return data as Payment;
}

export async function updateRegistrationStatus(
  registrationId: string,
  status: Registration['status'],
  paymentStatus: Registration['payment_status']
) {
  const { data, error } = await supabase
    .from('registrations')
    .update({
      status,
      payment_status: paymentStatus
    })
    .eq('id', registrationId)
    .select()
    .single();

  if (error) throw error;
  return data as Registration;
}

export async function fetchConversations(userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      participants:conversation_participants!inner(
        user_id,
        joined_at,
        last_read_at,
        profile:profiles(*)
      ),
      last_message:messages(
        *,
        sender:profiles(*)
      )
    `)
    .eq('participants.user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1, { foreignTable: 'messages' });

  if (error) throw error;
  return data as Conversation[];
}

export async function fetchMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles(*)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Message[];
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      { conversation_id: conversationId, sender_id: senderId, content }
    ])
    .select(`
      *,
      sender:profiles(*)
    `)
    .single();

  if (error) throw error;
  return data as Message;
}

export async function createDirectConversation(userId1: string, userId2: string) {
  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .insert([
      { type: 'direct' }
    ])
    .select()
    .single();

  if (conversationError) throw conversationError;

  const { error: participantsError } = await supabase
    .from('conversation_participants')
    .insert([
      { conversation_id: conversation.id, user_id: userId1 },
      { conversation_id: conversation.id, user_id: userId2 }
    ]);

  if (participantsError) throw participantsError;

  return conversation as Conversation;
}

export async function createGroupConversation(name: string, participantIds: string[]) {
  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .insert([
      { type: 'group', name }
    ])
    .select()
    .single();

  if (conversationError) throw conversationError;

  const participants = participantIds.map(userId => ({
    conversation_id: conversation.id,
    user_id: userId
  }));

  const { error: participantsError } = await supabase
    .from('conversation_participants')
    .insert(participants);

  if (participantsError) throw participantsError;

  return conversation as Conversation;
}

export async function updateLastRead(conversationId: string, userId: string) {
  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function fetchUserCrews(userId: string) {
  const { data, error } = await supabase
    .from('crew_assignments')
    .select(`
      *,
      crew:crews(
        *,
        session:sessions(*),
        assignments:crew_assignments(
          *,
          profile:profiles(*)
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as (CrewAssignment & { crew: Crew })[];
}

export async function updateCrewAssignmentStatus(
  crewId: string,
  userId: string,
  status: CrewAssignment['status']
) {
  const { data, error } = await supabase
    .from('crew_assignments')
    .update({ status })
    .eq('crew_id', crewId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as CrewAssignment;
}