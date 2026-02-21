import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { notificationsApiRef } from '@backstage/plugin-notifications';
import {
  Bell,
  BellOff,
  Bookmark,
  BookmarkCheck,
  Check,
  CheckCheck,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';

/* ------------------------------------------------------------------ */
/*  Types (from @backstage/plugin-notifications)                       */
/* ------------------------------------------------------------------ */

type NotificationSeverity = 'critical' | 'high' | 'normal' | 'low';

interface Notification {
  id: string;
  user: string | null;
  created: Date;
  saved?: Date;
  read?: Date;
  updated?: Date;
  origin: string;
  payload: {
    title: string;
    description?: string;
    link?: string;
    severity?: NotificationSeverity;
    topic?: string;
    scope?: string;
    icon?: string;
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 20;

const TABS = [
  { value: 'unread', label: 'Unread', icon: Bell },
  { value: 'all', label: 'All', icon: Bell },
  { value: 'saved', label: 'Saved', icon: Bookmark },
] as const;

type TabValue = (typeof TABS)[number]['value'];

function severityIcon(severity?: NotificationSeverity) {
  switch (severity) {
    case 'critical':
      return <ShieldAlert className="size-4 text-destructive" />;
    case 'high':
      return <AlertTriangle className="size-4 text-orange-500" />;
    case 'low':
      return <Info className="size-4 text-blue-500" />;
    default:
      return null;
  }
}

function severityBadge(severity?: NotificationSeverity) {
  if (!severity || severity === 'normal') return null;
  const variants: Record<string, string> = {
    critical: 'bg-destructive/10 text-destructive border-destructive/20',
    high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    low: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  };
  return (
    <Badge
      variant="outline"
      className={cn('text-[10px] capitalize', variants[severity])}
    >
      {severity}
    </Badge>
  );
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function NotificationsPage() {
  const notificationsApi = useApi(notificationsApiRef);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [tab, setTab] = useState<TabValue>('unread');
  const [offset, setOffset] = useState(0);

  /* Fetch notifications */
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const opts: Record<string, unknown> = {
        limit: PAGE_SIZE,
        offset,
        sort: 'created' as const,
        sortOrder: 'desc' as const,
      };
      if (tab === 'unread') opts.read = false;
      if (tab === 'saved') opts.saved = true;

      const [result, status] = await Promise.all([
        notificationsApi.getNotifications(opts as any),
        notificationsApi.getStatus(),
      ]);

      setNotifications(result.notifications as unknown as Notification[]);
      setTotalCount(result.totalCount);
      setUnreadCount(status.unread);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [notificationsApi, tab, offset]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /* Actions */
  const markAsRead = useCallback(
    async (ids: string[]) => {
      await notificationsApi.updateNotifications({ ids, read: true } as any);
      fetchNotifications();
    },
    [notificationsApi, fetchNotifications],
  );

  const toggleSaved = useCallback(
    async (id: string, currentlySaved: boolean) => {
      await notificationsApi.updateNotifications({
        ids: [id],
        saved: !currentlySaved,
      } as any);
      fetchNotifications();
    },
    [notificationsApi, fetchNotifications],
  );

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications
      .filter(n => !n.read)
      .map(n => n.id);
    if (unreadIds.length > 0) {
      await notificationsApi.updateNotifications({
        ids: unreadIds,
        read: true,
      } as any);
      fetchNotifications();
    }
  }, [notificationsApi, notifications, fetchNotifications]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="p-6 w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bell className="size-5" />
            <h1 className="text-xl font-semibold tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Stay up to date with alerts and updates.
          </p>
        </div>

        {tab === 'unread' && notifications.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="gap-1.5"
          >
            <CheckCheck className="size-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Separator />

      {/* Tabs */}
      <div className="flex gap-1">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              onClick={() => {
                setTab(t.value);
                setOffset(0);
              }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                tab === t.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className="size-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="size-10 text-destructive/50 mb-3" />
          <p className="text-sm text-destructive font-medium">
            Failed to load notifications
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {error.message}
          </p>
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <BellOff className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            {{ unread: 'No unread notifications', saved: 'No saved notifications', all: 'No notifications' }[tab]}
          </p>
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            {totalCount} notification{totalCount !== 1 ? 's' : ''}
          </p>

          <div className="space-y-2">
            {notifications.map(notification => {
              const isRead = !!notification.read;
              const isSaved = !!notification.saved;

              return (
                <Card
                  key={notification.id}
                  className={cn(
                    'transition-colors',
                    !isRead && 'border-l-2 border-l-primary',
                  )}
                >
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start gap-3">
                      {/* Severity icon */}
                      <div className="pt-0.5">
                        {severityIcon(notification.payload.severity) || (
                          <Bell className="size-4 text-muted-foreground" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p
                                className={cn(
                                  'text-sm',
                                  !isRead ? 'font-semibold' : 'font-medium',
                                )}
                              >
                                {notification.payload.title}
                              </p>
                              {severityBadge(notification.payload.severity)}
                              {notification.payload.topic && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {notification.payload.topic}
                                </Badge>
                              )}
                            </div>
                            {notification.payload.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {notification.payload.description}
                              </p>
                            )}
                          </div>

                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {timeAgo(notification.created)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 pt-1">
                          {!isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs"
                              onClick={() => markAsRead([notification.id])}
                            >
                              <Check className="size-3" />
                              Mark read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            onClick={() =>
                              toggleSaved(notification.id, isSaved)
                            }
                          >
                            {isSaved ? (
                              <BookmarkCheck className="size-3" />
                            ) : (
                              <Bookmark className="size-3" />
                            )}
                            {isSaved ? 'Saved' : 'Save'}
                          </Button>
                          {notification.payload.link && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs"
                              asChild
                            >
                              <a
                                href={notification.payload.link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="size-3" />
                                View
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                  disabled={offset === 0}
                  className="gap-1"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                  disabled={offset + PAGE_SIZE >= totalCount}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
