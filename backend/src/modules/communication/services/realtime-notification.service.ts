import { supabase } from '../../../database';
import { normalizeUserWithProfile } from '../../../common/utils/profile.util';
import { DispatchNotificationPayload } from '../communication.types';

export class RealtimeNotificationService {
  /**
   * Persists a notification in `public.notifications` so both REST polling and
   * Supabase Realtime / Socket.IO listeners receive it reliably.
   */
  async dispatchNotification(payload: DispatchNotificationPayload) {
    if (payload.actorId && payload.actorId === payload.recipientId) {
      return null;
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        recipient_id: payload.recipientId,
        actor_id: payload.actorId || null,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        reference_url: payload.referenceUrl || null,
        is_read: false,
      })
      .select(
        `
        *,
        actor:users!notifications_actor_id_fkey(
          id,
          academic_profile:academic_profiles(full_name, avatar_url, student_code)
        )
      `
      )
      .single();

    if (error) {
      console.error('Failed to dispatch notification:', error.message);
      return null;
    }

    return {
      ...data,
      actor: normalizeUserWithProfile(data.actor),
    };
  }

  async listNotifications(userId: string, limit = 30) {
    const [{ data, error }, { count: totalUnreadCount }] = await Promise.all([
      supabase
        .from('notifications')
        .select(
          `
          *,
          actor:users!notifications_actor_id_fkey(
            id,
            academic_profile:academic_profiles(full_name, avatar_url, student_code)
          )
        `
        )
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false),
    ]);

    if (error) {
      throw new Error(error.message);
    }

    const items = (data || []).map((n) => ({
      ...n,
      actor: normalizeUserWithProfile(n.actor),
    }));

    const fallbackUnread = items.filter((n) => !n.is_read).length;
    const unreadCount =
      typeof totalUnreadCount === 'number' ? totalUnreadCount : fallbackUnread;

    return {
      items,
      unreadCount,
    };
  }

  async markAsRead(userId: string, notificationId?: string) {
    let query = supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId);

    if (notificationId) {
      query = query.eq('id', notificationId);
    } else {
      query = query.eq('is_read', false);
    }

    const { error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    return { updated: true };
  }
}

export const realtimeNotificationService = new RealtimeNotificationService();
