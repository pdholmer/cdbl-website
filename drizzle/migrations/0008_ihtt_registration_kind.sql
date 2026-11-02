ALTER TABLE public.registrations DROP CONSTRAINT registrations_kind_check;
ALTER TABLE public.registrations ADD CONSTRAINT registrations_kind_check
  CHECK (kind = ANY (ARRAY['division'::text, 'tryout'::text, 'ihtt'::text]));

CREATE OR REPLACE FUNCTION public.guard_ihtt_requires_in_house()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _is_ihtt boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.programs WHERE id = NEW.program_id AND type = 'ihtt') INTO _is_ihtt;
  IF _is_ihtt AND NEW.kind <> 'ihtt' THEN
    RAISE EXCEPTION 'Registrations for an IHTT program must use kind ihtt' USING ERRCODE = 'check_violation';
  END IF;
  IF NOT _is_ihtt AND NEW.kind = 'ihtt' THEN
    RAISE EXCEPTION 'Kind ihtt is only allowed for an IHTT program' USING ERRCODE = 'check_violation';
  END IF;
  IF NOT _is_ihtt THEN
    RETURN NEW;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.registrations r
    JOIN public.programs p ON p.id = r.program_id AND p.type = 'in_house'
    WHERE r.player_id = NEW.player_id AND r.season_id = NEW.season_id
      AND r.league_id = NEW.league_id AND r.lifecycle <> 'cancelled'
      AND r.kind = 'division'
      AND ( (NEW.checkout_id IS NOT NULL AND r.checkout_id = NEW.checkout_id)
            OR r.payment IN ('paid','waived') )
  ) THEN
    RAISE EXCEPTION 'IHTT registration needs an in-house registration for the same player and season in the same checkout'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $function$;