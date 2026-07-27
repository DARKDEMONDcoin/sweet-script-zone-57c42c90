
ALTER TABLE public.profiles DISABLE TRIGGER USER;

UPDATE public.profiles SET plan='free'
WHERE plan <> 'free' AND id <> '3863bfb6-7d0d-46da-a2d7-7ec920e4aa85';

ALTER TABLE public.profiles ENABLE TRIGGER USER;

UPDATE public.subscriptions SET status='canceled', updated_at=now()
WHERE status <> 'canceled' AND user_id <> '3863bfb6-7d0d-46da-a2d7-7ec920e4aa85';

UPDATE public.workspaces SET plan='free'
WHERE plan IS NOT NULL AND plan <> 'free' AND owner_id <> '3863bfb6-7d0d-46da-a2d7-7ec920e4aa85';
