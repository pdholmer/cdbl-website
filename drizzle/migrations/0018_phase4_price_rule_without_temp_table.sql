CREATE OR REPLACE FUNCTION public.price_cart_lines(_items jsonb, _settings jsonb, _as_of date, _cart_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SET search_path TO 'public'
AS $$
DECLARE
  r RECORD; v_first uuid; v_lines jsonb := '[]'::jsonb; v_total numeric := 0;
  v_eb_end date := (_settings->>'early_bird_ends_on')::date;
  v_closes date := (_settings->>'closes_on')::date;
  v_late date := (_settings->>'late_until')::date;
  v_eb numeric := coalesce((_settings->>'early_bird_amount')::numeric, 0);
  v_sib numeric := coalesce((_settings->>'sibling_amount')::numeric, 0);
  v_lf numeric := coalesce((_settings->>'late_fee_amount')::numeric, 0);
  v_ihtt_on boolean := coalesce((_settings->>'ihtt_also_pays_in_house')::boolean, true);
  v_waived boolean; v_carrier uuid;
BEGIN
  -- First child in the family group pays full price (clinic never counts).
  SELECT x.player_id INTO v_first
  FROM jsonb_to_recordset(_items) AS x(player_id uuid, kind text, created_at timestamptz, sibling_redeemed boolean)
  WHERE x.kind <> 'clinic'
  GROUP BY x.player_id ORDER BY bool_or(coalesce(x.sibling_redeemed,false)) ASC, min(x.created_at), x.player_id LIMIT 1;

  FOR r IN SELECT * FROM jsonb_to_recordset(_items) AS x(registration_id uuid, player_id uuid, player_name text, cart_id uuid,
             kind text, fee numeric, label text, created_at timestamptz, sibling_redeemed boolean)
           WHERE x.cart_id = _cart_id ORDER BY x.player_name, x.created_at LOOP
    v_lines := v_lines || jsonb_build_object('registration_id', r.registration_id, 'type', 'fee', 'label', r.label, 'amount', r.fee);
    v_total := v_total + r.fee;
    v_waived := r.kind = 'division' AND NOT v_ihtt_on AND EXISTS (
      SELECT 1 FROM jsonb_to_recordset(_items) AS i(player_id uuid, kind text) WHERE i.player_id = r.player_id AND i.kind = 'ihtt');
    IF v_waived THEN
      v_lines := v_lines || jsonb_build_object('registration_id', r.registration_id, 'type', 'ihtt_included', 'label', 'In-House included with IHTT', 'amount', -r.fee);
      v_total := v_total - r.fee;
    END IF;
    IF r.kind <> 'clinic' AND NOT v_waived THEN
      IF v_eb_end IS NOT NULL AND _as_of <= v_eb_end AND v_eb > 0 THEN
        v_lines := v_lines || jsonb_build_object('registration_id', r.registration_id, 'type', 'early_bird', 'label', 'Early bird discount', 'amount', -v_eb);
        v_total := v_total - v_eb;
      ELSIF v_closes IS NOT NULL AND _as_of > v_closes AND (v_late IS NULL OR _as_of <= v_late) AND v_lf > 0 THEN
        v_lines := v_lines || jsonb_build_object('registration_id', r.registration_id, 'type', 'late_fee', 'label', 'Late registration fee', 'amount', v_lf);
        v_total := v_total + v_lf;
      END IF;
    END IF;
    IF r.kind <> 'clinic' AND r.player_id <> v_first AND v_sib > 0 THEN
      SELECT i.registration_id INTO v_carrier
      FROM jsonb_to_recordset(_items) AS i(registration_id uuid, player_id uuid, kind text, created_at timestamptz, sibling_redeemed boolean)
      WHERE i.player_id = r.player_id AND i.kind <> 'clinic'
      ORDER BY coalesce(i.sibling_redeemed,false) DESC, (i.kind = 'division') DESC, i.created_at, i.registration_id LIMIT 1;
      IF v_carrier = r.registration_id THEN
        v_lines := v_lines || jsonb_build_object('registration_id', r.registration_id, 'type', 'sibling', 'label', 'Sibling discount', 'amount', -v_sib);
        v_total := v_total - v_sib;
      END IF;
    END IF;
  END LOOP;
  RETURN jsonb_build_object('lines', v_lines, 'total', greatest(v_total, 0), 'as_of', _as_of,
    'closed', v_late IS NOT NULL AND _as_of > v_late);
END $$;